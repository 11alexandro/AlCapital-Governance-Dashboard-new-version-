/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FileText, Vote, Sparkles, Users, Landmark } from "lucide-react";

interface StatsCardsProps {
  totalProposals: number;
  totalVotesCast: string;
  totalVotingPower: string;
  activeWallets: string;
  treasuryBalance: string;
}

export default function StatsCards({
  totalProposals,
  totalVotesCast,
  totalVotingPower,
  activeWallets,
  treasuryBalance
}: StatsCardsProps) {
  
  const stats = [
    {
      id: "active-proposals",
      title: "Active Proposals",
      value: totalProposals.toString(),
      icon: FileText,
      iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.12)]"
    },
    {
      id: "total-votes",
      title: "Total Votes Cast",
      value: totalVotesCast,
      icon: Vote,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]"
    },
    {
      id: "voting-power",
      title: "Total Voting Power",
      value: totalVotingPower,
      icon: Sparkles,
      iconColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(34,211,238,0.12)]"
    },
    {
      id: "active-wallets",
      title: "Active Wallets",
      value: activeWallets,
      icon: Users,
      iconColor: "text-[#8b5cf6] bg-[#8b5cf6]/10 border-[#8b5cf6]/20",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(139,92,246,0.12)]"
    },
    {
      id: "treasury",
      title: "Treasury Value",
      value: treasuryBalance,
      icon: Landmark,
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.12)]"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className={`group bg-gradient-to-b from-[#0d1527] to-[#080d19] border border-[#1e293b]/60 rounded-2xl p-4 sm:p-5 hover:border-slate-700/80 hover:scale-[1.01] transition-all duration-300 relative overflow-hidden flex flex-row items-center gap-4 ${stat.glowColor}`}
          >
            {/* Top glass reflection highlight */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/[0.02]" />

            {/* Soft decorative glow background in card corner */}
            <div className="absolute -right-6 -bottom-6 w-16 h-16 rounded-full bg-slate-500/5 blur-lg group-hover:bg-slate-500/10 transition-colors duration-500"></div>

            {/* Icon housing */}
            <div className={`flex items-center justify-center w-11 h-11 rounded-xl border shrink-0 transition-all duration-300 group-hover:scale-105 ${stat.iconColor}`}>
              <Icon className="w-5 h-5 shrink-0" />
            </div>

            {/* Stats numeric description */}
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase select-none group-hover:text-slate-300 transition-colors truncate">
                {stat.title}
              </span>
              <span className="text-[18px] sm:text-[19px] font-bold text-white tracking-tight mt-0.5 font-mono truncate">
                {stat.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
