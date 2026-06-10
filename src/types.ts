/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Proposal {
  id: string; // e.g. "1" for Proposal #01
  orderNum: string; // e.g. "01", "02"
  title: string;
  summary: string;
  description: string;
  endsIn: string; // e.g. "2d 14h 32m"
  status: "Active" | "Passed" | "Defeated";
  creator: string; // e.g. "0xA1B2...C3D4"
  dateCreated: string; // e.g. "May 20, 2024"
  voteYes: number; // in votes (e.g. 16900000)
  voteNo: number;  // in votes (e.g. 6100000)
  voteAbstain: number; // in votes (e.g. 1800000)
  userVoted?: "YES" | "NO" | "ABSTAIN";
}

export interface Activity {
  id: string;
  wallet: string;
  action: "YES" | "NO" | "ABSTAIN" | "CREATED";
  proposalId: string;
  proposalTitle: string;
  timestamp: string; // e.g. "2 sec ago"
  secondsAgo: number;
  votingPower: number; // e.g. 2450
}

export interface StatCardData {
  title: string;
  value: string;
  icon: string;
  change?: string;
}

export interface ChartDataPoint {
  date: string; // e.g. "May 20"
  yes: number;
  no: number;
  abstain: number;
}
