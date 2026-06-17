/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { Proposal } from "../types";
import { Chart, DoughnutController, BarController, ArcElement, BarElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";

// Register Chart.js elements
Chart.register(DoughnutController, BarController, ArcElement, BarElement, LinearScale, CategoryScale, Tooltip, Legend);

interface AnalyticsPanelProps {
  proposal: Proposal;
  showOnly?: "all" | "votes" | "power";
}

export default function AnalyticsPanel({ proposal, showOnly = "all" }: AnalyticsPanelProps) {
  const donutRef = useRef<HTMLCanvasElement | null>(null);
  const barRef = useRef<HTMLCanvasElement | null>(null);
  const donutInstance = useRef<Chart | null>(null);
  const barInstance = useRef<Chart | null>(null);

  const totalVotesDef = proposal.voteYes + proposal.voteNo + proposal.voteAbstain;
  const yesPercent = totalVotesDef > 0 ? (proposal.voteYes / totalVotesDef) * 100 : 0;
  const noPercent = totalVotesDef > 0 ? (proposal.voteNo / totalVotesDef) * 100 : 0;
  const abstainPercent = totalVotesDef > 0 ? (proposal.voteAbstain / totalVotesDef) * 100 : 0;

  // Format millions
  const formatMillions = (val: number) => {
    return `${(val / 1000000).toFixed(1)}M`;
  };

  useEffect(() => {
    if (!donutRef.current) return;

    // Destroy existing chart to prevent garbage canvas overlap bugs
    if (donutInstance.current) {
      donutInstance.current.destroy();
    }

    const ctx = donutRef.current.getContext("2d");
    if (!ctx) return;

    donutInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Yes", "No", "Abstain"],
        datasets: [{
          data: [proposal.voteYes, proposal.voteNo, proposal.voteAbstain],
          backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
          borderColor: "#0d1527",
          borderWidth: 3,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#0d1527",
            titleColor: "#92400e",
            bodyColor: "#ffffff",
            borderColor: "#1e293b",
            borderWidth: 1,
            cornerRadius: 12,
            callbacks: {
              label: function(context) {
                const rawVal = context.raw as number;
                const pct = totalVotesDef > 0 ? ((rawVal / totalVotesDef) * 100).toFixed(1) : "0";
                return ` ${context.label}: ${pct}% (${formatMillions(rawVal)} votes)`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (donutInstance.current) {
        donutInstance.current.destroy();
      }
    };
  }, [proposal]);

  // Bar chart representing Voting Power Distribution (Wallets count vs voting power weight)
  useEffect(() => {
    if (!barRef.current) return;

    if (barInstance.current) {
      barInstance.current.destroy();
    }

    const ctx = barRef.current.getContext("2d");
    if (!ctx) return;

    // Design high fidelity double bars reflecting custom tiers
    barInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["0 - 1K", "1K - 10K", "10K - 100K", "100K - 1M", "1M+"],
        datasets: [
          {
            label: "Wallets",
            data: [12000, 18500, 14200, 9500, 24800], // styled values
            backgroundColor: "rgba(59, 130, 246, 0.7)", // light blue
            borderColor: "#3b82f6",
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 8,
          },
          {
            label: "Voting Power",
            data: [15000, 22400, 19100, 12500, 27400], // styled values
            backgroundColor: "rgba(139, 92, 246, 0.7)", // hot purple
            borderColor: "#8b5cf6",
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 8,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false, // placed manually
          },
          tooltip: {
            backgroundColor: "#0d1527",
            titleColor: "#94a3b8",
            bodyColor: "#ffffff",
            borderColor: "#1e293b",
            borderWidth: 1,
            cornerRadius: 12,
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#64748b",
              font: {
                size: 9,
                family: "var(--font-mono)"
              }
            }
          },
          y: {
            grid: {
              color: "#1e293b",
            },
            ticks: {
              color: "#64748b",
              font: {
                size: 9,
                family: "var(--font-mono)"
              },
              callback: function(value) {
                const num = value as number;
                return num >= 1000 ? `${(num / 1000).toFixed(0)}K` : num;
              }
            }
          }
        }
      }
    });

    return () => {
      if (barInstance.current) {
        barInstance.current.destroy();
      }
    };
  }, []);

  if (showOnly === "votes") {
    return (
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-2 w-full">
        {/* Circular Donut wrapper with overlay text in the center */}
        <div className="relative w-44 h-44 shrink-0 mx-auto md:mx-0">
          <canvas ref={donutRef} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-2xl font-bold text-white font-mono">{formatMillions(totalVotesDef)}</span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase mt-0.5">Total Votes</span>
          </div>
        </div>

        {/* Right Labels Keys */}
        <div className="flex-1 flex flex-col gap-3 font-sans w-full max-w-md">
          {/* Yes */}
          <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-[#1e293b]/40">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200">Yes (In Favor)</span>
                <span className="text-[10px] text-slate-500 font-mono">{formatMillions(proposal.voteYes)} votes</span>
              </div>
            </div>
            <span className="text-sm font-extrabold text-emerald-400 font-mono">{yesPercent.toFixed(1)}%</span>
          </div>

          {/* No */}
          <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-[#1e293b]/40">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_#ef4444]" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200">No (Against)</span>
                <span className="text-[10px] text-slate-500 font-mono">{formatMillions(proposal.voteNo)} votes</span>
              </div>
            </div>
            <span className="text-sm font-extrabold text-rose-400 font-mono">{noPercent.toFixed(1)}%</span>
          </div>

          {/* Abstain */}
          <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-[#1e293b]/40">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b]" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200">Abstain (Neutral)</span>
                <span className="text-[10px] text-slate-500 font-mono">{formatMillions(proposal.voteAbstain)} votes</span>
              </div>
            </div>
            <span className="text-sm font-extrabold text-amber-500 font-mono">{abstainPercent.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  }

  if (showOnly === "power") {
    return (
      <div className="flex flex-col flex-1 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider select-none flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
            <span>Voting Power Distribution</span>
          </h3>
          <div className="flex items-center gap-3 text-[9px] font-mono font-semibold select-none">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-[#3b82f6]" />
              <span className="text-slate-400">Wallets</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-[#8b5cf6]" />
              <span className="text-slate-400">Power</span>
            </div>
          </div>
        </div>

        {/* Bar chart container canvas */}
        <div className="flex-1 min-h-[190px] relative w-full">
          <canvas ref={barRef} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
      {/* 1. Vote Distribution Donut Chart Panel */}
      <div className="bg-[#0d1527] border border-[#1e293b]/70 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col">
        <h3 className="text-sm font-bold text-white tracking-tight mb-4 select-none">
          Vote Distribution
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-6 py-2 w-full">
          {/* Circular Donut wrapper with overlay text in the center */}
          <div className="relative w-36 h-36 shrink-0 mx-auto sm:mx-0">
            <canvas ref={donutRef} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-xl font-bold text-white font-mono">{formatMillions(totalVotesDef)}</span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase mt-0.5">Total Votes</span>
            </div>
          </div>

          {/* Right Labels Keys */}
          <div className="flex-1 flex flex-col gap-3 font-sans w-full">
            {/* Yes */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-300">Yes</span>
                  <span className="text-[9px] text-slate-500 font-mono font-medium">{formatMillions(proposal.voteYes)} votes</span>
                </div>
              </div>
              <span className="text-sm font-bold text-white font-mono">{yesPercent.toFixed(1)}%</span>
            </div>

            {/* No */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#ef4444]" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-300">No</span>
                  <span className="text-[9px] text-slate-500 font-mono font-medium">{formatMillions(proposal.voteNo)} votes</span>
                </div>
              </div>
              <span className="text-sm font-bold text-white font-mono">{noPercent.toFixed(1)}%</span>
            </div>

            {/* Abstain */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-300">Abstain</span>
                  <span className="text-[9px] text-slate-500 font-mono font-medium">{formatMillions(proposal.voteAbstain)} votes</span>
                </div>
              </div>
              <span className="text-sm font-bold text-white font-mono">{abstainPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Voting Power Distribution Chart Panel */}
      <div className="bg-[#0d1527] border border-[#1e293b]/70 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col flex-1 min-h-[300px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white tracking-tight select-none">
            Voting Power Distribution
          </h3>
          <div className="flex items-center gap-3 text-[9px] font-mono font-semibold select-none">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-[#3b82f6]" />
              <span className="text-slate-400">Wallets</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-[#8b5cf6]" />
              <span className="text-slate-400 font-sans">Voting Power</span>
            </div>
          </div>
        </div>

        {/* Bar chart container canvas */}
        <div className="flex-1 min-h-[180px] relative">
          <canvas ref={barRef} />
        </div>
      </div>
    </div>
  );
}
