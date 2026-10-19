'use client';

import React, { useState } from 'react';
import { Check, Info, ExternalLink, Layers } from 'lucide-react';

export type PlanTierId = 'free' | 'launch' | 'scale';

interface PlanFeature {
  label: string;
  tooltip?: string;
}

interface PlanSpec {
  id: PlanTierId;
  name: string;
  badge?: string;
  subtitle: string;
  highlighted?: boolean;
  features: PlanFeature[];
  priceHeadline: string;
  priceSuffix: string;
  ratesHeader: string;
  rates: {
    service: string;
    detail: string;
  }[];
}

const PLANS: PlanSpec[] = [
  {
    id: 'free',
    name: 'Free',
    subtitle: 'For prototypes, proofs of concept, and hobby projects',
    features: [
      { label: 'No credit card required' },
      { label: 'Instant provisioning' },
      { label: 'Autoscale to 2 CU', tooltip: '2 CU = 2 vCPU, 8 GB RAM' },
      { label: 'Scale to zero when idle' },
      { label: 'Point-in-time restore' },
      { label: 'Up to 100 projects' },
    ],
    priceHeadline: '$0',
    priceSuffix: '/ month',
    ratesHeader: 'INCLUDED EVERY MONTH',
    rates: [
      { service: 'Postgres', detail: '100 compute hours, 1 GB storage' },
      { service: 'Functions', detail: '10 active hours' },
      { service: 'Object storage', detail: '5 GB' },
    ],
  },
  {
    id: 'launch',
    name: 'Launch',
    badge: 'Most popular',
    subtitle: 'For production apps that stay reliable as your userbase grows',
    highlighted: true,
    features: [
      { label: 'Autoscale to 16 CU', tooltip: '16 CU = 16 vCPU, 64 GB RAM' },
      { label: 'Always-on compute' },
      { label: 'AI Gateway access' },
      { label: 'Longer point-in-time restore' },
      { label: 'Protected branches' },
      { label: 'Logical replication' },
    ],
    priceHeadline: 'Usage-based',
    priceSuffix: 'pricing',
    ratesHeader: 'RATES AT A GLANCE',
    rates: [
      { service: 'Postgres', detail: '$0.106/CU-hr, $0.35/GB-month' },
      { service: 'Functions', detail: '$0.10/CU-hr' },
      { service: 'Object storage', detail: '$0.023/GB-month' },
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    subtitle: 'For teams with strict security, compliance, and scale demands',
    features: [
      { label: 'Everything in Launch, plus:' },
      {
        label: 'Larger computes up to 56 CU',
        tooltip: '56 CU = 56 vCPU, 224 GB RAM',
      },
      { label: 'SOC 2 & HIPAA' },
      { label: 'IP Allow & private networking' },
      { label: '99.95% uptime SLA' },
      { label: 'Standard support' },
    ],
    priceHeadline: 'Usage-based',
    priceSuffix: 'pricing',
    ratesHeader: 'RATES AT A GLANCE',
    rates: [
      { service: 'Postgres', detail: '$0.222/CU-hr, $0.35/GB-month' },
      { service: 'Functions', detail: '$0.12/CU-hr' },
      { service: 'Object storage', detail: '$0.023/GB-month' },
    ],
  },
];

export default function PricingPlansGrid() {
  const [selectedPlan, setSelectedPlan] = useState<PlanTierId>('launch');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(
    'scale-Larger computes up to 56 CU'
  );
  const [showFullDetails, setShowFullDetails] = useState<boolean>(false);

  return (
    <div className="w-full space-y-6">
      {/* Top Header Bar ("Change plan" / Compute Allocation) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1A1D26]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#CBD5E1]">
            <Layers className="w-3.5 h-3.5 stroke-[2.4]" aria-hidden="true" />
            <span>03. ELASTIC ENCLAVE COMPUTE & STORAGE PLANS</span>
          </div>
          <h2
            id="pricing-heading"
            className="text-2xl lg:text-4xl font-bold tracking-[-0.03em] text-[#F8FAFC]"
          >
            Change plan
          </h2>
        </div>

        <div className="text-xs font-mono tabular-nums text-[#CBD5E1] bg-[#0D1017] border border-[#222632] rounded-xl px-3.5 py-2">
          Active tier:{' '}
          <span className="font-semibold text-[#F8FAFC] uppercase">
            {selectedPlan}
          </span>{' '}
          · Instant scale-to-zero
        </div>
      </div>

      {/* 3-Card Pricing Grid (Free, Launch, Scale) in 95% Liquid Silver/Obsidian + 5% Deep Dark Purple */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {PLANS.map((plan) => {
          const isCurrent = selectedPlan === plan.id;
          const isHighlighted = Boolean(plan.highlighted);

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 ${
                isHighlighted
                  ? 'bg-[#090B11] border-2 border-[#4C1D95] shadow-[0_0_45px_rgba(46,16,101,0.65),inset_0_1px_0_0_rgba(226,232,240,0.22)]'
                  : 'bg-[#080A0E] border border-[#1E222D] hover:border-[#2E3446] shadow-[0_18px_50px_rgba(0,0,0,0.75)]'
              }`}
            >
              {/* Top Specular Liquid Silver Hairline on Highlighted Launch Card */}
              {isHighlighted && (
                <div
                  aria-hidden="true"
                  className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#E2E8F0]/60 to-transparent"
                />
              )}

              <div>
                {/* Plan Title & "Most popular" Badge (Deep Dark Purple + Liquid Silver instead of Green) */}
                <div className="flex items-center gap-3">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC]">
                    {plan.name}
                  </h3>
                  {plan.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#2E1065] to-[#3B0764] text-[#F1F5F9] border border-[#6D28D9]/70 shadow-[0_0_16px_rgba(46,16,101,0.8)]">
                      {plan.badge}
                    </span>
                  )}
                </div>

                {/* Plan Subtitle */}
                <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                  {plan.subtitle}
                </p>

                {/* Feature Checklist */}
                <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-[#E2E8F0]">
                  {plan.features.map((feat) => {
                    const tooltipKey = `${plan.id}-${feat.label}`;
                    const isTooltipOpen = activeTooltip === tooltipKey;

                    return (
                      <li
                        key={feat.label}
                        className="relative flex items-center gap-3"
                      >
                        {/* Circular Checkmark Icon (Deep Purple + Silver on Launch, Brushed Silver on Free/Scale) */}
                        <span
                          aria-hidden="true"
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                            isHighlighted
                              ? 'bg-[#2E1065] border-[#6D28D9] text-[#F8FAFC] shadow-[0_0_10px_rgba(46,16,101,0.7)]'
                              : 'bg-[#10131B] border-[#333A4B] text-[#CBD5E1]'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </span>

                        <span className="font-medium text-[#F1F5F9]">
                          {feat.label}
                        </span>

                        {feat.tooltip && (
                          <div className="relative inline-flex items-center">
                            <button
                              type="button"
                              aria-label={`Compute unit details for ${feat.label}`}
                              onClick={() =>
                                setActiveTooltip(
                                  isTooltipOpen ? null : tooltipKey
                                )
                              }
                              onMouseEnter={() => setActiveTooltip(tooltipKey)}
                              className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] rounded-full p-0.5"
                            >
                              <Info className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>

                            {isTooltipOpen && (
                              <div
                                role="status"
                                className="absolute left-6 top-6 z-30 whitespace-nowrap rounded-lg bg-[#161922] border border-[#2E3446] px-3 py-1.5 text-xs font-mono tabular-nums text-[#F8FAFC] shadow-2xl"
                              >
                                {feat.tooltip}
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Bottom Pricing & Rates Block */}
              <div className="mt-8 pt-6 border-t border-[#1A1E29]">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#F8FAFC]">
                    {plan.priceHeadline}
                  </span>
                  <span className="text-xs sm:text-sm text-[#94A3B8]">
                    {plan.priceSuffix}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
                  <span>{plan.ratesHeader}</span>
                  <Info className="w-3 h-3 text-[#94A3B8]" aria-hidden="true" />
                </div>

                <div className="mt-2.5 space-y-1.5 text-xs font-mono tabular-nums">
                  {plan.rates.map((rate) => (
                    <div key={rate.service} className="flex items-baseline gap-2.5">
                      <span className="font-semibold text-[#E2E8F0]">
                        {rate.service}
                      </span>
                      <span className="text-[#94A3B8]">{rate.detail}</span>
                    </div>
                  ))}
                </div>

                {/* Plan Action Button */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`mt-6 w-full py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] ${
                    isCurrent
                      ? isHighlighted
                        ? 'bg-[#2E1065] hover:bg-[#3B0764] text-[#F8FAFC] border border-[#581C87] shadow-[0_0_20px_rgba(46,16,101,0.55)]'
                        : 'bg-[#161922] text-[#CBD5E1] border border-[#2E3446]'
                      : 'bg-[#0B0D13] hover:bg-[#141722] text-[#F8FAFC] border border-[#262B38]'
                  }`}
                >
                  {isCurrent ? 'Current plan' : 'Select plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Link: See full pricing details ↗ */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setShowFullDetails((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#CBD5E1] hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] rounded px-1 py-0.5 w-fit"
        >
          <span className="underline underline-offset-4 decoration-[#475569]">
            See full pricing details
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8]" aria-hidden="true" />
        </button>

        {showFullDetails && (
          <div className="text-xs font-mono tabular-nums text-[#CBD5E1] bg-[#0C0E14] border border-[#222632] rounded-xl px-4 py-2.5">
            1 CU = 1 vCPU + 4 GB RAM · Scale-to-zero after 300s idle · Zero egress fees within region
          </div>
        )}
      </div>
    </div>
  );
}
