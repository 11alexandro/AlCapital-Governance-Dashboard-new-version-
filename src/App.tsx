/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { io } from "socket.io-client";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import StatsCards from "./components/StatsCards";
import ProposalList from "./components/ProposalList";
import ProposalDetails from "./components/ProposalDetails";
import AnalyticsPanel from "./components/AnalyticsPanel";
import LiveActivityFeed from "./components/LiveActivityFeed";
import FooterStatusBar from "./components/FooterStatusBar";
import { Proposal, Activity, ChartDataPoint } from "./types";
import { 
  INITIAL_PROPOSALS, 
  INITIAL_ACTIVITIES, 
  CHART_HISTORY_DATA, 
  MOCK_WALLETS 
} from "./data/constants";
import { Coins, Layers, ArrowUpRight, TrendingUp, Search, Users, Shield, Plus, ArrowRight, Wallet, CheckCircle2 } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("proposals");
  const [selectedId, setSelectedId] = useState<string>("1");
  const [currentWallet, setCurrentWallet] = useState<string>(MOCK_WALLETS[0]);
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [chartHistory, setChartHistory] = useState<ChartDataPoint[]>(CHART_HISTORY_DATA);
  
  // Real-time fluctuating parameters
  const [blockNumber, setBlockNumber] = useState<number>(19234567);
  const [gasPrice, setGasPrice] = useState<number>(25);
  const [onlineCount, setOnlineCount] = useState<number>(1248);

  // Profile-based voting ledger: tracks wallet_address -> proposal_id -> choice {"YES" | "NO" | "ABSTAIN"}
  const [userVotes, setUserVotes] = useState<Record<string, Record<string, "YES" | "NO" | "ABSTAIN">>>({});

  // Helper function to extract voting power based on active wallet profile
  const getVotingPower = (wallet: string): number => {
    switch (wallet) {
      case "0x8F3A...7B9C": return 2450;
      case "0x2D4E...9F1A": return 1200;
      case "0x7C8D...3E2F": return 850;
      case "0x9A1B...4C3D": return 5600;
      case "0x5E6F...8A7B": return 3200;
      case "0x1C2D...4E5F": return 4100;
      case "0xB3C4...5D6E": return 1950;
      case "0xF1E2...D3C4": return 2800;
      case "0xA9B8...C7D6": return 1050;
      case "0xE5D4...C3B2": return 6700;
      default: return 1500;
    }
  };

  const votingPower = useMemo(() => getVotingPower(currentWallet), [currentWallet]);

  // Retrieve current active proposal based on selected ID
  const selectedProposal = useMemo(() => {
    const prop = proposals.find((p) => p.id === selectedId) || proposals[0];
    
    // Inject active user profile's vote record to proposal details UI
    return {
      ...prop,
      userVoted: userVotes[currentWallet]?.[prop.id] || undefined
    };
  }, [proposals, selectedId, userVotes, currentWallet]);

  // Aggregate stats across all active proposals
  const totalVotesAcrossAll = useMemo(() => {
    let sum = 0;
    proposals.forEach(p => {
      sum += p.voteYes + p.voteNo + p.voteAbstain;
    });
    return sum;
  }, [proposals]);

  const socketRef = useRef<any>(null);

  // Initialize socket.io-client connection and synchronize with Express server in real-time
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on("init", (data: any) => {
      setProposals(data.proposals);
      setActivities(data.activities);
      setChartHistory(data.chartHistory);
      setUserVotes(data.userVotes);
      if (data.env) {
        setBlockNumber(data.env.blockNumber);
        setGasPrice(data.env.gasPrice);
        setOnlineCount(data.env.onlineCount);
      }
    });

    socket.on("state_updated", (data: any) => {
      setProposals(data.proposals);
      setActivities(data.activities);
      setChartHistory(data.chartHistory);
      setUserVotes(data.userVotes);
    });

    socket.on("env_update", (data: any) => {
      setBlockNumber(data.blockNumber);
      setGasPrice(data.gasPrice);
      setOnlineCount(data.onlineCount);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Broadcast Changed wallet session to other tabs via BroadcastChannel if open
  useEffect(() => {
    const syncChannel = new BroadcastChannel("aicapital_gov_sync");
    syncChannel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === "PROFILE_CHANGED") {
        setCurrentWallet(payload.wallet);
      }
    };
    return () => {
      syncChannel.close();
    };
  }, []);

  // Handle casting of the user's vote via Socket.io
  const handleCastUserVote = (voteType: "YES" | "NO" | "ABSTAIN") => {
    if (userVotes[currentWallet]?.[selectedId]) {
      return; // Already voted on this proposal using this wallet session
    }

    if (socketRef.current) {
      socketRef.current.emit("cast_vote", {
        proposalId: selectedId,
        voteType,
        wallet: currentWallet,
      });
    }
  };

  // Convert votes cast sum to text letters
  const formatCompactMillions = (value: number) => {
    return `${(value / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="flex bg-[#05070f] text-slate-100 min-h-screen relative font-sans">
      {/* Absolute Decorative Glow Orbs */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-blue-500/[0.04] blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[5%] w-[400px] h-[400px] rounded-full bg-purple-500/[0.03] blur-[120px] pointer-events-none"></div>

      {/* 1. Left Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Panel Content (shifted right offset of sidebar width 64) */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* 2. Top Navigation Bar */}
        <Topbar 
          currentWallet={currentWallet} 
          setCurrentWallet={(w) => {
            setCurrentWallet(w);
            // broadcast changed wallet profile to other frames
            const syncChannel = new BroadcastChannel("aicapital_gov_sync");
            syncChannel.postMessage({ type: "PROFILE_CHANGED", payload: { wallet: w } });
            syncChannel.close();
          }}
          onlineCount={onlineCount}
          votingPower={votingPower}
        />

        {/* 3. Sub-views Layout according to Left Tab */}
        <main className="flex-1 p-8 flex flex-col gap-6">
          
          {/* 1. Dashboard Tab View - Comprehensive 3-column Overview */}
          {activeTab === "dashboard" && (
            <>
              {/* Row: Horizontal Metric Statistics Cards */}
              <StatsCards 
                totalProposals={12} 
                totalVotesCast={formatCompactMillions(totalVotesAcrossAll)} 
                totalVotingPower="98.7M" 
                activeWallets="1,248" 
                treasuryBalance="$8.94M" 
              />

              {/* Grid Content Column Setup matching references exactly */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* A. Left Main Panel - 3/12 width: Active Proposals Selectable list */}
                <div className="lg:col-span-3 h-full">
                  <ProposalList 
                    proposals={proposals} 
                    selectedId={selectedId} 
                    setSelectedId={setSelectedId} 
                  />
                </div>

                {/* B. Center Column Panel - 5/12 width: Proposal specifics, Cast buttons, curves */}
                <div className="lg:col-span-5 h-full">
                  <ProposalDetails 
                    proposal={selectedProposal}
                    currentWallet={currentWallet}
                    votingPower={votingPower}
                    onCastVote={handleCastUserVote}
                    chartHistory={chartHistory}
                  />
                </div>

                {/* C. Right Column Panel - 4/12 width: Analytics (Donut, Bars), Live Feed scroller */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                  <AnalyticsPanel proposal={selectedProposal} />
                  
                  <LiveActivityFeed activities={activities} />
                </div>

              </div>
            </>
          )}

          {/* 2. Proposals Tab View - Dedicated list-detail split view with larger real estate */}
          {activeTab === "proposals" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Proposals Hub</h3>
                <p className="text-xs text-slate-400 mt-1">Explore, filter, and inspect draft and active voting lists across the AICapital Protocol.</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-4 h-full">
                  <ProposalList 
                    proposals={proposals} 
                    selectedId={selectedId} 
                    setSelectedId={setSelectedId} 
                  />
                </div>
                <div className="lg:col-span-8 h-full">
                  <ProposalDetails 
                    proposal={selectedProposal}
                    currentWallet={currentWallet}
                    votingPower={votingPower}
                    onCastVote={handleCastUserVote}
                    chartHistory={chartHistory}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. Vote Tab View - Focused secure voting console */}
          {activeTab === "vote" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-950/20 via-[#0d1527] to-purple-950/15 border border-[#1e293b]/50 p-6 rounded-2xl">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                    <span>Secure Voting Chamber</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Verify metadata details and cast high-integrity cryptographically weight-backed votes below.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-slate-400">Select Proposal:</span>
                  <select 
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="bg-[#070b19] border border-[#1e293b] text-slate-200 text-xs py-2 px-3.5 rounded-xl outline-none focus:border-blue-500 transition-colors font-semibold cursor-pointer max-w-[240px]"
                  >
                    {proposals.map(p => (
                      <option key={p.id} value={p.id}>Prop #{p.orderNum}: {p.title.substring(0, 32)}...</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* Proposal Metadata snapshot */}
                  <div className="bg-[#0d1527] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#3b82f6]/5 blur-3xl pointer-events-none"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-blue-500/10 text-[#3b82f6] font-mono">Proposal #{selectedProposal.orderNum}</span>
                      <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/10">{selectedProposal.status}</span>
                    </div>
                    <h4 className="text-base font-bold text-white tracking-tight mt-1">{selectedProposal.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedProposal.description}</p>
                    <div className="border-t border-[#1e293b]/40 pt-4 mt-2 flex flex-col gap-2 text-xs font-mono text-slate-400">
                      <div>Creator Hash: <span className="font-semibold text-slate-200 select-all">{selectedProposal.creator}</span></div>
                      <div>Ending Deadline: <span className="font-semibold text-blue-400">{selectedProposal.endsIn}</span></div>
                    </div>
                  </div>

                  <div className="bg-[#0d1527] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Your Voting Weight</h4>
                    <div className="flex items-center justify-between p-4 bg-[#070b19]/60 border border-[#1e293b]/40 rounded-xl">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase">Selected Identity</span>
                        <span className="text-xs font-bold text-white font-mono select-all mt-0.5 truncate">{currentWallet}</span>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="text-xs font-mono font-bold text-blue-400 block">{votingPower.toLocaleString()} VP</span>
                        <span className="text-[9px] text-slate-500 block uppercase font-mono mt-0.5">Ratio: {((votingPower / 98700000) * 100).toFixed(4)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 flex flex-col gap-6">
                  <ProposalDetails 
                    proposal={selectedProposal}
                    currentWallet={currentWallet}
                    votingPower={votingPower}
                    onCastVote={handleCastUserVote}
                    chartHistory={chartHistory}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Activity Feed Tab View - Full screen continuous log feed */}
          {activeTab === "activity" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Governance Activity Log</h3>
                <p className="text-xs text-slate-400 mt-1">Real-time telemetry and cryptographic execution events across Validator Nodes on the AICapital DAO.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 h-full">
                  <LiveActivityFeed activities={activities} />
                </div>
                <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                  <div className="bg-[#0d1527] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4 select-none">Live Network Health</h3>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between p-3.5 border border-[#1e293b]/50 bg-[#070b19]/40 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                          <span className="text-xs text-slate-300">Validator Nodes Online</span>
                        </div>
                        <span className="text-sm font-bold text-white font-mono">{onlineCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-3.5 border border-[#1e293b]/50 bg-[#070b19]/40 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-xs text-slate-300">Block Height</span>
                        </div>
                        <span className="text-sm font-bold text-white font-mono">{blockNumber}</span>
                      </div>
                      <div className="flex items-center justify-between p-3.5 border border-[#1e293b]/50 bg-[#070b19]/40 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          <span className="text-xs text-slate-300">Gas Cost Estimate</span>
                        </div>
                        <span className="text-sm font-bold text-white font-mono">{gasPrice} Gwei</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#0d1527] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm leading-relaxed text-xs text-slate-300">
                    <h4 className="text-slate-100 font-bold mb-2">Simulated Ledger Synchronizer</h4>
                    <p className="mb-2">This application establishes real-time connections locally by utilizing dynamic `BroadcastChannel` subscriptions.</p>
                    <p>New community and automated bot validation entries are generated natively every 14 seconds to represent authentic Web3 activity.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subview 01: Analytics Extra Breakdown */}
          {activeTab === "analytics" && (
            <div className="bg-[#0d1527] border border-[#1e293b]/70 rounded-2xl p-7 flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Ecosystem Metrics Overview</h3>
                <p className="text-xs text-slate-400">Expanded financial analysis across current proposals and protocol parameters.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 border border-[#1e293b]/60 bg-[#070b19]/60 rounded-xl relative">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block mb-1 uppercase tracking-wider">Proposal Success Rate</span>
                  <div className="text-2xl font-bold text-white font-mono">84.2%</div>
                  <p className="text-[11px] text-slate-500 mt-2">16 passed, 3 defeated of 19 overall. Quorum is comfortably exceeded at 16.5% average.</p>
                </div>
                <div className="p-5 border border-[#1e293b]/60 bg-[#070b19]/60 rounded-xl relative">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block mb-1 uppercase tracking-wider">Average Delegator Yield</span>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">7.14% APY</div>
                  <p className="text-[11px] text-slate-500 mt-2">Annualized protocol dividend payouts distributed automatically to active voters.</p>
                </div>
                <div className="p-5 border border-[#1e293b]/60 bg-[#070b19]/60 rounded-xl relative">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block mb-1 uppercase tracking-wider">Gini Coefficient (VP dispersion)</span>
                  <div className="text-2xl font-bold text-slate-300 font-mono">0.34</div>
                  <p className="text-[11px] text-slate-500 mt-2">Indicates a robust decentralized state distribution. Highly resilient against whale collusion.</p>
                </div>
              </div>
              <div className="p-6 border border-[#1e293b]/60 bg-[#070b19]/30 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Want to run customized queries?</h4>
                  <p className="text-xs text-slate-500">Connect to our open-source IPFS database sub-graphs or query directly via custom Dune dashboards.</p>
                </div>
                <button 
                  onClick={() => window.open("https://github.com", "_blank")}
                  className="px-4 py-2 border border-[#1e293b] hover:border-[#3b82f6]/40 hover:bg-[#1d4ed8]/10 text-xs font-semibold rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  Explore Subgraph API
                </button>
              </div>
            </div>
          )}

          {/* Subview 02: Treasury Reserves Ledger */}
          {activeTab === "treasury" && (
            <div className="bg-[#0d1527] border border-[#1e293b]/70 rounded-2xl p-7 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-[#1e293b]/50 pb-5">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Treasury Cash Reserves</h3>
                  <p className="text-xs text-slate-400">Real-time balances held in ALCapital's decentralized smart multi-sigs.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-semibold text-slate-400 block uppercase">Total Valuation</span>
                  <span className="text-2xl font-bold text-white font-mono">$8,942,500.00</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Stablecoins */}
                <div className="p-4 border border-[#1e293b]/60 bg-[#070b19]/40 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center shrink-0">
                    <Coins className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">USCD / USDT</span>
                    <span className="text-sm font-bold text-white font-mono">$4,821,400.00</span>
                  </div>
                </div>

                {/* ETH */}
                <div className="p-4 border border-[#1e293b]/60 bg-[#070b19]/40 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/15 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 fill-current text-[#8b5cf6]" viewBox="0 0 784.37 1277.39">
                      <polygon points="392.07 0 383.5 29.11 383.5 873.74 392.07 882.29 784.13 651.05 392.07 0" />
                      <polygon points="392.07 0 0 651.05 392.07 882.29 392.07 472.9 392.07 0" />
                      <polygon points="392.07 956.44 387.24 962.32 387.24 1269.83 392.07 1277.39 784.37 724.89 392.07 956.44" />
                      <polygon points="392.07 1277.39 392.07 956.44 0 724.89 392.07 1277.39" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Wrapped Ether</span>
                    <span className="text-sm font-bold text-white font-mono">1,152.40 WETH</span>
                  </div>
                </div>

                {/* AIC Utility */}
                <div className="p-4 border border-[#1e293b]/60 bg-[#070b19]/40 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/15 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">AIC Ecosystem Reserve</span>
                    <span className="text-sm font-bold text-white font-mono">12,450,000 AIC</span>
                  </div>
                </div>

                {/* DeFi Investments */}
                <div className="p-4 border border-[#1e293b]/60 bg-[#070b19]/40 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Yield Farms / LRTs</span>
                    <span className="text-sm font-bold text-white font-mono">$1,894,300.00</span>
                  </div>
                </div>
              </div>

              {/* Asset list breakdown table */}
              <div className="border border-[#1e293b]/60 rounded-xl overflow-hidden mt-2 bg-[#070b19]/20">
                <table className="w-full text-left text-xs text-slate-300 font-sans border-collapse">
                  <thead className="bg-[#070b19]/60 border-b border-[#1e293b]/50 text-slate-400 font-mono text-[10px] uppercase font-bold select-none">
                    <tr>
                      <th className="p-4">Asset</th>
                      <th className="p-4">Address Ledger</th>
                      <th className="p-4">Current Valuation</th>
                      <th className="p-4">Allocation Weighted</th>
                      <th className="p-4 text-right">Action Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]/40 font-mono">
                    <tr className="hover:bg-slate-800/10">
                      <td className="p-4 font-sans font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span>USDC (Circle Coin)</span>
                      </td>
                      <td className="p-4 text-slate-400 select-all">0x3f5ce...d53b4</td>
                      <td className="p-4 text-slate-200 font-bold">$3,840,000.00</td>
                      <td className="p-4 text-slate-400">42.9%</td>
                      <td className="p-4 text-right">
                        <button className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-[#3b82f6] hover:text-white rounded-lg text-xs transition-colors cursor-pointer font-sans font-semibold">Audit Ledger</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/10">
                      <td className="p-4 font-sans font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" />
                        <span>wETH (Wrapped Ether)</span>
                      </td>
                      <td className="p-4 text-slate-400 select-all">0x4a7e9...b8cfd</td>
                      <td className="p-4 text-slate-200 font-bold">$2,860,000.00</td>
                      <td className="p-4 text-slate-400">32.0%</td>
                      <td className="p-4 text-right">
                        <button className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-[#3b82f6] hover:text-white rounded-lg text-xs transition-colors cursor-pointer font-sans font-semibold">Audit Ledger</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/10">
                      <td className="p-4 font-sans font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                        <span>AIC Governance Reserve</span>
                      </td>
                      <td className="p-4 text-slate-400 select-all">0xf3ec9...1d48b</td>
                      <td className="p-4 text-slate-200 font-bold">$1,245,000.00</td>
                      <td className="p-4 text-slate-400">13.9%</td>
                      <td className="p-4 text-right">
                        <button className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-[#3b82f6] hover:text-white rounded-lg text-xs transition-colors cursor-pointer font-sans font-semibold">Audit Ledger</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subview 03: DAO Board Members List */}
          {activeTab === "members" && (
            <div className="bg-[#0d1527] border border-[#1e293b]/70 rounded-2xl p-7 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Voter Leaderboard</h3>
                  <p className="text-xs text-slate-400 font-sans">Core delegators and governance node profiles participating in ALCapital rounds.</p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search wallet hashes..." 
                    className="pl-10 pr-4 py-2 bg-[#070b19] border border-[#1e293b] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-[#3b82f6]/50 w-64 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {MOCK_WALLETS.slice(0, 9).map((wallet, index) => {
                  const power = getVotingPower(wallet);
                  const isUser = wallet === currentWallet;
                  return (
                    <div 
                      key={wallet}
                      className={`p-5 rounded-xl border bg-[#070b19]/40 flex items-center justify-between relative overflow-hidden group transition-all duration-300 ${
                        isUser 
                          ? "border-[#3b82f6]/40 bg-[#1d4ed8]/5" 
                          : "border-[#1e293b]/60 hover:border-slate-700/80 hover:bg-[#0d1527]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Styled index marker */}
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-[#1e293b]/50 text-[11px] font-mono font-bold text-slate-400 flex items-center justify-center shrink-0">
                          #{index + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-bold text-white select-all">{wallet}</span>
                          <span className="text-[10px] text-slate-500">Registered Validator Node</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-[#3b82f6] font-mono">
                          {power.toLocaleString()} <span className="text-[8px] text-slate-400 font-sans font-normal">VP</span>
                        </span>
                        {isUser && (
                          <span className="block text-[8px] font-bold text-emerald-400 uppercase font-mono tracking-wider mt-0.5">Your Account</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subview 04: Governance Settings Parameters */}
          {activeTab === "settings" && (
            <div className="bg-[#0d1527] border border-[#1e293b]/70 rounded-2xl p-7 flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">DAO Governance Settings</h3>
                <p className="text-xs text-slate-400 font-sans">Current parameter variables baked into ALCapital multi-sig smart contracts.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl border-t border-[#1e293b]/50 pt-5">
                {/* 1 */}
                <div className="flex flex-col gap-2 p-5 border border-[#1e293b]/50 bg-[#070b19]/40 rounded-xl">
                  <span className="text-xs font-bold text-slate-300">Minimum Proposal Threshold</span>
                  <p className="text-[11px] text-slate-500">Required native voting power credentials necessary to publish a fresh on-chain resolution.</p>
                  <div className="flex items-center gap-3 mt-2">
                    <input 
                      type="text" 
                      defaultValue="100,000 AIC" 
                      className="px-3.5 py-1.5 bg-[#070b19] border border-[#1e293b]/70 rounded-lg text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-[#3b82f6]/40 flex-1"
                    />
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-[#1e293b] text-slate-400 font-mono">0.1% Quorum</span>
                  </div>
                </div>

                {/* 2 */}
                <div className="flex flex-col gap-2 p-5 border border-[#1e293b]/50 bg-[#070b19]/40 rounded-xl">
                  <span className="text-xs font-bold text-slate-300">Voting Delay Duration</span>
                  <p className="text-[11px] text-slate-500">Cool-down timer delay before voting slots activate once draft proposals go public.</p>
                  <div className="flex items-center gap-3 mt-2">
                    <input 
                      type="text" 
                      defaultValue="3 Days (72 Hrs)" 
                      className="px-3.5 py-1.5 bg-[#070b19] border border-[#1e293b]/70 rounded-lg text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-[#3b82f6]/40 flex-1"
                    />
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-[#1e293b] text-slate-400 font-mono">7,200 Blocks</span>
                  </div>
                </div>

                {/* 3 */}
                <div className="flex flex-col gap-2 p-5 border border-[#1e293b]/50 bg-[#070b19]/40 rounded-xl">
                  <span className="text-xs font-bold text-slate-300">Smart Contract Timelock Lockup</span>
                  <p className="text-[11px] text-slate-500">Security execution latency buffer required after a vote passes prior to physical asset dispatch.</p>
                  <div className="flex items-center gap-3 mt-2">
                    <input 
                      type="text" 
                      defaultValue="2 Days (48 Hrs)" 
                      className="px-3.5 py-1.5 bg-[#070b19] border border-[#1e293b]/70 rounded-lg text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-[#3b82f6]/40 flex-1"
                    />
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-[#1e293b] text-slate-400 font-mono">Timelock Safe</span>
                  </div>
                </div>

                {/* 4 */}
                <div className="flex flex-col gap-2 p-5 border border-[#1e293b]/50 bg-[#070b19]/40 rounded-xl">
                  <span className="text-xs font-bold text-slate-300">Absolute Quorum Target</span>
                  <p className="text-[11px] text-slate-500">Necessary minimum ratio of total circulating voting power units involved to pass structural laws.</p>
                  <div className="flex items-center gap-3 mt-2">
                    <input 
                      type="text" 
                      defaultValue="12.5% (12,337,500 AIC)" 
                      className="px-3.5 py-1.5 bg-[#070b19] border border-[#1e293b]/70 rounded-lg text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-[#3b82f6]/40 flex-1"
                    />
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-[#1e293b] text-slate-400 font-mono">LOCKED</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 max-w-4xl text-[11px] text-slate-400 flex items-start gap-3">
                <Shield className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Modifying the smart contract variables requires casting and successfully validating a dedicated parameter revision proposal with a supermajority quorum of &gt;66.6% YES votes. Changes are immutable once passed.
                </p>
              </div>
            </div>
          )}

        </main>

        {/* 4. Footer status bar */}
        <FooterStatusBar 
          blockNumber={blockNumber} 
          gasPrice={gasPrice} 
          networkStatus="Connected" 
        />
      </div>
    </div>
  );
}
