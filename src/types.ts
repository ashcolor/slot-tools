export interface Member {
  id: string;
  name: string;
  investMedals: number;
  investCash: number;
  collectMedals: number;
  collectCash: number;
}


export interface RateOption {
  label: string;
  value: number;
}

export const RATE_OPTIONS: RateOption[] = [
  { label: "5 等価 (4円/枚)", value: 4 },
  { label: "20 等価 (20円/枚)", value: 20 },
  { label: "46枚 非等価 (約21.74円/枚)", value: 1000 / 46 },
];

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
  members: MemberResult[];
  settlements: Settlement[];
}
