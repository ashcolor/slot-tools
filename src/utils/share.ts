import type { Member } from "../types";

interface ShareData {
  r: number;       // rate
  s: 46 | 50;      // slotSize
  n: string;       // name
  im: number;      // investMedals
  ic: number;      // investCash
  cm: number;      // collectMedals
  cc: number;      // collectCash
}

export interface DecodedShare {
  rate: number;
  slotSize: 46 | 50;
  member: Omit<Member, "id">;
}

export function encodeShareURL(member: Member, rate: number, slotSize: 46 | 50): string {
  const data: ShareData = {
    r: rate,
    s: slotSize,
    n: member.name,
    im: member.investMedals,
    ic: member.investCash,
    cm: member.collectMedals,
    cc: member.collectCash,
  };
  const json = JSON.stringify(data);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  const url = new URL("/noridachi", window.location.origin);
  url.searchParams.set("d", encoded);
  return url.toString();
}

export function decodeShareData(param: string): DecodedShare | null {
  try {
    const json = decodeURIComponent(escape(atob(param)));
    const data: ShareData = JSON.parse(json);
    return {
      rate: data.r,
      slotSize: data.s,
      member: {
        name: data.n,
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
