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
    <footer className="w-full bg-[#05070f] border-t border-[#1e293b]/50 h-10 px-8 flex items-center justify-between text-[11px] font-mono select-none text-slate-400">
      {/* Network parameters */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400">Network Status:</span>
          <span className="text-slate-200 font-bold">{networkStatus}</span>
        </div>

        <span className="h-3 w-[1px] bg-slate-800"></span>

        <div className="flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400">Block:</span>
          <span className="text-slate-200 font-bold tracking-wider">{blockNumber.toLocaleString()}</span>
        </div>

        <span className="h-3 w-[1px] bg-slate-800"></span>

        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400">Gas:</span>
          <span className="text-emerald-400 font-bold">{gasPrice} Gwei</span>
        </div>
      </div>

      {/* Sync banner captions */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>
        <span className="text-slate-500 font-medium">Updates every second via WebSocket</span>
      </div>
    </footer>
  );
}
