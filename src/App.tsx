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
import { MOCK_WALLETS } from "./data/constants";
import { Coins, Layers, ArrowUpRight, TrendingUp, Search, Users, Shield, Plus, ArrowRight, Wallet, CheckCircle2, X } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("proposals");
  const [selectedId, setSelectedId] = useState<string>("1");
  const [currentWallet, setCurrentWallet] = useState<string>(MOCK_WALLETS[0]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [chartHistory, setChartHistory] = useState<ChartDataPoint[]>([]);
  
  // Real-time fluctuating parameters
  const [blockNumber, setBlockNumber] = useState<number>(19234567);
  const [gasPrice, setGasPrice] = useState<number>(25);
  const [onlineCount, setOnlineCount] = useState<number>(1248);

  // Profile-based voting ledger: tracks wallet_address -> proposal_id -> choice {"YES" | "NO" | "ABSTAIN"}
  const [userVotes, setUserVotes] = useState<Record<string, Record<string, "YES" | "NO" | "ABSTAIN">>>({});

  // Dynamic MongoDB metrics
  const [metrics, setMetrics] = useState<any>(null);

  // MetaMask integration states (Phase 3)
  const [metaMaskAddress, setMetaMaskAddress] = useState<string>("");
  const [metaMaskEthBalance, setMetaMaskEthBalance] = useState<string>("0.000");
  const [metaMaskConnected, setMetaMaskConnected] = useState<boolean>(false);

  // New Draft Proposal modal state (Phase 4)
  const [proposalModalOpen, setProposalModalOpen] = useState<boolean>(false);
  const [newPropTitle, setNewPropTitle] = useState("");
  const [newPropSummary, setNewPropSummary] = useState("");
  const [newPropDesc, setNewPropDesc] = useState("");
  const [newPropCategory, setNewPropCategory] = useState("AI Strategy");
  const [isSubmittingProp, setIsSubmittingProp] = useState(false);

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
    if (!prop) return null;
    
    // Inject active user profile's vote record to proposal details UI
    return {
      ...prop,
      userVoted: (userVotes && userVotes[currentWallet]) ? userVotes[currentWallet][prop.id] : undefined
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

  // Fetch metrics dynamically from MongoDB/Fallback database (Phase 7)
  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/metrics");
      const data = await res.json();
      setMetrics(data);
    } catch (e) {
      console.error("Failed to load ecosystem metrics", e);
    }
  };

  // MetaMask wallet triggers & listeners (Phase 3)
  const handleConnectMetaMask = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum !== undefined) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) {
          await handleWalletSync(accounts[0]);
        }
      } catch (err: any) {
        alert("MetaMask connection failed: " + err.message);
      }
    } else {
      alert("🦊 MetaMask was not found in your browser. Feel free to use the built-in development identities dropdown on the Top bar!");
    }
  };

  const handleWalletSync = async (address: string) => {
    try {
      const res = await fetch("/api/wallets/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address })
      });
      const info = await res.json();
      if (info.success) {
        setMetaMaskAddress(info.user.walletAddress);
        setMetaMaskConnected(true);
        setCurrentWallet(info.user.walletAddress);
        setMetaMaskEthBalance(info.user.onchainEth);
        
        // Register websocket session
        if (socketRef.current) {
          socketRef.current.emit("user_connect", { wallet: info.user.walletAddress });
        }
      }
    } catch (e) {
      console.error("Failed to connect MetaMask", e);
    }
  };

  // Initialize socket.io-client connection and synchronize with Express server in real-time
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on("init", (data: any) => {
      setProposals(data.proposals);
      setActivities(data.activities);
      setChartHistory(data.chartHistory);
      setUserVotes(data.userVotes || {});
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
      if (data.userVotes) {
        setUserVotes(data.userVotes);
      }
    });

    socket.on("env_update", (data: any) => {
      setBlockNumber(data.blockNumber);
      setGasPrice(data.gasPrice);
      setOnlineCount(data.onlineCount);
    });

    socket.on("user_profile_sync", (data: any) => {
      if (data && data.walletAddress) {
        setUserVotes(prev => ({
          ...prev,
          [data.walletAddress]: data.userVotes
        }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Sync MetaMask listeners for chain/account changes (Phase 3)
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          handleWalletSync(accounts[0]);
        } else {
          setMetaMaskConnected(false);
          setMetaMaskAddress("");
        }
      };
      const handleChainChanged = () => {
        window.location.reload();
      };
      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on("chainChanged", handleChainChanged);
      return () => {
        (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
        (window as any).ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  // Load metrics dynamically and keep updated
  useEffect(() => {
    fetchMetrics();
  }, [proposals, activities]);

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

  // Handle casting of user's vote via secure REST pipeline (Phase 4, Phase 8)
  const handleCastUserVote = async (voteType: "YES" | "NO" | "ABSTAIN") => {
    if (!selectedId) return;
    if (userVotes && userVotes[currentWallet] && userVotes[currentWallet][selectedId]) {
      alert("This wallet session has already registered a vote on this proposal.");
      return;
    }

    try {
      const res = await fetch(`/api/proposals/${selectedId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: selectedId,
          walletAddress: currentWallet,
          voteType,
          votingPower
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`🗳️ Vote registered successfully!\n\nProof hash on-chain simulation index:\n${data.txHash}`);
      } else {
        alert(data.error || "Failed to submit vote");
      }
    } catch (err: any) {
      alert("Failed to submit vote: " + err.message);
    }
  };

  // Submit fresh drafted proposal to MongoDB pipeline (Phase 4)
  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropTitle || newPropTitle.trim().length < 5) {
      alert("Proposal Title must be at least 5 characters.");
      return;
    }
    if (!newPropDesc || newPropDesc.trim().length < 15) {
      alert("Description must be at least 15 characters of explanatory content.");
      return;
    }

    setIsSubmittingProp(true);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPropTitle,
          summary: newPropSummary || newPropTitle.slice(0, 80) + "...",
          description: newPropDesc,
          category: newPropCategory,
          walletAddress: currentWallet
        })
      });

      const data = await res.json();
      if (data.success) {
        setProposalModalOpen(false);
        setNewPropTitle("");
        setNewPropSummary("");
        setNewPropDesc("");
        if (data.proposal && data.proposal.orderNum) {
          setSelectedId(data.proposal.orderNum);
        }
        alert(`🎉 Proposal #${data.proposal?.orderNum || ""} drafted and registered successfully to persistence storage!`);
      } else {
        alert(data.error || "Failed to submit proposal");
      }
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmittingProp(false);
    }
  };

  // Admin closures of voting periods (Phase 4)
  const handleCloseProposal = async (id: string) => {
    try {
      const res = await fetch(`/api/proposals/${id}/close`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        alert(`🔒 Proposal #${id} has been closed. Status finalized: ${data.status}`);
      } else {
        alert(data.error || "Failed to close proposal");
      }
    } catch (e: any) {
      alert("Closure failed: " + e.message);
    }
  };

  const handleArchiveProposal = async (id: string) => {
    try {
      const res = await fetch(`/api/proposals/${id}/archive`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        alert(`📁 Proposal #${id} has been archived successfully.`);
      } else {
        alert(data.error || "Failed to archive proposal");
      }
    } catch (e: any) {
      alert("Archive failed: " + e.message);
    }
  };

  // Convert votes cast sum to text letters
  const formatCompactMillions = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    return value.toLocaleString();
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
          metaMaskAddress={metaMaskAddress}
          metaMaskConnected={metaMaskConnected}
          onConnectMetaMask={handleConnectMetaMask}
          metaMaskEthBalance={metaMaskEthBalance}
        />

        {/* 3. Sub-views Layout according to Left Tab */}
        <main className="flex-1 p-8 flex flex-col gap-6">
          
          {/* 1. Dashboard Tab View - Comprehensive 3-column Overview */}
          {activeTab === "dashboard" && (
            <>
              {/* Row: Horizontal Metric Statistics Cards connected dynamically */}
              <StatsCards 
                totalProposals={metrics?.governance?.totalProposals || proposals.length} 
                totalVotesCast={metrics?.community?.totalVotesWeight ? formatCompactMillions(metrics.community.totalVotesWeight) : formatCompactMillions(totalVotesAcrossAll)} 
                totalVotingPower="98.7M" 
                activeWallets={metrics?.community?.totalWallets ? String(metrics.community.totalWallets) : "1,248"} 
                treasuryBalance={metrics?.treasury?.treasuryBalance || "$8.94M"} 
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
                <div className="lg:col-span-5 h-full font-sans">
                  {selectedProposal ? (
                    <ProposalDetails 
                      proposal={selectedProposal}
                      currentWallet={currentWallet}
                      votingPower={votingPower}
                      onCastVote={handleCastUserVote}
                      chartHistory={chartHistory}
                      onCloseProposal={handleCloseProposal}
                      onArchiveProposal={handleArchiveProposal}
                    />
                  ) : (
                    <div className="p-6 text-center border border-dashed border-[#1e293b] rounded-2xl text-slate-500 text-xs">
                      No active proposals found in index database ledger.
                    </div>
                  )}
                </div>

                {/* C. Right Column Panel - 4/12 width: Analytics (Donut, Bars), Live Feed scroller */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                  {selectedProposal && <AnalyticsPanel proposal={selectedProposal} />}
                  
                  <LiveActivityFeed activities={activities} />
                </div>

              </div>
            </>
          )}

          {/* 2. Proposals Tab View - Dedicated list-detail split view with larger real estate */}
          {activeTab === "proposals" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/10 p-5 rounded-2xl border border-[#1e293b]/40">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Proposals Hub</h3>
                  <p className="text-xs text-slate-400 mt-1">Explore, filter, and inspect draft and active voting lists across the AICapital Protocol.</p>
                </div>
                <button
                  onClick={() => setProposalModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.25)] hover:scale-[1.01] active:scale-[0.99] rounded-xl text-xs font-bold text-white transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Draft Proposal</span>
                </button>
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
                  {selectedProposal ? (
                    <ProposalDetails 
                      proposal={selectedProposal}
                      currentWallet={currentWallet}
                      votingPower={votingPower}
                      onCastVote={handleCastUserVote}
                      chartHistory={chartHistory}
                      onCloseProposal={handleCloseProposal}
                      onArchiveProposal={handleArchiveProposal}
                    />
                  ) : (
                    <div className="p-6 text-center border border-dashed border-[#1e293b] rounded-2xl text-slate-500 text-xs">
                      No active proposals selected yet.
                    </div>
                  )}
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
                  {selectedProposal && (
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
                  )}

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
                  {selectedProposal ? (
                    <ProposalDetails 
                      proposal={selectedProposal}
                      currentWallet={currentWallet}
                      votingPower={votingPower}
                      onCastVote={handleCastUserVote}
                      chartHistory={chartHistory}
                      onCloseProposal={handleCloseProposal}
                      onArchiveProposal={handleArchiveProposal}
                    />
                  ) : (
                    <div className="p-6 text-center border border-dashed border-[#1e293b] rounded-2xl text-slate-500 text-xs">
                      No matching proposal found to vote.
                    </div>
                  )}
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
                    <p className="mb-2">This application establishes real-time connections locally by utilizing dynamic sync channels.</p>
                    <p>New community and automated bot validation entries are generated natively every 16 seconds to represent authentic Web3 activity.</p>
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
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-[#1e293b] text-slate-400 font-mono font-semibold">Timelock Safe</span>
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

      {/* ========================================== */}
      {/* 5. GORGEOUS SLIDING WIZARD PROPOSAL MODAL (Phase 4) */}
      {/* ========================================== */}
      {proposalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="fixed inset-0 cursor-default" 
            onClick={() => setProposalModalOpen(false)}
          />
          <div className="relative w-full max-w-xl rounded-3xl border border-[#1e293b] bg-[#0d1527] shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 p-7 flex flex-col gap-6 overflow-hidden animate-in zoom-in-95 duration-200 font-sans">
            {/* Background absolute decor */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-[#1e293b]/50 pb-4">
              <div className="flex flex-col">
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Plus className="w-4.5 h-4.5 text-[#3b82f6]" />
                  <span>Submit New Draft Proposal</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Submit parameter laws, multi-sig asset dispatches, or AI directives.</p>
              </div>
              <button 
                onClick={() => setProposalModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#070b19] border border-[#1e293b]/60 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="flex flex-col gap-4">
              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Proposal Category</label>
                <select
                  value={newPropCategory}
                  onChange={(e) => setNewPropCategory(e.target.value)}
                  className="w-full bg-[#070b19] border border-[#1e293b] focus:border-[#3b82f6]/80 text-xs text-slate-200 py-3 px-4 rounded-xl outline-none transition-colors cursor-pointer font-semibold"
                >
                  <option value="AI Strategy">AI Strategy & Infrastructure Allocations</option>
                  <option value="Treasury Management">Treasury Capital Deployments</option>
                  <option value="Liquidity Provisioning">Liquidity Provisions</option>
                  <option value="Core Protocol Parameters">Protocol Settings Parameters</option>
                  <option value="Community Grants">Community Ecosystem Grants</option>
                </select>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Proposal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ALP-12: Core Liquidity Allocation to Arbitrum UniV3 Pools"
                  value={newPropTitle}
                  onChange={(e) => setNewPropTitle(e.target.value)}
                  className="w-full bg-[#070b19] border border-[#1e293b] focus:border-[#3b82f6]/80 text-xs text-slate-200 py-3 px-4 rounded-xl outline-none transition-colors placeholder:text-slate-600 font-semibold"
                />
              </div>

              {/* Summary */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">One-line Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Allocate 150 WETH of reserve holdings to optimize protocol yield divider metrics."
                  value={newPropSummary}
                  onChange={(e) => setNewPropSummary(e.target.value)}
                  className="w-full bg-[#070b19] border border-[#1e293b] focus:border-[#3b82f6]/80 text-xs text-slate-200 py-3 px-4 rounded-xl outline-none transition-colors placeholder:text-slate-600"
                />
              </div>

              {/* Detailed description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Full Proposal Description</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write clear, comprehensive specifications detailing the logic, target block ranges, asset addresses, on-chain execution details, and why this benefits token delegators..."
                  value={newPropDesc}
                  onChange={(e) => setNewPropDesc(e.target.value)}
                  className="w-full bg-[#070b19] border border-[#1e293b] focus:border-[#3b82f6]/80 text-xs text-slate-200 py-3 px-4 rounded-xl outline-none transition-colors placeholder:text-slate-600 resize-none leading-relaxed"
                />
              </div>

              {/* Author Display Banner */}
              <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-between text-xs mt-2 select-none">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">Signing Wallet Identity:</span>
                <span className="font-mono text-[11px] text-blue-400 font-bold max-w-[280px] truncate">{currentWallet}</span>
              </div>

              <div className="flex items-center justify-end gap-3.5 mt-4">
                <button
                  type="button"
                  onClick={() => setProposalModalOpen(false)}
                  className="px-5 py-2.5 bg-transparent hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer select-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProp}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 hover:scale-[1.01] active:scale-[0.99] disabled:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.2)] transition-all cursor-pointer select-none flex items-center gap-1.5"
                >
                  {isSubmittingProp ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Publish on-chain draft</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
