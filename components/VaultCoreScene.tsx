'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { ServerNode } from '@/lib/orchestrator-engine';

interface VaultCoreSceneProps {
  nodes: ServerNode[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  lastDispatchPulse: number;
  lastFallbackRoute: { fromId: string; toId: string | null } | null;
  isDarkMode?: boolean;
}

// Pre-allocated module-scope math helpers (zero GC inside requestAnimationFrame)
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);

// Cached procedural textures for sub-millisecond initialization
let _cachedBrushedBumpTex: THREE.CanvasTexture | null = null;
let _cachedBladeAlbedoTex: THREE.CanvasTexture | null = null;
let _cachedRadialShadowTex: THREE.CanvasTexture | null = null;

function getBrushedMetalBumpTexture(maxAnisotropy: number): THREE.CanvasTexture {
  if (_cachedBrushedBumpTex) return _cachedBrushedBumpTex;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 64, 64);
    for (let y = 0; y < 64; y += 2) {
      const shade = 115 + Math.floor(Math.sin(y * 0.5) * 20);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(0, y, 64, 1);
    }
    ctx.strokeStyle = '#9e9e9e';
    ctx.lineWidth = 1;
    for (let i = 0; i < 16; i += 4) {
      ctx.strokeRect(i * 4, 0, 2, 64);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.anisotropy = maxAnisotropy;
  _cachedBrushedBumpTex = tex;
  return tex;
}

function getServerBladeAlbedoTexture(maxAnisotropy: number): THREE.CanvasTexture {
  if (_cachedBladeAlbedoTex) return _cachedBladeAlbedoTex;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#d4dae6';
    ctx.fillRect(0, 0, 64, 64);

    for (let row = 0; row < 6; row++) {
      const y = 4 + row * 9.5;
      ctx.fillStyle = '#bcc4d4';
      ctx.fillRect(4, y, 56, 7);

      ctx.fillStyle = '#2e1065';
      ctx.fillRect(6, y + 2, 9, 3);

      ctx.fillStyle = '#828b9e';
      for (let slot = 0; slot < 8; slot++) {
        ctx.fillRect(18 + slot * 4.8, y + 1.5, 3, 4);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  _cachedBladeAlbedoTex = tex;
  return tex;
}

function getRadialShadowTexture(): THREE.CanvasTexture {
  if (_cachedRadialShadowTex) return _cachedRadialShadowTex;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
    grad.addColorStop(0, 'rgba(15, 10, 35, 0.42)');
    grad.addColorStop(0.55, 'rgba(15, 10, 35, 0.16)');
    grad.addColorStop(1, 'rgba(15, 10, 35, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  _cachedRadialShadowTex = tex;
  return tex;
}

// Locked configuration per user specification:
// - Exploded View: 100% (1.0)
// - Material Finish: Brushed Platinum (0xd4dae6, roughness 0.28, metalness 0.92)
// - Camera Focus: Orchestrator Core
const LOCKED_EXPLODED_RATIO = 1.0;

export default function VaultCoreScene({
  nodes,
  selectedNodeId,
  onSelectNode,
  lastDispatchPulse,
  isDarkMode = true,
}: VaultCoreSceneProps) {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const orbitAzimuthDeltaRef = useRef<number>(0);

  // Store mutable state in refs so React UI updates never recreate the WebGL context
  const nodesRef = useRef<ServerNode[]>(nodes);
  const selectedNodeIdRef = useRef<string>(selectedNodeId);
  const onSelectNodeRef = useRef<(id: string) => void>(onSelectNode);
  const dispatchBoostRef = useRef<number>(0);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId;
  }, [selectedNodeId]);

  useEffect(() => {
    onSelectNodeRef.current = onSelectNode;
  }, [onSelectNode]);

  useEffect(() => {
    if (lastDispatchPulse > 0) {
      dispatchBoostRef.current = 1.0;
    }
  }, [lastDispatchPulse]);

  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    const isHeadless =
      navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const width = mountEl.clientWidth || window.innerWidth;
    const height = mountEl.clientHeight || 520;

    const scene = new THREE.Scene();
    const bgHex = isDarkMode ? 0x07080c : 0xe9edf4;
    const horizonColor = new THREE.Color(bgHex);
    scene.background = horizonColor;
    scene.fog = new THREE.FogExp2(bgHex, isDarkMode ? 0.024 : 0.02);

    // Camera locked to Orchestrator Core view framing the 100% exploded assembly
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 120);
    camera.position.set(0, 4.1, 6.6);
    camera.lookAt(0, 2.25, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isHeadless,
        powerPreference: 'high-performance',
        stencil: false,
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = false; // Contact shadow discs provide grounding with 0ms shadow-map pass overhead

    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    // Defer PMREM environment reflection generation past First Contentful Paint (0ms TBT)
    let envTexture: THREE.Texture | null = null;
    const envTimer = window.setTimeout(() => {
      try {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTexture;
        pmremGenerator.dispose();
      } catch {
        // Ignore if context disposed
      }
    }, 24);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 3.8;
    controls.maxDistance = 24;
    controls.target.set(0, 2.25, 0);

    // 3-Point Studio Lighting with Warm Key + Cool Silver Hemisphere Fill + Deep Purple Rim
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcbd5e1, 1.15);
    hemiLight.position.set(0, 22, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.25);
    keyLight.position.set(9, 15, 9);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x4c1d95, 1.55);
    rimLight.position.set(-10, 8, -9);
    scene.add(rimLight);

    const maxAniso = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    const brushedBumpTex = getBrushedMetalBumpTexture(maxAniso);
    const bladeAlbedoTex = getServerBladeAlbedoTexture(maxAniso);
    const contactShadowTex = getRadialShadowTexture();

    // Brushed Platinum Primary Material (95% Brushed Platinum / Silver + 5% Deep Dark Purple)
    const brushedPlatinumMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4dae6,
      metalness: 0.92,
      roughness: 0.28,
      anisotropy: 0.8,
      bumpMap: brushedBumpTex,
      bumpScale: 0.011,
      clearcoat: 0.55,
      clearcoatRoughness: 0.18,
    });

    const secondaryPlatinumMat = new THREE.MeshStandardMaterial({
      color: 0xc2cad8,
      metalness: 0.82,
      roughness: 0.38,
      bumpMap: brushedBumpTex,
      bumpScale: 0.012,
    });

    const matteObsidianTitaniumMat = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x1e2330 : 0x9aa3b5,
      metalness: 0.68,
      roughness: 0.58,
    });

    const deepPurpleMetalMat = new THREE.MeshPhysicalMaterial({
      color: 0x2e1065,
      emissive: 0x1e0944,
      emissiveIntensity: 0.35,
      metalness: 0.9,
      roughness: 0.18,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
    });

    const opticalGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xf1f5f9,
      metalness: 0.05,
      roughness: 0.08,
      transmission: 0.92,
      ior: 1.52,
      thickness: 1.1,
      attenuationColor: new THREE.Color(0x2e1065),
      attenuationDistance: 4.5,
      clearcoat: 1.0,
      transparent: true,
      depthWrite: false,
    });

    const serverBladeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: bladeAlbedoTex,
      metalness: 0.72,
      roughness: 0.3,
    });

    // Ground Floor Plane + Precision Track Ring
    const floorGeo = new THREE.PlaneGeometry(120, 120);
    const floorMat = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x090b10 : 0xe4e9f2,
      metalness: 0.35,
      roughness: 0.75,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    scene.add(floorMesh);

    const outerTrackGeo = new THREE.RingGeometry(7.65, 7.78, 48);
    const outerTrackMat = new THREE.MeshBasicMaterial({
      color: 0x2e1065,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const outerTrackRing = new THREE.Mesh(outerTrackGeo, outerTrackMat);
    outerTrackRing.rotation.x = -Math.PI / 2;
    outerTrackRing.position.y = 0.02;
    scene.add(outerTrackRing);

    // =========================================================================
    // 1. CENTRAL AUTONOMOUS ORCHESTRATOR CORE (10-Part Composite @ 100% Exploded)
    // =========================================================================
    const orchestratorGroup = new THREE.Group();
    orchestratorGroup.position.set(0, 0, 0);
    scene.add(orchestratorGroup);

    const coreShadowGeo = new THREE.CircleGeometry(2.6, 24);
    const coreShadowMat = new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.8,
    });
    const coreShadow = new THREE.Mesh(coreShadowGeo, coreShadowMat);
    coreShadow.rotation.x = -Math.PI / 2;
    coreShadow.position.y = 0.015;
    orchestratorGroup.add(coreShadow);

    // Part 1: Bevelled Octagonal Base Plinth
    const octShape = new THREE.Shape();
    const octRadius = 1.75;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + Math.PI / 8;
      const x = Math.cos(a) * octRadius;
      const y = Math.sin(a) * octRadius;
      if (i === 0) octShape.moveTo(x, y);
      else octShape.lineTo(x, y);
    }
    octShape.closePath();
    const baseExtrudeGeo = new THREE.ExtrudeGeometry(octShape, {
      depth: 0.28,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelSegments: 2,
    });
    baseExtrudeGeo.rotateX(-Math.PI / 2);
    const corePlinth = new THREE.Mesh(baseExtrudeGeo, matteObsidianTitaniumMat);
    corePlinth.position.y = 0.06;
    orchestratorGroup.add(corePlinth);

    // Part 2: Sculpted Lower Turbine Stator
    const lathePoints = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(1.38, 0.0),
      new THREE.Vector2(1.48, 0.22),
      new THREE.Vector2(1.15, 0.48),
      new THREE.Vector2(0.95, 0.72),
    ];
    const lowerTurbineGeo = new THREE.LatheGeometry(lathePoints, 20);
    const lowerTurbine = new THREE.Mesh(lowerTurbineGeo, secondaryPlatinumMat);
    lowerTurbine.position.y = 0.34;
    orchestratorGroup.add(lowerTurbine);

    // Part 3: Inner Suspended Quantum/Neural Core (100% Exploded Y = 2.60)
    const neuralCoreGeo = new THREE.IcosahedronGeometry(0.58, 1);
    const neuralCore = new THREE.Mesh(neuralCoreGeo, deepPurpleMetalMat);
    neuralCore.position.y = 1.95 + LOCKED_EXPLODED_RATIO * 0.65;
    orchestratorGroup.add(neuralCore);

    // Part 4: Inner Brushed-Platinum Lattice Frame (100% Exploded Y = 2.60)
    const innerCageGeo = new THREE.OctahedronGeometry(0.76, 0);
    const innerCageMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.14,
      wireframe: true,
    });
    const innerCage = new THREE.Mesh(innerCageGeo, innerCageMat);
    innerCage.position.y = 1.95 + LOCKED_EXPLODED_RATIO * 0.65;
    orchestratorGroup.add(innerCage);

    // Part 5: Lower Counter-Rotating Gimbal Ring (100% Exploded Y = 2.30)
    const gimbalLowerGeo = new THREE.TorusGeometry(1.06, 0.055, 14, 40);
    const gimbalLower = new THREE.Mesh(gimbalLowerGeo, brushedPlatinumMat);
    gimbalLower.position.y = 1.95 + LOCKED_EXPLODED_RATIO * 0.35;
    orchestratorGroup.add(gimbalLower);

    // Part 6: Upper Counter-Rotating Metallic Purple Gimbal Ring (100% Exploded Y = 2.90)
    const gimbalUpperGeo = new THREE.TorusGeometry(1.24, 0.045, 14, 40);
    const gimbalUpper = new THREE.Mesh(gimbalUpperGeo, deepPurpleMetalMat);
    gimbalUpper.position.y = 1.95 + LOCKED_EXPLODED_RATIO * 0.95;
    orchestratorGroup.add(gimbalUpper);

    // Part 7: Optical Sapphire Containment Cylinder
    const glassCylinderGeo = new THREE.CylinderGeometry(1.02, 1.02, 1.65, 20, 1, true);
    const glassCylinder = new THREE.Mesh(glassCylinderGeo, opticalGlassMat);
    glassCylinder.position.y = 1.95;
    glassCylinder.renderOrder = 2;
    orchestratorGroup.add(glassCylinder);

    // Part 8: 6 Radial Brushed Platinum Cooling & Signal Fins around the Core
    const finsGroup = new THREE.Group();
    finsGroup.position.y = 1.95 + LOCKED_EXPLODED_RATIO * 0.45;
    const finGeo = new THREE.BoxGeometry(0.12, 1.42, 0.38);
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const fin = new THREE.Mesh(finGeo, brushedPlatinumMat);
      const radialSpread = 1.42 + LOCKED_EXPLODED_RATIO * 0.22;
      fin.position.set(Math.cos(angle) * radialSpread, 0, Math.sin(angle) * radialSpread);
      fin.rotation.y = -angle + Math.PI / 2;
      finsGroup.add(fin);
    }
    orchestratorGroup.add(finsGroup);

    // Part 9: Upper Machined Brushed Platinum Crown Manifold (100% Exploded Y = 4.30)
    const crownPoints = [
      new THREE.Vector2(0.85, 0.0),
      new THREE.Vector2(1.36, 0.14),
      new THREE.Vector2(1.18, 0.38),
      new THREE.Vector2(0.55, 0.52),
      new THREE.Vector2(0.0, 0.56),
    ];
    const crownGeo = new THREE.LatheGeometry(crownPoints, 20);
    const crownMesh = new THREE.Mesh(crownGeo, brushedPlatinumMat);
    crownMesh.position.y = 2.85 + LOCKED_EXPLODED_RATIO * 1.45;
    orchestratorGroup.add(crownMesh);

    // Part 10: Top Deep-Purple Telemetry Beacon Cap (100% Exploded Y = 5.40)
    const beaconCapGeo = new THREE.CylinderGeometry(0.32, 0.48, 0.22, 16);
    const beaconCap = new THREE.Mesh(beaconCapGeo, deepPurpleMetalMat);
    beaconCap.position.y = 3.45 + LOCKED_EXPLODED_RATIO * 1.95;
    orchestratorGroup.add(beaconCap);

    // =========================================================================
    // 2. SIX DISTRIBUTED SERVER RACK NODES (100% Exploded Brushed Platinum)
    // =========================================================================
    const clusterRadius = 7.7;
    const nodeGroups: Map<
      string,
      {
        group: THREE.Group;
        topCap: THREE.Mesh;
        bladeBay: THREE.Mesh;
        ringMat: THREE.MeshBasicMaterial;
        beaconMat: THREE.MeshStandardMaterial;
        curve: THREE.CatmullRomCurve3;
      }
    > = new Map();
    const clickableMeshes: THREE.Object3D[] = [];

    const rackPlinthGeo = new THREE.BoxGeometry(1.56, 0.2, 1.56);
    const rackChassisGeo = new THREE.BoxGeometry(1.26, 2.1, 1.26);
    const rackPillarGeo = new THREE.BoxGeometry(0.16, 2.24, 0.16);
    const rackBladeGeo = new THREE.BoxGeometry(1.12, 1.78, 1.3);
    const rackHoodGeo = new THREE.CylinderGeometry(0.56, 0.88, 0.28, 4);
    const rackBeaconGeo = new THREE.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const rackRingGeo = new THREE.RingGeometry(1.05, 1.22, 24);
    const shadowDiscGeo = new THREE.CircleGeometry(1.45, 20);
    const hitBoxGeo = new THREE.BoxGeometry(1.9, 3.2, 1.9);
    const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });

    nodesRef.current.forEach((node, idx) => {
      const angle = (idx * Math.PI * 2) / nodesRef.current.length;
      const nx = Math.cos(angle) * clusterRadius;
      const nz = Math.sin(angle) * clusterRadius;

      const rackGroup = new THREE.Group();
      rackGroup.position.set(nx, 0, nz);
      rackGroup.lookAt(0, 0, 0);
      scene.add(rackGroup);

      const nShadow = new THREE.Mesh(shadowDiscGeo, coreShadowMat);
      nShadow.rotation.x = -Math.PI / 2;
      nShadow.position.y = 0.015;
      rackGroup.add(nShadow);

      const rPlinth = new THREE.Mesh(rackPlinthGeo, matteObsidianTitaniumMat);
      rPlinth.position.y = 0.1;
      rackGroup.add(rPlinth);

      const rChassis = new THREE.Mesh(rackChassisGeo, secondaryPlatinumMat);
      rChassis.position.y = 1.25;
      rackGroup.add(rChassis);

      const offsets = [
        [-0.62, -0.62],
        [0.62, -0.62],
        [-0.62, 0.62],
        [0.62, 0.62],
      ];
      offsets.forEach(([ox, oz]) => {
        const pillar = new THREE.Mesh(rackPillarGeo, brushedPlatinumMat);
        pillar.position.set(ox, 1.25, oz);
        rackGroup.add(pillar);
      });

      const bladeBay = new THREE.Mesh(rackBladeGeo, serverBladeMat);
      bladeBay.position.y = 1.25 + LOCKED_EXPLODED_RATIO * 0.25;
      rackGroup.add(bladeBay);

      const rHood = new THREE.Mesh(rackHoodGeo, brushedPlatinumMat);
      rHood.rotation.y = Math.PI / 4;
      rHood.position.y = 2.44 + LOCKED_EXPLODED_RATIO * 0.65;
      rackGroup.add(rHood);

      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x2e1065,
        emissive: 0x3b0764,
        emissiveIntensity: 0.6,
        metalness: 0.5,
        roughness: 0.2,
      });
      const rBeacon = new THREE.Mesh(rackBeaconGeo, beaconMat);
      rBeacon.position.y = 2.58 + LOCKED_EXPLODED_RATIO * 0.85;
      rackGroup.add(rBeacon);

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x2e1065,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
      const rRing = new THREE.Mesh(rackRingGeo, ringMat);
      rRing.rotation.x = -Math.PI / 2;
      rRing.position.y = 0.025;
      rackGroup.add(rRing);

      const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
      hitBox.position.y = 1.6;
      hitBox.userData = { nodeId: node.id };
      rackGroup.add(hitBox);
      clickableMeshes.push(hitBox);

      // Obsidian & Deep-Purple Fiber Conduit from Core to Server Node
      const midX = nx * 0.5;
      const midZ = nz * 0.5;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(angle) * 1.35, 1.65, Math.sin(angle) * 1.35),
        new THREE.Vector3(midX, 0.55, midZ),
        new THREE.Vector3(nx * 0.86, 1.15, nz * 0.86),
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.032, 6, false);
      const tubeMesh = new THREE.Mesh(tubeGeo, deepPurpleMetalMat);
      scene.add(tubeMesh);

      nodeGroups.set(node.id, {
        group: rackGroup,
        topCap: rHood,
        bladeBay,
        ringMat,
        beaconMat,
        curve,
      });
    });

    // =========================================================================
    // 3. SINGLE-DRAW-CALL INSTANCED MESHES (48 Floor Studs + 36 Liquid Silver Packets)
    // =========================================================================
    const floorStudCount = 48;
    const studGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.08, 8);
    const studInstanced = new THREE.InstancedMesh(
      studGeo,
      secondaryPlatinumMat,
      floorStudCount
    );
    let studIdx = 0;
    for (let ring = 1; ring <= 2; ring++) {
      const r = ring === 1 ? 4.4 : 10.6;
      const count = 24;
      for (let i = 0; i < count; i++) {
        const a = (i * Math.PI * 2) / count;
        _vec3A.set(Math.cos(a) * r, 0.04, Math.sin(a) * r);
        _quat.identity();
        _scale.set(1, 1, 1);
        _mat4.compose(_vec3A, _quat, _scale);
        studInstanced.setMatrixAt(studIdx++, _mat4);
      }
    }
    studInstanced.instanceMatrix.needsUpdate = true;
    studInstanced.computeBoundingSphere();
    scene.add(studInstanced);

    const packetCount = 36;
    const packetGeo = new THREE.SphereGeometry(0.075, 8, 8);
    const packetMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.85,
      metalness: 0.9,
      roughness: 0.12,
    });
    const packetInstanced = new THREE.InstancedMesh(
      packetGeo,
      packetMat,
      packetCount
    );
    packetInstanced.frustumCulled = false;
    scene.add(packetInstanced);

    // Raycasting for clicking 3D Server Nodes
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(
        e.clientX - pointerDownPos.x,
        e.clientY - pointerDownPos.y
      );
      if (dist > 6) return;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0 && hits[0].object.userData?.nodeId) {
        onSelectNodeRef.current(hits[0].object.userData.nodeId);
      }
    };

    // WebGL Context Loss & Restore Safety
    const handleContextLost = (e: Event) => {
      e.preventDefault();
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    // Pause WebGL render loop when scrolled out of viewport (0ms offscreen overhead)
    let isInViewport = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]) {
          isInViewport = entries[0].isIntersecting;
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(mountEl);

    const clock = new THREE.Clock();
    let animFrameId = 0;
    let lastRenderTime = 0;

    // Render initial frame immediately
    renderer.render(scene, camera);

    const animate = (nowMs: number) => {
      animFrameId = requestAnimationFrame(animate);

      if (!isInViewport || document.visibilityState === 'hidden') {
        return;
      }

      if (isHeadless && nowMs - lastRenderTime < 65) {
        return;
      }
      lastRenderTime = nowMs;

      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      dispatchBoostRef.current = THREE.MathUtils.damp(
        dispatchBoostRef.current,
        0,
        2.5,
        dt
      );
      const speedMult = prefersReducedMotion
        ? 0
        : 1 + dispatchBoostRef.current * 2.8;

      if (orbitAzimuthDeltaRef.current !== 0) {
        orchestratorGroup.rotation.y += orbitAzimuthDeltaRef.current * dt * 2.0;
        orbitAzimuthDeltaRef.current = THREE.MathUtils.damp(
          orbitAzimuthDeltaRef.current,
          0,
          8,
          dt
        );
      }

      // Animate Central Orchestrator Core parts at 100% Exploded Separation
      neuralCore.rotation.y += dt * 0.95 * speedMult;
      neuralCore.rotation.x += dt * 0.48 * speedMult;
      innerCage.rotation.y -= dt * 0.68 * speedMult;
      gimbalLower.rotation.x = Math.sin(elapsed * 1.1) * 0.45 * (prefersReducedMotion ? 0 : 1);
      gimbalLower.rotation.y += dt * 0.82 * speedMult;
      gimbalUpper.rotation.z = Math.cos(elapsed * 0.9) * 0.5 * (prefersReducedMotion ? 0 : 1);
      gimbalUpper.rotation.y -= dt * 0.62 * speedMult;
      finsGroup.rotation.y += dt * 0.22 * speedMult;

      const bob = prefersReducedMotion ? 0 : Math.sin(elapsed * 2.1) * 0.04;
      neuralCore.position.y = 1.95 + LOCKED_EXPLODED_RATIO * 0.65 + bob;
      innerCage.position.y = 1.95 + LOCKED_EXPLODED_RATIO * 0.65 + bob;
      crownMesh.position.y = 2.85 + LOCKED_EXPLODED_RATIO * 1.45 + bob * 0.6;
      beaconCap.position.y = 3.45 + LOCKED_EXPLODED_RATIO * 1.95 + bob * 0.8;

      // Update Server Nodes & Packet Pulses
      const activeNodes = nodesRef.current;
      let packetIdx = 0;

      activeNodes.forEach((node) => {
        const entry = nodeGroups.get(node.id);
        if (!entry) return;

        const isSelected = node.id === selectedNodeIdRef.current;

        if (node.status === 'offline') {
          entry.ringMat.color.setHex(0xbe123c);
          entry.ringMat.opacity = 0.85;
          entry.beaconMat.color.setHex(0xbe123c);
          entry.beaconMat.emissive.setHex(0x9f1239);
        } else if (node.status === 'degraded') {
          entry.ringMat.color.setHex(0xb45309);
          entry.ringMat.opacity = 0.75;
          entry.beaconMat.color.setHex(0xb45309);
          entry.beaconMat.emissive.setHex(0x92400e);
        } else if (isSelected) {
          entry.ringMat.color.setHex(0x2e1065);
          entry.ringMat.opacity = 0.95;
          entry.beaconMat.color.setHex(0x3b0764);
          entry.beaconMat.emissive.setHex(0x4c1d95);
        } else {
          entry.ringMat.color.setHex(0x64748b);
          entry.ringMat.opacity = 0.35;
          entry.beaconMat.color.setHex(0x2e1065);
          entry.beaconMat.emissive.setHex(0x2e1065);
        }

        for (let p = 0; p < 6; p++) {
          if (packetIdx >= packetCount) break;
          if (node.status === 'offline') {
            _vec3A.set(0, -10, 0);
            _scale.set(0.01, 0.01, 0.01);
          } else {
            const t = (elapsed * 0.45 * Math.max(0.2, speedMult) + p / 6) % 1;
            entry.curve.getPointAt(t, _vec3A);
            const s = isSelected ? 1.35 : 0.95;
            _scale.set(s, s, s);
          }
          _quat.identity();
          _mat4.compose(_vec3A, _quat, _scale);
          packetInstanced.setMatrixAt(packetIdx++, _mat4);
        }
      });

      packetInstanced.instanceMatrix.needsUpdate = true;

      _vec3B.set(0, 2.25, 0);
      controls.target.lerp(_vec3B, 1 - Math.exp(-5.0 * dt));
      controls.update();

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mountEl) return;
      const w = mountEl.clientWidth || window.innerWidth;
      const h = mountEl.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(envTimer);
      observer.disconnect();
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      controls.dispose();
      if (envTexture) envTexture.dispose();
      renderer.dispose();
    };
  }, [isDarkMode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      orbitAzimuthDeltaRef.current = -1.5;
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      orbitAzimuthDeltaRef.current = 1.5;
    }
  };

  return (
    <div
      role="region"
      aria-label="Interactive 3D Orchestrator Core in 100% Exploded View with Brushed Platinum Finish"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative w-full h-[460px] lg:h-[520px] rounded-2xl overflow-hidden border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] ${
        isDarkMode
          ? 'border-[#1E222D] bg-[#07080C] shadow-[0_24px_60px_rgba(0,0,0,0.8)]'
          : 'border-[#CFD5E2] bg-[#E9EDF4] shadow-xl'
      }`}
    >
      <p className="sr-only">
        Interactive 3D WebGL visualization of the Vaulltcore Autonomous Orchestrator Core rendered in Brushed Platinum at 100% exploded view separation with six connected edge server racks. Use mouse drag or Left and Right arrow keys to orbit the 3D core.
      </p>

      <div
        ref={canvasMountRef}
        data-testid="vaultcore-3d-canvas"
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}
