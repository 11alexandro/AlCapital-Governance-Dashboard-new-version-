/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Proposal } from "../types";
import { ChevronRight } from "lucide-react";

interface ProposalListProps {
  proposals: Proposal[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  isProposalsPage?: boolean;
}

export default function ProposalList({ proposals, selectedId, setSelectedId, isProposalsPage = false }: ProposalListProps) {
  
  // Custom theme colors for each proposal ID to look identical to the premium mock screenshot
  const getIdStyle = (id: string) => {
    switch (id) {
      case "1":
        return {
          bg: "bg-blue-500/10 border-blue-500/30 text-[#3b82f6]",
          track: "bg-blue-500",
        };
      case "2":
        return {
          bg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
          track: "bg-cyan-400",
        };
      case "3":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          track: "bg-emerald-400",
        };
      case "4":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-500",
          track: "bg-amber-500",
        };
      case "5":
        return {
          bg: "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400",
          track: "bg-fuchsia-400",
        };
      default:
        return {
          bg: "bg-slate-500/10 border-slate-500/30 text-slate-400",
          track: "bg-slate-400",
        };
    }
  };

  return (
    <div 
      className={`bg-[#0d1527] border border-[#1e293b]/70 rounded-2xl p-4 flex flex-col shadow-sm relative overflow-hidden ${
        isProposalsPage ? "max-h-[610px] h-fit" : ""
      }`}
      style={!isProposalsPage ? { height: "508.66px" } : undefined}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.15);
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.4);
        }
      `}} />

      {/* Header section */}
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-2 select-none">
          <span>Active Proposals</span>
          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#1e293b] text-slate-300 font-mono">
            {proposals.length}
          </span>
        </h3>
        <button 
          onClick={() => setSelectedId("1")}
          className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Vertical List of Proposal Entries */}
      <div className={`flex flex-col gap-2 overflow-y-auto pr-1.5 flex-1 custom-scrollbar ${
        isProposalsPage ? "max-h-[450px]" : "max-h-[365px]"
      }`}>
        {proposals.map((proposal) => {
          const isSelected = proposal.id === selectedId;
          const styles = getIdStyle(proposal.id);
          const totalVotes = proposal.voteYes + proposal.voteNo + proposal.voteAbstain;
          const yesPercent = totalVotes > 0 ? (proposal.voteYes / totalVotes) * 100 : 0;

          return (
            <button
              key={proposal.id}
              onClick={() => setSelectedId(proposal.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all duration-300 relative group cursor-pointer ${
                isSelected 
                  ? "bg-[#1d4ed8]/10 border-[#3b82f6]/60 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                  : "bg-[#070b19]/60 border-[#1e293b]/50 hover:border-slate-700/80 hover:bg-[#0d1527]/80"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Proposal Index bubble */}
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[11px] font-extrabold font-mono shrink-0 ${styles.bg}`}>
                  {proposal.orderNum}
                </div>

                {/* Main Content Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-bold truncate leading-none transition-colors duration-200 ${
                      isSelected ? "text-white" : "text-slate-200 group-hover:text-white"
                    }`}>
                      {proposal.title}
                    </h4>
                    {/* Status badge */}
                    <span className="shrink-0 text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/10">
                      {proposal.status}
                    </span>
                  </div>

                  <p className="text-[9px] text-slate-400 mt-1 font-medium font-mono leading-none">
                    Ends in {proposal.endsIn}
                  </p>

                  {/* Tiny progress rail as styled under proposals in high-fidelity screenshot */}
                  <div className="w-full h-1 bg-[#1e293b] rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${styles.track}`}
                      style={{ width: `${yesPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom CTA bar */}
      <button 
        onClick={() => setSelectedId(proposals[0].id)}
        className="flex items-center justify-center gap-1.5 w-full mt-3.5 py-2 rounded-xl border border-dashed border-[#1e293b] hover:border-[#3b82f6]/50 bg-transparent text-[10px] font-semibold text-slate-400 hover:text-white transition-all cursor-pointer group"
      >
        <span>View All Proposals</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
