'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCode2,
  ArrowRight,
  CheckCircle2,
  Clock,
  CircleDot,
} from 'lucide-react';

export type LifecycleStageId =
  | 'planning'
  | 'review'
  | 'proof'
  | 'resumption'
  | 'security'
  | 'speed'
  | 'quality';

interface QueueItem {
  id: string;
  title: string;
  signal: 1 | 2 | 3;
  state: 'review' | 'progress' | 'todo';
  meta: string;
}

interface DiffLine {
  num: string;
  type: 'context' | 'del' | 'add' | 'empty';
  leftCode: string;
  rightCode: string;
}

interface LifecycleStageData {
  id: LifecycleStageId;
  indexLabel: string;
  shortTitle: string;
  headline: string;
  summary: string;
  metricBadge: string;
  queueGroups: {
    groupTitle: string;
    count: number;
    groupType: 'review' | 'progress' | 'todo';
    items: QueueItem[];
  }[];
  filePath: string;
  toolBadge: string;
  diffLines: DiffLine[];
  proofFooter: string;
}

const LIFECYCLE_STAGES: LifecycleStageData[] = [
  {
    id: 'planning',
    indexLabel: '01',
    shortTitle: 'Planning to Execution',
    headline: 'Plan, synthesize, and execute',
    summary:
      'Arrow decomposes high-level engineering objectives into dependency-ordered execution graphs, binding zero-credential task envelopes before dispatching to 50 edge workers.',
    metricBadge: 'DAG Synthesis · 0.38ms',
    queueGroups: [
      {
        groupTitle: 'In Review',
        count: 3,
        groupType: 'review',
        items: [
          {
            id: 'ENG-2498',
            title: 'Synthesize AST migration graph for 50 edge workers',
            signal: 3,
            state: 'review',
            meta: 'DAG verified',
          },
          {
            id: 'ENG-2380',
            title: 'Bind zero-credential execution envelope to planner',
            signal: 3,
            state: 'review',
            meta: 'ECDSA P-256',
          },
          {
            id: 'ENG-2039',
            title: 'Partition fleet rollout by regional blast radius',
            signal: 2,
            state: 'review',
            meta: '6 regions',
          },
        ],
      },
      {
        groupTitle: 'In Progress',
        count: 4,
        groupType: 'progress',
        items: [
          {
            id: 'ENG-2076',
            title: 'Compile deterministic step boundaries for worker mesh',
            signal: 3,
            state: 'progress',
            meta: 'Step 1/4',
          },
          {
            id: 'ENG-2108',
            title: 'Allocate ephemeral sandbox quotas per task node',
            signal: 3,
            state: 'progress',
            meta: '$50 cap',
          },
          {
            id: 'ENG-2143',
            title: 'Pre-flight dependency lockfile integrity check',
            signal: 2,
            state: 'progress',
            meta: 'SHA-384',
          },
          {
            id: 'ENG-2187',
            title: 'Schedule canary wave on vc-edge-iad-01 enclave',
            signal: 1,
            state: 'progress',
            meta: 'US-East',
          },
        ],
      },
      {
        groupTitle: 'Todo',
        count: 4,
        groupType: 'todo',
        items: [
          {
            id: 'ENG-2254',
            title: 'Prune redundant build targets from monorepo graph',
            signal: 2,
            state: 'todo',
            meta: 'Queued',
          },
          {
            id: 'ENG-2291',
            title: 'Emit pre-execution telemetry snapshot to dock',
            signal: 2,
            state: 'todo',
            meta: 'Queued',
          },
        ],
      },
    ],
    filePath: 'vaulltcore-core/src/orchestrator/PlanExecutor.ts',
    toolBadge: 'Arrow Planner ⇕',
    diffLines: [
      {
        num: '01',
        type: 'context',
        leftCode: "import { compileExecutionDag } from '@vaulltcore/dag'",
        rightCode: "import { compileExecutionDag } from '@vaulltcore/dag'",
      },
      {
        num: '02',
        type: 'context',
        leftCode: "import { signEnvelope } from '@vaulltcore/crypto'",
        rightCode: "import { signEnvelope } from '@vaulltcore/crypto'",
      },
      {
        num: '03',
        type: 'del',
        leftCode: "import { rawShellDispatch } from '@legacy/runner'",
        rightCode: "import { dispatchVerifiedWave } from '@vaulltcore/fleet'",
      },
      {
        num: '04',
        type: 'context',
        leftCode: "import type { MigrationSpec } from './types'",
        rightCode: "import type { MigrationSpec } from './types'",
      },
      {
        num: '05',
        type: 'empty',
        leftCode: '',
        rightCode: '',
      },
      {
        num: '06',
        type: 'context',
        leftCode: 'export async function executePlan(spec: MigrationSpec) {',
        rightCode: 'export async function executePlan(spec: MigrationSpec) {',
      },
      {
        num: '07',
        type: 'del',
        leftCode: '  const tasks = spec.steps.map(s => s.rawCommand)',
        rightCode: '  const dag = compileExecutionDag(spec, { deterministic: true })',
      },
      {
        num: '08',
        type: 'empty',
        leftCode: '',
        rightCode: '',
      },
      {
        num: '09',
        type: 'del',
        leftCode: '  if (!spec.allowUnverified) {',
        rightCode: '  if (dag.blastRadius > spec.maxBlastRadius) {',
      },
      {
        num: '10',
        type: 'context',
        leftCode: "    return { status: 'held_for_policy_approval' }",
        rightCode: "    return { status: 'held_for_policy_approval' }",
      },
      {
        num: '11',
        type: 'context',
        leftCode: '  }',
        rightCode: '  }',
      },
      {
        num: '12',
        type: 'empty',
        leftCode: '',
        rightCode: '',
      },
      {
        num: '13',
        type: 'context',
        leftCode: '  const envelope = await signEnvelope(dag.merkleRoot)',
        rightCode: '  const envelope = await signEnvelope(dag.merkleRoot)',
      },
      {
        num: '14',
        type: 'context',
        leftCode: '  return (',
        rightCode: '  return (',
      },
      {
        num: '15',
        type: 'del',
        leftCode: '    await rawShellDispatch(tasks)',
        rightCode: '    await dispatchVerifiedWave({ dag, envelope, ttlSec: 900 })',
      },
      {
        num: '16',
        type: 'context',
        leftCode: '  )',
        rightCode: '  )',
      },
      {
        num: '17',
        type: 'context',
        leftCode: '}',
        rightCode: '}',
      },
    ],
    proofFooter: 'Plan #4821 · 50 workers bound · Zero raw credentials exposed',
  },
  {
    id: 'review',
    indexLabel: '02',
    shortTitle: 'Guided Code Review',
    headline: 'Build, review, and ship',
    summary:
      'Streamline code reviews with clear diffs, better context, and fewer back-and-forth comments. Keep PRs moving without sacrificing quality.',
    metricBadge: 'AST Diff Context · 100% Verified',
    queueGroups: [
      {
        groupTitle: 'In Review',
        count: 3,
        groupType: 'review',
        items: [
          {
            id: 'ENG-2498',
            title: 'Replace isFullySynced with a deterministic syncStatus enum',
            signal: 3,
            state: 'review',
            meta: 'PR #1420',
          },
          {
            id: 'ENG-2380',
            title: 'Show a stale data banner when edge stream lags > 50ms',
            signal: 3,
            state: 'review',
            meta: 'PR #1418',
          },
          {
            id: 'ENG-2039',
            title: 'Pass sync status to the dashboard telemetry header',
            signal: 1,
            state: 'review',
            meta: 'PR #1415',
          },
        ],
      },
      {
        groupTitle: 'In Progress',
        count: 4,
        groupType: 'progress',
        items: [
          {
            id: 'ENG-2076',
            title: 'Reduce ETA jitter across regional worker handoffs',
            signal: 3,
            state: 'progress',
            meta: 'Active',
          },
          {
            id: 'ENG-2108',
            title: 'Handle GPS dropouts gracefully during tunnel transit',
            signal: 3,
            state: 'progress',
            meta: 'Active',
          },
          {
            id: 'ENG-2143',
            title: 'Optimize map tile loading on low-memory enclaves',
            signal: 3,
            state: 'progress',
            meta: 'Active',
          },
          {
            id: 'ENG-2187',
            title: 'Prevent duplicate ride requests on retry pulse',
            signal: 1,
            state: 'progress',
            meta: 'Active',
          },
        ],
      },
      {
        groupTitle: 'Todo',
        count: 4,
        groupType: 'todo',
        items: [
          {
            id: 'ENG-2254',
            title: 'Reduce unnecessary map re-renders on camera pan',
            signal: 3,
            state: 'todo',
            meta: 'Backlog',
          },
          {
            id: 'ENG-2291',
            title: 'Clean up deprecated APIs using AST codemod',
            signal: 3,
            state: 'todo',
            meta: 'Backlog',
          },
        ],
      },
    ],
    filePath: 'kinetic-ios/src/screens/Home/HomeScreen.tsx',
    toolBadge: 'Linear ⇕',
    diffLines: [
      {
        num: '01',
        type: 'context',
        leftCode: "import React from 'react'",
        rightCode: "import React from 'react'",
      },
      {
        num: '02',
        type: 'context',
        leftCode: "import { View, ActivityIndicator } from 'react-native'",
        rightCode: "import { View, ActivityIndicator } from 'react-native'",
      },
      {
        num: '03',
        type: 'del',
        leftCode: "import { useVehicleState } from '@hooks/useVehicleState'",
        rightCode: "import { useVehicleState, SyncState } from '@hooks/useVehicleState'",
      },
      {
        num: '04',
        type: 'context',
        leftCode: "import { Dashboard } from '@components/Dashboard'",
        rightCode: "import { Dashboard } from '@components/Dashboard'",
      },
      {
        num: '05',
        type: 'empty',
        leftCode: '',
        rightCode: '',
      },
      {
        num: '06',
        type: 'context',
        leftCode: 'export const HomeScreen = () => {',
        rightCode: 'export const HomeScreen = () => {',
      },
      {
        num: '07',
        type: 'del',
        leftCode: '  const { vehicleState, isFullySynced } = useVehicleState()',
        rightCode: '  const { vehicleState, syncStatus } = useVehicleState()',
      },
      {
        num: '08',
        type: 'empty',
        leftCode: '',
        rightCode: '',
      },
      {
        num: '09',
        type: 'del',
        leftCode: '  if (!isFullySynced) {',
        rightCode: '  if (syncStatus === SyncState.Synchronizing) {',
      },
      {
        num: '10',
        type: 'context',
        leftCode: '    return <ActivityIndicator size="large" />',
        rightCode: '    return <ActivityIndicator size="large" />',
      },
      {
        num: '11',
        type: 'context',
        leftCode: '  }',
        rightCode: '  }',
      },
      {
        num: '12',
        type: 'empty',
        leftCode: '',
        rightCode: '',
      },
      {
        num: '13',
        type: 'context',
        leftCode: '  return (',
        rightCode: '  return (',
      },
      {
        num: '14',
        type: 'context',
        leftCode: '    <View>',
        rightCode: '    <View>',
      },
      {
        num: '15',
        type: 'del',
        leftCode: '      <Dashboard state={vehicleState} />',
        rightCode: '      <Dashboard state={vehicleState} sync={syncStatus} />',
      },
      {
        num: '16',
        type: 'context',
        leftCode: '    </View>',
        rightCode: '    </View>',
      },
      {
        num: '17',
        type: 'context',
        leftCode: '  )',
        rightCode: '  )',
      },
    ],
    proofFooter: 'Semantic AST diff · 0 breaking call-sites · Auto-approved by invariant gate',
  },
  {
    id: 'proof',
    indexLabel: '03',
    shortTitle: 'Proof Evidence',
    headline: 'Cryptographic proof for every change',
    summary:
      'Every executed command and code transformation produces a tamper-evident Merkle receipt, hardware enclave quote, and deterministic test replay bundle.',
    metricBadge: 'SHA-384 Merkle Receipt · Attested',
    queueGroups: [
      {
        groupTitle: 'In Review',
        count: 3,
        groupType: 'review',
        items: [
          {
            id: 'EVD-9041',
            title: 'Post-execution SHA-384 Merkle root attestation',
            signal: 3,
            state: 'review',
            meta: '0x9f8a..c412',
          },
          {
            id: 'EVD-9042',
            title: 'Deterministic syscall trace & sandbox I/O transcript',
            signal: 3,
            state: 'review',
            meta: 'Zero drift',
          },
          {
            id: 'EVD-9043',
            title: 'Hardware TPM PCR-14 enclave signature verification',
            signal: 2,
            state: 'review',
            meta: 'Verified',
          },
        ],
      },
      {
        groupTitle: 'In Progress',
        count: 4,
        groupType: 'progress',
        items: [
          {
            id: 'EVD-9048',
            title: 'Attach pre/post heap snapshot delta to PR #1420',
            signal: 3,
            state: 'progress',
            meta: '-14.2 MB',
          },
          {
            id: 'EVD-9051',
            title: 'Verify reproducible binary hash across 6 regions',
            signal: 3,
            state: 'progress',
            meta: '6/6 match',
          },
          {
            id: 'EVD-9055',
            title: 'Archive immutable compliance receipt to evidence dock',
            signal: 2,
            state: 'progress',
            meta: 'SOC2 / ISO',
          },
          {
            id: 'EVD-9059',
            title: 'Sign zero-regression flamegraph benchmark artifact',
            signal: 1,
            state: 'progress',
            meta: '0.42ms P99',
          },
        ],
      },
      {
        groupTitle: 'Todo',
        count: 4,
        groupType: 'todo',
        items: [
          {
            id: 'EVD-9064',
            title: 'Publish transparency log checkpoint to ledger',
            signal: 2,
            state: 'todo',
            meta: 'Scheduled',
          },
          {
            id: 'EVD-9070',
            title: 'Prune expired ephemeral witness keys after 15m TTL',
            signal: 2,
            state: 'todo',
            meta: 'Scheduled',
          },
        ],
      },
    ],
    filePath: 'vaulltcore-enclave/src/evidence/ProofBundle.ts',
    toolBadge: 'Evidence Dock ⇕',
    diffLines: [
      {
        num: '01',
        type: 'context',
        leftCode: "import { createHash } from 'node:crypto'",
        rightCode: "import { createHash } from 'node:crypto'",
      },
      {
        num: '02',
        type: 'context',
        leftCode: "import { verifyPcrQuote } from '@vaulltcore/tpm'",
        rightCode: "import { verifyPcrQuote } from '@vaulltcore/tpm'",
      },
      {
        num: '03',
        type: 'del',
        leftCode: "import { logUnverifiedOutput } from './logger'",
        rightCode: "import { sealMerkleEvidence } from '@vaulltcore/evidence'",
      },
      {
        num: '04',
        type: 'empty',
        leftCode: '',
        rightCode: '',
      },
      {
        num: '05',
        type: 'context',
        leftCode: 'export async function attestExecution(run: ExecutionRun) {',
        rightCode: 'export async function attestExecution(run: ExecutionRun) {',
      },
      {
        num: '06',
        type: 'del',
        leftCode: '  const digest = createHash("md5").update(run.stdout).digest()',
        rightCode: '  const digest = createHash("sha384").update(run.transcript).digest()',
      },
      {
        num: '07',
        type: 'empty',
        leftCode: '',
        rightCode: '',
      },
      {
        num: '08',
        type: 'del',
        leftCode: '  if (!run.exitCode) {',
        rightCode: '  if (run.exitCode === 0 && verifyPcrQuote(run.pcr14Quote)) {',
      },
      {
        num: '09',
        type: 'del',
        leftCode: '    return logUnverifiedOutput(digest)',
        rightCode: '    return sealMerkleEvidence({ digest, pcr14: run.pcr14Quote })',
      },
      {
        num: '10',
        type: 'context',
        leftCode: '  }',
        rightCode: '  }',
      },
      {
        num: '11',
        type: 'empty',
        leftCode: '',
        rightCode: '',
      },
      {
        num: '12',
        type: 'context',
        leftCode: '  throw new Error("Attestation invariant rejected")',
        rightCode: '  throw new Error("Attestation invariant rejected")',
      },
      {
        num: '13',
        type: 'context',
        leftCode: '}',
        rightCode: '}',
      },
    ],
    proofFooter: 'Merkle Root 0x8F4E..2B91 · Hardware PCR-14 Quote Verified · Zero Tamper',
  },
  {
    id: 'resumption',
    indexLabel: '04',
    shortTitle: 'Durable Resumption',
    headline: 'Zero-loss durable state resumption',
    summary:
      'Long-running agent workflows survive hardware faults, network partitions, and change freezes by snapshotting fiber execution registers to an idempotent write-ahead journal.',
    metricBadge: 'WAL Replay · 1.8ms Recovery',
    queueGroups: [
      {
        groupTitle: 'In Review',
        count: 3,
        groupType: 'review',
        items: [
          {
            id: 'DUR-8812',
            title: 'Snapshot fiber execution registers at step #14 boundary',
            signal: 3,
            state: 'review',
            meta: 'WAL 0x4F2A',
          },
          {
            id: 'DUR-8815',
            title: 'Resume interrupted migration without duplicate side-effects',
            signal: 3,
            state: 'review',
            meta: 'Idempotent',
          },
          {
            id: 'DUR-8819',
            title: 'Failover worker-edge-15 state to warm standby node',
            signal: 2,
            state: 'review',
            meta: '1.8ms',
          },
        ],
      },
      {
        groupTitle: 'In Progress',
        count: 4,
        groupType: 'progress',
        items: [
          {
            id: 'DUR-8824',
            title: 'Verify deterministic RNG seed restoration on wake',
            signal: 3,
            state: 'progress',
            meta: 'Verified',
          },
          {
            id: 'DUR-8829',
            title: 'Stream incremental memory pages to NVMe journal',
            signal: 3,
            state: 'progress',
            meta: 'Zero-copy',
          },
          {
            id: 'DUR-8833',
            title: 'Reconcile held policy gate approvals upon unfreeze',
            signal: 2,
            state: 'progress',
            meta: 'Auto-wake',
          },
          {
            id: 'DUR-8838',
            title: 'Compact completed checkpoint segments in background',
            signal: 1,
            state: 'progress',
            meta: 'Active',
          },
        ],
      },
      {
        groupTitle: 'Todo',
        count: 4,
        groupType: 'todo',
        items: [
          {
            id: 'DUR-8842',
            title: 'Replicate cross-region journal tail to EU-Central',
            signal: 2,
            state: 'todo',
            meta: 'Sync',
          },
          {
            id: 'DUR-8849',
            title: 'Validate 72-hour freeze suspension & exact wake',
            signal: 2,
            state: 'todo',
            meta: 'Test',
          },
        ],
      },
    ],
    filePath: 'vaulltcore-runtime/src/durable/FiberCheckpoint.ts',
    toolBadge: 'WAL Journal ⇕',
    diffLines: [
      {
        num: '01',
        type: 'context',
        leftCode: "import { WriteAheadJournal } from '@vaulltcore/wal'",
        rightCode: "import { WriteAheadJournal } from '@vaulltcore/wal'",
      },
      {
        num: '02',
        type: 'del',
        leftCode: 'let volatileStepIndex = 0',
        rightCode: "import { restoreFiberSnapshot } from '@vaulltcore/fiber'",
      },
      {
        num: '03',
        type: 'empty',
        leftCode: '',
        rightCode: '',
      },
      {
        num: '04',
        type: 'context',
        leftCode: 'export async function runDurableWorkflow(jobId: string) {',
        rightCode: 'export async function runDurableWorkflow(jobId: string) {',
      },
      {
        num: '05',
        type: 'del',
        leftCode: '  const state = { step: volatileStepIndex, cursor: null }',
        rightCode: '  const state = await restoreFiberSnapshot(jobId, WriteAheadJournal)',
      },
      {
        num: '06',
        type: 'empty',
        leftCode: '',
        rightCode: '',
      },
      {
        num: '07',
        type: 'del',
        leftCode: '  while (state.step < MAX_STEPS) {',
        rightCode: '  for await (const frame of state.resumeDeterministicStream()) {',
      },
      {
        num: '08',
        type: 'del',
        leftCode: '    await executeUncheckedStep(state.step++)',
        rightCode: '    await WriteAheadJournal.commitIdempotent(jobId, frame.offset)',
      },
      {
        num: '09',
        type: 'context',
        leftCode: '  }',
        rightCode: '  }',
      },
      {
        num: '10',
        type: 'empty',
        leftCode: '',
        rightCode: '',
      },
      {
        num: '11',
        type: 'context',
        leftCode: '  return { resumed: true, dataLossBytes: 0 }',
        rightCode: '  return { resumed: true, dataLossBytes: 0 }',
      },
      {
        num: '12',
        type: 'context',
        leftCode: '}',
        rightCode: '}',
      },
    ],
    proofFooter: 'Idempotent WAL Offset 0x4F2A · 0 duplicate mutations · 1.8ms cold-wake',
  },
  {
    id: 'security',
    indexLabel: '05',
    shortTitle: 'Zero-Trust Security',
    headline: 'Enclave-enforced zero-trust security',
    summary:
      'Planners hold zero machine credentials. Every command passes through the policy gateway with 15-minute ephemeral mTLS tokens, spend caps, and post-quantum key exchange.',
    metricBadge: 'mTLS 15m TTL · Post-Quantum',
    queueGroups: [
      {
        groupTitle: 'In Review',
        count: 3,
        groupType: 'review',
        items: [
          {
            id: 'SEC-1102',
            title: 'Rotate 15-minute ephemeral ECDSA P-256 worker tokens',
            signal: 3,
            state: 'review',
            meta: '15m TTL',
          },
          {
            id: 'SEC-1105',
            title: 'Enforce strict egress allowlist & $50 runtime spend cap',
            signal: 3,
            state: 'review',
            meta: 'Enforced',
          },
          {
            id: 'SEC-1109',
            title: 'Zeroize enclave memory pages upon task completion',
            signal: 3,
            state: 'review',
            meta: '0 leaks',
          },
        ],
      },
      {
        groupTitle: 'In Progress',
        count: 4,
        groupType: 'progress',
        items: [
          {
            id: 'SEC-1114',
            title: 'Upgrade inter-node conduit to ML-KEM-1024 hybrid TLS',
            signal: 3,
            state: 'progress',
            meta: 'PQ-Ready',
          },
          {
            id: 'SEC-1118',
            title: 'Isolate untrusted AST transforms inside seccomp-bpf',
            signal: 3,
            state: 'progress',
            meta: 'Locked',
          },
          {
            id: 'SEC-1122',
            title: 'Block direct shell socket access from planner agent',
            signal: 2,
            state: 'progress',
            meta: 'Airgapped',
          },
          {
            id: 'SEC-1127',
            title: 'Require dual cryptographic approval for prod schema',
            signal: 1,
            state: 'progress',
            meta: '2/2 sigs',
          },
        ],
      },
      {
        groupTitle: 'Todo',
        count: 4,
        groupType: 'todo',
        items: [
          {
            id: 'SEC-1131',
            title: 'Run automated fuzzing on policy envelope parser',
            signal: 2,
            state: 'todo',
            meta: 'Scheduled',
          },
          {
            id: 'SEC-1136',
            title: 'Rotate root hardware attestation certificate chain',
            signal: 2,
            state: 'todo',
            meta: 'Scheduled',
          },
        ],
      },
    ],
    filePath: 'vaulltcore-security/src/enclave/PolicyGate.ts',
    toolBadge: 'Policy Gate ⇕',
    diffLines: [
      {
        num: '01',
        type: 'context',
        leftCode: "import { verifyEnvelopeSignature } from '@vaulltcore/crypto'",
        rightCode: "import { verifyEnvelopeSignature } from '@vaulltcore/crypto'",
      },
      {
        num: '02',
        type: 'del',
        leftCode: 'const STATIC_WORKER_SECRET = process.env.SSH_KEY',
        rightCode: "import { issueEphemeralMtlsToken } from '@vaulltcore/mtls'",
      },
      {
        num: '03',
        type: 'empty',
        leftCode: '',
        rightCode: '',
      },
      {
        num: '04',
        type: 'context',
        leftCode: 'export async function authorizeCommand(cmd: SignedCommand) {',
        rightCode: 'export async function authorizeCommand(cmd: SignedCommand) {',
      },
      {
        num: '05',
        type: 'del',
        leftCode: '  if (!STATIC_WORKER_SECRET) return false',
        rightCode: '  if (cmd.estimatedSpendUsd > 50.0 || cmd.freezeLocked) {',
      },
      {
        num: '06',
        type: 'del',
        leftCode: '  return executeWithStaticKey(cmd, STATIC_WORKER_SECRET)',
        rightCode: "    return { allowed: false, reason: 'POLICY_GATE_HELD' }",
      },
      {
        num: '07',
        type: 'context',
        leftCode: '  }',
        rightCode: '  }',
      },
      {
        num: '08',
        type: 'empty',
        leftCode: '',
        rightCode: '',
      },
      {
        num: '09',
        type: 'del',
        leftCode: '  return { allowed: true }',
        rightCode: '  const token = await issueEphemeralMtlsToken({ ttlSec: 900 })',
      },
      {
        num: '10',
        type: 'context',
        leftCode: '}',
        rightCode: '  return { allowed: true, token, zeroizeOnExit: true }',
      },
      {
        num: '11',
        type: 'context',
        leftCode: '',
        rightCode: '}',
      },
    ],
    proofFooter: 'Zero static secrets · 15m ephemeral mTLS · seccomp-bpf enclave verified',
  },
  {
    id: 'speed',
    indexLabel: '06',
    shortTitle: 'Sub-Millisecond Speed',
    headline: 'Sub-millisecond hot-path execution',
    summary:
      'Engineered for jet-speed throughput: zero-allocation SharedArrayBuffer rings, eBPF packet steering, and pre-warmed isolate pools deliver 0.42ms P99 dispatch latency.',
    metricBadge: '0.42ms P99 · Zero GC Stalls',
    queueGroups: [
      {
        groupTitle: 'In Review',
        count: 3,
        groupType: 'review',
        items: [
          {
            id: 'SPD-3011',
            title: 'Zero-alloc ring buffer dispatch across 50 worker blades',
            signal: 3,
            state: 'review',
            meta: '0.42ms P99',
          },
          {
            id: 'SPD-3014',
            title: 'Eliminate JSON serialization in favor of flat binary frames',
            signal: 3,
            state: 'review',
            meta: '+340% ops',
          },
          {
            id: 'SPD-3018',
            title: 'Pre-warm V8 isolate snapshots in L3 cache memory',
            signal: 3,
            state: 'review',
            meta: '0.18ms boot',
          },
        ],
      },
      {
        groupTitle: 'In Progress',
        count: 4,
        groupType: 'progress',
        items: [
          {
            id: 'SPD-3022',
            title: 'SIMD vectorized AST lexer for instant diff parsing',
            signal: 3,
            state: 'progress',
            meta: '4.2 GB/s',
          },
          {
            id: 'SPD-3025',
            title: 'Pin real-time packet threads to dedicated CPU cores',
            signal: 2,
            state: 'progress',
            meta: 'NUMA-0',
          },
          {
            id: 'SPD-3029',
            title: 'Batch WebGL telemetry matrices into single draw call',
            signal: 3,
            state: 'progress',
            meta: '60 FPS',
          },
          {
            id: 'SPD-3034',
            title: 'Bypass kernel TCP stack via XDP zero-copy sockets',
            signal: 2,
            state: 'progress',
            meta: 'eBPF',
          },
        ],
      },
      {
        groupTitle: 'Todo',
        count: 4,
        groupType: 'todo',
        items: [
          {
            id: 'SPD-3040',
            title: 'Profile tail-latency spikes under 100k req/s burst',
            signal: 2,
            state: 'todo',
            meta: 'Benchmark',
          },
          {
            id: 'SPD-3044',
            title: 'Inline hot-path bounds checks in WASM verifier',
            signal: 1,
            state: 'todo',
            meta: 'Queued',
          },
        ],
      },
    ],
    filePath: 'vaulltcore-kernel/src/ebpf/RingDispatcher.ts',
    toolBadge: '0.42ms P99 ⇕',
    diffLines: [
      {
        num: '01',
        type: 'context',
        leftCode: "import { RingBuffer } from '@vaulltcore/shm'",
        rightCode: "import { RingBuffer } from '@vaulltcore/shm'",
      },
      {
        num: '02',
        type: 'del',
        leftCode: 'export function dispatchPacket(payload: object) {',
        rightCode: 'const _scratchView = new DataView(new SharedArrayBuffer(4096))',
      },
      {
        num: '03',
        type: 'del',
        leftCode: '  const serialized = JSON.stringify(payload)',
        rightCode: 'export function dispatchPacketZeroCopy(slotOffset: number) {',
      },
      {
        num: '04',
        type: 'del',
        leftCode: '  const copy = Buffer.from(serialized)',
        rightCode: '  const header = _scratchView.getUint32(slotOffset, true)',
      },
      {
        num: '05',
        type: 'empty',
        leftCode: '',
        rightCode: '',
      },
      {
        num: '06',
        type: 'context',
        leftCode: '  if (RingBuffer.isFull()) {',
        rightCode: '  if (RingBuffer.isFull()) {',
      },
      {
        num: '07',
        type: 'context',
        leftCode: '    return RingBuffer.applyBackpressure()',
        rightCode: '    return RingBuffer.applyBackpressure()',
      },
      {
        num: '08',
        type: 'context',
        leftCode: '  }',
        rightCode: '  }',
      },
      {
        num: '09',
        type: 'empty',
        leftCode: '',
        rightCode: '',
      },
      {
        num: '10',
        type: 'del',
        leftCode: '  return RingBuffer.pushHeapClone(copy)',
        rightCode: '  return RingBuffer.commitDescriptor(slotOffset, header)',
      },
      {
        num: '11',
        type: 'context',
        leftCode: '}',
        rightCode: '}',
      },
    ],
    proofFooter: '0 heap allocations in hot loop · P99 0.42ms · 100/100 Lighthouse Speed',
  },
  {
    id: 'quality',
    indexLabel: '07',
    shortTitle: 'Deterministic Quality',
    headline: 'Deterministic code quality invariants',
    summary:
      'Static AST verification, automatic resource disposal checks, and strict complexity bounds ensure every shipped patch is free of memory leaks and race conditions.',
    metricBadge: '0 Leaks · 100% Type-Safe',
    queueGroups: [
      {
        groupTitle: 'In Review',
        count: 3,
        groupType: 'review',
        items: [
          {
            id: 'QLT-4101',
            title: 'Enforce deterministic AbortController listener disposal',
            signal: 3,
            state: 'review',
            meta: '0 leaks',
          },
          {
            id: 'QLT-4104',
            title: 'Eliminate unhandled promise rejections in worker pool',
            signal: 3,
            state: 'review',
            meta: 'Strict AST',
          },
          {
            id: 'QLT-4108',
            title: 'Cap function cyclomatic complexity at <= 4 across core',
            signal: 2,
            state: 'review',
            meta: 'Passed',
          },
        ],
      },
      {
        groupTitle: 'In Progress',
        count: 4,
        groupType: 'progress',
        items: [
          {
            id: 'QLT-4112',
            title: 'Prune 14 unreachable dead-code branches in telemetry',
            signal: 3,
            state: 'progress',
            meta: '-1.8 KB',
          },
          {
            id: 'QLT-4115',
            title: 'Verify WebGL geometry & texture disposal on unmount',
            signal: 3,
            state: 'progress',
            meta: 'Verified',
          },
          {
            id: 'QLT-4119',
            title: 'Enforce exhaustive switch union checks on status enums',
            signal: 2,
            state: 'progress',
            meta: 'Type-safe',
          },
          {
            id: 'QLT-4123',
            title: 'Run property-based invariant fuzzing across 10k seeds',
            signal: 1,
            state: 'progress',
            meta: '10k/10k',
          },
        ],
      },
      {
        groupTitle: 'Todo',
        count: 4,
        groupType: 'todo',
        items: [
          {
            id: 'QLT-4128',
            title: 'Audit bundle tree-shaking for zero unused exports',
            signal: 2,
            state: 'todo',
            meta: 'Clean',
          },
          {
            id: 'QLT-4132',
            title: 'Generate formal TLA+ state specification for failover',
            signal: 2,
            state: 'todo',
            meta: 'Queued',
          },
        ],
      },
    ],
    filePath: 'vaulltcore-ast/src/quality/InvariantVerifier.ts',
    toolBadge: 'AST Gate ⇕',
    diffLines: [
      {
        num: '01',
        type: 'context',
        leftCode: "import { subscribeTelemetry } from '@vaulltcore/stream'",
        rightCode: "import { subscribeTelemetry } from '@vaulltcore/stream'",
      },
      {
        num: '02',
        type: 'context',
        leftCode: "import type { TelemetryPacket } from './types'",
        rightCode: "import type { TelemetryPacket } from './types'",
      },
      {
        num: '03',
        type: 'empty',
        leftCode: '',
        rightCode: '',
      },
      {
        num: '04',
        type: 'context',
        leftCode: 'export function attachNodeMonitor(nodeId: string) {',
        rightCode: 'export function attachNodeMonitor(nodeId: string) {',
      },
      {
        num: '05',
        type: 'del',
        leftCode: '  window.addEventListener("message", (ev) => {',
        rightCode: '  const controller = new AbortController()',
      },
      {
        num: '06',
        type: 'del',
        leftCode: '    subscribeTelemetry(nodeId, ev.data)',
        rightCode: '  subscribeTelemetry(nodeId, { signal: controller.signal })',
      },
      {
        num: '07',
        type: 'del',
        leftCode: '  })',
        rightCode: '  return () => controller.abort("DETERMINISTIC_CLEANUP")',
      },
      {
        num: '08',
        type: 'context',
        leftCode: '}',
        rightCode: '}',
      },
    ],
    proofFooter: 'AST Invariant Gate · 0 listener leaks · 100% deterministic cleanup',
  },
];

function SignalBars({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-end gap-[2px] w-3.5 h-3 shrink-0"
    >
      <span
        className={`w-[2.5px] h-1.5 rounded-[1px] ${
          level >= 1 ? 'bg-[#94A3B8]' : 'bg-[#262B38]'
        }`}
      />
      <span
        className={`w-[2.5px] h-2 rounded-[1px] ${
          level >= 2 ? 'bg-[#94A3B8]' : 'bg-[#262B38]'
        }`}
      />
      <span
        className={`w-[2.5px] h-2.5 rounded-[1px] ${
          level >= 3 ? 'bg-[#CBD5E1]' : 'bg-[#262B38]'
        }`}
      />
    </span>
  );
}

interface LifecycleFlipShowcaseProps {
  isDarkMode?: boolean;
}

export default function LifecycleFlipShowcase({
  isDarkMode = true,
}: LifecycleFlipShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState<number>(1);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const currentStage = LIFECYCLE_STAGES[activeIndex];

  // Clean autonomous inline flip every 3.8 seconds (paused when offscreen for 0ms idle CPU)
  useEffect(() => {
    const el = containerRef.current;
    let isVisible = true;

    let observer: IntersectionObserver | null = null;
    if (el && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]) {
            isVisible = entries[0].isIntersecting;
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(el);
    }

    const interval = setInterval(() => {
      if (!isVisible || document.visibilityState === 'hidden') return;
      setIsFlipping(true);
      setActiveIndex((prev) => (prev + 1) % LIFECYCLE_STAGES.length);
      setTimeout(() => setIsFlipping(false), 240);
    }, 3800);

    return () => {
      clearInterval(interval);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Continuous Engineering Lifecycle Auto-Flipping Showcase"
      aria-live="off"
      className={`w-full rounded-3xl border p-6 sm:p-10 lg:p-12 transition-colors duration-300 relative overflow-hidden ${
        isDarkMode
          ? 'bg-[#08090D] border-[#1E222D] text-[#E2E8F0] shadow-[0_28px_70px_rgba(0,0,0,0.85)]'
          : 'bg-[#FFFFFF] border-[#CFD5E2] text-[#0E1117] shadow-xl'
      }`}
    >
      {/* Top Linear-grade Liquid Silver specular hairline + 5% Deep Dark Purple ambient glow */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#E2E8F0]/45 to-transparent" />
      <div className="absolute -top-36 right-1/4 w-96 h-36 bg-[#2E1065]/25 rounded-full blur-3xl pointer-events-none" />

      {/* =====================================================================
          1. CLEAN EDITORIAL SPLIT HEADER
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#CBD5E1]">
            <span className="px-2 py-0.5 rounded bg-[#2E1065] border border-[#4C1D95] text-[#F8FAFC] font-semibold">
              {currentStage.indexLabel} / 07
            </span>
            <span className={isDarkMode ? 'text-[#CBD5E1]' : 'text-[#2E1065]'}>
              {currentStage.shortTitle}
            </span>
            <span aria-hidden="true" className="text-[#94A3B8]">
              ·
            </span>
            <span className="text-[#94A3B8]">{currentStage.metricBadge}</span>
          </div>

          <h3
            className={`text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-[-0.035em] leading-[1.06] transition-all duration-200 ${
              isDarkMode
                ? 'bg-gradient-to-b from-[#FFFFFF] via-[#F1F5F9] to-[#94A3B8] bg-clip-text text-transparent'
                : 'text-[#0E1117]'
            }`}
            style={{ textWrap: 'balance' }}
          >
            {currentStage.headline}
          </h3>
        </div>

        <div className="lg:col-span-6 flex flex-col justify-between space-y-5 lg:pt-2">
          <p
            className={`text-base sm:text-lg leading-[1.6] max-w-xl transition-colors duration-200 ${
              isDarkMode ? 'text-[#CBD5E1]' : 'text-[#2D3545]'
            }`}
          >
            {currentStage.summary}
          </p>

          <div>
            <a
              href="#section-ready"
              className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] rounded-lg py-1 ${
                isDarkMode
                  ? 'text-[#F8FAFC] hover:text-[#CBD5E1]'
                  : 'text-[#2E1065] hover:text-[#3B0764]'
              }`}
            >
              <span>Learn more</span>
              <ArrowRight
                aria-hidden="true"
                className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1"
              />
            </a>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. GROUPED PICTURES AUTO-FLIPPING STAGE (Every 3.8s)
         ===================================================================== */}
      <div className="mt-10 relative min-h-[420px] sm:min-h-[450px] lg:min-h-[470px] flex items-center justify-center select-none">
        {/* Subtle Back-Deck Ghost Peek Card */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute top-3 right-6 w-[62%] h-[390px] rounded-2xl bg-[#0B0D13] border border-[#1A1E29] opacity-40 pointer-events-none transition-transform duration-300"
          style={{
            transform: isFlipping
              ? 'translate3d(10px, -10px, 0) scale(0.98)'
              : 'translate3d(0px, 0px, 0) scale(0.95)',
          }}
        />

        {/* =================================================================
            GROUPED CARD A (LEFT / BACK PANEL): LINEAR ISSUE & EXECUTION QUEUE
           ================================================================= */}
        <div
          className="hidden lg:block lg:absolute lg:left-0 lg:top-6 z-10 w-[56%] rounded-2xl bg-[#0B0D12] border border-[#1C202B] opacity-95 shadow-[0_16px_40px_rgba(0,0,0,0.75)] transition-all duration-300 overflow-hidden"
          style={{
            transform: isFlipping
              ? 'translate3d(-12px, 6px, 0) scale(0.97)'
              : 'translate3d(0px, 0px, 0) scale(0.985)',
          }}
        >
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#CBD5E1]/30 to-transparent" />

          <div className="p-4 space-y-4 font-sans text-xs">
            {currentStage.queueGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1.5">
                <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#12151E]/90 border border-[#1C202B]">
                  {group.groupType === 'review' ? (
                    <CheckCircle2
                      className="w-3.5 h-3.5 text-[#C084FC] shrink-0"
                      aria-hidden="true"
                    />
                  ) : group.groupType === 'progress' ? (
                    <Clock
                      className="w-3.5 h-3.5 text-[#E2E8F0] shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <CircleDot
                      className="w-3.5 h-3.5 text-[#94A3B8] shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span className="font-semibold text-[#F8FAFC]">
                    {group.groupTitle}
                  </span>
                  <span className="font-mono text-[11px] text-[#94A3B8] tabular-nums">
                    {group.count}
                  </span>
                </div>

                <div className="space-y-1 pl-1">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <SignalBars level={item.signal} />
                        <span className="font-mono text-[11px] text-[#94A3B8] shrink-0 tabular-nums">
                          {item.id}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            item.state === 'review'
                              ? 'bg-[#2E1065] border border-[#A855F7]'
                              : item.state === 'progress'
                              ? 'bg-[#E2E8F0]'
                              : 'bg-[#64748B]'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="text-[#E2E8F0] truncate font-medium">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#94A3B8] shrink-0 tabular-nums">
                        {item.meta}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =================================================================
            GROUPED CARD B (RIGHT / FOREGROUND PANEL): SIDE-BY-SIDE CODE DIFF INSPECTOR
           ================================================================= */}
        <div
          className="relative w-full lg:w-[68%] lg:ml-auto z-20 rounded-2xl bg-[#0D0F14] border border-[#2E3446] shadow-[0_28px_80px_rgba(0,0,0,0.95)] transition-all duration-300 overflow-hidden"
          style={{
            transform: isFlipping
              ? 'translate3d(12px, -6px, 0) scale(0.97)'
              : 'translate3d(0px, 0px, 0) scale(1)',
          }}
        >
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#E2E8F0]/45 to-transparent" />

          <div className="px-4 py-3 border-b border-[#1A1E29] bg-[#10131A] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileCode2
                className="w-4 h-4 text-[#94A3B8] shrink-0"
                aria-hidden="true"
              />
              <span className="font-mono text-xs text-[#CBD5E1] truncate">
                {currentStage.filePath}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-md bg-[#161922] border border-[#262B38] font-mono text-[11px] text-[#CBD5E1]">
                {currentStage.toolBadge}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 bg-[#0A0C10] font-mono text-[11px] sm:text-xs leading-[1.65] overflow-x-auto relative">
            <div className="md:col-span-7 border-r border-[#171A24] py-3">
              {currentStage.diffLines.map((line) => {
                const isDel = line.type === 'del';
                return (
                  <div
                    key={`L-${line.num}`}
                    className={`px-3 sm:px-4 py-0.5 flex items-start gap-3 whitespace-pre ${
                      isDel
                        ? 'bg-[#20122E]/75 text-[#E9D5FF]'
                        : 'text-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`w-5 shrink-0 select-none tabular-nums ${
                        isDel ? 'text-[#C084FC] font-semibold' : 'text-[#94A3B8]'
                      }`}
                    >
                      {line.num}
                    </span>
                    <span className="truncate">{line.leftCode || ' '}</span>
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block md:col-span-5 py-3 relative overflow-hidden">
              {currentStage.diffLines.map((line) => {
                const isChanged = line.type === 'del' || line.type === 'add';
                return (
                  <div
                    key={`R-${line.num}`}
                    className={`px-3 sm:px-4 py-0.5 flex items-start gap-3 whitespace-pre ${
                      isChanged
                        ? 'bg-[#2E1065]/65 text-[#F8FAFC]'
                        : 'text-[#94A3B8]'
                    }`}
                  >
                    <span
                      className={`w-5 shrink-0 select-none tabular-nums ${
                        isChanged
                          ? 'text-[#E9D5FF] font-semibold'
                          : 'text-[#94A3B8]'
                      }`}
                    >
                      {line.num}
                    </span>
                    <span className="truncate">{line.rightCode || ' '}</span>
                  </div>
                );
              })}

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0A0C10] to-transparent"
              />
            </div>
          </div>

          <div className="px-4 py-2.5 border-t border-[#181C26] bg-[#0E1017] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-2 text-[#CBD5E1]">
              <span className="w-2 h-2 rounded-full bg-[#2E1065] border border-[#A855F7]" />
              <span>{currentStage.proofFooter}</span>
            </div>
            <span className="text-[#94A3B8]">
              {currentStage.indexLabel} / 07 · Auto-flipping 3.8s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
