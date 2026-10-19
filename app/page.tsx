'use client';

import React, { useState } from 'react';
import {
  Crosshair,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import {
  createInitialNodes,
  type ServerNode,
} from '@/lib/orchestrator-engine';
import VaultCoreScene from '@/components/VaultCoreScene';
import FleetDispatchCard from '@/components/FleetDispatchCard';
import LifecycleFlipShowcase from '@/components/LifecycleFlipShowcase';
import PricingPlansGrid from '@/components/PricingPlansGrid';
import Navbar from '@/components/Navbar';

export default function VaulltcoreLandingPage() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [nodes] = useState<ServerNode[]>(() => createInitialNodes());

  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-us-east');
  const [targetScope, setTargetScope] = useState<'all' | string>('node-eu-west');

  const [lastDispatchPulse] = useState<number>(0);
  const [lastFallbackRoute] = useState<{
    fromId: string;
    toId: string | null;
  } | null>(null);

  const [contactPinged, setContactPinged] = useState<boolean>(false);

  const targetNode =
    nodes.find((n) => n.id === targetScope) || nodes[0];

  return (
    <div
      id="top"
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? 'bg-[#07080B] text-[#E2E8F0]' : 'bg-[#F2F4F8] text-[#0E1117]'
      }`}
    >
      {/* Accessibility Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#2E1065] focus:text-white focus:text-xs focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* =====================================================================
          RESPONSIVE NAVIGATION BAR WITH DROPDOWN MENUS & DARK MODE TOGGLE
         ===================================================================== */}
      <Navbar
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <main
        id="main-content"
        className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 pt-24 pb-20"
      >
        {/* ===================================================================
            HERO SECTION (95% Liquid Silver / Brushed Platinum & 5% Deep Purple)
           =================================================================== */}
        <section aria-labelledby="hero-heading" className="py-10 lg:py-14">
          <div className="max-w-4xl space-y-5">
            <div
              className={`inline-flex items-center gap-2 text-xs font-mono font-medium transition-colors ${
                isDarkMode ? 'text-[#CBD5E1]' : 'text-[#2E1065]'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5 stroke-[2.4]" aria-hidden="true" />
              <span>VAULLTCORE AI · AUTONOMOUS SOFTWARE ENGINEERING MESH</span>
            </div>

            <h1
              id="hero-heading"
              className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.035em] leading-[1.08] transition-colors ${
                isDarkMode
                  ? 'bg-gradient-to-b from-[#FFFFFF] via-[#F1F5F9] to-[#94A3B8] bg-clip-text text-transparent'
                  : 'text-[#0E1117]'
              }`}
              style={{ textWrap: 'balance' }}
            >
              Autonomous Agent Orchestration & Fleet Dispatch
            </h1>

            <p
              className={`text-lg sm:text-xl leading-[1.6] max-w-3xl transition-colors ${
                isDarkMode ? 'text-[#CBD5E1]' : 'text-[#2D3545]'
              }`}
            >
              Vaulltcore AI deploys self-healing software agents that continuously optimize edge worker nodes, enforce zero-trust policy gates, and execute deterministic fleet dispatch.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <a
                href="#section-orchestrator"
                className="px-6 py-3 text-xs font-semibold text-[#F8FAFC] bg-[#2E1065] border border-[#4C1D95] rounded-xl hover:bg-[#3B0764] transition-all shadow-[0_0_24px_rgba(46,16,101,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] cursor-pointer whitespace-nowrap shrink-0"
              >
                Launch Fleet Dispatch
              </a>
              <a
                href="#section-lifecycle"
                className={`px-6 py-3 text-xs font-semibold rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] cursor-pointer whitespace-nowrap shrink-0 ${
                  isDarkMode
                    ? 'bg-[#10131B] border-[#262B38] text-[#E2E8F0] hover:bg-[#171B26]'
                    : 'bg-white border-[#CFD5E2] text-[#0E1117] hover:bg-[#EAEFF7]'
                }`}
              >
                Explore 02. Lifecycle Showcase
              </a>
            </div>
          </div>

          {/* ===================================================================
              3D VAULT CORE INTERACTIVE MESH SCENE (100% Exploded · Brushed Platinum · Orchestrator Core)
             =================================================================== */}
          <div id="hero-3d" className="mt-10 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div
                className={`text-xs font-mono font-medium ${
                  isDarkMode ? 'text-[#CBD5E1]' : 'text-[#2D3545]'
                }`}
              >
                Orchestrator Core · 100% Exploded View · Brushed Platinum Finish
              </div>
              <div
                className={`text-xs font-mono tabular-nums ${
                  isDarkMode ? 'text-[#CBD5E1]' : 'text-[#2E1065]'
                }`}
              >
                Active Node: {targetNode.hostname} ({targetNode.region}) · {targetNode.p99LatencyMs}ms P99
              </div>
            </div>

            <VaultCoreScene
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={(id) => {
                setSelectedNodeId(id);
                setTargetScope(id);
              }}
              lastDispatchPulse={lastDispatchPulse}
              lastFallbackRoute={lastFallbackRoute}
              isDarkMode={isDarkMode}
            />
          </div>
        </section>

        {/* ===================================================================
            SECTION 01: ARROW AGENT DISPATCHING & FLEET MOCKUP
           =================================================================== */}
        <section
          id="section-orchestrator"
          aria-labelledby="orchestrator-heading"
          className={`py-14 lg:py-18 border-b transition-colors ${
            isDarkMode ? 'border-[#1A1D26]' : 'border-[#D5DAE5]'
          }`}
        >
          <div className="max-w-3xl">
            <div
              className={`flex items-center gap-2 text-xs font-semibold ${
                isDarkMode ? 'text-[#CBD5E1]' : 'text-[#2E1065]'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5 stroke-[2.4]" aria-hidden="true" />
              <span>01. AGENT ORCHESTRATION & FLEET DISPATCH</span>
            </div>
            <h2
              id="orchestrator-heading"
              className={`mt-1 text-2xl lg:text-4xl font-bold tracking-[-0.03em] transition-colors ${
                isDarkMode ? 'text-[#F8FAFC]' : 'text-[#0E1117]'
              }`}
              style={{ textWrap: 'balance' }}
            >
              Arrow Orchestrator Fleet & Worker Mesh
            </h2>
            <p
              className={`mt-3 text-base leading-[1.6] transition-colors ${
                isDarkMode ? 'text-[#CBD5E1]' : 'text-[#2D3545]'
              }`}
            >
              Arrow inspects real machine health, synchronizes agent pipelines, and executes deterministic operations across distributed edge clusters.
            </p>
          </div>

          <div className="mt-8">
            <FleetDispatchCard />
          </div>
        </section>

        {/* ===================================================================
            SECTION 02: AUTONOMOUS LIFECYCLE — PLANNING TO EXECUTION, REVIEW,
            PROOF EVIDENCE, DURABLE RESUMPTION, SECURITY, SPEED & QUALITY
           =================================================================== */}
        <section
          id="section-lifecycle"
          aria-labelledby="lifecycle-heading"
          className={`py-14 lg:py-20 border-b transition-colors ${
            isDarkMode ? 'border-[#1A1D26]' : 'border-[#D5DAE5]'
          }`}
        >
          <div className="max-w-3xl mb-8">
            <div
              className={`flex items-center gap-2 text-xs font-semibold ${
                isDarkMode ? 'text-[#CBD5E1]' : 'text-[#2E1065]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 stroke-[2.4]" aria-hidden="true" />
              <span>
                02. PLANNING TO EXECUTION · REVIEW · PROOF · RESUMPTION · SECURITY · SPEED · QUALITY
              </span>
            </div>
            <h2
              id="lifecycle-heading"
              className={`mt-1 text-2xl lg:text-4xl font-bold tracking-[-0.03em] transition-colors ${
                isDarkMode ? 'text-[#F8FAFC]' : 'text-[#0E1117]'
              }`}
              style={{ textWrap: 'balance' }}
            >
              Continuous Engineering Lifecycle & Inline Proof Deck
            </h2>
            <p
              className={`mt-3 text-base leading-[1.6] transition-colors ${
                isDarkMode ? 'text-[#CBD5E1]' : 'text-[#2D3545]'
              }`}
            >
              Grouped overlapping queue and diff frames auto-flip inline every 3.8 seconds across all seven autonomous engineering stages.
            </p>
          </div>

          <LifecycleFlipShowcase isDarkMode={isDarkMode} />
        </section>

        {/* ===================================================================
            SECTION 03: PRICING & COMPUTE PLANS (ON TOP OF LAST CTA GRID)
            Free, Launch (Most popular), and Scale in Liquid Silver & Deep Purple
           =================================================================== */}
        <section
          id="section-pricing"
          aria-labelledby="pricing-heading"
          className={`py-14 lg:py-20 border-b transition-colors ${
            isDarkMode ? 'border-[#1A1D26]' : 'border-[#D5DAE5]'
          }`}
        >
          <PricingPlansGrid />
        </section>

        {/* ===================================================================
            LAST CTA GRID: READY TO BUILD — BUILD WITH CONTROL. SHIP WITH CONFIDENCE.
           =================================================================== */}
        <section
          id="section-ready"
          aria-labelledby="ready-heading"
          className="pt-14 lg:pt-20 pb-6"
        >
          <div className="relative w-full rounded-[28px] sm:rounded-[32px] border border-[#1E2330] bg-[#090B10] px-6 py-16 sm:py-24 lg:py-28 text-center overflow-hidden shadow-[0_28px_80px_rgba(0,0,0,0.85)]">
            {/* Top Liquid Silver specular hairline */}
            <div
              aria-hidden="true"
              className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#CBD5E1]/35 to-transparent"
            />

            {/* Bottom-center Liquid Silver & 5% Deep Dark Purple ambient radial glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[680px] h-[260px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(148,163,184,0.16)_0%,rgba(46,16,101,0.22)_45%,transparent_75%)] blur-2xl"
            />

            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              {/* Top Pill Kicker: READY TO BUILD */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#262C3A] bg-[#0D1017]/90 text-[11px] font-semibold tracking-[0.14em] uppercase text-[#CBD5E1]">
                <Sparkles
                  className="w-3.5 h-3.5 text-[#CBD5E1]"
                  aria-hidden="true"
                />
                <span>READY TO BUILD</span>
              </div>

              {/* Two-Line Hero Display Headline */}
              <h2
                id="ready-heading"
                className="mt-7 text-4xl sm:text-6xl lg:text-[64px] font-bold tracking-[-0.035em] leading-[1.06]"
              >
                <span className="block text-[#F8FAFC]">
                  Build with control.
                </span>
                <span className="block mt-1 bg-gradient-to-r from-[#B8C7E0] via-[#8FA6C9] to-[#7890B5] bg-clip-text text-transparent">
                  Ship with confidence.
                </span>
              </h2>

              {/* Subheading Copy */}
              <p className="mt-6 text-base sm:text-xl text-[#94A3B8] max-w-xl mx-auto leading-[1.6]">
                Give your engineering agents room to execute—and your team the
                oversight to trust what ships.
              </p>

              {/* Dual Action Buttons */}
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="#section-orchestrator"
                  className="px-6 py-3.5 rounded-xl bg-[#F1F5F9] hover:bg-white text-[#090B10] font-semibold text-sm inline-flex items-center gap-2.5 transition-all shadow-[0_0_32px_rgba(241,245,249,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Open workspace</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={() => setContactPinged(true)}
                  className="px-6 py-3.5 rounded-xl bg-[#11141D] hover:bg-[#181C28] text-[#F8FAFC] border border-[#262C3A] font-semibold text-sm inline-flex items-center gap-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] cursor-pointer whitespace-nowrap shrink-0"
                >
                  {contactPinged ? (
                    <>
                      <CheckCircle2
                        className="w-4 h-4 text-[#C084FC]"
                        aria-hidden="true"
                      />
                      <span>Engineering team notified</span>
                    </>
                  ) : (
                    <>
                      <span>Contact us</span>
                      <ArrowUpRight
                        className="w-4 h-4 stroke-[2.2] text-[#CBD5E1]"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          QUIET ACCESSIBLE FOOTER
         ===================================================================== */}
      <footer
        className={`border-t py-8 px-6 lg:px-12 text-xs transition-colors ${
          isDarkMode
            ? 'border-[#1A1D26] bg-[#050609] text-[#94A3B8]'
            : 'border-[#D5DAE5] bg-[#EAEEF5] text-[#2D3545]'
        }`}
      >
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div
            className={`flex items-center gap-2 font-semibold ${
              isDarkMode ? 'text-[#F8FAFC]' : 'text-[#0E1117]'
            }`}
          >
            <Crosshair
              aria-hidden="true"
              className={`w-3.5 h-3.5 stroke-[2.2] ${
                isDarkMode ? 'text-[#CBD5E1]' : 'text-[#2E1065]'
              }`}
            />
            <span>Vaulltcore AI · Arrow Autonomous Software Engineering</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#hero-3d"
              className={`transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] rounded px-1 ${
                isDarkMode ? 'text-[#CBD5E1] hover:text-white' : 'text-[#2D3545] hover:text-[#0E1117]'
              }`}
            >
              3D Orchestrator Core
            </a>
            <a
              href="#section-orchestrator"
              className={`transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] rounded px-1 ${
                isDarkMode ? 'text-[#CBD5E1] hover:text-white' : 'text-[#2D3545] hover:text-[#0E1117]'
              }`}
            >
              01. Fleet Dispatch
            </a>
            <a
              href="#section-lifecycle"
              className={`transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] rounded px-1 ${
                isDarkMode ? 'text-[#CBD5E1] hover:text-white' : 'text-[#2D3545] hover:text-[#0E1117]'
              }`}
            >
              02. Lifecycle & Proof
            </a>
            <a
              href="#section-pricing"
              className={`transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] rounded px-1 ${
                isDarkMode ? 'text-[#CBD5E1] hover:text-white' : 'text-[#2D3545] hover:text-[#0E1117]'
              }`}
            >
              03. Plans
            </a>
          </div>
          <div>© 2026 Vaulltcore AI Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
