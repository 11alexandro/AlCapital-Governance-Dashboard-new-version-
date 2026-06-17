/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Link2, Activity } from "lucide-react";

interface FooterStatusBarProps {
  blockNumber: number;
  gasPrice: number;
  networkStatus: string;
}

export default function FooterStatusBar({ blockNumber, gasPrice, networkStatus }: FooterStatusBarProps) {
  return (
    <footer className="w-full bg-[#030611] border-t border-[#1e293b]/40 py-3 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] sm:text-[11px] font-mono select-none text-slate-400">
      {/* Network parameters */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5 bg-[#0a0f21] border border-[#1e293b]/40 rounded-lg px-2 py-0.5">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10b981]"></span>
          </span>
          <span className="text-slate-500 uppercase tracking-wider text-[9px]">Status:</span>
          <span className="text-[#10b981] font-bold">{networkStatus}</span>
        </div>

        <div className="flex items-center gap-1 bg-[#0a0f21] border border-[#1e293b]/40 rounded-lg px-2 py-0.5">
          <Link2 className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="text-slate-500 uppercase tracking-wider text-[9px]">Block:</span>
          <span className="text-slate-200 font-bold">{blockNumber.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1 bg-[#0a0f21] border border-[#1e293b]/40 rounded-lg px-2 py-0.5">
          <Activity className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="text-slate-500 uppercase tracking-wider text-[9px]">Gas:</span>
          <span className="text-amber-500 font-bold">{gasPrice} Gwei</span>
        </div>
      </div>

      {/* Sync banner captions */}
      <div className="flex items-center gap-1.5 text-slate-500">
        <span className="relative flex h-1 w-1 bg-emerald-500/60 rounded-full"></span>
        <span className="text-[10px] sm:text-[11px]">Synced via WebSocket</span>
      </div>
    </footer>
  );
}
