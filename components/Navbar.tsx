'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Crosshair,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  X,
  Server,
  Shield,
  Layers,
  Terminal,
  Cpu,
  Lock,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

type NavDropdownId = 'product' | 'developers' | 'enterprise' | 'company';

interface DropdownSubItem {
  title: string;
  desc: string;
  href: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_DROPDOWN_DATA: Record<
  NavDropdownId,
  { label: string; items: DropdownSubItem[] }
> = {
  product: {
    label: 'Product',
    items: [
      {
        title: '3D Orchestrator Core',
        desc: '100% exploded Brushed Platinum autonomous core & 6 edge racks',
        href: '#hero-3d',
        badge: 'WebGL',
        icon: Crosshair,
      },
      {
        title: 'Arrow Fleet Dispatch',
        desc: '50-blade instanced worker matrix with live backoff healing',
        href: '#section-orchestrator',
        badge: '0.42ms P99',
        icon: Server,
      },
      {
        title: 'Continuous Lifecycle & Proof',
        desc: 'Auto-flipping queue and side-by-side AST diff verification',
        href: '#section-lifecycle',
        badge: '7 Stages',
        icon: Layers,
      },
      {
        title: 'Zero-Trust Policy Gateway',
        desc: '15m ephemeral mTLS tokens, spend caps, and freeze locks',
        href: '#section-orchestrator',
        icon: Shield,
      },
    ],
  },
  developers: {
    label: 'Developers',
    items: [
      {
        title: 'Arrow Agent CLI & SDK',
        desc: 'Synthesize dependency-ordered DAGs with zero machine secrets',
        href: '#section-lifecycle',
        badge: 'v4.2',
        icon: Terminal,
      },
      {
        title: 'SharedArrayBuffer Ring API',
        desc: 'Zero-allocation binary frame dispatch & eBPF packet steering',
        href: '#section-lifecycle',
        icon: Cpu,
      },
      {
        title: 'SHA-384 Merkle Attestations',
        desc: 'Hardware TPM PCR-14 quotes and reproducible build receipts',
        href: '#section-lifecycle',
        icon: Lock,
      },
    ],
  },
  enterprise: {
    label: 'Enterprise',
    items: [
      {
        title: 'SOC 2 & HIPAA Enclaves',
        desc: 'Airgapped policy enforcement and cryptographic audit trails',
        href: '#section-pricing',
        badge: 'Scale Tier',
        icon: Shield,
      },
      {
        title: 'Up to 56 CU Dedicated Compute',
        desc: '56 vCPU / 224 GB RAM elastic enclaves with 99.95% uptime SLA',
        href: '#section-pricing',
        icon: Server,
      },
      {
        title: 'IP Allow & Private Networking',
        desc: 'Zero-egress regional peering across US-East, EU-West, and AP-East',
        href: '#section-pricing',
        icon: Building2,
      },
    ],
  },
  company: {
    label: 'Company',
    items: [
      {
        title: 'About Vaulltcore Enterprise',
        desc: 'Autonomous software engineering built for mission-critical teams',
        href: '#top',
        icon: Crosshair,
      },
      {
        title: 'Security & Attestation Architecture',
        desc: 'How Arrow enforces deterministic code quality and zero leaks',
        href: '#section-lifecycle',
        icon: Shield,
      },
      {
        title: 'Book an Engineering Demo',
        desc: 'Connect with our systems architects for custom fleet deployment',
        href: '#section-ready',
        icon: Building2,
      },
    ],
  },
};

const DROPDOWN_ORDER: NavDropdownId[] = [
  'product',
  'developers',
  'enterprise',
  'company',
];

export default function Navbar({
  isDarkMode,
  onToggleDarkMode,
}: NavbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openDesktopDropdown, setOpenDesktopDropdown] =
    useState<NavDropdownId | null>(null);
  const [expandedMobileSection, setExpandedMobileSection] =
    useState<NavDropdownId | null>(null);
  const [authBanner, setAuthBanner] = useState<string | null>(null);

  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDesktopDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const handleLinkClick = () => {
    setOpenDesktopDropdown(null);
    setDrawerOpen(false);
  };

  const triggerActionFeedback = (msg: string) => {
    setAuthBanner(msg);
    setTimeout(() => {
      setAuthBanner(null);
    }, 3600);
  };

  return (
    <>
      <header
        ref={navRef}
        className={`sticky top-0 z-40 transition-colors duration-200 border-b backdrop-blur-md ${
          isDarkMode
            ? 'bg-[#09090D]/95 border-[#1C1E28] text-[#F8FAFC]'
            : 'bg-[#F2F4F8]/95 border-[#D5DAE5] text-[#0E1117]'
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4 py-3.5">
          {/* =================================================================
              BRAND WORDMARK: [Icon] Vaulltcore Enterprise
             ================================================================= */}
          <a
            href="#top"
            onClick={handleLinkClick}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] rounded-lg py-0.5"
          >
            <span
              aria-hidden="true"
              className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-b from-[#E2E8F0] to-[#94A3B8] text-[#09090D] border border-white/40 shadow-[0_0_14px_rgba(226,232,240,0.25)]"
            >
              <Crosshair className="w-4 h-4 stroke-[2.5]" />
            </span>
            <span className="flex items-baseline gap-1.5 text-base sm:text-[17px] tracking-tight">
              <span
                className={`font-bold ${
                  isDarkMode ? 'text-[#F8FAFC]' : 'text-[#0E1117]'
                }`}
              >
                Vaulltcore
              </span>
              <span
                className={`font-medium ${
                  isDarkMode ? 'text-[#8B93A6]' : 'text-[#475569]'
                }`}
              >
                Enterprise
              </span>
            </span>
          </a>

          {/* =================================================================
              DESKTOP DROPDOWN NAVIGATION:
              Product ⌄ | Developers ⌄ | Enterprise ⌄ | Company ⌄ | Pricing
             ================================================================= */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-1.5 text-sm font-medium"
          >
            {DROPDOWN_ORDER.map((key) => {
              const group = NAV_DROPDOWN_DATA[key];
              const isOpen = openDesktopDropdown === key;

              return (
                <div key={key} className="relative">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() =>
                      setOpenDesktopDropdown((prev) =>
                        prev === key ? null : key
                      )
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] ${
                      isOpen
                        ? isDarkMode
                          ? 'bg-[#151722] text-white'
                          : 'bg-[#E2E6F0] text-[#0E1117]'
                        : isDarkMode
                        ? 'text-[#CBD5E1] hover:text-white hover:bg-[#11131C]'
                        : 'text-[#2D3545] hover:text-[#0E1117] hover:bg-[#EAEFF7]'
                    }`}
                  >
                    <span>{group.label}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-white' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      className={`absolute left-0 mt-2 w-80 rounded-2xl p-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.85)] border transition-all z-50 ${
                        isDarkMode
                          ? 'bg-[#0C0D14] border-[#222634] text-[#F8FAFC]'
                          : 'bg-white border-[#CFD5E2] text-[#0E1117]'
                      }`}
                    >
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <a
                              key={item.title}
                              href={item.href}
                              onClick={handleLinkClick}
                              className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                                isDarkMode
                                  ? 'hover:bg-[#151824]'
                                  : 'hover:bg-[#F2F4F8]'
                              }`}
                            >
                              <div className="p-2 rounded-lg bg-[#171926] border border-[#2A2F42] text-[#E2E8F0] shrink-0 mt-0.5">
                                <IconComponent
                                  className="w-4 h-4"
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-semibold truncate">
                                    {item.title}
                                  </span>
                                  {item.badge && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#2E1065] text-[#E9D5FF] border border-[#581C87] shrink-0">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <p
                                  className={`text-[11px] mt-0.5 leading-snug ${
                                    isDarkMode
                                      ? 'text-[#94A3B8]'
                                      : 'text-[#475569]'
                                  }`}
                                >
                                  {item.desc}
                                </p>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Direct Link: Pricing (no chevron, matching screenshot) */}
            <a
              href="#section-pricing"
              onClick={handleLinkClick}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] ${
                isDarkMode
                  ? 'text-[#CBD5E1] hover:text-white hover:bg-[#11131C]'
                  : 'text-[#2D3545] hover:text-[#0E1117] hover:bg-[#EAEFF7]'
              }`}
            >
              Pricing
            </a>
          </nav>

          {/* =================================================================
              RIGHT ACTIONS: Sign in | Book a demo | Theme | Full-Screen Drawer Toggle
             ================================================================= */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label={
                isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'
              }
              className={`p-2 rounded-lg border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] ${
                isDarkMode
                  ? 'bg-[#0E1017] border-[#242836] text-[#CBD5E1] hover:text-white hover:border-[#363C4E]'
                  : 'bg-white border-[#CFD5E2] text-[#0E1117] hover:bg-[#EAEFF7]'
              }`}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                triggerActionFeedback(
                  'SSO Enclave Sign-In ready · mTLS hardware key verified'
                )
              }
              className={`hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] ${
                isDarkMode
                  ? 'bg-[#0D0E14] border-[#262936] text-[#F8FAFC] hover:bg-[#151822]'
                  : 'bg-white border-[#CFD5E2] text-[#0E1117] hover:bg-[#EAEFF7]'
              }`}
            >
              Sign in
            </button>

            <a
              href="#section-ready"
              onClick={handleLinkClick}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] border border-[#8B5CF6]/50 shadow-[0_0_20px_rgba(124,58,237,0.45)] transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]"
            >
              Book a demo
            </a>

            {/* Toggle button to open the Full-Screen Dropdown Navigation (as shown in reference screenshot) */}
            <button
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-expanded={drawerOpen}
              aria-label={
                drawerOpen
                  ? 'Close Vaulltcore Enterprise navigation menu'
                  : 'Open Vaulltcore Enterprise dropdown navigation menu'
              }
              className={`p-2 rounded-lg border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] ${
                isDarkMode
                  ? 'bg-[#0E1017] border-[#242836] text-[#F8FAFC] hover:bg-[#161924]'
                  : 'bg-white border-[#CFD5E2] text-[#0E1117]'
              }`}
            >
              {drawerOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Instant feedback toast when Sign In is clicked */}
        {authBanner && (
          <div
            role="status"
            className="bg-[#130D24] border-t border-[#3B0764] px-6 py-2 text-xs font-mono text-[#E9D5FF] flex items-center justify-center gap-2"
          >
            <CheckCircle2
              className="w-3.5 h-3.5 text-[#C084FC] shrink-0"
              aria-hidden="true"
            />
            <span>{authBanner}</span>
          </div>
        )}
      </header>

      {/* =====================================================================
          FULL-SCREEN DROPDOWN NAVIGATION OVERLAY (MATCHING SCREENSHOT 1:1)
          - Top Bar: [Icon] Vaulltcore Enterprise  .......... [×]
          - Accordion List: Product ⌄, Developers ⌄, Enterprise ⌄, Company ⌄, Pricing
          - Pinned Bottom Bar: [ Sign in ]  [ Book a demo ]
         ===================================================================== */}
      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Vaulltcore Enterprise Navigation"
          className="fixed inset-0 z-50 bg-[#0B0A0F] text-[#F8FAFC] flex flex-col justify-between overflow-y-auto"
        >
          {/* Top Section: Brand Header + Listed Dropdown Items */}
          <div>
            {/* Top Header Row inside Dropdown Overlay */}
            <div className="max-w-[1360px] mx-auto px-5 sm:px-8 py-4 flex items-center justify-between border-b border-[#181822]">
              <a
                href="#top"
                onClick={handleLinkClick}
                className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] rounded-lg"
              >
                <span
                  aria-hidden="true"
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-b from-[#E2E8F0] to-[#94A3B8] text-[#09090D]"
                >
                  <Crosshair className="w-4 h-4 stroke-[2.5]" />
                </span>
                <span className="flex items-baseline gap-1.5 text-[17px] tracking-tight">
                  <span className="font-bold text-[#F8FAFC]">Vaulltcore</span>
                  <span className="font-normal text-[#8B93A6]">Enterprise</span>
                </span>
              </a>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 text-[#94A3B8] hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] rounded-lg"
              >
                <X className="w-5 h-5 stroke-[1.8]" aria-hidden="true" />
              </button>
            </div>

            {/* Vertical Listed Dropdown Navigation Items */}
            <nav
              aria-label="Vaulltcore Enterprise Dropdown Menu"
              className="max-w-[1360px] mx-auto px-5 sm:px-8 pt-6 pb-10 space-y-1"
            >
              {DROPDOWN_ORDER.map((key) => {
                const group = NAV_DROPDOWN_DATA[key];
                const isExpanded = expandedMobileSection === key;

                return (
                  <div key={key} className="border-b border-transparent">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() =>
                        setExpandedMobileSection((prev) =>
                          prev === key ? null : key
                        )
                      }
                      className="w-full py-3.5 flex items-center justify-between text-left text-[16px] font-normal text-[#CBD5E1] hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] rounded-lg"
                    >
                      <span>{group.label}</span>
                      <ChevronDown
                        aria-hidden="true"
                        className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-white' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="pb-4 pl-3 pr-1 space-y-2 border-l border-[#232634] ml-1 mt-1">
                        {group.items.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <a
                              key={item.title}
                              href={item.href}
                              onClick={handleLinkClick}
                              className="flex items-start gap-3 p-2.5 rounded-xl bg-[#11121A]/80 hover:bg-[#171924] border border-[#1E202E] transition-colors"
                            >
                              <div className="p-2 rounded-lg bg-[#1A1C29] text-[#E2E8F0] shrink-0">
                                <IconComponent
                                  className="w-4 h-4"
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-medium text-[#F8FAFC]">
                                    {item.title}
                                  </span>
                                  {item.badge && (
                                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-[#2E1065] text-[#E9D5FF] border border-[#581C87]">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#94A3B8] mt-0.5">
                                  {item.desc}
                                </p>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Pricing Row (No right chevron, matching screenshot) */}
              <div className="pt-1">
                <a
                  href="#section-pricing"
                  onClick={handleLinkClick}
                  className="block w-full py-3.5 text-[16px] font-normal text-[#CBD5E1] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] rounded-lg"
                >
                  Pricing
                </a>
              </div>
            </nav>
          </div>

          {/* Pinned Bottom Dual CTA Bar: [ Sign in ]  [ Book a demo ] */}
          <div className="border-t border-[#191A24] bg-[#09080D] px-5 sm:px-8 py-4">
            <div className="max-w-[1360px] mx-auto grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  triggerActionFeedback(
                    'SSO Enclave Sign-In ready · mTLS hardware key verified'
                  );
                }}
                className="w-full py-3 px-4 rounded-lg bg-[#0E0F15] hover:bg-[#161822] border border-[#262936] text-sm font-medium text-[#F8FAFC] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]"
              >
                Sign in
              </button>

              <a
                href="#section-ready"
                onClick={handleLinkClick}
                className="w-full py-3 px-4 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-sm font-medium text-white text-center shadow-[0_0_24px_rgba(124,58,237,0.45)] transition-colors cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]"
              >
                Book a demo
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
