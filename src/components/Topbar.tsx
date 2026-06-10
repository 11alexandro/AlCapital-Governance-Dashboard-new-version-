/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ChevronDown, Wallet, LogOut, RefreshCw, CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";
import { MOCK_WALLETS } from "../data/constants";

interface TopbarProps {
  currentWallet: string;
  setCurrentWallet: (wallet: string) => void;
  onlineCount: number;
  votingPower: number;
  metaMaskAddress?: string;
  metaMaskConnected?: boolean;
  onConnectMetaMask?: () => void;
  metaMaskEthBalance?: string;
}

export default function Topbar({
  currentWallet,
  setCurrentWallet,
  onlineCount,
  votingPower,
  metaMaskAddress,
  metaMaskConnected = false,
  onConnectMetaMask,
  metaMaskEthBalance = "0.000"
}: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Generate a premium dynamic gradient avatar based on the wallet address
  const getGradientForWallet = (addr: string) => {
    if (!addr) return "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)";
    const sum = addr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const degree = sum % 360;
    return `linear-gradient(${degree}deg, #3b82f6 0%, #a855f7 50%, #ec4899 100%)`;
  };

  const getFormatWallet = (addr: string) => {
    if (!addr) return "Not Connected";
    if (addr.length <= 13) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="flex items-center justify-between border-b border-[#1e293b]/50 bg-[#05070f]/80 backdrop-blur-md h-20 px-8 sticky top-0 z-30 font-sans">
      {/* Title & Subtitle */}
      <div className="flex flex-col animate-fadeIn">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>ALCapital Governance</span>
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Decentralized Governance Tracker & Smart Voting Console
        </p>
      </div>

      {/* Right Controls: Live status & Wallet Selector */}
      <div className="flex items-center gap-5">
        {/* Live Indicator */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-semibold text-emerald-400 font-mono tracking-wider uppercase select-none">
            Live
          </span>
          <span className="h-3 w-[1px] bg-emerald-500/20"></span>
          <span className="text-[11px] font-bold text-slate-300 font-mono">
            {onlineCount.toLocaleString()} <span className="text-slate-500 font-sans font-normal lowercase">online</span>
          </span>
        </div>

        {/* MetaMask Status Button */}
        {!metaMaskConnected ? (
          <button
            onClick={onConnectMetaMask}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] border border-blue-500/30 text-white text-xs font-bold shadow-[0_0_15px_rgba(37,99,235,0.2)] transition-all cursor-pointer select-none"
          >
            <Wallet className="w-4 h-4 shrink-0 transition-transform group-hover:rotate-6" />
            <span>Connect Metamask</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-[#3b82f6] text-xs font-bold select-none font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>🦊 {getFormatWallet(metaMaskAddress || "")}</span>
            <span className="text-slate-500 font-normal">|</span>
            <span className="text-slate-300 font-normal">{metaMaskEthBalance} ETH</span>
          </div>
        )}

        {/* Wallet Dropdown Button (Local Multi-user Test Panel) */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#0d1527] hover:bg-[#131d35] border border-[#1e293b]/80 hover:border-[#3b82f6]/40 transition-all text-slate-200 hover:text-white text-xs font-semibold shadow-sm cursor-pointer select-none"
          >
            <div 
              className="w-4 h-4 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.1)] shrink-0"
              style={{ background: getGradientForWallet(currentWallet) }}
            />
            <span className="font-mono text-xs text-slate-300">{getFormatWallet(currentWallet)}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay back-closer */}
              <div 
                className="fixed inset-0 z-40 cursor-default" 
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2.5 w-72 rounded-2xl border border-[#1e293b] bg-[#0d1527] shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 py-3 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200 font-sans">
                <div className="px-4 py-2 border-b border-[#1e293b]/60 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-mono">Simulators</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-[#3b82f6]">Local Profiles</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ background: getGradientForWallet(currentWallet) }}
                    />
                    <span className="text-xs text-slate-300 font-semibold font-mono">{votingPower.toLocaleString()} AIC VP</span>
                  </div>
                </div>

                <div className="px-3">
                  <span className="block px-2 py-1 text-[9px] font-bold text-slate-500 tracking-wider uppercase mb-1 font-mono">
                    Switch Active Session identity
                  </span>
                  
                  <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1 border border-[#1e293b]/40 rounded-xl p-1.5 bg-[#070b19]/60">
                    {MOCK_WALLETS.map((wallet) => (
                      <button
                        key={wallet}
                        onClick={() => {
                          setCurrentWallet(wallet);
                          setDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between w-full p-2 rounded-lg text-left text-xs font-mono transition-colors cursor-pointer ${
                          wallet === currentWallet 
                            ? "bg-[#3b82f6]/10 text-white font-bold border border-blue-500/10" 
                            : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3.5 h-3.5 rounded-full"
                            style={{ background: getGradientForWallet(wallet) }}
                          />
                          <span>{getFormatWallet(wallet)}</span>
                        </div>
                        {wallet === currentWallet && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#3b82f6]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#1e293b]/60 px-3 flex flex-col gap-1">
                  <button 
                    onClick={() => {
                      const randomKeys = Array.from({length: 4}, () => Math.floor(Math.random()*16).toString(16)).join("");
                      const newMock = `0x${randomKeys}A3...B${randomKeys}C7`;
                      setCurrentWallet(newMock);
                      setDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/30 text-left transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Generate Random Identity</span>
                  </button>
                  <button 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 rounded-xl hover:bg-rose-500/10 text-left transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Clear dropdown</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
