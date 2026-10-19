import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialNodes,
  createInitialSecurityControls,
  createInitialCodeQualityTargets,
  validateCommandInput,
  calculateBackoffDelayMs,
  dispatchCommandWithResilience,
  replayQueuedTasks,
  remediateSecurityControl,
  refactorAstTarget,
  computeClusterSummary,
  type ResilienceConfig,
} from './orchestrator-engine.ts';

test('validateCommandInput rejects empty or too-short commands and classifies categories', () => {
  const emptyRes = validateCommandInput('   ');
  assert.equal(emptyRes.valid, false);
  assert.ok(emptyRes.error);

  const shortRes = validateCommandInput('ab');
  assert.equal(shortRes.valid, false);

  const speedRes = validateCommandInput('vaultcore optimize-ebpf-hotpaths');
  assert.equal(speedRes.valid, true);
  assert.equal(speedRes.category, 'speed');

  const secRes = validateCommandInput('vaultcore sec --rotate-mtls');
  assert.equal(secRes.valid, true);
  assert.equal(secRes.category, 'security');

  const qualRes = validateCommandInput('vaultcore ast --refactor');
  assert.equal(qualRes.valid, true);
  assert.equal(qualRes.category, 'quality');
});

test('calculateBackoffDelayMs computes exact exponential backoff sequence', () => {
  const config: ResilienceConfig = {
    baseDelayMs: 50,
    maxRetries: 3,
    backoffFactor: 2,
    jitterEnabled: false,
    fallbackStrategy: 'secondary-failover',
  };

  assert.equal(calculateBackoffDelayMs(0, config), 50);
  assert.equal(calculateBackoffDelayMs(1, config), 100);
  assert.equal(calculateBackoffDelayMs(2, config), 200);
});

test('dispatchCommandWithResilience retries degraded nodes with exponential backoff and succeeds', () => {
  const nodes = createInitialNodes();
  // node-eu-west starts in 'degraded' status
  const degradedNode = nodes.find((n) => n.id === 'node-eu-west')!;
  assert.equal(degradedNode.status, 'degraded');

  const config: ResilienceConfig = {
    baseDelayMs: 40,
    maxRetries: 3,
    backoffFactor: 2,
    jitterEnabled: false,
    fallbackStrategy: 'secondary-failover',
  };

  const { updatedNodes, task } = dispatchCommandWithResilience(
    nodes,
    'vaultcore dispatch --optimize-hotpath',
    'node-eu-west',
    config
  );

  assert.equal(task.status, 'verified');
  assert.equal(task.totalBackoffMs, 120); // 40ms + 80ms
  assert.equal(task.retryAttempts.length, 3);
  assert.equal(task.retryAttempts[0].outcome, 'timeout');
  assert.equal(task.retryAttempts[1].outcome, 'timeout');
  assert.equal(task.retryAttempts[2].outcome, 'success');

  const healed = updatedNodes.find((n) => n.id === 'node-eu-west')!;
  assert.equal(healed.status, 'nominal');
});

test('dispatchCommandWithResilience fails over to standby node when primary node is offline', () => {
  const nodes = createInitialNodes().map((n) =>
    n.id === 'node-us-east' ? { ...n, status: 'offline' as const } : n
  );

  const config: ResilienceConfig = {
    baseDelayMs: 50,
    maxRetries: 3,
    backoffFactor: 2,
    jitterEnabled: false,
    fallbackStrategy: 'secondary-failover',
  };

  const { task } = dispatchCommandWithResilience(
    nodes,
    'vaultcore sec --rotate-mtls',
    'node-us-east',
    config
  );

  assert.equal(task.status, 'failed-over');
  assert.equal(task.fallbackTriggered, true);
  assert.equal(task.primaryNodeId, 'node-us-east');
  assert.equal(task.executedNodeId, 'node-eu-central'); // configured fallbackNodeId for node-us-east
  assert.equal(task.totalBackoffMs, 350); // 50 + 100 + 200
  assert.equal(task.retryAttempts.length, 4); // 3 failed attempts + 1 failover success
});

test('dispatchCommandWithResilience queues command for later when durable-queue fallback is selected and replays on recovery', () => {
  const nodes = createInitialNodes().map((n) =>
    n.id === 'node-us-east' ? { ...n, status: 'offline' as const } : n
  );

  const config: ResilienceConfig = {
    baseDelayMs: 30,
    maxRetries: 2,
    backoffFactor: 2,
    jitterEnabled: false,
    fallbackStrategy: 'durable-queue',
  };

  const { updatedNodes, task } = dispatchCommandWithResilience(
    nodes,
    'vaultcore ast --refactor-simd',
    'node-us-east',
    config
  );

  assert.equal(task.status, 'queued-for-later');
  assert.equal(task.fallbackTriggered, true);
  assert.equal(task.executedNodeId, null);
  assert.equal(task.totalBackoffMs, 90); // 30 + 60

  const replayResult = replayQueuedTasks([task], updatedNodes);
  assert.equal(replayResult.replayedCount, 1);
  assert.equal(replayResult.updatedTasks[0].status, 'verified');
  assert.equal(replayResult.updatedTasks[0].executedNodeId, 'node-us-east');
});

test('remediateSecurityControl and refactorAstTarget update scores and Lighthouse breakdown', () => {
  let nodes = createInitialNodes();
  let controls = createInitialSecurityControls();
  let targets = createInitialCodeQualityTargets();

  for (const c of controls) {
    if (c.status !== 'enforced') {
      const res = remediateSecurityControl(controls, nodes, c.id);
      controls = res.updatedControls;
      nodes = res.updatedNodes;
    }
  }

  for (const t of targets) {
    if (t.status !== 'verified') {
      const res = refactorAstTarget(targets, nodes, t.id);
      targets = res.updatedTargets;
      nodes = res.updatedNodes;
    }
  }

  const summary = computeClusterSummary(nodes, controls, targets);
  assert.equal(summary.lighthouse.performance, 100);
  assert.equal(summary.lighthouse.accessibility, 100);
  assert.equal(summary.lighthouse.bestPractices, 100);
  assert.equal(summary.lighthouse.seo, 100);
});
