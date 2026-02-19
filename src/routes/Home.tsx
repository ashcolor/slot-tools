import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { RateSelector } from "../components/RateSelector";
import { MemberForm } from "../components/MemberForm";
import { SettlementView } from "../components/Settlement";
import { ShareModal } from "../components/ShareModal";
import { calculate } from "../utils/calculate";
import { useLocalStorage } from "../utils/useLocalStorage";
import { encodeShareURL, decodeShareData } from "../utils/share";
import type { Member } from "../types";

const MAX_MEMBERS = 4;
const ANIMAL_EMOJIS = [
  "🐶","🐱","🐰","🐻","🐼","🐨","🐯","🦁","🐮","🐷",
  "🐸","🐵","🐔","🐧","🐦","🦊","🦝","🦄","🐴","🐺",
  "🐗","🐲","🦎","🐢","🐍","🦅","🦉","🦇","🐝","🐞",
  "🦋","🐙","🦈","🐬","🐳","🐘","🦒","🦘","🦩","🦜",
];

function pickRandomEmojis(count: number): string[] {
  const shuffled = [...ANIMAL_EMOJIS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function createMember(emoji: string): Member {
  return {
    id: crypto.randomUUID(),
    name: emoji,
    investMedals: 0,
    investCash: 0,
    collectMedals: 0,
    collectCash: 0,
  };
}

const DEFAULT_EMOJIS = pickRandomEmojis(MAX_MEMBERS);

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rate, setRate] = useLocalStorage("noridachi-rate", 20);
  const [slotSize, setSlotSize] = useLocalStorage<46 | 50>("noridachi-slotSize", 46);
  const [memberCount, setMemberCount] = useLocalStorage("noridachi-memberCount", 2);
  const [usedEmojis] = useLocalStorage("noridachi-emojis", DEFAULT_EMOJIS);
  const [members, setMembers] = useLocalStorage<Member[]>("noridachi-members", [
    createMember(usedEmojis[0]),
    createMember(usedEmojis[1]),
  ]);
  const [shareIndex, setShareIndex] = useState<number | null>(null);

  // 共有URLからデータを読み込み（メンバー2以降に挿入）
  useEffect(() => {
    const d = searchParams.get("d");
    if (!d) return;
    const decoded = decodeShareData(d);
    if (!decoded) return;

    setRate(decoded.rate);
    setSlotSize(decoded.slotSize);

    setMembers((prev) => {
      const me = prev[0] || createMember(usedEmojis[0]);
      const shared: Member = { id: crypto.randomUUID(), ...decoded.member };
      const newCount = Math.max(prev.length, 2);
      const rest = prev.slice(2);
      setMemberCount(newCount);
      return [me, shared, ...rest];
    });

    setSearchParams({}, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateMember = (index: number, updated: Member) => {
    setMembers((prev) => prev.map((m, i) => (i === index ? updated : m)));
  };

  const handleCountChange = (newCount: number) => {
    setMemberCount(newCount);
    setMembers((prev) => {
      if (newCount > prev.length) {
        const added = Array.from({ length: newCount - prev.length }, (_, i) =>
          createMember(usedEmojis[prev.length + i] || `メンバー${prev.length + i + 1}`)
        );
        return [...prev, ...added];
      }
      return prev.slice(0, newCount);
    });
  };

  const filledMembers = useMemo(
    () => members.map((m, i) => ({ ...m, name: m.name.trim() || usedEmojis[i] || `メンバー${i + 1}` })),
    [members, usedEmojis]
  );

  const medalSteps = useMemo(
    () => [slotSize, slotSize * 10],
    [slotSize]
  );

  const result = useMemo(
    () => calculate(filledMembers, rate),
    [filledMembers, rate]
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <label className="text-xs font-bold uppercase tracking-wide opacity-60 shrink-0">レート</label>
        <RateSelector rate={rate} onChange={setRate} />
      </div>
      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs font-bold uppercase tracking-wide opacity-60 shrink-0">再プレイ単位</label>
        <select
          className="select select-bordered select-sm w-24"
          value={slotSize}
          onChange={(e) => setSlotSize(Number(e.target.value) as 46 | 50)}
        >
          <option value={46}>46枚</option>
          <option value={50}>50枚</option>
        </select>
        <label className="text-xs font-bold uppercase tracking-wide opacity-60 shrink-0">人数</label>
        <select
          className="select select-bordered select-sm w-20"
          value={memberCount}
          onChange={(e) => handleCountChange(Number(e.target.value))}
        >
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>{n}人</option>
          ))}
        </select>
      </div>

      <SettlementView result={result} rate={rate} />

      <div className="divider text-xs opacity-60">
        入力
        <button
          type="button"
          className="btn btn-xs btn-ghost opacity-40 hover:opacity-100"
          onClick={() => {
            setMembers((prev) => prev.map((m) => ({
              ...m,
              investMedals: 0,
              investCash: 0,
              collectMedals: 0,
              collectCash: 0,
            })));
          }}
        >
          クリア
        </button>
      </div>

      <div className="overflow-x-auto p-1 -m-1">
        <div className="flex gap-3 w-min">
          {members.map((member, i) => (
            <div key={member.id} className="min-w-0 w-max">
              <MemberForm
                member={member}
                index={i}
                medalSteps={medalSteps}
                onChange={(updated) => updateMember(i, updated)}
                onShare={() => setShareIndex(i)}
              />
            </div>
          ))}
        </div>
      </div>

      {shareIndex !== null && (
        <ShareModal
          url={encodeShareURL(filledMembers[shareIndex], rate, slotSize)}
          onClose={() => setShareIndex(null)}
        />
      )}
    </div>
  );
}
