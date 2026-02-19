import { useEffect, useMemo, useRef, useState } from "react";
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

function isMemberEmpty(m: Member) {
  return m.investMedals === 0 && m.investCash === 0 && m.collectMedals === 0 && m.collectCash === 0;
}

export function Noriuchi() {
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
  const [pendingShare, setPendingShare] = useState<Omit<Member, "id"> | null>(null);
  const importModalRef = useRef<HTMLDialogElement>(null);

  const applyShare = (index: number, data: Omit<Member, "id">) => {
    setMembers((prev) => prev.map((m, i) =>
      i === index ? { ...m, ...data } : m
    ));
    setPendingShare(null);
  };

  // 共有URLからデータを読み込み
  useEffect(() => {
    const d = searchParams.get("d");
    if (!d) return;
    const decoded = decodeShareData(d);
    if (!decoded) return;

    setRate(decoded.rate);
    setSlotSize(decoded.slotSize);
    setSearchParams({}, { replace: true });

    // 空きスロットを探す（index 0 = 自分はスキップ）
    const emptyIndex = members.findIndex((m, i) => i > 0 && isMemberEmpty(m));
    if (emptyIndex !== -1) {
      applyShare(emptyIndex, decoded.member);
    } else {
      // 空きなし → モーダルで確認
      setPendingShare(decoded.member);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pendingShare) {
      importModalRef.current?.showModal();
    }
  }, [pendingShare]);

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

      <SettlementView result={result} rate={rate} />

      <div className={memberCount <= 2 ? "mt-4 p-1 -m-1" : "mt-4 overflow-x-auto p-1 -m-1"}>
        <div className={memberCount <= 2 ? "grid grid-cols-2 gap-3" : "flex gap-3 w-min"}>
          {members.map((member, i) => (
            <div key={member.id} className={memberCount <= 2 ? "min-w-0" : "min-w-0 w-max"}>
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

      <dialog ref={importModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">データの読み込み</h3>
          {pendingShare && memberCount <= 2 ? (
            <>
              <p className="py-4">
                「{filledMembers[1]?.name}」を「{pendingShare.name}」のデータで上書きしますか？
              </p>
              <div className="modal-action">
                <form method="dialog">
                  <button className="btn btn-sm" onClick={() => setPendingShare(null)}>キャンセル</button>
                </form>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    if (pendingShare) applyShare(1, pendingShare);
                    importModalRef.current?.close();
                  }}
                >
                  上書き
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="py-4">どのメンバーに展開しますか？</p>
              <div className="flex flex-col gap-2">
                {filledMembers.slice(1).map((m, i) => (
                  <button
                    key={m.id}
                    className="btn btn-sm"
                    onClick={() => {
                      if (pendingShare) applyShare(i + 1, pendingShare);
                      importModalRef.current?.close();
                    }}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
              <div className="modal-action">
                <form method="dialog">
                  <button className="btn btn-sm" onClick={() => setPendingShare(null)}>キャンセル</button>
                </form>
              </div>
            </>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setPendingShare(null)}>close</button>
        </form>
      </dialog>
    </div>
  );
}
