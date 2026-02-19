import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { RateSelector } from "../components/RateSelector";
import { MemberForm } from "../components/MemberForm";
import { SettlementView } from "../components/Settlement";
import { ShareModal } from "../components/ShareModal";
import { ImportModal } from "../components/ImportModal";
import { calculate } from "../utils/calculate";
import { useLocalStorage } from "../utils/useLocalStorage";
import { encodeShareURL, decodeShareData } from "../utils/share";
import { ANIMAL_EMOJIS, LENDING_RATE_OPTIONS, getExchangeOptions, pickRandomEmoji } from "../types";
import type { Member } from "../types";

const MAX_MEMBERS = 4;

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

function isMemberEmpty(m: Member) {
  return m.investMedals === 0 && m.investCash === 0 && m.collectMedals === 0 && m.collectCash === 0;
}

export function Noriuchi() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [lendingRate, setLendingRate] = useLocalStorage("noridachi-rate", 20);
  const [exchangeRate, setExchangeRate] = useLocalStorage("noridachi-exchangeRate", 20);
  const [slotSize, setSlotSize] = useLocalStorage<46 | 50>("noridachi-slotSize", 46);
  const [memberCount, setMemberCount] = useLocalStorage("noridachi-memberCount", 2);
  const [usedEmojis] = useLocalStorage("noridachi-emojis", DEFAULT_EMOJIS);
  const [members, setMembers] = useLocalStorage<Member[]>("noridachi-members", [
    createMember(usedEmojis[0]),
    createMember(usedEmojis[1]),
  ]);
  const [shareIndex, setShareIndex] = useState<number | null>(null);
  const [pendingShare, setPendingShare] = useState<Omit<Member, "id"> | null>(null);

  // localStorage から読み込んだメンバーの空名前を補完
  useEffect(() => {
    if (members.some((m) => !m.name.trim())) {
      setMembers((prev) => prev.map((m) => m.name.trim() ? m : { ...m, name: pickRandomEmoji() }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const exchangeOptions = useMemo(
    () => getExchangeOptions(lendingRate),
    [lendingRate]
  );

  const handleLendingRateChange = (newRate: number) => {
    setLendingRate(newRate);
    // 等価にリセット
    setExchangeRate(newRate);
  };

  const applyShare = (index: number) => {
    if (!pendingShare) return;
    setMembers((prev) => prev.map((m, i) =>
      i === index ? { ...m, ...pendingShare } : m
    ));
    setPendingShare(null);
  };

  // 共有URLからデータを読み込み
  useEffect(() => {
    const d = searchParams.get("d");
    if (!d) return;
    const decoded = decodeShareData(d);
    if (!decoded) return;

    setLendingRate(decoded.lendingRate);
    setExchangeRate(decoded.exchangeRate);
    setSlotSize(decoded.slotSize);
    setSearchParams({}, { replace: true });

    // 空きスロットを探す（index 0 = 自分はスキップ）
    const emptyIndex = members.findIndex((m, i) => i > 0 && isMemberEmpty(m));
    if (emptyIndex !== -1) {
      setMembers((prev) => prev.map((m, i) =>
        i === emptyIndex ? { ...m, ...decoded.member } : m
      ));
    } else {
      // 空きなし → モーダルで確認
      setPendingShare(decoded.member);
    }
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
    () => members.map((m) => ({ ...m, name: m.name.trim() || pickRandomEmoji() })),
    [members]
  );

  const medalSteps = useMemo(
    () => [slotSize, slotSize * 10],
    [slotSize]
  );

  const result = useMemo(
    () => calculate(filledMembers, lendingRate, exchangeRate),
    [filledMembers, lendingRate, exchangeRate]
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <label className="text-xs font-bold uppercase tracking-wide opacity-60 shrink-0">貸出</label>
        <RateSelector rate={lendingRate} options={LENDING_RATE_OPTIONS} onChange={handleLendingRateChange} />
        <label className="text-xs font-bold uppercase tracking-wide opacity-60 shrink-0">交換</label>
        <RateSelector rate={exchangeRate} options={exchangeOptions} onChange={setExchangeRate} />
      </div>
      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs font-bold uppercase tracking-wide opacity-60 shrink-0">再プレイ単位</label>
        <select
          className="select select-bordered select-sm w-auto"
          value={slotSize}
          onChange={(e) => setSlotSize(Number(e.target.value) as 46 | 50)}
        >
          <option value={46}>46枚</option>
          <option value={50}>50枚</option>
        </select>
        <label className="text-xs font-bold uppercase tracking-wide opacity-60 shrink-0">人数</label>
        <select
          className="select select-bordered select-sm w-auto"
          value={memberCount}
          onChange={(e) => handleCountChange(Number(e.target.value))}
        >
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>{n}人</option>
          ))}
        </select>
      </div>

      <SettlementView result={result} exchangeRate={exchangeRate} />

      <div className={memberCount <= 2 ? "mt-4 p-1 -m-1" : "mt-4 overflow-x-auto p-1 -m-1"}>
        <div className={memberCount <= 2 ? "grid grid-cols-2 gap-3" : "flex gap-3 w-min"}>
          {members.map((member, i) => (
            <div key={member.id} className={memberCount <= 2 ? "min-w-0" : "min-w-0 w-max"}>
              <MemberForm
                member={member}
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
          url={encodeShareURL(filledMembers[shareIndex], lendingRate, exchangeRate, slotSize)}
          onClose={() => setShareIndex(null)}
        />
      )}

      <ImportModal
        pendingShare={pendingShare}
        memberCount={memberCount}
        filledMembers={filledMembers}
        onApply={applyShare}
        onCancel={() => setPendingShare(null)}
      />
    </div>
  );
}
