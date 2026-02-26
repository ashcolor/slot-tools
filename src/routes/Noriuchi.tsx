import { useEffect, useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import { MemberForm } from "../features/noriuchi/components/MemberForm";
import { NoriuchiConfigDialog } from "../features/noriuchi/components/NoriuchiConfigDialog";
import { NoriuchiResetDialog } from "../features/noriuchi/components/NoriuchiResetDialog";
import { SettlementView } from "../features/noriuchi/components/Settlement";
import {
  MAX_MEMBERS,
  PACHINKO_LENDING_OPTIONS,
  PACHISLOT_LENDING_OPTIONS,
  getExchangeOptions,
  isPachinkoRate,
  pickRandomEmoji,
  pickRandomEmojis,
} from "../features/noriuchi/constants";
import { calculate } from "../utils/calculate";
import { useLocalStorage } from "../utils/useLocalStorage";
import type { Member } from "../types";

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
  const [activeTab, setActiveTab] = useLocalStorage<"playing" | "settlement">(
    "noriuchi-activeTab",
    "playing",
  );
  const configModalRef = useRef<HTMLDialogElement>(null);
  const resetModalRef = useRef<HTMLDialogElement>(null);

  // localStorage から読み込んだメンバーの空名前を補完
  useEffect(() => {
    if (members.some((m) => !m.name.trim())) {
      setMembers((prev) =>
        prev.map((m) => (m.name.trim() ? m : { ...m, name: pickRandomEmoji() })),
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const exchangeOptions = useMemo(() => getExchangeOptions(lendingRate), [lendingRate]);

  const handleLendingRateChange = (newRate: number) => {
    setLendingRate(newRate);
    // 等価にリセット
    setExchangeRate(newRate);
  };

  const updateMember = (index: number, updated: Member) => {
    setMembers((prev) => prev.map((m, i) => (i === index ? updated : m)));
  };

  const handleTransfer = (
    fromIndex: number,
    targetId: string,
    amount: number,
    setStoredMedals: boolean,
  ) => {
    setMembers((prev) =>
      prev.map((m, i) => {
        if (i === fromIndex)
          return {
            ...m,
            collectMedals: m.collectMedals - amount,
            storedMedals: setStoredMedals ? m.storedMedals : 0,
          };
        if (m.id === targetId)
          return {
            ...m,
            collectMedals: m.collectMedals + amount,
            ...(setStoredMedals ? { storedMedals: amount } : {}),
          };
        return m;
      }),
    );
  };

  const handleCountChange = (newCount: number) => {
    setMemberCount(newCount);
    setMembers((prev) => {
      if (newCount > prev.length) {
        const added = Array.from({ length: newCount - prev.length }, (_, i) =>
          createMember(usedEmojis[prev.length + i] || `メンバー${prev.length + i + 1}`),
        );
        return [...prev, ...added];
      }
      return prev.slice(0, newCount);
    });
  };

  const filledMembers = useMemo(
    () => members.map((m) => ({ ...m, name: m.name.trim() || pickRandomEmoji() })),
    [members],
  );

  const medalSteps = useMemo(() => [slotSize, slotSize * 10], [slotSize]);
  const isPachinko = isPachinkoRate(lendingRate);
  const playUnit = isPachinko ? "玉" : "枚";

  const result = useMemo(
    () => calculate(filledMembers, lendingRate, exchangeRate),
    [filledMembers, lendingRate, exchangeRate],
  );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm opacity-70">
          <span className="badge badge-neutral badge-sm">
            {isPachinko ? "パチンコ" : "スロット"}
          </span>
          <span>
            <span>貸出：</span>
            <span className="font-bold">
              {(isPachinko ? PACHINKO_LENDING_OPTIONS : PACHISLOT_LENDING_OPTIONS).find(
                (o) => o.value === lendingRate,
              )?.label ?? `${lendingRate}円`}
            </span>
          </span>
          <Icon icon="fa6-solid:arrow-right" className="size-3" />
          <span>
            <span>交換：</span>
            <span className="font-bold">
              {exchangeOptions.find((o) => o.value === exchangeRate)?.label ?? `${exchangeRate}円`}
            </span>
          </span>
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

      <NoriuchiConfigDialog
        dialogRef={configModalRef}
        lendingRate={lendingRate}
        exchangeRate={exchangeRate}
        slotSize={slotSize}
        memberCount={memberCount}
        exchangeOptions={exchangeOptions}
        onSwitchToSlot={() => {
          handleLendingRateChange(20);
          setSlotSize(46);
        }}
        onSwitchToPachinko={() => {
          handleLendingRateChange(4);
          setSlotSize(125);
        }}
        onChangeLendingRate={handleLendingRateChange}
        onChangeExchangeRate={setExchangeRate}
        onChangeSlotSize={(newSlotSize) => setSlotSize(newSlotSize)}
        onChangeMemberCount={handleCountChange}
      />

      <NoriuchiResetDialog
        dialogRef={resetModalRef}
        onConfirmReset={() => {
          setMembers((prev) =>
            prev.map((member) => ({
              ...member,
              investMedals: 0,
              investCash: 0,
              collectMedals: 0,
              storedMedals: 0,
            })),
          );
          setActiveTab("playing");
        }}
      />

      <div className="tabs tabs-box tabs-xs">
        <input
          type="radio"
          name="noriuchi_tabs"
          className="tab flex-1"
          aria-label="遊技中"
          checked={activeTab === "playing"}
          onChange={() => setActiveTab("playing")}
        />
        <div className="tab-content">
          <div className="flex flex-col gap-2">
            <div className={memberCount <= 2 ? "-m-1 p-1" : "-m-1 overflow-x-auto p-1"}>
              <div className={memberCount <= 2 ? "grid grid-cols-2 gap-1" : "flex w-min gap-3"}>
                {members.map((member, i) => (
                  <div key={member.id} className={memberCount <= 2 ? "min-w-0" : "w-max min-w-0"}>
                    <MemberForm
                      member={member}
                      exchangeRate={exchangeRate}
                      medalSteps={medalSteps}
                      playUnit={playUnit}
                      mode="playing"
                      onChange={(updated) => updateMember(i, updated)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-soft self-end"
              onClick={() => setActiveTab("settlement")}
            >
              精算 <Icon icon="fa6-solid:arrow-right" className="size-3" />
            </button>
          </div>
        </div>

        <input
          type="radio"
          name="noriuchi_tabs"
          className="tab flex-1"
          aria-label="精算"
          checked={activeTab === "settlement"}
          onChange={() => setActiveTab("settlement")}
        />
        <div className="tab-content">
          <div className="flex flex-col gap-2">
            <SettlementView result={result} playUnit={playUnit} />
            <div className={memberCount <= 2 ? "-m-1 p-1" : "-m-1 overflow-x-auto p-1"}>
              <div className={memberCount <= 2 ? "grid grid-cols-2 gap-1" : "flex w-min gap-3"}>
                {members.map((member, i) => (
                  <div key={member.id} className={memberCount <= 2 ? "min-w-0" : "w-max min-w-0"}>
                    <MemberForm
                      member={member}
                      exchangeRate={exchangeRate}
                      medalSteps={medalSteps}
                      playUnit={playUnit}
                      mode="settlement"
                      onChange={(updated) => updateMember(i, updated)}
                      otherMembers={members
                        .filter((_, j) => j !== i)
                        .map((m) => ({
                          id: m.id,
                          name: m.name,
                          investMedals: m.investMedals,
                          storedMedals: m.storedMedals,
                          collectMedals: m.collectMedals,
                        }))}
                      onTransfer={(targetId, amount, setStoredMedals) =>
                        handleTransfer(i, targetId, amount, setStoredMedals)
                      }
                      memberResult={result.members[i]}
                      settlements={result.settlements.filter(
                        (s) => s.from === filledMembers[i].name || s.to === filledMembers[i].name,
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-soft self-start"
              onClick={() => setActiveTab("playing")}
            >
              <Icon icon="fa6-solid:arrow-left" className="size-3" /> 戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
