/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  LayoutDashboard, 
  FileText, 
  Vote, 
  BarChart3, 
  Coins, 
  Activity as ActivityIcon, 
  Users, 
  Settings, 
  ExternalLink,
  Twitter,
  Github,
  Compass,
  X
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  learnMoreUrl?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen = false, onClose }: SidebarProps) {
  const menuItems = [
    { name: "Dashboard", id: "dashboard", icon: LayoutDashboard },
    { name: "Proposals", id: "proposals", icon: FileText },
    { name: "Vote", id: "vote", icon: Vote },
    { name: "Analytics", id: "analytics", icon: BarChart3 },
    { name: "Treasury", id: "treasury", icon: Coins },
    { name: "Activity Feed", id: "activity", icon: ActivityIcon },
    { name: "Members", id: "members", icon: Users },
    { name: "Settings", id: "settings", icon: Settings }
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`w-64 flex flex-col justify-between border-r border-[#1e293b]/50 bg-[#070b19] h-screen fixed left-0 top-0 z-50 p-5 font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:flex`}>
        {/* Top Part: Logo */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              {/* Futuristic geometric A Logo resembling screenshot exactly */}
              <div className="relative flex items-center justify-center w-8 h-8">
                <svg 
                  className="w-full h-full drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" 
                  viewBox="0 0 100 100" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M50 10 L15 85 L35 85 L50 45 L65 85 L85 85 Z" 
                    fill="url(#logoGrad)" 
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
              <span className="text-xl font-bold font-sans tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                AICapital
              </span>
            </div>

            {/* Close button on mobile/tablet screens */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl bg-slate-900 border border-[#1e293b] text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? "bg-[#1d4ed8]/20 text-white border-l-2 border-[#3b82f6] shadow-[inset_0_0_12px_rgba(59,130,246,0.15)] font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon 
                    className={`w-[18px] h-[18px] transition-colors duration-200 ${
                      isActive ? "text-[#3b82f6]" : "text-slate-400 group-hover:text-slate-200"
                    }`} 
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] shadow-[0_0_8px_#3b82f6] animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Part: DAO Info block */}
      <div className="flex flex-col gap-4 mt-auto pt-5 border-t border-[#1e293b]/40 pb-4">
        <div className="rounded-xl border border-[#1e293b]/55 bg-[#0d1527] p-4 shadow-sm relative overflow-hidden group">
          {/* Subtle glow effect behind card */}
          <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-colors duration-500"></div>
          
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-4 h-4 text-[#3b82f6]" />
            <span className="text-xs font-semibold text-slate-200 tracking-wider uppercase">DAO Info</span>
          </div>
          
          <h4 className="text-[13px] font-bold text-white mb-1">AICapital DAO</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
            Community-driven AI investment and liquidity protocol.
          </p>
          
          <button 
            onClick={() => window.open("https://github.com", "_blank", "noopener,noreferrer")}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg border border-[#1e293b] hover:border-[#3b82f6]/40 bg-[#070b19] hover:bg-[#1d4ed8]/10 text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            <span>Learn More</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Footer & Socials Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 px-2">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noreferrer"
              className="text-slate-300 hover:text-[#3b82f6] transition-colors"
              title="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a 
              href="https://discord.com" 
              target="_blank" 
              rel="noreferrer"
              className="text-slate-300 hover:text-[#5865F2] transition-colors"
              title="Discord"
            >
              {/* Custom Discord icon since Lucide is easy but Twitter/Github/Discord are beautiful */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,52.8,6.83,77.19,77.19,0,0,0,49.5,0,105.15,105.15,0,0,0,19,8.07C3.66,31.58-1.86,54.65,1,77.53a105.73,105.73,0,0,0,32,16.29,80.68,80.68,0,0,0,6.71-11,68.6,68.6,0,0,1-10.64-5.12c.91-.67,1.81-1.37,2.67-2.1a75.75,75.75,0,0,0,71.3,0c.87.73,1.76,1.43,2.68,2.1a67.81,67.81,0,0,1-10.64,5.12,80.12,80.12,0,0,0,6.72,11,105.73,105.73,0,0,0,32-16.29C129.72,48.55,123.47,25.79,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
              </svg>
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="text-slate-300 hover:text-white transition-colors"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
          <div className="px-2 text-[10px] text-slate-400 hover:text-slate-350 transition-colors select-none">
            <p>© 2026 AICapital DAO</p>
            <p>All rights reserved.</p>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
