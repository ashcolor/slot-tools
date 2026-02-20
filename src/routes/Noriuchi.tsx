import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { RateSelector } from "../components/RateSelector";
import { MemberForm } from "../components/MemberForm";
import { SettlementView } from "../components/Settlement";
import { calculate } from "../utils/calculate";
import { useLocalStorage } from "../utils/useLocalStorage";
import { ANIMAL_EMOJIS, PACHINKO_LENDING_OPTIONS, PACHISLOT_LENDING_OPTIONS, getExchangeOptions, pickRandomEmoji } from "../types";
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
  const [slotSize, setSlotSize] = useLocalStorage<46 | 50 | 125>("noriuchi-slotSize", 46);
  const [memberCount, setMemberCount] = useLocalStorage("noriuchi-memberCount", 2);
  const [usedEmojis] = useLocalStorage("noriuchi-emojis", DEFAULT_EMOJIS);
  const [members, setMembers] = useLocalStorage<Member[]>("noriuchi-members", [
    createMember(usedEmojis[0]),
    createMember(usedEmojis[1]),
  ]);
  const [activeTab, setActiveTab] = useState<"playing" | "settlement">("playing");
  const configModalRef = useRef<HTMLDialogElement>(null);
  const resetModalRef = useRef<HTMLDialogElement>(null);

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

  const handleTransfer = (fromIndex: number, targetId: string, amount: number) => {
    setMembers((prev) => prev.map((m, i) => {
      if (i === fromIndex) return { ...m, collectMedals: m.collectMedals - amount };
      if (m.id === targetId) return { ...m, collectMedals: m.collectMedals + amount, storedMedals: amount };
      return m;
    }));
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 text-sm opacity-70">
          <span className="font-bold">{lendingRate === 4 ? "パチンコ" : "スロット"}</span>
          <span>貸出</span>
          <span className="font-bold">{(lendingRate === 4 ? PACHINKO_LENDING_OPTIONS : PACHISLOT_LENDING_OPTIONS).find((o) => o.value === lendingRate)?.label ?? `${lendingRate}円`}</span>
          <Icon icon="fa6-solid:arrow-right" className="size-3" />
          <span>交換</span>
          <span className="font-bold">{exchangeOptions.find((o) => o.value === exchangeRate)?.label ?? `${exchangeRate}円`}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square"
            onClick={() => configModalRef.current?.showModal()}
            aria-label="設定"
          >
            <Icon icon="fa6-solid:gear" className="size-4" />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square"
            onClick={() => resetModalRef.current?.showModal()}
            aria-label="リセット"
          >
            <Icon icon="fa6-regular:trash-can" className="size-4" />
          </button>
        </div>
      </div>

      <dialog ref={configModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">設定</h3>
          <div className="flex flex-col gap-4">
            <div className="tabs tabs-box w-fit mx-auto">
              <input
                type="radio"
                name="game_type"
                className="tab"
                aria-label="スロット"
                checked={lendingRate !== 4}
                onChange={() => { handleLendingRateChange(20); setSlotSize(46); }}
              />
              <input
                type="radio"
                name="game_type"
                className="tab"
                aria-label="パチンコ"
                checked={lendingRate === 4}
                onChange={() => { handleLendingRateChange(4); setSlotSize(125); }}
              />
            </div>
            <div>
              <div className="text-xs font-bold opacity-50 mb-2">レート</div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold">貸出</label>
                  <RateSelector rate={lendingRate} options={lendingRate === 4 ? PACHINKO_LENDING_OPTIONS : PACHISLOT_LENDING_OPTIONS} onChange={handleLendingRateChange} />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold">交換</label>
                  <RateSelector rate={exchangeRate} options={exchangeOptions} onChange={setExchangeRate} />
                </div>
              </div>
            </div>
            <div className="divider my-0" />
            <div>
              <div className="text-xs font-bold opacity-50 mb-2">入力設定</div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold">再プレイ単位</label>
                  {lendingRate === 4 ? (
                    <select
                      className="select select-bordered select-sm w-auto"
                      value={slotSize}
                      onChange={(e) => setSlotSize(Number(e.target.value) as 125)}
                    >
                      <option value={125}>125玉</option>
                    </select>
                  ) : (
                    <select
                      className="select select-bordered select-sm w-auto"
                      value={slotSize}
                      onChange={(e) => setSlotSize(Number(e.target.value) as 46 | 50)}
                    >
                      <option value={46}>46枚</option>
                      <option value={50}>50枚</option>
                    </select>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold">メンバー数</label>
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
              </div>
            </div>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-sm">閉じる</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

      <dialog ref={resetModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-2">リセット</h3>
          <p className="text-sm opacity-70">全メンバーの入力内容をリセットしますか？</p>
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button className="btn btn-sm">キャンセル</button>
              <button
                className="btn btn-sm btn-error"
                onClick={() => setMembers((prev) => prev.map((m) => ({ ...m, investMedals: 0, investCash: 0, collectMedals: 0, storedMedals: 0 })))}
              >
                リセット
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

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
            精算 <Icon icon="fa6-solid:arrow-right" className="size-3" />
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
          <SettlementView result={result} exchangeRate={exchangeRate} />
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
                    otherMembers={members.filter((_, j) => j !== i).map((m) => ({ id: m.id, name: m.name, investMedals: m.investMedals }))}
                    onTransfer={(targetId, amount) => handleTransfer(i, targetId, amount)}
                    memberResult={result.members[i]}
                    settlements={result.settlements.filter((s) => s.from === filledMembers[i].name || s.to === filledMembers[i].name)}
                  />
                </div>
              ))}
            </div>
          </div>
          <button type="button" className="btn btn-sm w-full mt-2" onClick={() => setActiveTab("playing")}>
            <Icon icon="fa6-solid:arrow-left" className="size-3" /> 戻る
          </button>
        </div>
      </div>

    </div>
  );
}
