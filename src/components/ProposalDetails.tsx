/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { Proposal } from "../types";
import { Info, Calendar, User, Clock, ShieldCheck, CheckSquare, Trash2 } from "lucide-react";
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend } from "chart.js";

// Register Chart.js components
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

interface ProposalDetailsProps {
  proposal: Proposal;
  currentWallet: string;
  votingPower: number;
  onCastVote: (voteType: "YES" | "NO" | "ABSTAIN") => void;
  chartHistory: any[];
  onCloseProposal?: (id: string) => void;
  onArchiveProposal?: (id: string) => void;
}

export default function ProposalDetails({
  proposal,
  currentWallet,
  votingPower,
  onCastVote,
  chartHistory,
  onCloseProposal,
  onArchiveProposal
}: ProposalDetailsProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Calculate percentages
  const totalVotesDef = proposal.voteYes + proposal.voteNo + proposal.voteAbstain;
  const yesPercent = totalVotesDef > 0 ? (proposal.voteYes / totalVotesDef) * 100 : 0;
  const noPercent = totalVotesDef > 0 ? (proposal.voteNo / totalVotesDef) * 100 : 0;
  const abstainPercent = totalVotesDef > 0 ? (proposal.voteAbstain / totalVotesDef) * 100 : 0;

  // Render metric to millions string
  const formatMillions = (val: number) => {
    return `${(val / 1000000).toFixed(1)}M`;
  };

  // Re-draw chart on data change
  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart to prevent garbage canvas overlap bugs
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Generate gradients for standard neon charts
    const yesGradient = ctx.createLinearGradient(0, 0, 0, 150);
    yesGradient.addColorStop(0, "rgba(16, 185, 129, 0.2)");
    yesGradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");

    const noGradient = ctx.createLinearGradient(0, 0, 0, 150);
    noGradient.addColorStop(0, "rgba(239, 68, 68, 0.2)");
    noGradient.addColorStop(1, "rgba(239, 68, 68, 0.0)");

    const abstainGradient = ctx.createLinearGradient(0, 0, 0, 150);
    abstainGradient.addColorStop(0, "rgba(245, 158, 11, 0.15)");
    abstainGradient.addColorStop(1, "rgba(245, 158, 11, 0.0)");

    // Cumulative progress chart setup
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: chartHistory.map(d => d.date),
        datasets: [
          {
            label: "Yes",
            data: chartHistory.map(d => d.yes),
            borderColor: "#10b981",
            borderWidth: 2,
            backgroundColor: yesGradient,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#10b981",
            pointRadius: 3,
            pointHoverRadius: 6,
          },
          {
            label: "No",
            data: chartHistory.map(d => d.no),
            borderColor: "#ef4444",
            borderWidth: 2,
            backgroundColor: noGradient,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#ef4444",
            pointRadius: 3,
            pointHoverRadius: 6,
          },
          {
            label: "Abstain",
            data: chartHistory.map(d => d.abstain),
            borderColor: "#f59e0b",
            borderWidth: 2,
            backgroundColor: abstainGradient,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#f59e0b",
            pointRadius: 3,
            pointHoverRadius: 6,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false, // Customized legends are placed manually in html markup
          },
          tooltip: {
            backgroundColor: "#0d1527",
            titleColor: "#94a3b8",
            bodyColor: "#ffffff",
            borderColor: "#1e293b",
            borderWidth: 1,
            padding: 10,
            cornerRadius: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
              }
            }
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
                size: 10,
                family: "var(--font-mono)"
              }
            }
          },
          y: {
            border: {
              dash: [4, 4]
            },
            grid: {
              color: "#1e293b",
            },
            ticks: {
              color: "#64748b",
              font: {
                size: 10,
                family: "var(--font-mono)"
              },
              callback: function(value) {
                return value + "%";
              }
            },
            min: 0,
            max: 100,
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartHistory]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
      {/* A. Left Core Details Column */}
      <div className="lg:col-span-7 flex flex-col gap-6 w-full">
        {/* 1. Main Proposal Content Card */}
        <div className="bg-[#0d1527] border border-[#1e293b]/70 rounded-2xl p-4 sm:p-6 shadow-sm relative overflow-hidden flex flex-col gap-4">
          {/* Decorative subtle light */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>

          {/* Top Badges */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-[#3b82f6] tracking-wider uppercase font-mono">
              Proposal #{proposal.orderNum}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 tracking-wider uppercase flex items-center gap-1.5 select-none animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {proposal.status}
            </span>
          </div>

          {/* Proposal Title */}
          <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
            {proposal.title}
          </h2>

          {/* Proposal Description */}
          <p className="text-[12px] text-slate-300 leading-relaxed font-sans">
            {proposal.description}
          </p>

          {/* Metadata section */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 pt-4 border-t border-[#1e293b]/50 text-slate-400 text-[10px] font-mono">
            <div className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Created by:</span>
              <span className="font-bold text-slate-300 truncate max-w-[100px]">{proposal.creator}</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Created:</span>
              <span className="font-bold text-slate-300">{proposal.dateCreated}</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Ends in:</span>
              <span className="font-bold text-[#3b82f6]">{proposal.endsIn}</span>
            </div>
          </div>
        </div>

        {/* 3. Real-time Interactive Voting Panel */}
        <div className="bg-[#0d1527] border border-[#1e293b]/70 rounded-2xl p-4 sm:p-6 shadow-sm relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Cast Your Vote</span>
            </h3>
            <div className="text-[10px] font-bold px-3 py-1 rounded-lg bg-blue-500/10 text-[#3b82f6] border border-blue-500/10">
              Your VP: <span className="font-mono">{votingPower.toLocaleString()} AIC</span>
            </div>
          </div>

          {proposal.userVoted ? (
            /* User already voted interface card */
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex flex-col items-center justify-center text-center py-5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs font-bold text-white">Your vote receipt is recorded</p>
              <p className="text-[10px] text-slate-400 mt-1 font-mono leading-relaxed">
                Wallet: <span className="select-all text-slate-300">{currentWallet}</span> <br/>
                Signed vote: <span className={`font-bold ${
                  proposal.userVoted === "YES" ? "text-emerald-400" : proposal.userVoted === "NO" ? "text-rose-400" : "text-amber-500"
                }`}>{proposal.userVoted}</span> ({votingPower.toLocaleString()} VP)
              </p>
            </div>
          ) : (
            /* Cast Vote Action Panel */
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-3">
                {/* YES Button */}
                <button
                  onClick={() => onCastVote("YES")}
                  className="group flex flex-col items-center justify-center py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 hover:border-emerald-500/50 transition-all cursor-pointer font-sans select-none text-center shadow-sm relative overflow-hidden"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Yes</span>
                  </div>
                  <span className="text-[8px] text-slate-400 mt-1 uppercase tracking-wide">Support</span>
                </button>

                {/* NO Button */}
                <button
                  onClick={() => onCastVote("NO")}
                  className="group flex flex-col items-center justify-center py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/30 hover:border-rose-500/50 transition-all cursor-pointer font-sans select-none text-center shadow-sm relative overflow-hidden"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    <span>No</span>
                  </div>
                  <span className="text-[8px] text-slate-400 mt-1 uppercase tracking-wide">Reject</span>
                </button>

                {/* ABSTAIN Button */}
                <button
                  onClick={() => onCastVote("ABSTAIN")}
                  className="group flex flex-col items-center justify-center py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 hover:border-amber-500/50 transition-all cursor-pointer font-sans select-none text-center shadow-sm relative overflow-hidden"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>Abstain</span>
                  </div>
                  <span className="text-[8px] text-slate-400 mt-1 uppercase tracking-wide">Neutral</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 justify-center mt-1 text-slate-500 text-[9px] font-mono select-none">
                <Info className="w-3 h-3 text-slate-600" />
                <span>Signed vote is unalterable and final</span>
              </div>
            </div>
          )}

          {onCloseProposal && onArchiveProposal && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-4 pt-4 border-t border-[#1e293b]/40 justify-between w-full">
              <span className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-wider select-none">Multi-Sig Actions</span>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onCloseProposal(proposal.id)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-[#3b82f6] hover:text-blue-400 border border-blue-500/20 text-[9px] font-bold font-mono transition-all cursor-pointer whitespace-nowrap"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Execute</span>
                </button>
                <button
                  onClick={() => onArchiveProposal(proposal.id)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 border border-rose-500/10 text-[9px] font-bold font-mono transition-all cursor-pointer whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Archive</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* B. Right Metrics & Chart Column */}
      <div className="lg:col-span-5 flex flex-col gap-6 w-full">
        {/* 2. Live Voting Statistics Indicators */}
        <div className="bg-[#0d1527] border border-[#1e293b]/70 rounded-2xl p-5 shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3 select-none">
            Consensus Metrics
          </h4>
          
          <div className="flex flex-col gap-3">
            {/* YES */}
            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-950/40 border border-[#1e293b]/30">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">YES</span>
                <span className="text-[9px] text-slate-500 font-mono font-medium">({formatMillions(proposal.voteYes)})</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${yesPercent}%` }} />
                </div>
                <span className="text-xs font-bold text-white font-mono shrink-0 w-10 text-right">{yesPercent.toFixed(1)}%</span>
              </div>
            </div>

            {/* NO */}
            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-950/40 border border-[#1e293b]/30">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest font-mono">NO</span>
                <span className="text-[9px] text-slate-500 font-mono font-medium">({formatMillions(proposal.voteNo)})</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${noPercent}%` }} />
                </div>
                <span className="text-xs font-bold text-white font-mono shrink-0 w-10 text-right">{noPercent.toFixed(1)}%</span>
              </div>
            </div>

            {/* ABSTAIN */}
            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-950/40 border border-[#1e293b]/30">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono font-semibold">ABSTAIN</span>
                <span className="text-[9px] text-slate-500 font-mono font-medium">({formatMillions(proposal.voteAbstain)})</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${abstainPercent}%` }} />
                </div>
                <span className="text-xs font-bold text-white font-mono shrink-0 w-10 text-right">{abstainPercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Chart Section */}
        <div className="bg-[#0d1527] border border-[#1e293b]/70 rounded-2xl p-5 shadow-sm flex flex-col h-[280px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <h4 className="text-xs font-bold text-white tracking-tight">Vote Curve</h4>
              <span className="text-[9px] text-slate-400 font-mono">7D progress graph</span>
            </div>

            <div className="flex items-center gap-2 text-[8px] font-mono font-bold select-none">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-400">Yes</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span className="text-slate-400">No</span>
              </div>
            </div>
          </div>

          {/* Line Chart Component Area */}
          <div className="flex-1 relative min-h-0">
            <canvas ref={chartRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
