/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Activity } from "../types";
import { Check, X, ShieldAlert, BadgePlus, ThumbsUp, HelpCircle } from "lucide-react";

interface LiveActivityFeedProps {
  activities: Activity[];
}

export default function LiveActivityFeed({ activities }: LiveActivityFeedProps) {
  
  const getActionStyles = (action: string) => {
    switch (action) {
      case "YES":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
          text: "voted YES on",
          color: "text-emerald-400",
          prefix: "+",
          icon: Check
        };
      case "NO":
        return {
          bg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
          text: "voted NO on",
          color: "text-rose-400",
          prefix: "+",
          icon: X
        };
      case "ABSTAIN":
        return {
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-500",
          text: "abstained on",
          color: "text-amber-500",
          prefix: "+",
          icon: HelpCircle
        };
      case "CREATED":
        return {
          bg: "bg-blue-500/10 border-blue-500/20 text-blue-400",
          text: "created Proposal",
          color: "text-[#3b82f6]",
          prefix: "",
          icon: BadgePlus
        };
      default:
        return {
          bg: "bg-slate-500/10 border-slate-500/20 text-slate-400",
          text: "interacted",
          color: "text-slate-400",
          prefix: "",
          icon: HelpCircle
        };
    }
  };

  return (
    <div className="bg-[#0d1527] border border-[#1e293b]/70 rounded-2xl p-5 shadow-sm flex flex-col h-fit relative overflow-hidden">
      {/* Header section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 select-none">
          <span>Live Activity Feed</span>
          {/* Animated red/green indicator dot representing real time feed */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        </h3>
        <button 
          onClick={() => {}} 
          className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Activities Feed Scroller */}
      <div className="flex-1 overflow-y-auto max-h-[310px] flex flex-col gap-3 pr-1">
        {activities.map((act) => {
          const styles = getActionStyles(act.action);
          const IconComp = styles.icon;

          return (
            <div
              key={act.id}
              className="group flex items-center justify-between p-3.5 rounded-xl border border-[#1e293b]/50 bg-[#070b19]/40 hover:bg-[#0d1527] hover:border-slate-850 transition-all duration-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Visual Action Indicator Bubble */}
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${styles.bg}`}>
                  <IconComp className="w-4 h-4" />
                </div>

                {/* Event Text Info */}
                <div className="flex flex-col min-w-0 leading-tight">
                  <div className="text-xs text-slate-300">
                    <span className="font-mono font-bold text-slate-200 select-all hover:text-white transition-colors">
                      {act.wallet}
                    </span>{" "}
                    <span className="font-normal text-slate-400">{styles.text}</span>{" "}
                    <span className="font-bold text-slate-200">
                      {act.proposalId === "12" ? `Proposal #12` : `Proposal #${act.proposalId}`}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 font-mono font-medium">
                    {act.timestamp}
                  </span>
                </div>
              </div>

              {/* Voting Power Weighted Action Tracker */}
              {act.votingPower > 0 && (
                <div className="text-right shrink-0 select-none">
                  <span className={`text-xs font-bold font-mono ${styles.color}`}>
                    {styles.prefix}{act.votingPower.toLocaleString()}
                  </span>
                  <div className="text-[8px] text-slate-500 font-mono tracking-wider uppercase">VP</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
