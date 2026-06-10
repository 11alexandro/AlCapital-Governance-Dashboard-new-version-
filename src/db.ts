/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Define the absolute paths for fallback persistence
const FALLBACK_DB_PATH = path.join(process.cwd(), "db_persistent.json");

// Define TypeScript interfaces for our db models
export interface IUser {
  walletAddress: string;
  username: string;
  role: string;
  votingPower: number;
  createdAt: Date;
}

export interface IProposal {
  id?: string;
  orderNum: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  status: "Active" | "Passed" | "Defeated";
  votesFor: number;      // voteYes in UI
  votesAgainst: number;  // voteNo in UI
  votesAbstain: number;  // voteAbstain in UI
  totalVotes: number;
  createdBy: string;
  endsIn: string;
  dateCreated: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVote {
  proposalId: string;
  walletAddress: string;
  voteType: "YES" | "NO" | "ABSTAIN";
  votingPower: number;
  timestamp: Date;
}

export interface IActivity {
  type: "YES" | "NO" | "ABSTAIN" | "CREATED";
  description: string;
  timestamp: Date;
  wallet?: string;
  proposalId?: string;
  proposalTitle?: string;
  votingPower?: number;
}

// -------------------------------------------------------------
// Real MongoDB Schema definition (Mongoose)
// -------------------------------------------------------------

const UserSchema = new mongoose.Schema<IUser>({
  walletAddress: { type: String, required: true, unique: true },
  username: { type: String, default: "" },
  role: { type: String, default: "Member" },
  votingPower: { type: Number, default: 1500 },
  createdAt: { type: Date, default: Date.now }
});

const ProposalSchema = new mongoose.Schema<IProposal>({
  orderNum: { type: String },
  title: { type: String, required: true },
  summary: { type: String, default: "" },
  description: { type: String, required: true },
  category: { type: String, default: "Core" },
  status: { type: String, default: "Active" },
  votesFor: { type: Number, default: 0 },
  votesAgainst: { type: Number, default: 0 },
  votesAbstain: { type: Number, default: 0 },
  totalVotes: { type: Number, default: 0 },
  createdBy: { type: String, required: true },
  endsIn: { type: String, default: "3d" },
  dateCreated: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const VoteSchema = new mongoose.Schema<IVote>({
  proposalId: { type: String, required: true },
  walletAddress: { type: String, required: true },
  voteType: { type: String, required: true },
  votingPower: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ActivitySchema = new mongoose.Schema<IActivity>({
  type: { type: String, required: true },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  wallet: { type: String },
  proposalId: { type: String },
  proposalTitle: { type: String },
  votingPower: { type: Number }
});

// Guard model re-compilation in NextJS / Express HMR reloaders
export const MongooseUser = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const MongooseProposal = mongoose.models.Proposal || mongoose.model<IProposal>("Proposal", ProposalSchema);
export const MongooseVote = mongoose.models.Vote || mongoose.model<IVote>("Vote", VoteSchema);
export const MongooseActivity = mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);

// -------------------------------------------------------------
// Fallback JSON-File Database Engine (Survives Server Restarts)
// -------------------------------------------------------------

interface IFallbackDB {
  users: IUser[];
  proposals: IProposal[];
  votes: IVote[];
  activities: IActivity[];
}

const INITIAL_PROPOSALS: IProposal[] = [
  {
    orderNum: "01",
    title: "AI Model Integration Partnership",
    summary: "Proposal to allocate treasury funds for strategic partnership with leading AI model providers to enhance protocol capabilities.",
    description: "This proposal requests the authorization and funding to form a strategic partnership with primary AI infrastructure providers. By dedicating treasury resources, AICapital aims to integrate state-of-the-art server-side Gemini and high-throughput LLM pipelines directly into the automated DAO advisory terminal. Approving this proposal authorizes the release of 1,200,000 USDC from the treasury over a rolling 12-month milestone disbursement schedule.",
    category: "Strategic Integration",
    status: "Active",
    votesFor: 16900000,
    votesAgainst: 6100000,
    votesAbstain: 1700000,
    totalVotes: 24700000,
    createdBy: "0xA1B2...C3D4",
    endsIn: "2d 14h 32m",
    dateCreated: "May 20, 2024",
    createdAt: new Date("2024-05-20"),
    updatedAt: new Date("2024-05-20")
  },
  {
    orderNum: "02",
    title: "Treasury Diversification Strategy",
    summary: "Proposal to diversify 15% of the DAO's stablecoin holdings into liquid restaking assets (LRTs) to optimize capital efficiency.",
    description: "With stablecoins representing over 70% of treasury allocation, AICapital runs the risk of capital stagnation during high-growth market epochs. This proposal establishes an official Treasury Diversification Framework, routing 15% of existing USDC cash reserves into highly liquid restaking pools like ether.fi (eETH) and Renzo (ezETH).",
    category: "Treasury Management",
    status: "Active",
    votesFor: 12400000,
    votesAgainst: 8900000,
    votesAbstain: 500000,
    totalVotes: 21800000,
    createdBy: "0x8F3A...7B9C",
    endsIn: "4d 8h 12m",
    dateCreated: "May 21, 2024",
    createdAt: new Date("2024-05-21"),
    updatedAt: new Date("2024-05-21")
  },
  {
    orderNum: "03",
    title: "Liquidity Mining Incentives v2",
    summary: "Revamp the current liquidity reward structure across secondary DEX pools to improve long-term capital retention.",
    description: "The existing v1 liquidity incentives are yielding high impermanent loss and attract short-term mercenary capital. This v2 upgrade shifts current incentives into dynamic Uniswap V3 concentrated liquidity positions, pairing reward multipliers with long-term ve-locked staking terms.",
    category: "Liquidity incentives",
    status: "Active",
    votesFor: 8400000,
    votesAgainst: 1500000,
    votesAbstain: 3100000,
    totalVotes: 13000000,
    createdBy: "0x2D4E...9F1A",
    endsIn: "6d 22h 45m",
    dateCreated: "May 22, 2024",
    createdAt: new Date("2024-05-22"),
    updatedAt: new Date("2024-05-22")
  },
  {
    orderNum: "04",
    title: "AIC Token Buyback Proposal",
    summary: "Allocate 5% of monthly protocol trading and advisory revenues to market-buy and lock AIC tokens in the security reserve.",
    description: "To align operational revenues with token-holders, this proposal initiates an automated buyback mechanism. Every 30 days, smart contracts will inspect net revenues collected in the advisory sub-treasury, convert 5% of those volumes to native AIC tokens using custom TWAP orders on DEXes, and store the resulting tokens in the DAO developer grant fund.",
    category: "Protocol Revenue",
    status: "Active",
    votesFor: 21100000,
    votesAgainst: 3200000,
    votesAbstain: 500000,
    totalVotes: 24800000,
    createdBy: "0x7C8D...3E2F",
    endsIn: "8d 3h 11m",
    dateCreated: "May 22, 2024",
    createdAt: new Date("2024-05-22"),
    updatedAt: new Date("2024-05-22")
  },
  {
    orderNum: "05",
    title: "Governance Parameter Update",
    summary: "Reduce proposal voting delay durations and tweak the quorum threshold from 10% to 12.5% for heightened security.",
    description: "As institutional representation increases in AICapital, our governance parameters must adapt to mitigate flash-loan voting vectors. This upgrade shortens the absolute proposal drafting delay to 24 hours while lifting the quorum requirement of native votes to 12.5% of total circulating assets.",
    category: "Core Governance",
    status: "Active",
    votesFor: 4500000,
    votesAgainst: 12000000,
    votesAbstain: 8400000,
    totalVotes: 24900000,
    createdBy: "0x9A1B...4C3D",
    endsIn: "10d 18h 33m",
    dateCreated: "May 23, 2024",
    createdAt: new Date("2024-05-23"),
    updatedAt: new Date("2024-05-23")
  }
];

const INITIAL_ACTIVITIES: IActivity[] = [
  {
    type: "YES",
    description: "0x8F3A...7B9C voted YES with 2,450 VP on Proposal #01",
    timestamp: new Date(Date.now() - 2000),
    wallet: "0x8F3A...7B9C",
    proposalId: "1",
    proposalTitle: "AI Model Integration Partnership",
    votingPower: 2450
  },
  {
    type: "NO",
    description: "0x2D4E...9F1A voted NO with 1,200 VP on Proposal #01",
    timestamp: new Date(Date.now() - 5000),
    wallet: "0x2D4E...9F1A",
    proposalId: "1",
    proposalTitle: "AI Model Integration Partnership",
    votingPower: 1200
  },
  {
    type: "ABSTAIN",
    description: "0x7C8D...3E2F abstained with 850 VP on Proposal #01",
    timestamp: new Date(Date.now() - 8000),
    wallet: "0x7C8D...3E2F",
    proposalId: "1",
    proposalTitle: "AI Model Integration Partnership",
    votingPower: 850
  },
  {
    type: "CREATED",
    description: "New core Governance Parameter Update proposal drafted by 0x9A1B...4C3D",
    timestamp: new Date(Date.now() - 15000),
    wallet: "0x9A1B...4C3D",
    proposalId: "5",
    proposalTitle: "Governance Parameter Update",
    votingPower: 0
  }
];

class FallbackDatabase {
  private data: IFallbackDB = {
    users: [],
    proposals: [],
    votes: [],
    activities: []
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(FALLBACK_DB_PATH)) {
        const fileContent = fs.readFileSync(FALLBACK_DB_PATH, "utf8");
        const parsed = JSON.parse(fileContent);
        this.data = {
          users: parsed.users || [],
          proposals: parsed.proposals || [],
          votes: parsed.votes || [],
          activities: parsed.activities || []
        };
      } else {
        // Initialize with default states
        this.data.proposals = [...INITIAL_PROPOSALS];
        this.data.activities = [...INITIAL_ACTIVITIES];
        this.save();
      }
    } catch (err) {
      console.error("Failed to load local DB, resetting to defaults", err);
      this.data.proposals = [...INITIAL_PROPOSALS];
      this.data.activities = [...INITIAL_ACTIVITIES];
    }
  }

  private save() {
    try {
      fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(this.data, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to write local database to file system", err);
    }
  }

  // Users Helpers
  async getUsers(): Promise<IUser[]> {
    return this.data.users;
  }

  async findUser(wallet: string): Promise<IUser | null> {
    return this.data.users.find(u => u.walletAddress.toLowerCase() === wallet.toLowerCase()) || null;
  }

  async createUser(wallet: string, username = "", role = "Member", votingPower = 1500): Promise<IUser> {
    const existing = await this.findUser(wallet);
    if (existing) return existing;

    const newUser: IUser = {
      walletAddress: wallet,
      username,
      role,
      votingPower,
      createdAt: new Date()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  async updateUserVotingPower(wallet: string, votingPower: number): Promise<IUser | null> {
    const user = await this.findUser(wallet);
    if (user) {
      user.votingPower = votingPower;
      this.save();
      return user;
    }
    return this.createUser(wallet, "", "Member", votingPower);
  }

  // Proposals Helpers
  async getProposals(): Promise<IProposal[]> {
    return this.data.proposals;
  }

  async findProposal(id: string): Promise<IProposal | null> {
    // Check both index (1-based) or orderNum or raw text matching
    return this.data.proposals.find((p, index) => p.orderNum === id || String(index + 1) === id) || null;
  }

  async createProposal(proposal: Omit<IProposal, "createdAt" | "updatedAt">): Promise<IProposal> {
    const newProp: IProposal = {
      ...proposal,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.proposals.push(newProp);
    this.save();
    return newProp;
  }

  async updateProposalVotes(id: string, voteType: "YES" | "NO" | "ABSTAIN", power: number): Promise<IProposal | null> {
    const prop = await this.findProposal(id);
    if (prop) {
      if (voteType === "YES") prop.votesFor += power;
      else if (voteType === "NO") prop.votesAgainst += power;
      else if (voteType === "ABSTAIN") prop.votesAbstain += power;
      
      prop.totalVotes = prop.votesFor + prop.votesAgainst + prop.votesAbstain;
      prop.updatedAt = new Date();
      this.save();
      return prop;
    }
    return null;
  }

  async updateProposalStatus(id: string, status: "Active" | "Passed" | "Defeated"): Promise<IProposal | null> {
    const prop = await this.findProposal(id);
    if (prop) {
      prop.status = status;
      prop.updatedAt = new Date();
      this.save();
      return prop;
    }
    return null;
  }

  // Votes Helpers
  async getVotes(): Promise<IVote[]> {
    return this.data.votes;
  }

  async getVote(proposalId: string, walletAddress: string): Promise<IVote | null> {
    return this.data.votes.find(
      v => v.proposalId === proposalId && v.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    ) || null;
  }

  async castVote(vote: IVote): Promise<IVote> {
    const existing = await this.getVote(vote.proposalId, vote.walletAddress);
    if (existing) return existing;

    this.data.votes.push(vote);
    await this.updateProposalVotes(vote.proposalId, vote.voteType, vote.votingPower);
    this.save();
    return vote;
  }

  // Activities Helpers
  async getActivities(): Promise<IActivity[]> {
    return this.data.activities;
  }

  async addActivity(act: IActivity): Promise<IActivity> {
    this.data.activities.unshift(act);
    this.data.activities = this.data.activities.slice(0, 50); // Keep max 50 fallback logs
    this.save();
    return act;
  }
}

export const fallbackDB = new FallbackDatabase();

// -------------------------------------------------------------
// Central DB Service Gateway (Decides dynamically between real MongoDB and persistent fallback JSON)
// -------------------------------------------------------------

export let isMongoDBConnected = false;

export async function connectDatabase(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("-------------------------------------------------------------");
    console.log("🛡️  No MONGODB_URI found. Booting with Local JSON Fallback DB.");
    console.log(`📂  Database file: ${FALLBACK_DB_PATH}`);
    console.log("-------------------------------------------------------------");
    isMongoDBConnected = false;
    return false;
  }

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(uri);
    isMongoDBConnected = true;
    console.log("-------------------------------------------------------------");
    console.log("🍃  Mongoose: Successfully integrated live MongoDB cloud database.");
    console.log("-------------------------------------------------------------");
    
    // Seed database if empty
    const propCount = await MongooseProposal.countDocuments();
    if (propCount === 0) {
      console.log("🌱  Seeding MongoDB collection with baseline Proposals and Logs...");
      await MongooseProposal.insertMany(INITIAL_PROPOSALS);
      await MongooseActivity.insertMany(INITIAL_ACTIVITIES);
      console.log("✅  Seeding Completed.");
    }
    return true;
  } catch (err) {
    console.error("⚠️  Failed to connect to MONGODB_URI. Retrying using Local Fallback JSON.", err);
    isMongoDBConnected = false;
    return false;
  }
}

// Global accessor layer that bridges Mongoose calls and fallback calls
export const DB = {
  getIsMongoDB: () => isMongoDBConnected,

  async getUsersCount(): Promise<number> {
    if (isMongoDBConnected) {
      return await MongooseUser.countDocuments();
    }
    const users = await fallbackDB.getUsers();
    // Unique wallets counted
    const activeWallets = new Set<string>();
    const votes = await fallbackDB.getVotes();
    votes.forEach(v => activeWallets.add(v.walletAddress.toLowerCase()));
    users.forEach(u => activeWallets.add(u.walletAddress.toLowerCase()));
    
    // Fallback always should return at least some simulated user addresses
    return Math.max(12, activeWallets.size);
  },

  async registerUserSession(wallet: string, votingPower = 1500): Promise<IUser> {
    if (isMongoDBConnected) {
      let user = await MongooseUser.findOne({ walletAddress: wallet.toLowerCase() } as any);
      if (!user) {
        user = await MongooseUser.create({
          walletAddress: wallet.toLowerCase(),
          username: `user_${wallet.slice(0, 6)}`,
          role: "Member",
          votingPower
        });
      } else {
        user.votingPower = votingPower;
        await user.save();
      }
      return user;
    }
    return await fallbackDB.createUser(wallet, `user_${wallet.slice(0, 6)}`, "Member", votingPower);
  },

  async getProposals(): Promise<IProposal[]> {
    if (isMongoDBConnected) {
      const documents = await MongooseProposal.find().sort({ orderNum: 1 });
      return documents.map(d => d.toObject() as IProposal);
    }
    return await fallbackDB.getProposals();
  },

  async createProposal(data: Omit<IProposal, "createdAt" | "updatedAt">): Promise<IProposal> {
    if (isMongoDBConnected) {
      const created = await MongooseProposal.create(data);
      return created.toObject() as IProposal;
    }
    return await fallbackDB.createProposal(data);
  },

  async castVote(proposalId: string, walletAddress: string, voteType: "YES" | "NO" | "ABSTAIN", votingPower: number): Promise<boolean> {
    if (isMongoDBConnected) {
      // 1. Guard against duplicate voting
      const alreadyVoted = await MongooseVote.findOne({ proposalId, walletAddress: walletAddress.toLowerCase() } as any);
      if (alreadyVoted) {
        return false;
      }

      // 2. Insert vote
      await MongooseVote.create({
        proposalId,
        walletAddress: walletAddress.toLowerCase(),
        voteType,
        votingPower,
        timestamp: new Date()
      });

      // 3. Update proposal statistics
      const prop = await MongooseProposal.findOne({ orderNum: proposalId } as any);
      if (prop) {
        if (voteType === "YES") prop.votesFor += votingPower;
        else if (voteType === "NO") prop.votesAgainst += votingPower;
        else if (voteType === "ABSTAIN") prop.votesAbstain += votingPower;
        
        prop.totalVotes = prop.votesFor + prop.votesAgainst + prop.votesAbstain;
        prop.updatedAt = new Date();
        await prop.save();
      }
      return true;
    } else {
      const alreadyVoted = await fallbackDB.getVote(proposalId, walletAddress);
      if (alreadyVoted) return false;

      await fallbackDB.castVote({
        proposalId,
        walletAddress: walletAddress.toLowerCase(),
        voteType,
        votingPower,
        timestamp: new Date()
      });
      return true;
    }
  },

  async getUserVotes(walletAddress: string): Promise<Record<string, "YES" | "NO" | "ABSTAIN">> {
    const results: Record<string, "YES" | "NO" | "ABSTAIN"> = {};
    if (isMongoDBConnected) {
      const votes = await MongooseVote.find({ walletAddress: walletAddress.toLowerCase() } as any);
      votes.forEach(v => {
        results[v.proposalId] = v.voteType;
      });
    } else {
      const votes = await fallbackDB.getVotes();
      votes.forEach(v => {
        if (v.walletAddress.toLowerCase() === walletAddress.toLowerCase()) {
          results[v.proposalId] = v.voteType;
        }
      });
    }
    return results;
  },

  async getActivities(): Promise<IActivity[]> {
    if (isMongoDBConnected) {
      const docs = await MongooseActivity.find().sort({ timestamp: -1 }).limit(15);
      return docs.map(d => d.toObject() as IActivity);
    }
    return await fallbackDB.getActivities();
  },

  async addActivity(type: "YES" | "NO" | "ABSTAIN" | "CREATED", description: string, extra?: Partial<IActivity>): Promise<IActivity> {
    const record: IActivity = {
      type,
      description,
      timestamp: new Date(),
      ...extra
    };
    if (isMongoDBConnected) {
      const created = await MongooseActivity.create(record);
      return created.toObject() as IActivity;
    }
    return await fallbackDB.addActivity(record);
  },

  async updateProposalStatus(proposalId: string, status: "Active" | "Passed" | "Defeated"): Promise<boolean> {
    if (isMongoDBConnected) {
      const prop = await MongooseProposal.findOne({ orderNum: proposalId } as any);
      if (prop) {
        prop.status = status;
        prop.updatedAt = new Date();
        await prop.save();
        return true;
      }
      return false;
    } else {
      const updated = await fallbackDB.updateProposalStatus(proposalId, status);
      return !!updated;
    }
  }
};
