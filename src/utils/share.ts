import { pickRandomEmoji } from "../types";
import type { Member } from "../types";

interface ShareData {
  lr: number;      // lendingRate
  er: number;      // exchangeRate
  s: 46 | 50;      // slotSize
  n: string;       // name
  im: number;      // investMedals
  ic: number;      // investCash
  cm: number;      // collectMedals
  cc: number;      // collectCash
}

// 旧形式（後方互換）
interface LegacyShareData {
  r: number;
  s: 46 | 50;
  n: string;
  im: number;
  ic: number;
  cm: number;
  cc: number;
}

export interface DecodedShare {
  lendingRate: number;
  exchangeRate: number;
  slotSize: 46 | 50;
  member: Omit<Member, "id">;
}

export function encodeShareURL(member: Member, lendingRate: number, exchangeRate: number, slotSize: 46 | 50): string {
  const data: ShareData = {
    lr: lendingRate,
    er: exchangeRate,
    s: slotSize,
    n: member.name,
    im: member.investMedals,
    ic: member.investCash,
    cm: member.collectMedals,
    cc: member.collectCash,
  };
  const json = JSON.stringify(data);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  const url = new URL("/noriuchi", window.location.origin);
  url.searchParams.set("d", encoded);
  return url.toString();
}

export function decodeShareData(param: string): DecodedShare | null {
  try {
    const json = decodeURIComponent(escape(atob(param)));
    const data = JSON.parse(json) as ShareData & Partial<LegacyShareData>;

    // 旧形式: r のみ → 両方に同じ値を使う
    const lendingRate = data.lr ?? data.r ?? 20;
    const exchangeRate = data.er ?? data.r ?? 20;

    return {
      lendingRate,
      exchangeRate,
      slotSize: data.s,
      member: {
        name: data.n || pickRandomEmoji(),
        investMedals: data.im || 0,
        investCash: data.ic || 0,
        collectMedals: data.cm || 0,
        collectCash: data.cc || 0,
      },
    };
  } catch {
    return null;
  }
}
