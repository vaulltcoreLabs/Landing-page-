# Live 3D Fleet Dispatcher & High-Speed Instanced WebGL Engine

Transform the Fleet Dispatcher into an autonomous, real-time 3D WebGL machine cluster powered by a single-draw-call `THREE.InstancedMesh` engine, complete with live packet routing beams across the 3-stage pipeline, interactive chaos fault injection, autonomous backoff self-healing, and real-time GPU frame-rate telemetry.

## User Review & Critical Decisions

> [!IMPORTANT]
> All core architectural choices below reflect your confirmed preferences from the planning questionnaire. Review and click **Proceed** to begin implementation.

- **Confirmed 3D Cluster Visualization**: **Instanced WebGL 3D server blades with live pulse** — All 50 worker nodes (5 rows × 10 columns) are rendered in real 3D using `THREE.InstancedMesh` with PBR metallic materials, vertical load-based blade elevation, and raycast picking (`instanceId` inspection), alongside a quick camera angle switcher (`Isometric`, `Top Matrix`, `Front Rack`, `2D Grid Fallback`).
- **Confirmed Live Simulation Behaviors**:
  1. **Continuous job fan-out & auto-healing pulses** — Autonomous background tick dispatches workloads across idle/running blades and automatically heals degraded nodes.
  2. **Interactive chaos failure injection & recovery** — Dedicated chaos control lets users inject network/enclave faults into random workers and watch autonomous backoff recovery in real time.
  3. **Real-time packet routing beams between stages** — Animated energy conduits visually link **Stage 1 (Arrow Agent)** → **Stage 2 (Policy Gateway)** → **Stage 3 (Dispatch)** and fan out into the 50 3D server blades.
  4. **Live token rotation & policy gateway enforcement** — Continuous 15-minute token countdowns, cryptographic envelope rotation, spend-cap tracking, and freeze/approval gates that dynamically block or release held blades.
- **Confirmed Speed & Rendering Strategy**: **Single-draw-call `InstancedMesh` with live FPS telemetry** — Zero-allocation `Float32Array` matrix/color buffer updates inside an isolated `requestAnimationFrame` loop (decoupled from React state re-renders) paired with a live `FPS · Frame ms · Draw Calls` HUD badge.

---

## 1. Overview & Core Concept

- **What It Does**: Upgrades the Fleet Dispatcher from a static-feeling 2D cell grid into a living, hardware-accelerated 3D command center where users can watch commands flow from the Arrow Agent through the Policy Gateway and fan out as 3D light pulses across 50 physical server blades.
- **Target Audience / Persona**: Infrastructure engineers, SREs, and technical decision-makers evaluating autonomous agent orchestration, zero-trust policy gating, and sub-millisecond fleet dispatch.
- **Key Value**: Demonstrates both **visual realism** (interactive 3D server blades, live packet beams, chaos engineering) and **deterministic rendering speed** (single-draw-call instancing at 60 FPS with zero React reconciliation overhead).

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Autonomous Live Stream & Speed Control**: Upon load, the dispatcher runs a live autonomous simulation loop (`Live Auto-Sim: ON`, adjustable between `1x`, `2x`, and `Pause`) that continuously dispatches micro-tasks, updates worker P99 latencies, and pulses the 3-stage pipeline conduit.
  2. **3D Server Blade Inspection & Orbit**: Users can orbit, pan, or switch camera presets (`Isometric 3D`, `Top Matrix`, `Low Rack`, or `2D Classic`) and hover or click any of the 50 3D server blades to inspect its live hostname, region, ECDSA envelope hash, and P99 latency in the bottom inspector drawer.
  3. **Chaos Fault Injection & Auto-Heal**: Clicking **Inject Chaos Fault** randomly faults 1–3 active server blades (turning them crimson with an emergency vertical pulse) and triggers an automated 3-step exponential backoff heal sequence (`40ms → 80ms → Enclave Verified`)—or lets the user manually trigger an immediate heal.
  4. **Policy Gateway Enforcement**: Toggling **Change Freeze** or clicking **Approve Pending** immediately updates the 3D blade states and packet routing beams in real time.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Precision obsidian hardware instrumentation with physically based metallic server blades and high-contrast semantic status lighting.
  - *Color Palette & Mood*:
    - Dominant Canvas (60%): Deep Obsidian (`#0D0E12` / `#121316`)
    - Structural Surfaces (30%): Gunmetal Slate (`#16171D`) with hairline borders (`#242631`)
    - Semantic & Accent Budget (10%): Electric Blue (`#2563EB` / `#38BDF8`) for active running blades and packet beams, Amber (`#F59E0B`) for queued/held policy gates, Emerald (`#10B981`) for verified heals, and Crimson (`#EF4444`) for chaos faults.
  - *Typography & Hierarchy*: Crisp geometric sans for section headers paired with strict tabular monospace numerals (`font-mono tabular-nums`) for all counters, P99 latencies, token timers, and the live GPU FPS/frame-time counter.
  - *Component Styling & Layout*: Single-elevation outer container with clean hairline dividers, semantic DOM overlays (`z-10 pointer-events-auto`) over the WebGL canvas, and zero nested card clutter.
- **Interactive Feedback & Motion**:
  - Smooth damped camera transitions (`lerp` factor `0.08`) when switching between camera presets or focusing on a selected 3D worker blade.
  - Animated packet pulses traveling down the vertical stepper line (`Arrow Agent` → `Policy Gateway` → `Dispatch`) synchronized with 3D shockwave rings across the 50-blade instanced rack.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Single-Draw-Call `THREE.InstancedMesh` vs. 50 Individual `THREE.Mesh` Objects**
  - *Chosen Approach*: Render all 50 server blades using a single `THREE.InstancedMesh` (plus a second instanced layer for the glowing status top-caps and an animated ring pool for fan-out shockwaves).
  - *Why*: Reduces WebGL draw calls from 100+ down to 2, guaranteeing locked 60 FPS performance and sub-1ms CPU frame times even on integrated/mobile GPUs.
  - *Alternatives Considered*: Creating 50 separate Three.js mesh groups was rejected because per-mesh draw call overhead and material state switching degrade frame pacing.
- **Decision 2: Ref-Synchronized Zero-Allocation Render Loop vs. React State Per-Frame Updates**
  - *Chosen Approach*: Keep all 60fps animation math (blade wave elevation, packet beam progress, camera damping, and FPS calculation) inside pre-allocated `Float32Array` buffers and React `useRef` stores, updating React state only on discrete status transitions or 1-second telemetry ticks.
  - *Why*: Eliminates React virtual-DOM diffing during 60fps WebGL rendering and prevents garbage-collection frame drops.
- **Decision 3: Hybrid Camera Presets + 2D Matrix Fallback**
  - *Chosen Approach*: Default to the interactive 3D Instanced Server Blade viewport while providing instant 1-click camera presets (`Isometric`, `Top-Down`, `Rack Front`) and a `2D Matrix` toggle.
  - *Why*: Ensures both spatial 3D depth and instant scannability, while gracefully supporting headless browsers or WebGL context loss.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FleetDispatchCard (Container)                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Top Command Bar                                                       │  │
│  │  • Environment Selector (Acme staging / Global prod / Revolut edge)   │  │
│  │  • Live Auto-Sim Toggle (Play/Pause · 1x/2x) & Chaos Fault Injector   │  │
│  │  • Real-Time GPU Performance HUD (60 FPS · 0.4ms frame · 2 Draw Calls)│  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
│                                     │                                       │
│  ┌──────────────────────────────────▼────────────────────────────────────┐  │
│  │ 3-Stage Animated Pipeline Stepper (SVG/CSS Packet Routing Beams)      │  │
│  │  [1. Arrow Agent] ══(Packet Pulse)══► [2. Policy Gateway]             │  │
│  │                                          │ (Spend / Freeze / Approve) │  │
│  │                                          ▼                            │  │
│  │                                    [3. Dispatch Fan-Out]              │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
│                                     │                                       │
│  ┌──────────────────────────────────▼────────────────────────────────────┐  │
│  │ 3D Instanced WebGL Cluster Viewport (5x10 Server Blades)              │  │
│  │  • THREE.InstancedMesh (50 PBR Server Blades + Status Emissive Caps)  │  │
│  │  • 3D Packet Fan-Out Shockwave & Per-Blade Load Elevation             │  │
│  │  • Raycaster Instance Picking (Hover Tooltip + Click Selection)       │  │
│  │  • Camera Preset Switcher (Isometric / Top / Front / 2D Grid Toggle)  │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
│                                     │                                       │
│  ┌──────────────────────────────────▼────────────────────────────────────┐  │
│  │ Interactive Worker Inspector & Autonomous Backoff Healer              │  │
│  │  • Selected Blade Telemetry (Hostname, Region, P99 Latency, ECDSA)    │  │
│  │  • Live 3-Step Backoff Recovery Progress & Manual Probe Actions       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - `WorkerNode` (50 instances): `id` (1–50), `row` (1–5), `col` (1–10), `status` (`running` | `queued` | `held` | `failed` | `idle`), `hostname`, `region`, `latencyMs`, `loadFactor` (drives 3D blade elevation), `tokenExpiresInSec`, `envelopeSignature`.
  - `SimulationState`: `autoSimEnabled` (boolean), `simSpeed` (`1` | `2`), `activePacketStage` (`0` | `1` | `2` | `3`), `fpsMetrics` (`fps`, `frameTimeMs`, `drawCalls`).
  - `Pre-allocated WebGL Buffers`: Static `THREE.Object3D` dummy matrix helper, `THREE.Color` scratch instance, and `Float32Array(50)` for smooth per-blade vertical height interpolation and pulse intensity.
- **Interactive Component & State Mapping**:
  - **Pulse Fan-Out / Auto-Sim Tick**: Fires a packet beam from `Arrow Agent` → `Policy Gateway` → `Dispatch`, triggers a 3D radial wave across the 50 instanced blades, refreshes envelope hashes, and fluctuates P99 latencies.
  - **Inject Chaos Fault**: Transitions 1–2 random `running` blades to `failed` (crimson emissive + rapid 3D beacon pulse), increments the `Failed` counter, selects a faulted blade, and schedules autonomous backoff healing if Auto-Sim is active.
  - **3D Blade Raycasting (`onPointerMove` / `onClick`)**: Uses `THREE.Raycaster` against the `InstancedMesh` to read `intersection.instanceId`, highlighting the hovered blade in 3D space and updating `selectedWorkerId` on click.
  - **Camera Preset & View Mode Controls**: Smoothly interpolates camera position/target between `isometric`, `top`, and `front` angles, or switches to the accessible 2D matrix view.
