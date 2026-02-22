import type { RateOption } from "../../types";

export const MAX_MEMBERS = 4;

export const ANIMAL_EMOJIS = [
  "🐶",
  "🐱",
  "🐰",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐸",
  "🐵",
  "🐔",
  "🐧",
  "🐦",
  "🦊",
  "🦝",
  "🦄",
  "🐴",
  "🐺",
  "🐗",
  "🐲",
  "🦎",
  "🐢",
  "🐍",
  "🦅",
  "🦉",
  "🦇",
  "🐝",
  "🐞",
  "🦋",
  "🐙",
  "🦈",
  "🐬",
  "🐳",
  "🐘",
  "🦒",
  "🦘",
  "🦩",
  "🦜",
];

export const LENDING_RATE_OPTIONS: RateOption[] = [
  { label: "4円パチンコ", value: 4 },
  { label: "20スロ", value: 20 },
  { label: "1000円/46枚", value: 1000 / 46 },
];

export const PACHINKO_LENDING_OPTIONS: RateOption[] = [{ label: "4円", value: 4 }];

export const PACHISLOT_LENDING_OPTIONS: RateOption[] = [
  { label: "20スロ", value: 20 },
  { label: "1000円/46枚", value: 1000 / 46 },
];

export function pickRandomEmoji(): string {
  return ANIMAL_EMOJIS[Math.floor(Math.random() * ANIMAL_EMOJIS.length)];
}

export function pickRandomEmojis(count: number): string[] {
  const shuffled = [...ANIMAL_EMOJIS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

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
  return [
    { label: "等価", value: 1000 / 46 },
    { label: "5.2枚", value: 100 / 5.2 },
  ];
}

