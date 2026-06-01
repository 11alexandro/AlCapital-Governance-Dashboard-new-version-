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
      iconColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
    },
    {
      id: "total-votes",
      title: "Total Votes Cast",
      value: totalVotesCast,
      icon: Vote,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
    },
    {
      id: "voting-power",
      title: "Total Voting Power",
      value: totalVotingPower,
      icon: Sparkles,
      iconColor: "text-pink-400 bg-pink-500/10 border-pink-500/20",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]"
    },
    {
      id: "active-wallets",
      title: "Active Wallets",
      value: activeWallets,
      icon: Users,
      iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
    },
    {
      id: "treasury",
      title: "Treasury Balance",
      value: treasuryBalance,
      icon: Landmark,
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className={`group bg-[#0d1527] border border-[#1e293b]/70 rounded-2xl p-5 hover:border-slate-700/80 transition-all duration-300 relative overflow-hidden flex flex-row items-center gap-4 ${stat.glowColor}`}
          >
            {/* Soft decorative glow background in card corner */}
            <div className="absolute -right-6 -bottom-6 w-16 h-16 rounded-full bg-slate-500/5 blur-lg group-hover:bg-slate-500/10 transition-colors duration-500"></div>

            {/* Icon housing */}
            <div className={`flex items-center justify-center w-11 h-11 rounded-xl border shrink-0 transition-transform duration-300 group-hover:scale-105 ${stat.iconColor}`}>
              <Icon className="w-5.5 h-5.5" />
            </div>

            {/* Stats numeric description */}
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase select-none group-hover:text-slate-300 transition-colors">
                {stat.title}
              </span>
              <span className="text-[19px] font-bold text-white tracking-tight mt-0.5 font-mono">
                {stat.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
