import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { RateSelector } from "../components/RateSelector";
import { MemberForm } from "../components/MemberForm";
import { SettlementView } from "../components/Settlement";
import { calculate } from "../utils/calculate";
import { useLocalStorage } from "../utils/useLocalStorage";
import { ANIMAL_EMOJIS, LENDING_RATE_OPTIONS, getExchangeOptions, pickRandomEmoji } from "../types";
import type { Member } from "../types";

const MAX_MEMBERS = 4;

function pickRandomEmojis(count: number): string[] {
  const shuffled = [...ANIMAL_EMOJIS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function createMember(emoji: string): Member {
  return {
    id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36),
    name: emoji,
    investMedals: 0,
    investCash: 0,
    collectMedals: 0,
    storedMedals: 0,
  };
}

const DEFAULT_EMOJIS = pickRandomEmojis(MAX_MEMBERS);

export function Noriuchi() {
  const [lendingRate, setLendingRate] = useLocalStorage("noriuchi-rate", 20);
  const [exchangeRate, setExchangeRate] = useLocalStorage("noriuchi-exchangeRate", 20);
  const [slotSize, setSlotSize] = useLocalStorage<46 | 50>("noriuchi-slotSize", 46);
  const [memberCount, setMemberCount] = useLocalStorage("noriuchi-memberCount", 2);
  const [usedEmojis] = useLocalStorage("noriuchi-emojis", DEFAULT_EMOJIS);
  const [members, setMembers] = useLocalStorage<Member[]>("noriuchi-members", [
    createMember(usedEmojis[0]),
    createMember(usedEmojis[1]),
  ]);
  const [activeTab, setActiveTab] = useState<"playing" | "settlement">("playing");
  const infoModalRef = useRef<HTMLDialogElement>(null);

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

      <div className="tabs tabs-box">
        <input
          type="radio"
          name="noriuchi_tabs"
          className="tab flex-1"
          aria-label="遊技中"
          checked={activeTab === "playing"}
          onChange={() => setActiveTab("playing")}
        />
        <div className="tab-content py-4">
          <div className="card bg-base-100 shadow-sm mb-4 relative">
            <button type="button" className="absolute top-1 right-1 opacity-50" onClick={() => infoModalRef.current?.showModal()} aria-label="計算について">
              <Icon icon="bi:info-circle" className="size-4" />
            </button>
            <div className="card-body p-3 flex-row items-center justify-center gap-6 text-center">
              <div>
                <div className="text-xs opacity-60">総投資</div>
                <div className="font-bold text-red-900">{Math.round(result.totalInvest).toLocaleString()} 円</div>
              </div>
              <div>
                <div className="text-xs opacity-60">出玉</div>
                <div className="font-bold text-blue-900">{members.reduce((s, m) => s + m.collectMedals, 0).toLocaleString()} 枚</div>
              </div>
              <div>
                <div className="text-xs opacity-60">収支</div>
                <div className={`font-bold ${result.totalProfit >= 0 ? "text-blue-500" : "text-red-500"}`}>
                  {result.totalProfit >= 0 ? "+" : ""}{Math.round(result.totalProfit).toLocaleString()} 円
                </div>
              </div>
            </div>
          </div>
          <dialog ref={infoModalRef} className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-2">途中結果について</h3>
              <p className="text-sm opacity-70">
                再プレイ枚数は貸出レートで、出玉は交換レートで円換算しています。貯メダルの入力前のため、全メダルを換金した場合の概算値です。
              </p>
              <div className="modal-action">
                <form method="dialog">
                  <button className="btn btn-sm">閉じる</button>
                </form>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop"><button>close</button></form>
          </dialog>
          <div className={memberCount <= 2 ? "p-1 -m-1" : "overflow-x-auto p-1 -m-1"}>
            <div className={memberCount <= 2 ? "grid grid-cols-2 gap-3" : "flex gap-3 w-min"}>
              {members.map((member, i) => (
                <div key={member.id} className={memberCount <= 2 ? "min-w-0" : "min-w-0 w-max"}>
                  <MemberForm
                    member={member}
                    exchangeRate={exchangeRate}
                    medalSteps={medalSteps}
                    mode="playing"
                    onChange={(updated) => updateMember(i, updated)}
                  />
                </div>
              ))}
            </div>
          </div>
          <button type="button" className="btn btn-sm  w-full mt-2" onClick={() => setActiveTab("settlement")}>
            精算入力へ <Icon icon="fa6-solid:arrow-right" className="size-3" />
          </button>
        </div>

        <input
          type="radio"
          name="noriuchi_tabs"
          className="tab flex-1"
          aria-label="精算"
          checked={activeTab === "settlement"}
          onChange={() => setActiveTab("settlement")}
        />
        <div className="tab-content py-2">
          <SettlementView result={result} lendingRate={lendingRate} exchangeRate={exchangeRate} />
          <div className={memberCount <= 2 ? "mt-4 p-1 -m-1" : "mt-4 overflow-x-auto p-1 -m-1"}>
            <div className={memberCount <= 2 ? "grid grid-cols-2 gap-3" : "flex gap-3 w-min"}>
              {members.map((member, i) => (
                <div key={member.id} className={memberCount <= 2 ? "min-w-0" : "min-w-0 w-max"}>
                  <MemberForm
                    member={member}
                    exchangeRate={exchangeRate}
                    medalSteps={medalSteps}
                    mode="settlement"
                    onChange={(updated) => updateMember(i, updated)}
                  />
                </div>
              ))}
            </div>
          </div>
          <button type="button" className="btn btn-sm w-full mt-2" onClick={() => setActiveTab("playing")}>
            <Icon icon="fa6-solid:arrow-left" className="size-3" /> 入力画面へ
          </button>
        </div>
      </div>

    </div>
  );
}
