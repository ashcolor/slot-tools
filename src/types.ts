export interface Member {
  id: string;
  name: string;
  investMedals: number;
  investCash: number;
  collectMedals: number;
  storedMedals: number;
}

export interface RateOption {
  label: string;
  value: number;
}

export interface MemberResult {
  id: string;
  name: string;
  totalInvest: number;
  totalCollect: number;
  profit: number;
  share: number;
  diff: number; // + means receive, - means pay
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface CalcResult {
  totalInvest: number;
  totalCollect: number;
  totalProfit: number;
  totalInvestMedals: number;
  totalCollectMedals: number;
  totalInvestCash: number;
  displayInvest: number;
  displayCollect: number;
  members: MemberResult[];
  settlements: Settlement[];
}
