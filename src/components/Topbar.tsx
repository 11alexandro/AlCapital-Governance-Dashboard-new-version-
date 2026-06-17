/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ChevronDown, Wallet, LogOut, RefreshCw, CheckCircle2, ShieldCheck, HelpCircle, Menu } from "lucide-react";
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
  onMenuClick?: () => void;
}

export default function Topbar({
  currentWallet,
  setCurrentWallet,
  onlineCount,
  votingPower,
  metaMaskAddress,
  metaMaskConnected = false,
  onConnectMetaMask,
  metaMaskEthBalance = "0.000",
  onMenuClick
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
    <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1e293b]/50 bg-gradient-to-b from-[#050711]/90 to-[#03060c]/90 backdrop-blur-md h-auto md:h-20 py-4 md:py-0 px-4 sm:px-8 gap-3 md:gap-4 sticky top-0 z-30 font-sans relative">
      {/* Subtle border bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-500/10 via-indigo-500/25 to-purple-500/10" />

      {/* Title & Subtitle + Menu Button */}
      <div className="flex items-center gap-3 animate-fadeIn min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl bg-[#090d1a] border border-[#1e293b] text-slate-300 hover:text-white hover:bg-slate-800/40 cursor-pointer active:scale-95 transition-all shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Brand Logo Icon */}
        <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 h-8 shrink-0">
          <svg 
            className="w-full h-full drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="logoGradTopbar" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <path 
              d="M50 10 L15 85 L35 85 L50 45 L65 85 L85 85 Z" 
              fill="url(#logoGradTopbar)" 
            />
            <path 
              d="M50 45 L35 85 L65 85 Z" 
              fill="#070b19" 
              opacity="0.8"
            />
            <path 
              d="M50 25 L28 75 L38 75 L50 48 L62 75 L72 75 Z" 
              fill="#ffffff" 
            />
          </svg>
        </div>

        <div className="flex flex-col min-w-0">
          <h1 className="text-sm min-[400px]:text-base md:text-lg lg:text-xl font-bold tracking-tight text-white flex items-center gap-1.5 sm:gap-2">
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-indigo-100 bg-clip-text text-transparent font-extrabold">AICapital</span>
            <span className="text-slate-300 font-light tracking-wide">Governance</span>
          </h1>
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium tracking-wide truncate max-w-[200px] min-[400px]:max-w-[250px] sm:max-w-md md:max-w-lg lg:max-w-xl">
            Decentralized Governance Tracker & Smart Voting Console
          </p>
        </div>
      </div>

      {/* Right Controls: Live status & Wallet Selector */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-between md:justify-end w-full md:w-auto shrink-0">
        {/* Live Indicator */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#09151c]/60 hover:bg-[#0d1e29]/75 border border-emerald-500/25 hover:border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.03)] shrink-0 select-none transition-all duration-300">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 font-mono tracking-wider uppercase">
            Live
          </span>
          <span className="h-3 w-[1px] bg-emerald-500/20"></span>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 font-mono flex items-center gap-1">
            {onlineCount.toLocaleString()} <span className="text-slate-500 font-sans font-normal lowercase hidden sm:inline">online</span>
          </span>
        </div>

        {/* MetaMask Status Button */}
        {!metaMaskConnected ? (
          <button
            onClick={onConnectMetaMask}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.02] active:scale-[0.98] border border-blue-500/30 text-white text-[9px] sm:text-xs font-bold shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.35)] transition-all cursor-pointer select-none shrink-0"
          >
            <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 transition-transform" />
            <span className="hidden sm:inline">Connect Metamask</span>
            <span className="sm:hidden">Connect</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[#091124] border border-blue-500/25 hover:border-blue-500/40 text-[#3b82f6] text-[9px] sm:text-xs font-bold select-none font-mono shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.03)] transition-all duration-300">
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 shrink-0" />
            <span className="hidden sm:inline">🦊 {getFormatWallet(metaMaskAddress || "")}</span>
            <span className="sm:hidden">🦊 {getFormatWallet(metaMaskAddress || "").slice(0, 4)}..</span>
            <span className="text-slate-700 hidden md:inline">|</span>
            <span className="text-slate-200 font-bold hidden md:inline">{metaMaskEthBalance} ETH</span>
          </div>
        )}

        {/* Wallet Dropdown Button (Local Multi-user Test Panel) */}
        <div className="relative shrink-0">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3.5 sm:py-2 rounded-xl bg-[#0b1021] hover:bg-[#111833] border border-[#1e293b]/80 hover:border-[#3b82f6]/40 transition-all text-slate-200 hover:text-white text-[9px] sm:text-xs font-semibold shadow-[0_0_10px_rgba(0,0,0,0.20)] cursor-pointer select-none shrink-0"
          >
            <div 
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.1)] shrink-0"
              style={{ background: getGradientForWallet(currentWallet) }}
            />
            <span className="font-mono text-[9px] sm:text-xs text-slate-300 hidden sm:inline">
              {getFormatWallet(currentWallet)}
            </span>
            <span className="font-mono text-[9px] text-slate-300 sm:hidden">
              {getFormatWallet(currentWallet).slice(0, 4)}..
            </span>
            <ChevronDown className="w-3 sm:w-3.5 sm:h-3.5 text-slate-400 transition-transform duration-200 shrink-0" />
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
