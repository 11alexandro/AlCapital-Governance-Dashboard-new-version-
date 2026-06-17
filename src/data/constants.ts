/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Proposal, Activity, ChartDataPoint } from "../types";

export const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: "1",
    orderNum: "01",
    title: "AI Model Integration Partnership",
    summary: "Proposal to allocate treasury funds for strategic partnership with leading AI model providers to enhance protocol capabilities.",
    description: "This proposal requests the authorization and funding to form a strategic partnership with primary AI infrastructure providers. By dedicating treasury resources, AICapital aims to integrate state-of-the-art server-side Gemini and high-throughput LLM pipelines directly into the automated DAO advisory terminal. This integration will empower members with high-fidelity analytical assistants, enhance machine-learning-driven portfolio models, and establish a permanent decentralized compute reserve. Approving this proposal authorizes the release of 1,200,000 USDC from the treasury over a rolling 12-month milestone-based disbursement schedule, governed by the AI Integration Committee.",
    endsIn: "2d 14h 32m",
    status: "Active",
    creator: "0xA1B2...C3D4",
    dateCreated: "May 20, 2024",
    voteYes: 16900000,
    voteNo: 6100000,
    voteAbstain: 1700000,
  },
  {
    id: "2",
    orderNum: "02",
    title: "Treasury Diversification Strategy",
    summary: "Proposal to diversify 15% of the DAO's stablecoin holdings into liquid restaking assets (LRTs) to optimize capital efficiency.",
    description: "With stablecoins representing over 70% of treasury allocation, AICapital runs the risk of capital stagnation during high-growth market epochs. This proposal establishes an official Treasury Diversification Framework, routing 15% of existing USDC cash reserves into highly liquid restaking pools like ether.fi (eETH) and Renzo (ezETH). This hedge mitigates absolute reliance on centralized issuers while raising the DAO's internal staking yield to an estimated 6.8% APY. Withdrawals will be programmatically enabled via risk-managed multi-sigs with a maximum 72-hour slippage buffer.",
    endsIn: "4d 8h 12m",
    status: "Active",
    creator: "0x8F3A...7B9C",
    dateCreated: "May 21, 2024",
    voteYes: 12400000,
    voteNo: 8900000,
    voteAbstain: 500000,
  },
  {
    id: "3",
    orderNum: "03",
    title: "Liquidity Mining Incentives v2",
    summary: "Revamp the current liquidity reward structure across secondary DEX pools to improve long-term capital retention.",
    description: "The existing v1 liquidity incentives are yielding high impermanent loss and attract short-term 'mercenary capital' that sofort dumps protocol dividends. This v2 upgrade shifts current incentives into dynamic Uniswap V3 concentrated liquidity positions, pairing reward multipliers with long-term ve-locked staking terms. The proposal shifts the monthly emission cap from flat pool distribution to volume-dense fee-generating ranges, preserving treasury capital, raising native utility, and bolstering deep, slippage-free execution desks.",
    endsIn: "6d 22h 45m",
    status: "Active",
    creator: "0x2D4E...9F1A",
    dateCreated: "May 22, 2024",
    voteYes: 8400000,
    voteNo: 1500000,
    voteAbstain: 3100000,
  },
  {
    id: "4",
    orderNum: "04",
    title: "AIC Token Buyback Proposal",
    summary: "Allocate 5% of monthly protocol trading and advisory revenues to market-buy and lock AIC tokens in the security reserve.",
    description: "To align operational revenues with token-holders, this proposal initiates a automated buyback mechanism. Every 30 days, smart contracts will inspect net revenues collected in the advisory sub-treasury, convert 5% of those volumes to native AIC tokens using custom TWAP orders on decentralized exchanges, and store the resulting tokens in the DAO developer grant fund. This program builds perpetual purchase support, establishes a sustainable developer bounty pool, and decreases circulating liquid supply.",
    endsIn: "8d 3h 11m",
    status: "Active",
    creator: "0x7C8D...3E2F",
    dateCreated: "May 22, 2024",
    voteYes: 21100000,
    voteNo: 3200000,
    voteAbstain: 500000,
  },
  {
    id: "5",
    orderNum: "05",
    title: "Governance Parameter Update",
    summary: "Reduce proposal voting delay durations and tweak the quorum threshold from 10% to 12.5% for heightened security.",
    description: "As institutional representation increases in AICapital, our governance parameters must adapt to mitigate flash-loan voting vectors. This upgrade shortens the absolute proposal drafting delay to 24 hours (enabling faster deployment of panic patches or market adjustments) while lifting the quorum requirement of native votes to 12.5% of total circulating assets. These changes prevent low-quorum collateral attacks and ensure any active resolution reflects authentic community consensus.",
    endsIn: "10d 18h 33m",
    status: "Active",
    creator: "0x9A1B...4C3D",
    dateCreated: "May 23, 2024",
    voteYes: 4500000,
    voteNo: 12000000,
    voteAbstain: 8400000,
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "act-1",
    wallet: "0x8F3A...7B9C",
    action: "YES",
    proposalId: "1",
    proposalTitle: "AI Model Integration Partnership",
    timestamp: "2 sec ago",
    secondsAgo: 2,
    votingPower: 2450,
  },
  {
    id: "act-2",
    wallet: "0x2D4E...9F1A",
    action: "NO",
    proposalId: "1",
    proposalTitle: "AI Model Integration Partnership",
    timestamp: "5 sec ago",
    secondsAgo: 5,
    votingPower: 1200,
  },
  {
    id: "act-3",
    wallet: "0x7C8D...3E2F",
    action: "ABSTAIN",
    proposalId: "1",
    proposalTitle: "AI Model Integration Partnership",
    timestamp: "8 sec ago",
    secondsAgo: 8,
    votingPower: 850,
  },
  {
    id: "act-4",
    wallet: "0x9A1B...4C3D",
    action: "CREATED",
    proposalId: "12",
    proposalTitle: "AI Model Integration Partnership",
    timestamp: "12 sec ago",
    secondsAgo: 12,
    votingPower: 0,
  },
  {
    id: "act-5",
    wallet: "0x5E6F...8A7B",
    action: "YES",
    proposalId: "2",
    proposalTitle: "Treasury Diversification Strategy",
    timestamp: "15 sec ago",
    secondsAgo: 15,
    votingPower: 3200,
  }
];

export const CHART_HISTORY_DATA: ChartDataPoint[] = [
  { date: "May 20", yes: 55, no: 38, abstain: 18 },
  { date: "May 21", yes: 61, no: 34, abstain: 21 },
  { date: "May 22", yes: 68, no: 32, abstain: 19 },
  { date: "May 23", yes: 70, no: 31, abstain: 18 },
  { date: "May 24", yes: 69, no: 33, abstain: 22 },
  { date: "May 25", yes: 67, no: 36, abstain: 20 },
  { date: "May 26", yes: 68.4, no: 24.7, abstain: 6.9 },
];

export const MOCK_WALLETS = [
  "0x8F3A...7B9C", "0x2D4E...9F1A", "0x7C8D...3E2F", "0x9A1B...4C3D", "0x5E6F...8A7B",
  "0x1C2D...4E5F", "0xB3C4...5D6E", "0xF1E2...D3C4", "0xA9B8...C7D6", "0xE5D4...C3B2"
];
