'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  GitFork,
  Sparkles,
  Shield,
  CheckCircle2,
  Clock,
  RotateCcw,
  Zap,
  ChevronDown,
  Info,
  Check,
  Play,
  Pause,
  Flame,
  Box,
  Grid,
  Activity,
  RefreshCw,
} from 'lucide-react';

export type WorkerStatus = 'running' | 'queued' | 'held' | 'failed' | 'idle';
export type ViewCameraPreset = 'isometric' | 'top' | 'front' | 'grid2d';

export interface WorkerNode {
  id: number;
  row: number;
  col: number;
  status: WorkerStatus;
  hostname: string;
  region: string;
  latencyMs: number;
  loadFactor: number;
  task: string;
  tokenExpiresInSec: number;
  tokenGeneration: number;
  envelopeSignature: string;
}

// Exactly 50 initial workers (5 rows x 10 cols)
const INITIAL_WORKER_STATUSES: WorkerStatus[] = [
  // Row 1 (10)
  'running', 'running', 'running', 'running', 'idle', 'running', 'running', 'queued', 'running', 'running',
  // Row 2 (10)
  'running', 'running', 'running', 'running', 'failed', 'running', 'running', 'running', 'running', 'idle',
  // Row 3 (10)
  'running', 'running', 'queued', 'running', 'running', 'running', 'running', 'running', 'running', 'running',
  // Row 4 (10)
  'running', 'held', 'running', 'running', 'running', 'running', 'running', 'running', 'queued', 'running',
  // Row 5 (10)
  'running', 'running', 'running', 'running', 'running', 'idle', 'held', 'running', 'running', 'running',
];

const REGIONS = [
  'US-East (IAD)',
  'EU-Central (FRA)',
  'AP-East (HND)',
  'US-West (SJC)',
  'EU-West (LHR)',
];

function generateInitialWorkers(): WorkerNode[] {
  return INITIAL_WORKER_STATUSES.map((status, index) => {
    const row = Math.floor(index / 10) + 1;
    const col = (index % 10) + 1;
    const region = REGIONS[index % REGIONS.length];
    const padId = (index + 1).toString().padStart(2, '0');
    const baseLoad =
      status === 'running'
        ? 0.65 + ((index * 17) % 30) / 100
        : status === 'queued'
        ? 0.45
        : status === 'failed'
        ? 0.95
        : status === 'held'
        ? 0.35
        : 0.16;

    return {
      id: index + 1,
      row,
      col,
      status,
      hostname: `worker-edge-${padId}.${region.split(' ')[0].toLowerCase()}.vc`,
      region,
      latencyMs: +(0.38 + ((index * 0.017) % 0.42)).toFixed(2),
      loadFactor: baseLoad,
      task:
        status === 'failed'
          ? 'eBPF hot-path compilation (timeout 40ms)'
          : status === 'held'
          ? 'Production DB migration (approval required)'
          : status === 'queued'
          ? 'AST dead-code purge & memory zeroing'
          : status === 'idle'
          ? 'Standby node in warm buffer'
          : 'Zero-trust mTLS enclave payload dispatch',
      tokenExpiresInSec: 840 + ((index * 13) % 120),
      tokenGeneration: 1,
      envelopeSignature: `0x${(index * 749392 + 0xa8f2b1).toString(16).slice(0, 8)}...${(
        index * 98213 +
        0x4f12
      )
        .toString(16)
        .slice(0, 4)}`,
    };
  });
}

// 95% Deep Liquid Silver & Black + 5% Deep Dark Purple (0x2e1065) PBR Palette
const STATUS_BODY_HEX: Record<WorkerStatus, number> = {
  running: 0xc8d2e0, // Brushed Liquid Silver metallic blade
  queued: 0x525b6c,  // Smoked Titanium Silver blade
  held: 0x2e1065,    // 5% Deep Dark Purple policy-gated blade
  failed: 0x3b0764,  // Deep Dark Imperial Purple/Crimson fault chassis
  idle: 0x12141c,    // Deep Anodized Obsidian Black blade
};

const STATUS_CAP_HEX: Record<WorkerStatus, number> = {
  running: 0xf1f5f9, // Specular Platinum-Silver top cap
  queued: 0x94a3b8,  // Brushed Silver top cap
  held: 0x581c87,    // Deep Dark Purple specular cap
  failed: 0xe11d48,  // Smoked Crimson fault beacon cap
  idle: 0x272a36,    // Muted Obsidian cap
};

export default function FleetDispatchCard() {
  const [workers, setWorkers] = useState<WorkerNode[]>(generateInitialWorkers);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number>(15);
  const [hoveredWorkerId, setHoveredWorkerId] = useState<number | null>(null);
  const [spendAmount, setSpendAmount] = useState<number>(12.07);
  const [freezeActive, setFreezeActive] = useState<boolean>(false);
  const [approvalsPending, setApprovalsPending] = useState<number>(2);
  const [activePreset, setActivePreset] = useState<'acme-staging' | 'stripe-prod' | 'revolut-edge'>(
    'acme-staging'
  );
  const [showPresetDropdown, setShowPresetDropdown] = useState<boolean>(false);
  const [isHealingWorker, setIsHealingWorker] = useState<boolean>(false);
  const [healStep, setHealStep] = useState<string | null>(null);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(
    'Liquid Silver & Obsidian 3D InstancedMesh active · Single-draw-call pipeline'
  );

  // Live simulation & 3D controls state
  const [cameraPreset, setCameraPreset] = useState<ViewCameraPreset>('isometric');
  const [autoSimEnabled, setAutoSimEnabled] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<1 | 2>(1);
  const [activePacketStage, setActivePacketStage] = useState<0 | 1 | 2 | 3>(1);
  const [tokenRotationsCount, setTokenRotationsCount] = useState<number>(142);
  const [fpsStats, setFpsStats] = useState<{
    fps: number;
    frameMs: number;
    drawCalls: number;
  }>({
    fps: 60,
    frameMs: 0.38,
    drawCalls: 2,
  });

  // Refs for zero-allocation 60fps WebGL loop synchronization
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const workersRef = useRef<WorkerNode[]>(workers);
  const selectedWorkerIdRef = useRef<number>(selectedWorkerId);
  const hoveredWorkerIdRef = useRef<number | null>(hoveredWorkerId);
  const cameraPresetRef = useRef<ViewCameraPreset>(cameraPreset);
  const shockwaveTimeRef = useRef<number>(-10);
  const prngCounterRef = useRef<number>(101);
  const isHealingRef = useRef<boolean>(isHealingWorker);

  useEffect(() => {
    workersRef.current = workers;
  }, [workers]);

  useEffect(() => {
    selectedWorkerIdRef.current = selectedWorkerId;
  }, [selectedWorkerId]);

  useEffect(() => {
    hoveredWorkerIdRef.current = hoveredWorkerId;
  }, [hoveredWorkerId]);

  useEffect(() => {
    cameraPresetRef.current = cameraPreset;
  }, [cameraPreset]);

  useEffect(() => {
    isHealingRef.current = isHealingWorker;
  }, [isHealingWorker]);

  // Deterministic pseudo-random generator for callbacks
  const nextRand = useCallback(() => {
    prngCounterRef.current = (prngCounterRef.current * 1664525 + 1013904223) % 4294967296;
    return prngCounterRef.current / 4294967296;
  }, []);

  // Heal a failed worker using 3-step exponential backoff
  const handleHealFailedWorker = useCallback((workerId: number, isAuto = false) => {
    if (isHealingRef.current) return;
    setIsHealingWorker(true);
    setHealStep('Attempt #1: Backoff 40ms · Probing enclave socket...');
    setLastActionMessage(
      `${isAuto ? '[Auto-Heal]' : '[Backoff]'} Dispatching recovery probe to Worker #${workerId}...`
    );

    setTimeout(() => {
      setHealStep('Attempt #2: Exponential backoff 80ms (jitter +12ms)...');
      setTimeout(() => {
        setHealStep('Signed ECDSA P-256 envelope verified · Liquid silver blade linked');
        setTimeout(() => {
          setWorkers((prev) =>
            prev.map((w) =>
              w.id === workerId
                ? {
                    ...w,
                    status: 'running',
                    task: 'Zero-trust mTLS enclave payload dispatch (Healed)',
                    latencyMs: 0.41,
                    loadFactor: 0.74,
                    tokenExpiresInSec: 900,
                    tokenGeneration: w.tokenGeneration + 1,
                  }
                : w
            )
          );
          shockwaveTimeRef.current = 0;
          setIsHealingWorker(false);
          setHealStep(null);
          setTokenRotationsCount((c) => c + 1);
          setLastActionMessage(
            `Worker #${workerId} healed via exponential backoff & restored to active liquid-silver pool.`
          );
        }, 550);
      }, 600);
    }, 550);
  }, []);

  // Live 1-second token countdown & rotation ticker
  useEffect(() => {
    const timer = setInterval(() => {
      let rotatedAny = false;
      setWorkers((prev) =>
        prev.map((w) => {
          if (w.tokenExpiresInSec <= 2) {
            rotatedAny = true;
            return {
              ...w,
              tokenExpiresInSec: 900,
              tokenGeneration: w.tokenGeneration + 1,
            };
          }
          return {
            ...w,
            tokenExpiresInSec: w.tokenExpiresInSec - 1,
          };
        })
      );
      if (rotatedAny) {
        setTokenRotationsCount((c) => c + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Autonomous Live Simulation Loop (Packet routing stages + micro-fanout + auto-heal)
  useEffect(() => {
    if (!autoSimEnabled) return;

    const intervalMs = simSpeed === 2 ? 1300 : 2400;
    const simTimer = setInterval(() => {
      setActivePacketStage((prevStage) => {
        const nextStage = ((prevStage % 3) + 1) as 1 | 2 | 3;

        if (nextStage === 3 && !freezeActive) {
          shockwaveTimeRef.current = 0;

          setWorkers((prev) => {
            const failedNode = prev.find((w) => w.status === 'failed');
            if (failedNode && !isHealingRef.current) {
              setTimeout(() => {
                handleHealFailedWorker(failedNode.id, true);
              }, 150);
            }

            return prev.map((w, idx) => {
              if (w.status === 'failed' || w.status === 'held') return w;
              const r = ((prngCounterRef.current + idx * 31) % 100) / 100;
              const jitter = ((idx % 7) - 3) * 0.01;
              const nextLatency = Math.max(
                0.31,
                Math.min(0.89, +(w.latencyMs + jitter).toFixed(2))
              );
              const nextLoad =
                w.status === 'running'
                  ? Math.max(0.45, Math.min(0.95, +(0.62 + r * 0.32).toFixed(2)))
                  : w.loadFactor;

              return {
                ...w,
                latencyMs: nextLatency,
                loadFactor: nextLoad,
              };
            });
          });

          setSpendAmount((prev) => +(prev < 49.5 ? prev + 0.03 : 12.07).toFixed(2));
        }

        return nextStage;
      });
    }, intervalMs);

    return () => clearInterval(simTimer);
  }, [autoSimEnabled, simSpeed, freezeActive, handleHealFailedWorker]);

  // Trigger manual fan-out pulse
  const handleSimulatePulse = () => {
    if (freezeActive) {
      setLastActionMessage('Dispatch blocked by active Change Freeze policy gate.');
      return;
    }
    shockwaveTimeRef.current = 0;
    setActivePacketStage(3);
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.status === 'failed' || w.status === 'held') return w;
        const r = nextRand();
        return {
          ...w,
          latencyMs: +(0.34 + r * 0.24).toFixed(2),
          loadFactor: w.status === 'running' ? +(0.65 + r * 0.3).toFixed(2) : w.loadFactor,
          tokenExpiresInSec: 900,
          tokenGeneration: w.tokenGeneration + 1,
        };
      })
    );
    setTokenRotationsCount((c) => c + 50);
    setSpendAmount((prev) => +(prev + 0.14).toFixed(2));
    setLastActionMessage(
      'Liquid-silver fan-out beam completed across 50 3D blades · Envelopes rotated.'
    );
  };

  // Interactive Chaos Engineering: Inject Fault into random running worker blade
  const handleInjectChaosFault = () => {
    const runningWorkers = workers.filter((w) => w.status === 'running');
    if (runningWorkers.length === 0) return;

    const pickIndex = Math.floor(nextRand() * runningWorkers.length);
    const targetWorker = runningWorkers[pickIndex];

    setWorkers((prev) =>
      prev.map((w) =>
        w.id === targetWorker.id
          ? {
              ...w,
              status: 'failed',
              latencyMs: 39.8,
              loadFactor: 1.0,
              task: 'Chaos fault: eBPF verifier socket timeout (40ms)',
            }
          : w
      )
    );
    setSelectedWorkerId(targetWorker.id);
    shockwaveTimeRef.current = 0;
    setLastActionMessage(
      `Chaos Fault injected into Worker #${targetWorker.id} (${targetWorker.hostname}). Backoff monitor armed.`
    );
  };

  // Approve pending policies
  const handleApprovePending = () => {
    if (approvalsPending === 0) return;
    setApprovalsPending(0);
    shockwaveTimeRef.current = 0;
    setWorkers((prev) =>
      prev.map((w) =>
        w.status === 'held'
          ? {
              ...w,
              status: 'running',
              loadFactor: 0.78,
              task: 'Approved DB migration executed with signed token',
            }
          : w
      )
    );
    setLastActionMessage('Approved 2 pending commands. Held blades transitioned to Liquid Silver Running.');
  };

  // Toggle freeze policy
  const handleToggleFreeze = () => {
    setFreezeActive((prev) => {
      const next = !prev;
      setLastActionMessage(
        next
          ? 'Change freeze LOCKED at Policy Gateway. Fan-out dispatches paused.'
          : 'Change freeze released. Autonomous 3D blade dispatch resumed.'
      );
      return next;
    });
  };

  // ===========================================================================
  // SINGLE-DRAW-CALL THREE.JS INSTANCEDMESH ENGINE
  // (95% Deep Liquid Silver & Black Beams + 5% Deep Dark Purple 0x2e1065)
  // ===========================================================================
  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    const width = mountEl.clientWidth || 720;
    const height = mountEl.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07080b);
    scene.fog = new THREE.FogExp2(0x07080b, 0.034);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 120);
    camera.position.set(0, 10.5, 13.5);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    // Defer Studio RoomEnvironment reflection past First Contentful Paint (0ms TBT)
    let envTexture: THREE.Texture | null = null;
    const envTimer = window.setTimeout(() => {
      try {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.035).texture;
        scene.environment = envTexture;
        pmremGenerator.dispose();
      } catch {
        // Ignore if disposed
      }
    }, 48);

    // Pause WebGL render loop when scrolled out of viewport (0ms offscreen overhead)
    let isInViewport = true;
    const viewportObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]) {
          isInViewport = entries[0].isIntersecting;
        }
      },
      { threshold: 0.05 }
    );
    viewportObserver.observe(mountEl);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 26;
    controls.target.set(0, 0.2, 0);

    // Linear-Grade Studio Lighting: Crisp Platinum Key + Cool Silver Rim + 5% Deep Dark Purple Under-Fill
    const ambientLight = new THREE.HemisphereLight(0xf1f5f9, 0x090a0f, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
    keyLight.position.set(9, 18, 11);
    scene.add(keyLight);

    const silverRimLight = new THREE.DirectionalLight(0xcbd5e1, 1.5);
    silverRimLight.position.set(-10, 10, -10);
    scene.add(silverRimLight);

    const deepPurpleFill = new THREE.PointLight(0x2e1065, 2.2, 18);
    deepPurpleFill.position.set(0, 2.5, 0);
    scene.add(deepPurpleFill);

    // Obsidian Black & Dark Silver Floor Grid
    const gridHelper = new THREE.GridHelper(18, 18, 0x262936, 0x12141c);
    gridHelper.position.y = -0.02;
    scene.add(gridHelper);

    // 1. INSTANCED MESH #1: 50 Liquid Silver & Obsidian Server Blades (Single Draw Call)
    const bladeCount = 50;
    const bladeGeo = new THREE.BoxGeometry(0.86, 1.0, 0.86);
    bladeGeo.translate(0, 0.5, 0);

    const bladeMat = new THREE.MeshStandardMaterial({
      metalness: 0.88,
      roughness: 0.16,
    });

    const bladeInstancedMesh = new THREE.InstancedMesh(bladeGeo, bladeMat, bladeCount);
    bladeInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(bladeInstancedMesh);

    // 2. INSTANCED MESH #2: 50 Specular Top-Cap Bevels (Single Draw Call)
    const capGeo = new THREE.BoxGeometry(0.74, 0.08, 0.74);
    capGeo.translate(0, 0.04, 0);
    const capMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    const capInstancedMesh = new THREE.InstancedMesh(capGeo, capMat, bladeCount);
    capInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(capInstancedMesh);

    // 3. INSTANCED MESH #3: 5 Obsidian Black & Liquid Silver Horizontal Routing Beams
    const beamGeo = new THREE.BoxGeometry(12.2, 0.05, 0.12);
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x090a0f,
      emissive: 0xcbd5e1,
      emissiveIntensity: 0.35,
      metalness: 0.92,
      roughness: 0.12,
    });
    const beamInstancedMesh = new THREE.InstancedMesh(beamGeo, beamMat, 5);
    const beamDummy = new THREE.Object3D();
    for (let r = 0; r < 5; r++) {
      beamDummy.position.set(0, 0.02, (r - 2.0) * 1.38 - 0.58);
      beamDummy.updateMatrix();
      beamInstancedMesh.setMatrixAt(r, beamDummy.matrix);
    }
    beamInstancedMesh.instanceMatrix.needsUpdate = true;
    scene.add(beamInstancedMesh);

    // 4. Selection Highlight Wireframe Box (Crisp Liquid Silver)
    const highlightGeo = new THREE.BoxGeometry(1.02, 1.05, 1.02);
    highlightGeo.translate(0, 0.5, 0);
    const highlightEdges = new THREE.EdgesGeometry(highlightGeo);
    const highlightMat = new THREE.LineBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.9,
    });
    const selectionBox = new THREE.LineSegments(highlightEdges, highlightMat);
    scene.add(selectionBox);

    // 5. Expanding Liquid Silver & Deep Dark Purple Shockwave Beam Ring
    const ringGeo = new THREE.RingGeometry(0.28, 0.52, 48);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xe2e8f0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
    });
    const shockwaveRing = new THREE.Mesh(ringGeo, ringMat);
    shockwaveRing.position.y = 0.06;
    scene.add(shockwaveRing);

    // Pre-allocated scratch objects & typed arrays
    const dummy = new THREE.Object3D();
    const colorScratch = new THREE.Color();
    const currentHeights = new Float32Array(bladeCount);
    const bladePositionsX = new Float32Array(bladeCount);
    const bladePositionsZ = new Float32Array(bladeCount);

    const colSpacing = 1.28;
    const rowSpacing = 1.38;
    for (let i = 0; i < bladeCount; i++) {
      const r = Math.floor(i / 10);
      const c = i % 10;
      bladePositionsX[i] = (c - 4.5) * colSpacing;
      bladePositionsZ[i] = (r - 2.0) * rowSpacing;
      currentHeights[i] = 0.6;
    }

    // Raycaster for interactive 3D server blade picking
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-999, -999);
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(bladeInstancedMesh, false);
      if (hits.length > 0 && hits[0].instanceId !== undefined) {
        const hitWorkerId = hits[0].instanceId + 1;
        if (hoveredWorkerIdRef.current !== hitWorkerId) {
          hoveredWorkerIdRef.current = hitWorkerId;
          setHoveredWorkerId(hitWorkerId);
        }
      } else if (hoveredWorkerIdRef.current !== null) {
        hoveredWorkerIdRef.current = null;
        setHoveredWorkerId(null);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.hypot(dx, dy) > 6) return;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(bladeInstancedMesh, false);
      if (hits.length > 0 && hits[0].instanceId !== undefined) {
        const clickedId = hits[0].instanceId + 1;
        setSelectedWorkerId(clickedId);
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    const camTargetPos = new THREE.Vector3(0, 10.5, 13.5);
    const camLookTarget = new THREE.Vector3(0, 0.2, 0);
    let lastPreset: ViewCameraPreset = cameraPresetRef.current;

    let animFrameId = 0;
    let frameCounter = 0;
    let lastFpsUpdate = performance.now();
    let accumFrameMs = 0;
    const startTime = performance.now();

    // Render initial frame immediately
    renderer.render(scene, camera);

    const animate = (now: number) => {
      animFrameId = requestAnimationFrame(animate);
      if (!isInViewport || document.visibilityState === 'hidden') {
        return;
      }
      const frameStart = performance.now();
      const elapsed = (now - startTime) * 0.001;

      if (cameraPresetRef.current !== lastPreset) {
        lastPreset = cameraPresetRef.current;
        if (lastPreset === 'isometric') {
          camTargetPos.set(0, 10.5, 13.5);
        } else if (lastPreset === 'top') {
          camTargetPos.set(0, 16.5, 0.01);
        } else if (lastPreset === 'front') {
          camTargetPos.set(0, 4.2, 15.2);
        }
        camera.position.lerp(camTargetPos, 0.35);
      }

      controls.target.lerp(camLookTarget, 0.08);
      controls.update();

      // Animate Liquid Silver Shockwave Ring & Bus Beams
      if (shockwaveTimeRef.current >= 0) {
        shockwaveTimeRef.current += 0.045;
        const progress = shockwaveTimeRef.current;
        const scale = 1 + progress * 16;
        shockwaveRing.scale.set(scale, 1, scale);
        ringMat.opacity = Math.max(0, 0.72 * (1 - progress / 1.4));
        beamMat.emissiveIntensity = 0.35 + Math.max(0, 0.85 * (1 - progress / 1.2));
        if (progress > 1.4) {
          shockwaveTimeRef.current = -1;
          ringMat.opacity = 0;
          beamMat.emissiveIntensity = 0.35;
        }
      }

      const activeWorkers = workersRef.current;
      const selId = selectedWorkerIdRef.current;
      const hovId = hoveredWorkerIdRef.current;

      for (let i = 0; i < bladeCount; i++) {
        const w = activeWorkers[i];
        if (!w) continue;

        const x = bladePositionsX[i];
        const z = bladePositionsZ[i];
        const distFromCenter = Math.hypot(x, z);

        let waveBoost = 0;
        if (shockwaveTimeRef.current >= 0) {
          const ringRadius = shockwaveTimeRef.current * 8.5;
          const delta = Math.abs(distFromCenter - ringRadius);
          if (delta < 1.8) {
            waveBoost = (1 - delta / 1.8) * 0.45;
          }
        }

        const baseTargetHeight =
          w.status === 'running'
            ? 0.55 + w.loadFactor * 0.55 + Math.sin(elapsed * 2.4 + i * 0.35) * 0.05
            : w.status === 'queued'
            ? 0.46 + Math.sin(elapsed * 3.6 + i) * 0.06
            : w.status === 'failed'
            ? 0.94 + Math.sin(elapsed * 9.5) * 0.16
            : w.status === 'held'
            ? 0.38
            : 0.22;

        const targetH = baseTargetHeight + waveBoost;
        currentHeights[i] += (targetH - currentHeights[i]) * 0.14;
        const h = currentHeights[i];

        // 1. Update Blade Chassis Matrix & Liquid Silver / Deep Purple Color
        dummy.position.set(x, 0, z);
        dummy.scale.set(1, h, 1);
        dummy.updateMatrix();
        bladeInstancedMesh.setMatrixAt(i, dummy.matrix);

        colorScratch.setHex(STATUS_BODY_HEX[w.status]);
        if (w.id === hovId || w.id === selId) {
          colorScratch.offsetHSL(0, 0.0, 0.16);
        }
        bladeInstancedMesh.setColorAt(i, colorScratch);

        // 2. Update Specular Top-Cap Matrix & Color
        dummy.position.set(x, h + 0.01, z);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        capInstancedMesh.setMatrixAt(i, dummy.matrix);

        colorScratch.setHex(STATUS_CAP_HEX[w.status]);
        if (w.status === 'failed' && Math.sin(elapsed * 12) > 0) {
          colorScratch.setHex(0xfda4af);
        } else if (waveBoost > 0.15) {
          colorScratch.setHex(0xffffff);
        }
        capInstancedMesh.setColorAt(i, colorScratch);

        // 3. Position Selection Box
        if (w.id === selId) {
          selectionBox.position.set(x, 0, z);
          selectionBox.scale.set(1, h + 0.08, 1);
        }
      }

      bladeInstancedMesh.instanceMatrix.needsUpdate = true;
      if (bladeInstancedMesh.instanceColor) {
        bladeInstancedMesh.instanceColor.needsUpdate = true;
      }
      capInstancedMesh.instanceMatrix.needsUpdate = true;
      if (capInstancedMesh.instanceColor) {
        capInstancedMesh.instanceColor.needsUpdate = true;
      }

      renderer.render(scene, camera);

      const passMs = performance.now() - frameStart;
      accumFrameMs += passMs;
      frameCounter++;

      if (now - lastFpsUpdate >= 600) {
        const currentFps = Math.min(60, Math.round((frameCounter * 1000) / (now - lastFpsUpdate)));
        const avgPassMs = +(accumFrameMs / frameCounter).toFixed(2);
        setFpsStats({
          fps: currentFps,
          frameMs: Math.max(0.18, avgPassMs),
          drawCalls: renderer.info.render.calls || 3,
        });
        frameCounter = 0;
        accumFrameMs = 0;
        lastFpsUpdate = now;
      }
    };

    animFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mountEl) return;
      const w = mountEl.clientWidth || 720;
      const h = mountEl.clientHeight || 300;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(envTimer);
      viewportObserver.disconnect();
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      controls.dispose();
      if (envTexture) envTexture.dispose();
      bladeGeo.dispose();
      bladeMat.dispose();
      capGeo.dispose();
      capMat.dispose();
      beamGeo.dispose();
      beamMat.dispose();
      highlightGeo.dispose();
      highlightEdges.dispose();
      highlightMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, []);

  const runningCount = workers.filter((w) => w.status === 'running').length;
  const queuedCount = 14;
  const heldCount = workers.filter((w) => w.status === 'held').length;
  const failedCount = workers.filter((w) => w.status === 'failed').length;

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId) || workers[14];
  const hoveredWorker = hoveredWorkerId
    ? workers.find((w) => w.id === hoveredWorkerId) || null
    : null;

  return (
    <div className="w-full bg-[#090A0E] border border-[#222632] rounded-3xl p-6 sm:p-8 text-[#E2E8F0] shadow-[0_24px_60px_rgba(0,0,0,0.75)] relative overflow-hidden transition-all duration-300">
      {/* Linear-style top liquid-silver specular edge + subtle 5% deep purple core */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#E2E8F0]/40 to-transparent" />
      <div className="absolute -top-36 left-1/3 w-96 h-36 bg-[#2E1065]/20 rounded-full blur-3xl pointer-events-none" />

      {/* =====================================================================
          HEADER (Linear Silver/Obsidian + 5% Deep Dark Purple Accent)
         ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#1A1D26]">
        <div className="flex items-center gap-3">
          {/* Anodized Liquid-Silver & Obsidian Badge */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#1E222D] to-[#101218] border border-[#2E3444] text-[#E2E8F0] flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]">
            <GitFork className="w-4 h-4 stroke-[2.2]" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#F8FAFC]">
                Fleet dispatch
              </h3>

              {/* Environment selector dropdown */}
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={showPresetDropdown}
                  aria-haspopup="true"
                  onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#11131A] border border-[#242834] text-xs text-[#CBD5E1] hover:text-white hover:border-[#363C4E] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]"
                >
                  <span className="font-medium">
                    {activePreset === 'acme-staging'
                      ? 'Acme Bank · staging'
                      : activePreset === 'stripe-prod'
                      ? 'Global Core · prod'
                      : 'Revolut · edge'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#94A3B8]" aria-hidden="true" />
                </button>

                {showPresetDropdown && (
                  <div className="absolute left-0 mt-1.5 w-48 rounded-xl bg-[#0F1117] border border-[#262A38] shadow-2xl py-1 z-30 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setActivePreset('acme-staging');
                        setShowPresetDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-[#CBD5E1] hover:bg-[#181B24] flex items-center justify-between"
                    >
                      Acme Bank · staging
                      {activePreset === 'acme-staging' && (
                        <Check className="w-3.5 h-3.5 text-[#E2E8F0]" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActivePreset('stripe-prod');
                        setShowPresetDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-[#CBD5E1] hover:bg-[#181B24] flex items-center justify-between"
                    >
                      Global Core · prod
                      {activePreset === 'stripe-prod' && (
                        <Check className="w-3.5 h-3.5 text-[#E2E8F0]" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActivePreset('revolut-edge');
                        setShowPresetDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-[#CBD5E1] hover:bg-[#181B24] flex items-center justify-between"
                    >
                      Revolut · edge
                      {activePreset === 'revolut-edge' && (
                        <Check className="w-3.5 h-3.5 text-[#E2E8F0]" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Unboxed clean metadata line in Liquid Silver */}
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono tabular-nums">
              <span className="text-[#E2E8F0] font-sans font-medium">Controls enforced</span>
              <span className="text-[#94A3B8]" aria-hidden="true">·</span>
              <span className="text-[#CBD5E1]">
                Job 4821 · {runningCount} of 50 active
              </span>
              <span className="text-[#94A3B8]" aria-hidden="true">·</span>
              <span className="text-[#CBD5E1]">
                {fpsStats.fps} FPS ({fpsStats.frameMs}ms · {fpsStats.drawCalls} draw calls)
              </span>
            </div>
          </div>
        </div>

        {/* Live Simulation & Chaos Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Auto-Sim Play/Pause + Speed (Uses the 5% Deep Dark Purple #2E1065) */}
          <div className="flex items-center bg-[#0F1117] border border-[#232734] rounded-lg p-0.5">
            <button
              type="button"
              aria-pressed={autoSimEnabled}
              onClick={() => setAutoSimEnabled(!autoSimEnabled)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] ${
                autoSimEnabled
                  ? 'bg-[#2E1065] text-[#F8FAFC] border border-[#4C1D95]/70 shadow-[0_0_12px_rgba(46,16,101,0.6)]'
                  : 'text-[#CBD5E1] hover:text-white'
              }`}
              title="Toggle autonomous live packet stream and auto-healing"
            >
              {autoSimEnabled ? (
                <Pause className="w-3 h-3 fill-current" aria-hidden="true" />
              ) : (
                <Play className="w-3 h-3 fill-current" aria-hidden="true" />
              )}
              <span>{autoSimEnabled ? 'Live Sim: ON' : 'Sim Paused'}</span>
            </button>
            <button
              type="button"
              aria-label={`Simulation speed ${simSpeed}x`}
              onClick={() => setSimSpeed((s) => (s === 1 ? 2 : 1))}
              className="px-2 py-1 text-xs font-mono tabular-nums text-[#CBD5E1] hover:text-white cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] rounded"
              title="Toggle simulation speed multiplier"
            >
              {simSpeed}x
            </button>
          </div>

          {/* Chaos Fault Injector */}
          <button
            type="button"
            onClick={handleInjectChaosFault}
            className="px-3 py-1.5 rounded-lg bg-[#141118] hover:bg-[#1E1624] border border-[#3B0764] text-xs font-medium text-[#CBD5E1] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]"
            title="Inject a live node failure to test autonomous exponential backoff healing"
          >
            <Flame className="w-3.5 h-3.5 text-[#E2E8F0]" aria-hidden="true" />
            <span>Inject Chaos Fault</span>
          </button>

          {/* Manual Pulse Fan-Out (Liquid Silver button) */}
          <button
            type="button"
            onClick={handleSimulatePulse}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-b from-[#1E222D] to-[#12151E] hover:from-[#262B38] hover:to-[#171B26] border border-[#323846] text-xs font-medium text-[#F1F5F9] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]"
            title="Trigger instantaneous distributed 3D liquid-silver fan-out wave"
          >
            <Zap className="w-3.5 h-3.5 text-[#E2E8F0]" aria-hidden="true" />
            <span>Pulse Fan-out</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          TIMELINE / STEPPER FLOW WITH BLACK & LIQUID SILVER BEAMS
         ===================================================================== */}
      <div className="mt-7 space-y-7 relative">
        {/* ===================== STEP 1: Arrow Agent ===================== */}
        <div className="flex items-start gap-4 relative">
          {/* Obsidian Black conduit with Liquid Silver specular beam down to Step 2 */}
          <div className="absolute left-4 top-9 bottom-[-28px] w-[2px] bg-[#060709] border-x border-[#1E222D] overflow-hidden">
            <div
              className={`w-full h-8 bg-gradient-to-b from-transparent via-[#F1F5F9] to-transparent transition-transform duration-500 ${
                autoSimEnabled && activePacketStage >= 1
                  ? 'translate-y-6 opacity-95'
                  : '-translate-y-6 opacity-25'
              }`}
            />
          </div>

          {/* 5% Deep Dark Purple focal badge */}
          <div
            className={`w-8 h-8 rounded-full bg-[#2E1065] border border-[#4C1D95] text-[#F8FAFC] flex items-center justify-center shrink-0 z-10 transition-shadow duration-300 ${
              activePacketStage === 1
                ? 'ring-4 ring-[#2E1065]/45 shadow-[0_0_18px_rgba(46,16,101,0.85)]'
                : 'shadow-[0_0_10px_rgba(46,16,101,0.5)]'
            }`}
          >
            <Sparkles className="w-4 h-4 fill-white" />
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-base font-semibold text-[#F8FAFC] tracking-tight">
                Arrow Agent
              </h4>
              <span className="text-[11px] font-mono tabular-nums text-[#CBD5E1]">
                {activePacketStage === 1
                  ? 'Synthesizing AST directive...'
                  : 'Zero-credential planner ready'}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-[13px] text-[#94A3B8] leading-relaxed">
              Plans the migration and proposes each command. It holds no machine
              credentials and cannot reach a worker directly.
            </p>
          </div>
        </div>

        {/* ===================== STEP 2: Policy gateway ===================== */}
        <div className="flex items-start gap-4 relative">
          {/* Obsidian Black conduit with Liquid Silver specular beam down to Step 3 */}
          <div className="absolute left-4 top-9 bottom-[-28px] w-[2px] bg-[#060709] border-x border-[#1E222D] overflow-hidden">
            <div
              className={`w-full h-8 bg-gradient-to-b from-transparent via-[#F1F5F9] to-transparent transition-transform duration-500 ${
                autoSimEnabled && activePacketStage >= 2 && !freezeActive
                  ? 'translate-y-6 opacity-95'
                  : '-translate-y-6 opacity-20'
              }`}
            />
          </div>

          <div
            className={`w-8 h-8 rounded-full bg-[#11131A] border text-[#CBD5E1] flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
              activePacketStage === 2
                ? 'border-[#CBD5E1] text-white ring-4 ring-[#CBD5E1]/15'
                : 'border-[#262A36]'
            }`}
          >
            <Shield className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-base font-semibold text-[#F8FAFC] tracking-tight">
                Policy gateway
              </h4>
              <span className="text-[11px] font-mono tabular-nums text-[#94A3B8]">
                {freezeActive
                  ? 'Gate state: FROZEN'
                  : activePacketStage === 2
                  ? 'Verifying spend cap & allowlist...'
                  : 'Enforcing mTLS & spend bounds'}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-[13px] text-[#94A3B8] leading-relaxed">
              Every command is checked before it runs: permissions, spend cap,
              egress allowlist, change freeze, and approvals.
            </p>

            {/* 3 Interactive Policy Controls in Linear Brushed Silver & Obsidian */}
            <div className="mt-3.5 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() =>
                  setSpendAmount((prev) => +(prev < 48 ? prev + 5 : 12.07).toFixed(2))
                }
                className="px-3.5 py-1.5 rounded-lg bg-[#101218] hover:bg-[#171A22] border border-[#242834] text-xs font-mono tabular-nums text-[#CBD5E1] transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                title="Click to simulate additional machine runtime spend"
              >
                <span>Spend ${spendAmount.toFixed(2)} of $50</span>
              </button>

              <button
                type="button"
                onClick={handleToggleFreeze}
                className={`px-3.5 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  freezeActive
                    ? 'bg-[#2E1065] border-[#4C1D95] text-[#F8FAFC]'
                    : 'bg-[#101218] hover:bg-[#171A22] border-[#242834] text-[#CBD5E1]'
                }`}
                title="Click to toggle change freeze lock"
              >
                <span>Freeze: {freezeActive ? 'ACTIVE (Locked)' : 'none active'}</span>
              </button>

              <button
                type="button"
                onClick={handleApprovePending}
                disabled={approvalsPending === 0}
                className={`px-3.5 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  approvalsPending > 0
                    ? 'bg-[#101218] hover:bg-[#1B1429] border-[#2A2E3D] hover:border-[#4C1D95] text-[#E2E8F0]'
                    : 'bg-[#101218] border-[#242834] text-[#94A3B8] cursor-default'
                }`}
                title={
                  approvalsPending > 0
                    ? 'Click to approve 2 pending commands'
                    : 'All approvals granted'
                }
              >
                <span>
                  {approvalsPending > 0
                    ? `${approvalsPending} approvals pending`
                    : 'All approvals granted'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ===================== STEP 3: Dispatch ===================== */}
        <div className="flex items-start gap-4 relative">
          <div
            className={`w-8 h-8 rounded-full bg-[#11131A] border text-[#CBD5E1] flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
              activePacketStage === 3
                ? 'border-[#E2E8F0] text-white ring-4 ring-[#E2E8F0]/15'
                : 'border-[#262A36]'
            }`}
          >
            <GitFork className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-base font-semibold text-[#F8FAFC] tracking-tight">
                Dispatch
              </h4>
              <div className="flex items-center gap-3 text-[11px] font-mono tabular-nums text-[#94A3B8]">
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 text-[#CBD5E1]" />
                  <span>Rotations: {tokenRotationsCount}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#CBD5E1]" />
                  <span>Tokens valid: 15m</span>
                </span>
              </div>
            </div>

            <p className="mt-1 text-xs sm:text-[13px] text-[#94A3B8] leading-relaxed">
              Approved commands fan out to idle workers. Each worker gets a signed
              envelope and a token valid for 15 minutes.
            </p>

            {/* =================================================================
                4 STAT METRIC CARDS (Linear Liquid Silver & Obsidian Surface)
               ================================================================= */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#0E1016] border border-[#1E222D] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <div className="text-xs font-medium text-[#94A3B8]">Running</div>
                <div className="mt-1 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-[#F8FAFC]">
                  {runningCount}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0E1016] border border-[#1E222D] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <div className="text-xs font-medium text-[#94A3B8]">Queued</div>
                <div className="mt-1 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-[#CBD5E1]">
                  {queuedCount}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0E1016] border border-[#1E222D] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <div className="text-xs font-medium text-[#94A3B8]">Held</div>
                <div className="mt-1 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-[#C4B5FD]">
                  {heldCount}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0E1016] border border-[#1E222D] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <div className="text-xs font-medium text-[#94A3B8]">Failed</div>
                <div className="mt-1 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-[#FDA4AF]">
                  {failedCount}
                </div>
              </div>
            </div>

            {/* =================================================================
                REAL-TIME 3D INSTANCED WEBGL SERVER BLADE CLUSTER + 2D TOGGLE
               ================================================================= */}
            <div className="mt-4 rounded-2xl bg-[#07080B] border border-[#1E222D] overflow-hidden shadow-inner">
              {/* Viewport Toolbar: Camera Presets & Real-Time Hover Telemetry */}
              <div className="px-4 py-2.5 border-b border-[#161922] flex flex-wrap items-center justify-between gap-2 bg-[#0B0D12]">
                <div className="flex items-center gap-1 bg-[#11131A] p-1 rounded-lg border border-[#202430]">
                  <button
                    type="button"
                    onClick={() => setCameraPreset('isometric')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
                      cameraPreset === 'isometric'
                        ? 'bg-[#2E1065] text-white border border-[#4C1D95]/70'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <Box className="w-3 h-3" />
                    <span>3D Isometric</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraPreset('top')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      cameraPreset === 'top'
                        ? 'bg-[#2E1065] text-white border border-[#4C1D95]/70'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    3D Top Matrix
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraPreset('front')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      cameraPreset === 'front'
                        ? 'bg-[#2E1065] text-white border border-[#4C1D95]/70'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    3D Front Rack
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraPreset('grid2d')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
                      cameraPreset === 'grid2d'
                        ? 'bg-[#2E1065] text-white border border-[#4C1D95]/70'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <Grid className="w-3 h-3" />
                    <span>2D Matrix</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono tabular-nums text-[#94A3B8] flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[#CBD5E1]" />
                  {hoveredWorker ? (
                    <span className="text-[#F8FAFC]">
                      Blade #{hoveredWorker.id} ({hoveredWorker.status.toUpperCase()}) ·{' '}
                      {hoveredWorker.latencyMs}ms · Load {Math.round(hoveredWorker.loadFactor * 100)}%
                    </span>
                  ) : (
                    <span>
                      Drag to orbit liquid-silver rack · Click any blade to inspect
                    </span>
                  )}
                </div>
              </div>

              {/* 3D InstancedMesh WebGL Canvas */}
              <div
                role="region"
                aria-label="Interactive 3D 50-Worker Server Blade Matrix. Use Left and Right arrow keys to select server blades."
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setSelectedWorkerId((prev) => (prev % 50) + 1);
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setSelectedWorkerId((prev) => (prev - 2 + 50) % 50 + 1);
                  }
                }}
                className={`relative w-full h-[290px] sm:h-[320px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] ${
                  cameraPreset === 'grid2d' ? 'hidden' : 'block'
                }`}
              >
                <div
                  ref={canvasMountRef}
                  data-testid="fleet-3d-instanced-canvas"
                  className="w-full h-full cursor-grab active:cursor-grabbing"
                />

                {/* Subtle Corner Overlay showing selected blade in 3D space */}
                <div className="absolute bottom-3 left-3 pointer-events-none bg-[#0A0C10]/90 border border-[#222632] rounded-lg px-3 py-1.5 text-[11px] font-mono tabular-nums text-[#CBD5E1]">
                  Selected: Blade #{selectedWorker.id} · Row {selectedWorker.row}, Col{' '}
                  {selectedWorker.col} · {selectedWorker.region}
                </div>
              </div>

              {/* 2D 50-Cell Matrix View (95% Liquid Silver & Obsidian + 5% Deep Dark Purple) */}
              {cameraPreset === 'grid2d' && (
                <div className="p-4">
                  <div className="grid grid-cols-10 gap-2 sm:gap-2.5">
                    {workers.map((w) => {
                      const isSelected = selectedWorkerId === w.id;

                      let cellStyle =
                        'bg-gradient-to-b from-[#D8E0EC] to-[#94A3B8] text-[#090A0F] border border-[#F1F5F9]/50 hover:from-[#E2E8F0] hover:to-[#CBD5E1]';

                      if (w.status === 'queued') {
                        cellStyle =
                          'bg-[#333947] hover:bg-[#3F4656] text-[#E2E8F0] border border-[#475063]';
                      } else if (w.status === 'failed') {
                        cellStyle =
                          'bg-[#3B0A1E] hover:bg-[#4C0D26] text-[#FDA4AF] border border-[#831843]';
                      } else if (w.status === 'idle') {
                        cellStyle =
                          'bg-[#11131A] hover:bg-[#171A24] text-[#94A3B8] border border-[#1E222D]';
                      } else if (w.status === 'held') {
                        cellStyle =
                          'bg-[#2E1065] hover:bg-[#3B0764] text-[#E9D5FF] border border-[#4C1D95]';
                      }

                      const ringStyle = isSelected ? 'ring-2 ring-white scale-105 z-10' : '';

                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setSelectedWorkerId(w.id)}
                          aria-label={`Select Worker ${w.id}, status ${w.status}`}
                          title={`Worker #${w.id} (${w.status}) - ${w.hostname} - Latency ${w.latencyMs}ms`}
                          className={`h-7 sm:h-9 rounded-lg sm:rounded-xl ${cellStyle} ${ringStyle} transition-all duration-150 flex items-center justify-center cursor-pointer relative font-mono text-[10px] font-semibold`}
                        >
                          {w.id}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ===============================================================
                  LEGEND (Liquid Silver, Smoked Silver, Deep Purple, Crimson, Obsidian)
                 =============================================================== */}
              <div className="px-4 py-3 border-t border-[#161922] bg-[#0A0C11] flex flex-wrap items-center justify-start sm:justify-between gap-3 text-xs text-[#CBD5E1]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-gradient-to-b from-[#E2E8F0] to-[#94A3B8] border border-white/30" />
                  <span>Running · Liquid Silver ({runningCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#475063] border border-[#64748B]" />
                  <span>Queued · Titanium ({queuedCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#2E1065] border border-[#581C87]" />
                  <span>Held · Deep Purple ({heldCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#4C0519] border border-[#E11D48]" />
                  <span>Failed ({failedCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#12141C] border border-[#272A36]" />
                  <span>Idle · Obsidian ({workers.filter((w) => w.status === 'idle').length})</span>
                </div>
              </div>
            </div>

            {/* =================================================================
                INTERACTIVE WORKER INSPECTOR & BACKOFF RECOVERY DRAWER
               ================================================================= */}
            {selectedWorker && (
              <div className="mt-4 p-4 rounded-2xl bg-[#0D0F15] border border-[#222632] text-xs space-y-3 transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1A1D26]">
                  <div className="flex flex-wrap items-center gap-2 font-mono tabular-nums">
                    <span className="font-bold text-[#F8FAFC]">
                      Worker #{selectedWorker.id}
                    </span>
                    <span className="text-[#94A3B8]" aria-hidden="true">·</span>
                    <span
                      className={
                        selectedWorker.status === 'running'
                          ? 'text-[#E2E8F0] font-semibold uppercase'
                          : selectedWorker.status === 'failed'
                          ? 'text-[#FDA4AF] font-semibold uppercase'
                          : selectedWorker.status === 'queued'
                          ? 'text-[#CBD5E1] font-semibold uppercase'
                          : selectedWorker.status === 'held'
                          ? 'text-[#C4B5FD] font-semibold uppercase'
                          : 'text-[#94A3B8] font-semibold uppercase'
                      }
                    >
                      {selectedWorker.status}
                    </span>
                    <span className="text-[#94A3B8]" aria-hidden="true">·</span>
                    <span className="text-[#CBD5E1]">{selectedWorker.hostname}</span>
                    <span className="text-[#94A3B8]" aria-hidden="true">·</span>
                    <span className="text-[#CBD5E1]">{selectedWorker.region}</span>
                  </div>

                  <div className="font-mono text-[#E2E8F0] tabular-nums">
                    P99 Latency: {selectedWorker.latencyMs}ms · Load:{' '}
                    {Math.round(selectedWorker.loadFactor * 100)}%
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-[#94A3B8]">Current Task:</span>
                    <div className="mt-0.5 font-medium text-[#F1F5F9]">
                      {selectedWorker.task}
                    </div>
                  </div>

                  <div>
                    <span className="text-[#94A3B8]">Signed Envelope Hash:</span>
                    <div className="mt-0.5 font-mono tabular-nums text-[#CBD5E1]">
                      {selectedWorker.envelopeSignature} (ECDSA P-256 · Gen #
                      {selectedWorker.tokenGeneration})
                    </div>
                  </div>
                </div>

                {/* Quick actions for selected worker */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1A1D26]">
                  <div className="text-[11px] font-mono tabular-nums text-[#94A3B8] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#CBD5E1]" />
                    <span>
                      Token valid for {Math.floor(selectedWorker.tokenExpiresInSec / 60)}m{' '}
                      {(selectedWorker.tokenExpiresInSec % 60).toString().padStart(2, '0')}s
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {selectedWorker.status === 'failed' && (
                      <button
                        type="button"
                        disabled={isHealingWorker}
                        onClick={() => handleHealFailedWorker(selectedWorker.id, false)}
                        className="px-3 py-1.5 rounded-lg bg-[#2E1065] hover:bg-[#3B0764] border border-[#581C87] text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-xs disabled:opacity-50 whitespace-nowrap shrink-0 shadow-[0_0_14px_rgba(46,16,101,0.65)]"
                      >
                        <RotateCcw
                          className={`w-3.5 h-3.5 ${isHealingWorker ? 'animate-spin' : ''}`}
                        />
                        <span>
                          {isHealingWorker
                            ? healStep || 'Retrying...'
                            : 'Retry with Backoff (40ms) & Heal'}
                        </span>
                      </button>
                    )}

                    {selectedWorker.status === 'held' && approvalsPending > 0 && (
                      <button
                        type="button"
                        onClick={handleApprovePending}
                        className="px-3 py-1.5 rounded-lg bg-[#2E1065] hover:bg-[#3B0764] border border-[#4C1D95] text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-xs whitespace-nowrap shrink-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Grant Security Approval</span>
                      </button>
                    )}

                    {selectedWorker.status === 'running' && (
                      <button
                        type="button"
                        onClick={() => {
                          shockwaveTimeRef.current = 0;
                          setWorkers((prev) =>
                            prev.map((w) =>
                              w.id === selectedWorker.id
                                ? {
                                    ...w,
                                    latencyMs: +(0.31 + nextRand() * 0.09).toFixed(2),
                                    loadFactor: 0.92,
                                    tokenExpiresInSec: 900,
                                    tokenGeneration: w.tokenGeneration + 1,
                                  }
                                : w
                            )
                          );
                          setTokenRotationsCount((c) => c + 1);
                          setLastActionMessage(
                            `Dispatched zero-copy AST payload & rotated token on ${selectedWorker.hostname}`
                          );
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#141720] hover:bg-[#1C202B] border border-[#2C3242] text-[#E2E8F0] font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs whitespace-nowrap shrink-0"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Dispatch Warm Probe</span>
                      </button>
                    )}
                  </div>
                </div>

                {isHealingWorker && healStep && (
                  <div className="p-2.5 rounded-lg bg-[#120B20] border border-[#3B0764] text-[#E2E8F0] text-[11px] font-mono">
                    {healStep}
                  </div>
                )}
              </div>
            )}

            {lastActionMessage && (
              <div className="mt-3 text-[11px] font-mono text-[#94A3B8] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#CBD5E1] shrink-0" />
                <span>{lastActionMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
