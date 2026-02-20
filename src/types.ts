export const ANIMAL_EMOJIS = [
  "🐶","🐱","🐰","🐻","🐼","🐨","🐯","🦁","🐮","🐷",
  "🐸","🐵","🐔","🐧","🐦","🦊","🦝","🦄","🐴","🐺",
  "🐗","🐲","🦎","🐢","🐍","🦅","🦉","🦇","🐝","🐞",
  "🦋","🐙","🦈","🐬","🐳","🐘","🦒","🦘","🦩","🦜",
];

export function pickRandomEmoji(): string {
  return ANIMAL_EMOJIS[Math.floor(Math.random() * ANIMAL_EMOJIS.length)];
}

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

export const LENDING_RATE_OPTIONS: RateOption[] = [
  { label: "4円パチンコ", value: 4 },
  { label: "20スロ", value: 20 },
  { label: "1000円/46枚", value: 1000 / 46 },
];

export const PACHINKO_LENDING_OPTIONS: RateOption[] = [
  { label: "4円", value: 4 },
];

export const PACHISLOT_LENDING_OPTIONS: RateOption[] = [
  { label: "20スロ", value: 20 },
  { label: "1000円/46枚", value: 1000 / 46 },
];

export function getExchangeOptions(lendingRate: number): RateOption[] {
  if (lendingRate === 4) {
    return [
      { label: "等価", value: 4 },
      { label: "28玉", value: 100 / 28 },
      { label: "30玉", value: 100 / 30 },
      { label: "33玉", value: 100 / 33 },
    ];
  }
  if (lendingRate === 20) {
    return [
      { label: "等価", value: 20 },
      { label: "5.5枚", value: 100 / 5.5 },
      { label: "5.6枚", value: 100 / 5.6 },
      { label: "6.0枚", value: 100 / 6 },
    ];
  }
  // 46枚貸し
  return [
    { label: "等価", value: 1000 / 46 },
    { label: "5.2枚", value: 100 / 5.2 },
  ];
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
