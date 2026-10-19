export type NodeStatus = 'nominal' | 'dispatching' | 'degraded' | 'offline';
export type FallbackStrategy = 'secondary-failover' | 'durable-queue';

export interface ServerNode {
  id: string;
  hostname: string;
  region: string;
  ipAddress: string;
  architecture: string;
  p99LatencyMs: number;
  cpuLoadPct: number;
  memoryUsedGb: number;
  memoryTotalGb: number;
  securityScore: number;
  codeQualityScore: number;
  activeTasks: number;
  completedTasks: number;
  tlsKeyVersion: string;
  status: NodeStatus;
  fallbackNodeId: string;
  angleRad: number;
}

export interface RetryAttemptLog {
  attemptNumber: number;
  targetNodeId: string;
  targetHostname: string;
  backoffDelayMs: number;
  outcome: 'success' | 'timeout' | 'connection-refused';
  detail: string;
}

export interface ResilienceConfig {
  baseDelayMs: number;
  maxRetries: number;
  backoffFactor: number;
  jitterEnabled: boolean;
  fallbackStrategy: FallbackStrategy;
}

export interface DispatchedTask {
  id: string;
  command: string;
  category: 'speed' | 'security' | 'quality' | 'orchestration';
  primaryNodeId: string;
  executedNodeId: string | null;
  targetNodeIds: string[];
  status: 'verified' | 'failed-over' | 'queued-for-later';
  durationMs: number;
  totalBackoffMs: number;
  retryAttempts: RetryAttemptLog[];
  fallbackTriggered: boolean;
  fallbackAction?: string;
  timestamp: string;
  impactSummary: string;
}

export interface SecurityControl {
  id: string;
  title: string;
  nodeId: string;
  protocol: string;
  status: 'enforced' | 'pending-rotation';
  verificationLatencyMs: number;
  detail: string;
}

export interface CodeQualityTarget {
  id: string;
  modulePath: string;
  language: string;
  cyclomaticComplexity: number;
  coveragePct: number;
  executionUs: number;
  status: 'verified' | 'needs-refactor';
  optimizationNote: string;
}

export interface LighthouseBreakdown {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  fcpMs: number;
  lcpMs: number;
  tbtMs: number;
  cls: number;
  ttfbMs: number;
  bundleKb: number;
}

export interface PlaybookPreset {
  id: string;
  label: string;
  command: string;
  category: 'speed' | 'security' | 'quality' | 'orchestration';
  description: string;
}

export const DEFAULT_RESILIENCE_CONFIG: ResilienceConfig = {
  baseDelayMs: 40,
  maxRetries: 3,
  backoffFactor: 2,
  jitterEnabled: false,
  fallbackStrategy: 'secondary-failover',
};

export const PLAYBOOK_PRESETS: PlaybookPreset[] = [
  {
    id: 'preset-speed',
    label: 'Optimize Edge Kernel Hot-Paths',
    command: 'vaultcore dispatch --op=optimize-ebpf-hotpaths --zero-alloc',
    category: 'speed',
    description: 'Vectorizes network ring buffers and trims P99 dispatch latency below 0.70ms.',
  },
  {
    id: 'preset-security',
    label: 'Rotate Zero-Trust mTLS & Enclave Keys',
    command: 'vaultcore sec --rotate-mtls-pq --verify-sbom',
    category: 'security',
    description: 'Rotates post-quantum X25519Kyber768 keys and seals hardware enclave attestations.',
  },
  {
    id: 'preset-quality',
    label: 'Autonomous AST Refactor & Leak Purge',
    command: 'vaultcore ast --prune-cyclomatic --prove-memory-bounds',
    category: 'quality',
    description: 'Refactors high-complexity AST branches and verifies zero heap allocations in hot loops.',
  },
  {
    id: 'preset-sync',
    label: 'Full Distributed Cluster Self-Heal',
    command: 'vaultcore orchestrate --cluster-sync --canary-verify --lighthouse-100',
    category: 'orchestration',
    description: 'Synchronizes state across all 6 global server nodes with deterministic failover guards.',
  },
];

export function createInitialNodes(): ServerNode[] {
  const specs = [
    {
      id: 'node-us-east',
      hostname: 'vc-edge-iad-01',
      region: 'US-East · Ashburn',
      ipAddress: '10.240.12.14',
      architecture: 'ARM64 Neoverse-V2',
      p99LatencyMs: 0.68,
      cpuLoadPct: 22,
      memoryUsedGb: 18.4,
      memoryTotalGb: 64,
      securityScore: 99,
      codeQualityScore: 98,
      activeTasks: 1,
      completedTasks: 1420,
      tlsKeyVersion: 'v4.19-PQ',
      status: 'nominal' as NodeStatus,
      fallbackNodeId: 'node-eu-central',
    },
    {
      id: 'node-eu-central',
      hostname: 'vc-edge-fra-02',
      region: 'EU-Central · Frankfurt',
      ipAddress: '10.240.28.09',
      architecture: 'AMD EPYC 9654',
      p99LatencyMs: 0.76,
      cpuLoadPct: 28,
      memoryUsedGb: 21.0,
      memoryTotalGb: 64,
      securityScore: 99,
      codeQualityScore: 97,
      activeTasks: 2,
      completedTasks: 1285,
      tlsKeyVersion: 'v4.19-PQ',
      status: 'nominal' as NodeStatus,
      fallbackNodeId: 'node-eu-west',
    },
    {
      id: 'node-ap-northeast',
      hostname: 'vc-edge-hnd-03',
      region: 'AP-East · Tokyo',
      ipAddress: '10.240.44.82',
      architecture: 'ARM64 Neoverse-V2',
      p99LatencyMs: 0.81,
      cpuLoadPct: 25,
      memoryUsedGb: 19.2,
      memoryTotalGb: 64,
      securityScore: 100,
      codeQualityScore: 99,
      activeTasks: 1,
      completedTasks: 1612,
      tlsKeyVersion: 'v4.20-PQ',
      status: 'nominal' as NodeStatus,
      fallbackNodeId: 'node-us-west',
    },
    {
      id: 'node-us-west',
      hostname: 'vc-edge-sjc-04',
      region: 'US-West · San Jose',
      ipAddress: '10.240.61.05',
      architecture: 'AMD EPYC 9654',
      p99LatencyMs: 0.64,
      cpuLoadPct: 19,
      memoryUsedGb: 16.2,
      memoryTotalGb: 64,
      securityScore: 99,
      codeQualityScore: 98,
      activeTasks: 0,
      completedTasks: 1890,
      tlsKeyVersion: 'v4.19-PQ',
      status: 'nominal' as NodeStatus,
      fallbackNodeId: 'node-us-east',
    },
    {
      id: 'node-eu-west',
      hostname: 'vc-edge-lhr-05',
      region: 'EU-West · London',
      ipAddress: '10.240.79.31',
      architecture: 'ARM64 Neoverse-V2',
      p99LatencyMs: 0.74,
      cpuLoadPct: 24,
      memoryUsedGb: 20.1,
      memoryTotalGb: 64,
      securityScore: 98,
      codeQualityScore: 98,
      activeTasks: 1,
      completedTasks: 1104,
      tlsKeyVersion: 'v4.18-PQ',
      status: 'degraded' as NodeStatus,
      fallbackNodeId: 'node-eu-central',
    },
    {
      id: 'node-sa-east',
      hostname: 'vc-edge-gru-06',
      region: 'SA-East · São Paulo',
      ipAddress: '10.240.93.47',
      architecture: 'AMD EPYC 9654',
      p99LatencyMs: 0.89,
      cpuLoadPct: 31,
      memoryUsedGb: 23.4,
      memoryTotalGb: 64,
      securityScore: 98,
      codeQualityScore: 96,
      activeTasks: 2,
      completedTasks: 948,
      tlsKeyVersion: 'v4.18-PQ',
      status: 'nominal' as NodeStatus,
      fallbackNodeId: 'node-us-east',
    },
  ];

  return specs.map((node, index) => ({
    ...node,
    angleRad: (index * Math.PI * 2) / specs.length,
  }));
}

export function createInitialSecurityControls(): SecurityControl[] {
  return [
    {
      id: 'sec-01',
      title: 'Post-Quantum X25519Kyber768 mTLS Mesh',
      nodeId: 'node-eu-west',
      protocol: 'TLS 1.3 + PQ-KEM',
      status: 'pending-rotation',
      verificationLatencyMs: 0.14,
      detail: 'Session key epoch approaching 4-hour deterministic rotation boundary.',
    },
    {
      id: 'sec-02',
      title: 'eBPF Syscall Allowlist & Kernel Seccomp',
      nodeId: 'node-us-east',
      protocol: 'LSM-BPF v6.8',
      status: 'enforced',
      verificationLatencyMs: 0.08,
      detail: 'Zero unauthorized socket or execve calls permitted outside signed agent binary.',
    },
    {
      id: 'sec-03',
      title: 'Hardware TPM 2.0 Enclave Quote Attestation',
      nodeId: 'node-eu-central',
      protocol: 'AMD SEV-SNP',
      status: 'pending-rotation',
      verificationLatencyMs: 0.19,
      detail: 'Remote cryptographic memory measurement ready for re-signing.',
    },
    {
      id: 'sec-04',
      title: 'SLSA Level 4 Hermetic Artifact Provenance',
      nodeId: 'node-ap-northeast',
      protocol: 'Sigstore Cosign',
      status: 'enforced',
      verificationLatencyMs: 0.11,
      detail: 'All dispatched machine payloads verified against immutable SHA-512 digest tree.',
    },
  ];
}

export function createInitialCodeQualityTargets(): CodeQualityTarget[] {
  return [
    {
      id: 'ast-01',
      modulePath: 'crates/orchestrator-core/src/dispatcher/ring_buffer.rs',
      language: 'Rust 2024',
      cyclomaticComplexity: 9,
      coveragePct: 96.4,
      executionUs: 42,
      status: 'needs-refactor',
      optimizationNote: 'Branch inside lock-free dequeue loop can be flattened via SIMD mask.',
    },
    {
      id: 'ast-02',
      modulePath: 'crates/vault-enclave/src/crypto/kyber_handshake.rs',
      language: 'Rust 2024',
      cyclomaticComplexity: 4,
      coveragePct: 99.8,
      executionUs: 68,
      status: 'verified',
      optimizationNote: 'Constant-time assembly verified with zero heap allocations.',
    },
    {
      id: 'ast-03',
      modulePath: 'services/telemetry-edge/src/ast_verifier.ts',
      language: 'TypeScript 5.9',
      cyclomaticComplexity: 11,
      coveragePct: 94.2,
      executionUs: 115,
      status: 'needs-refactor',
      optimizationNote: 'Recursive AST visitor allocates temporary array per node traversal.',
    },
    {
      id: 'ast-04',
      modulePath: 'crates/kernel-probe/src/ebpf/socket_filter.c',
      language: 'C / eBPF',
      cyclomaticComplexity: 3,
      coveragePct: 100.0,
      executionUs: 14,
      status: 'verified',
      optimizationNote: 'Verifier-proved bounded loop with 14µs deterministic packet inspection.',
    },
  ];
}

export function calculateBackoffDelayMs(
  attemptIndex: number,
  config: ResilienceConfig,
  deterministicSeed = 0.5
): number {
  const rawDelay = config.baseDelayMs * Math.pow(config.backoffFactor, attemptIndex);
  if (!config.jitterEnabled) {
    return Math.round(rawDelay);
  }
  // Deterministic jitter in [-15%, +15%]
  const jitterRatio = 1 + (deterministicSeed - 0.5) * 0.3;
  return Math.max(5, Math.round(rawDelay * jitterRatio));
}

export function createInitialTasks(): DispatchedTask[] {
  return [
    {
      id: 'task-901',
      command: 'vaultcore orchestrate --verify-enclave-mesh --quorum=6/6',
      category: 'orchestration',
      primaryNodeId: 'node-us-east',
      executedNodeId: 'node-us-east',
      targetNodeIds: [
        'node-us-east',
        'node-eu-central',
        'node-ap-northeast',
        'node-us-west',
        'node-eu-west',
        'node-sa-east',
      ],
      status: 'verified',
      durationMs: 0.64,
      totalBackoffMs: 0,
      retryAttempts: [
        {
          attemptNumber: 1,
          targetNodeId: 'node-us-east',
          targetHostname: 'vc-edge-iad-01',
          backoffDelayMs: 0,
          outcome: 'success',
          detail: 'Direct primary dispatch acknowledged in 0.64ms.',
        },
      ],
      fallbackTriggered: false,
      timestamp: '09:22:14.108 UTC',
      impactSummary: '6/6 distributed nodes attested · P99 dispatch 0.64ms',
    },
    {
      id: 'task-902',
      command: 'vaultcore sec --target=node-eu-west --rotate-mtls-pq',
      category: 'security',
      primaryNodeId: 'node-eu-west',
      executedNodeId: 'node-eu-central',
      targetNodeIds: ['node-eu-central'],
      status: 'failed-over',
      durationMs: 0.72,
      totalBackoffMs: 120,
      retryAttempts: [
        {
          attemptNumber: 1,
          targetNodeId: 'node-eu-west',
          targetHostname: 'vc-edge-lhr-05',
          backoffDelayMs: 40,
          outcome: 'timeout',
          detail: 'Primary link timeout on vc-edge-lhr-05; scheduling backoff 40ms.',
        },
        {
          attemptNumber: 2,
          targetNodeId: 'node-eu-west',
          targetHostname: 'vc-edge-lhr-05',
          backoffDelayMs: 80,
          outcome: 'timeout',
          detail: 'Packet loss threshold exceeded; scheduling backoff 80ms.',
        },
        {
          attemptNumber: 3,
          targetNodeId: 'node-eu-central',
          targetHostname: 'vc-edge-fra-02',
          backoffDelayMs: 0,
          outcome: 'success',
          detail: 'Fallback routed to standby node vc-edge-fra-02; verified in 0.72ms.',
        },
      ],
      fallbackTriggered: true,
      fallbackAction: 'Failover to standby node vc-edge-fra-02 after exponential backoff',
      timestamp: '09:23:02.419 UTC',
      impactSummary: 'Failover to vc-edge-fra-02 succeeded after 2 backoff retries (120ms)',
    },
  ];
}

export function validateCommandInput(rawCommand: string): {
  valid: boolean;
  sanitized: string;
  category: 'speed' | 'security' | 'quality' | 'orchestration';
  error?: string;
} {
  const trimmed = rawCommand.trim();
  if (!trimmed) {
    return {
      valid: false,
      sanitized: '',
      category: 'orchestration',
      error: 'Command input is required before dispatching to server nodes.',
    };
  }
  if (trimmed.length < 4) {
    return {
      valid: false,
      sanitized: trimmed,
      category: 'orchestration',
      error: 'Command must be at least 4 characters long.',
    };
  }

  const lower = trimmed.toLowerCase();
  let category: 'speed' | 'security' | 'quality' | 'orchestration' = 'orchestration';
  if (
    lower.includes('speed') ||
    lower.includes('latency') ||
    lower.includes('hotpath') ||
    lower.includes('optimize') ||
    lower.includes('cache')
  ) {
    category = 'speed';
  } else if (
    lower.includes('sec') ||
    lower.includes('tls') ||
    lower.includes('mtls') ||
    lower.includes('key') ||
    lower.includes('enclave') ||
    lower.includes('sbom')
  ) {
    category = 'security';
  } else if (
    lower.includes('ast') ||
    lower.includes('quality') ||
    lower.includes('lint') ||
    lower.includes('refactor') ||
    lower.includes('cyclomatic')
  ) {
    category = 'quality';
  }

  return {
    valid: true,
    sanitized: trimmed,
    category,
  };
}

export function computeClusterSummary(
  nodes: ServerNode[],
  securityControls: SecurityControl[],
  codeTargets: CodeQualityTarget[]
): {
  avgLatencyMs: number;
  avgSecurityScore: number;
  avgQualityScore: number;
  totalCompletedTasks: number;
  enforcedSecurityCount: number;
  verifiedAstCount: number;
  healthyNodeCount: number;
  lighthouse: LighthouseBreakdown;
} {
  if (nodes.length === 0) {
    return {
      avgLatencyMs: 0,
      avgSecurityScore: 100,
      avgQualityScore: 100,
      totalCompletedTasks: 0,
      enforcedSecurityCount: 0,
      verifiedAstCount: 0,
      healthyNodeCount: 0,
      lighthouse: {
        performance: 100,
        accessibility: 100,
        bestPractices: 100,
        seo: 100,
        fcpMs: 160,
        lcpMs: 280,
        tbtMs: 0,
        cls: 0,
        ttfbMs: 0.68,
        bundleKb: 38.2,
      },
    };
  }

  const activeNodes = nodes.filter((n) => n.status !== 'offline');
  const pool = activeNodes.length > 0 ? activeNodes : nodes;

  const sumLatency = pool.reduce((acc, n) => acc + n.p99LatencyMs, 0);
  const sumSec = pool.reduce((acc, n) => acc + n.securityScore, 0);
  const sumQual = pool.reduce((acc, n) => acc + n.codeQualityScore, 0);
  const totalCompletedTasks = nodes.reduce((acc, n) => acc + n.completedTasks, 0);

  const avgLatencyMs = Number((sumLatency / pool.length).toFixed(2));
  const avgSecurityScore = Number((sumSec / pool.length).toFixed(1));
  const avgQualityScore = Number((sumQual / pool.length).toFixed(1));

  const enforcedSecurityCount = securityControls.filter((c) => c.status === 'enforced').length;
  const verifiedAstCount = codeTargets.filter((t) => t.status === 'verified').length;
  const healthyNodeCount = nodes.filter((n) => n.status === 'nominal').length;

  const fcpMs = Math.max(120, Math.round(avgLatencyMs * 210));
  const lcpMs = Math.max(220, Math.round(avgLatencyMs * 360));

  return {
    avgLatencyMs,
    avgSecurityScore,
    avgQualityScore,
    totalCompletedTasks,
    enforcedSecurityCount,
    verifiedAstCount,
    healthyNodeCount,
    lighthouse: {
      performance: 100,
      accessibility: 100,
      bestPractices: 100,
      seo: 100,
      fcpMs,
      lcpMs,
      tbtMs: 0,
      cls: 0,
      ttfbMs: avgLatencyMs,
      bundleKb: verifiedAstCount === codeTargets.length ? 36.8 : 41.2,
    },
  };
}

/**
 * Dispatches a command with full exponential backoff retry logic and fallback strategy.
 * - If primary node is 'nominal': succeeds on Attempt 1 (0ms backoff).
 * - If primary node is 'degraded': fails first attempt(s) with exponential backoff, then succeeds on retry!
 * - If primary node is 'offline': exhausts `maxRetries` with exponential backoff (`base * factor^i`),
 *   then triggers `config.fallbackStrategy`:
 *   - `'secondary-failover'`: routes command to healthy standby node (`fallbackNodeId` or healthiest online node).
 *   - `'durable-queue'`: queues command in the durable ring-buffer for deferred replay when node recovers.
 */
export function dispatchCommandWithResilience(
  nodes: ServerNode[],
  rawCommand: string,
  targetScope: 'all' | string,
  config: ResilienceConfig = DEFAULT_RESILIENCE_CONFIG
): {
  updatedNodes: ServerNode[];
  task: DispatchedTask;
} {
  const validation = validateCommandInput(rawCommand);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid command');
  }

  const primaryNode =
    targetScope === 'all'
      ? nodes.find((n) => n.status !== 'nominal') || nodes[0]
      : nodes.find((n) => n.id === targetScope) || nodes[0];

  const retryAttempts: RetryAttemptLog[] = [];
  let totalBackoffMs = 0;
  let executedNodeId: string | null = primaryNode.id;
  let taskStatus: DispatchedTask['status'] = 'verified';
  let fallbackTriggered = false;
  let fallbackAction: string | undefined;

  if (primaryNode.status === 'nominal') {
    retryAttempts.push({
      attemptNumber: 1,
      targetNodeId: primaryNode.id,
      targetHostname: primaryNode.hostname,
      backoffDelayMs: 0,
      outcome: 'success',
      detail: `Primary node ${primaryNode.hostname} executed command on first attempt (${primaryNode.p99LatencyMs}ms).`,
    });
  } else if (primaryNode.status === 'degraded') {
    // Transient network congestion: fails Attempt 1 & 2, succeeds on Attempt 3 after exponential backoff
    const transientFailures = Math.min(2, Math.max(1, config.maxRetries - 1));
    for (let i = 0; i < transientFailures; i++) {
      const delay = calculateBackoffDelayMs(i, config, 0.6);
      totalBackoffMs += delay;
      retryAttempts.push({
        attemptNumber: i + 1,
        targetNodeId: primaryNode.id,
        targetHostname: primaryNode.hostname,
        backoffDelayMs: delay,
        outcome: 'timeout',
        detail: `Transient packet jitter on ${primaryNode.hostname}; exponential backoff ${delay}ms (${config.backoffFactor}^${i} × ${config.baseDelayMs}ms).`,
      });
    }
    retryAttempts.push({
      attemptNumber: transientFailures + 1,
      targetNodeId: primaryNode.id,
      targetHostname: primaryNode.hostname,
      backoffDelayMs: 0,
      outcome: 'success',
      detail: `Retry #${transientFailures + 1} succeeded on ${primaryNode.hostname} after ${totalBackoffMs}ms cumulative backoff.`,
    });
  } else {
    // Primary node is 'offline': exhaust all retries with exponential backoff, then execute fallback strategy
    for (let i = 0; i < config.maxRetries; i++) {
      const delay = calculateBackoffDelayMs(i, config, 0.4);
      totalBackoffMs += delay;
      retryAttempts.push({
        attemptNumber: i + 1,
        targetNodeId: primaryNode.id,
        targetHostname: primaryNode.hostname,
        backoffDelayMs: delay,
        outcome: 'connection-refused',
        detail: `Primary machine ${primaryNode.hostname} unreachable (Attempt ${i + 1}/${config.maxRetries}) · Backoff ${delay}ms.`,
      });
    }

    fallbackTriggered = true;

    if (config.fallbackStrategy === 'secondary-failover') {
      const configuredStandby = nodes.find(
        (n) => n.id === primaryNode.fallbackNodeId && n.status !== 'offline'
      );
      const anyHealthyStandby = nodes.find(
        (n) => n.id !== primaryNode.id && n.status !== 'offline'
      );
      const standbyNode = configuredStandby || anyHealthyStandby;

      if (standbyNode) {
        executedNodeId = standbyNode.id;
        taskStatus = 'failed-over';
        fallbackAction = `Automatic failover from ${primaryNode.hostname} to standby resource ${standbyNode.hostname} (${standbyNode.region})`;
        retryAttempts.push({
          attemptNumber: config.maxRetries + 1,
          targetNodeId: standbyNode.id,
          targetHostname: standbyNode.hostname,
          backoffDelayMs: 0,
          outcome: 'success',
          detail: `Fallback strategy [secondary-failover] dispatched command to ${standbyNode.hostname} in ${standbyNode.p99LatencyMs}ms.`,
        });
      } else {
        executedNodeId = null;
        taskStatus = 'queued-for-later';
        fallbackAction = `All standby nodes offline — persisted in durable queue for ${primaryNode.hostname}`;
      }
    } else {
      // 'durable-queue' strategy
      executedNodeId = null;
      taskStatus = 'queued-for-later';
      fallbackAction = `Enqueued in durable WAL ring-buffer for deferred execution when ${primaryNode.hostname} recovers`;
    }
  }

  const targetIds =
    taskStatus === 'queued-for-later'
      ? [primaryNode.id]
      : targetScope === 'all'
      ? nodes.filter((n) => n.status !== 'offline').map((n) => n.id)
      : executedNodeId
      ? [executedNodeId]
      : [];

  const updatedNodes = nodes.map((node) => {
    if (taskStatus === 'queued-for-later' || !targetIds.includes(node.id)) {
      return node;
    }

    let nextLatency = node.p99LatencyMs;
    let nextSec = node.securityScore;
    let nextQual = node.codeQualityScore;
    let nextKey = node.tlsKeyVersion;

    if (validation.category === 'speed') {
      nextLatency = Number(Math.max(0.42, node.p99LatencyMs - 0.08).toFixed(2));
    } else if (validation.category === 'security') {
      nextSec = Math.min(100, node.securityScore + 1);
      nextKey = 'v4.20-PQ';
    } else if (validation.category === 'quality') {
      nextQual = Math.min(100, node.codeQualityScore + 2);
      nextLatency = Number(Math.max(0.44, node.p99LatencyMs - 0.04).toFixed(2));
    } else {
      nextLatency = Number(Math.max(0.44, node.p99LatencyMs - 0.05).toFixed(2));
      nextSec = Math.min(100, node.securityScore + 1);
      nextQual = Math.min(100, node.codeQualityScore + 1);
    }

    return {
      ...node,
      p99LatencyMs: nextLatency,
      securityScore: nextSec,
      codeQualityScore: nextQual,
      tlsKeyVersion: nextKey,
      completedTasks: node.completedTasks + 1,
      cpuLoadPct: Math.max(14, Math.min(48, node.cpuLoadPct - 2)),
      status: node.status === 'degraded' ? ('nominal' as NodeStatus) : node.status,
    };
  });

  const executedNode = updatedNodes.find((n) => n.id === executedNodeId) || primaryNode;
  const durationMs = taskStatus === 'queued-for-later' ? 0 : executedNode.p99LatencyMs;

  const now = new Date();
  const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(
    now.getUTCMinutes()
  ).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}.${String(
    now.getUTCMilliseconds()
  ).padStart(3, '0')} UTC`;

  let impactSummary = `${targetIds.length}/${nodes.length} nodes updated · ${validation.category.toUpperCase()} verified in ${durationMs}ms`;
  if (taskStatus === 'failed-over' && executedNode) {
    impactSummary = `Failover to ${executedNode.hostname} after ${config.maxRetries} retries (${totalBackoffMs}ms backoff) · Verified in ${durationMs}ms`;
  } else if (taskStatus === 'queued-for-later') {
    impactSummary = `Queued in durable buffer after ${config.maxRetries} retries (${totalBackoffMs}ms backoff) awaiting ${primaryNode.hostname} recovery`;
  } else if (totalBackoffMs > 0) {
    impactSummary = `Recovered on ${primaryNode.hostname} after ${retryAttempts.length - 1} backoff retries (${totalBackoffMs}ms) · ${durationMs}ms`;
  }

  const task: DispatchedTask = {
    id: `task-${Math.floor(1000 + Math.random() * 9000)}`,
    command: validation.sanitized,
    category: validation.category,
    primaryNodeId: primaryNode.id,
    executedNodeId,
    targetNodeIds: targetIds,
    status: taskStatus,
    durationMs,
    totalBackoffMs,
    retryAttempts,
    fallbackTriggered,
    fallbackAction,
    timestamp: timeStr,
    impactSummary,
  };

  return { updatedNodes, task };
}

// Keep alias for backward compatibility
export const dispatchCommandToCluster = dispatchCommandWithResilience;

export function replayQueuedTasks(
  tasks: DispatchedTask[],
  nodes: ServerNode[]
): {
  updatedTasks: DispatchedTask[];
  updatedNodes: ServerNode[];
  replayedCount: number;
} {
  let replayedCount = 0;
  const healedNodes = nodes.map((n) =>
    n.status === 'offline' || n.status === 'degraded'
      ? {
          ...n,
          status: 'nominal' as NodeStatus,
          completedTasks: n.completedTasks + 1,
          p99LatencyMs: Number(Math.max(0.48, n.p99LatencyMs - 0.06).toFixed(2)),
        }
      : n
  );

  const updatedTasks = tasks.map((task) => {
    if (task.status !== 'queued-for-later') return task;
    replayedCount += 1;
    const primaryNode = healedNodes.find((n) => n.id === task.primaryNodeId) || healedNodes[0];
    return {
      ...task,
      executedNodeId: primaryNode.id,
      status: 'verified' as const,
      durationMs: primaryNode.p99LatencyMs,
      retryAttempts: [
        ...task.retryAttempts,
        {
          attemptNumber: task.retryAttempts.length + 1,
          targetNodeId: primaryNode.id,
          targetHostname: primaryNode.hostname,
          backoffDelayMs: 0,
          outcome: 'success' as const,
          detail: `Deferred queue replay succeeded on restored node ${primaryNode.hostname} in ${primaryNode.p99LatencyMs}ms.`,
        },
      ],
      impactSummary: `Replayed from durable queue onto ${primaryNode.hostname} · Verified in ${primaryNode.p99LatencyMs}ms`,
    };
  });

  return { updatedTasks, updatedNodes: healedNodes, replayedCount };
}

export function remediateSecurityControl(
  controls: SecurityControl[],
  nodes: ServerNode[],
  controlId: string
): {
  updatedControls: SecurityControl[];
  updatedNodes: ServerNode[];
} {
  let targetNodeId = '';
  const updatedControls = controls.map((c) => {
    if (c.id === controlId) {
      targetNodeId = c.nodeId;
      return {
        ...c,
        status: 'enforced' as const,
        verificationLatencyMs: Number(Math.max(0.06, c.verificationLatencyMs - 0.04).toFixed(2)),
        detail: 'Cryptographic key rotation & hardware attestation enforced across enclave.',
      };
    }
    return c;
  });

  const updatedNodes = nodes.map((n) =>
    n.id === targetNodeId
      ? {
          ...n,
          securityScore: 100,
          tlsKeyVersion: 'v4.20-PQ',
          completedTasks: n.completedTasks + 1,
          status: n.status === 'degraded' ? ('nominal' as NodeStatus) : n.status,
        }
      : n
  );

  return { updatedControls, updatedNodes };
}

export function refactorAstTarget(
  targets: CodeQualityTarget[],
  nodes: ServerNode[],
  targetId: string
): {
  updatedTargets: CodeQualityTarget[];
  updatedNodes: ServerNode[];
} {
  const updatedTargets = targets.map((t) => {
    if (t.id === targetId) {
      return {
        ...t,
        cyclomaticComplexity: Math.max(2, Math.floor(t.cyclomaticComplexity * 0.45)),
        coveragePct: 100.0,
        executionUs: Math.max(12, Math.floor(t.executionUs * 0.58)),
        status: 'verified' as const,
        optimizationNote: 'Autonomous AST rewrite verified: zero-allocation SIMD hot-path.',
      };
    }
    return t;
  });

  const updatedNodes = nodes.map((n) => ({
    ...n,
    codeQualityScore: Math.min(100, n.codeQualityScore + 1),
    p99LatencyMs: Number(Math.max(0.45, n.p99LatencyMs - 0.03).toFixed(2)),
  }));

  return { updatedTargets, updatedNodes };
}
