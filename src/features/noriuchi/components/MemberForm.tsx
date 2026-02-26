import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { StepInput } from "../../../components/StepInput";
import { pickRandomEmoji } from "../constants";
import type { CollectCalculationMode, Member, MemberResult, Settlement } from "../../../types";

interface Props {
  member: Member;
  lendingRate: number;
  exchangeRate: number;
  collectCalculationMode: CollectCalculationMode;
  medalSteps: number[];
  playUnit: "枚" | "玉";
  mode: "playing" | "settlement";
  onChange: (updated: Member) => void;
  otherMembers?: {
    id: string;
    name: string;
    investMedals: number;
    collectMedals: number;
  }[];
  onTransfer?: (targetId: string, amount: number) => void;
  memberResult?: MemberResult;
  settlements?: Settlement[];
}
const CASH_STEPS = [1000, 10000];
const fmtCash = (v: number) => v.toLocaleString();

export function MemberForm({
  member,
  lendingRate,
  exchangeRate,
  collectCalculationMode,
  medalSteps,
  playUnit,
  mode,
  onChange,
  otherMembers,
  onTransfer,
  memberResult,
  settlements,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState(otherMembers?.[0]?.id ?? "");
  const [doneSettlements, setDoneSettlements] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const update = (field: keyof Member, value: string | number) => {
    onChange({ ...member, [field]: value });
  };

  const addTo = (field: keyof Member, amount: number) => {
    update(field, Math.max(0, (member[field] as number) + amount));
  };

  const convertedInvest =
    memberResult?.totalInvest ?? member.investCash + member.investMedals * lendingRate;
  const convertedCollect =
    memberResult?.totalCollect ??
    (collectCalculationMode === "lending"
      ? member.collectMedals * lendingRate
      : collectCalculationMode === "exchange"
        ? member.collectMedals * exchangeRate
        : Math.min(member.collectMedals, member.investMedals) * lendingRate +
          Math.max(member.collectMedals - member.investMedals, 0) * exchangeRate);
  const fmtPerThousand = (rate: number) =>
    (Math.round((1000 / rate) * 10) / 10).toLocaleString(undefined, {
      maximumFractionDigits: 1,
    });
  const convertLabel =
    collectCalculationMode === "lending"
      ? `全て貸玉レート(${fmtPerThousand(lendingRate)}${playUnit} = 1000円)`
      : collectCalculationMode === "exchange"
        ? `全て交換レート(${fmtPerThousand(exchangeRate)}${playUnit} = 1000円)`
        : "再プレイ分まで貸玉レート・超過分交換レート";

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-3">
        <div>
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              className="input input-bordered input-sm w-full text-center font-semibold"
              maxLength={5}
              value={member.name}
              onChange={(e) => update("name", e.target.value)}
              onBlur={() => {
                if (!member.name.trim()) update("name", pickRandomEmoji());
                setEditing(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
            />
          ) : (
            <div
              className="cursor-pointer py-1 text-center text-lg transition-opacity hover:opacity-70"
              onClick={() => setEditing(true)}
            >
              {member.name}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {mode === "playing" && (
            <>
              {/* 再プレイ */}
              <div>
                <div className="text-invest mb-1 text-xs font-bold">再プレイ</div>
                <StepInput
                  icon="material-symbols:replay"
                  iconClass="text-base text-invest shrink-0 w-8"
                  value={member.investMedals}
                  unit={playUnit}
                  steps={medalSteps}
                  onChange={(v) => update("investMedals", v)}
                  onAdd={(v) => addTo("investMedals", v)}
                  readOnly
                />
              </div>

              {/* 現金投資 */}
              <div>
                <div className="text-invest mb-1 text-xs font-bold">現金投資</div>
                <StepInput
                  icon="akar-icons:money"
                  iconClass="text-base text-invest shrink-0 w-8"
                  value={member.investCash}
                  unit="円"
                  steps={CASH_STEPS}
                  onChange={(v) => update("investCash", v)}
                  onAdd={(v) => addTo("investCash", v)}
                  formatStep={fmtCash}
                  readOnly
                />
              </div>

              {/* 出玉 */}
              <div>
                <div className="text-collect mb-1 text-xs font-bold">出玉</div>
                <StepInput
                  icon="akar-icons:coin"
                  iconClass="text-base text-collect shrink-0 w-8"
                  value={member.collectMedals}
                  unit={playUnit}
                  steps={[]}
                  onChange={(v) => update("collectMedals", v)}
                  onAdd={() => {}}
                />
              </div>
            </>
          )}

          {mode === "settlement" && (
            <>
              {/* メダル */}
              <div>
                <div className="mb-2 text-xs font-bold opacity-50">メダル結果</div>
                <div className="flex flex-col gap-0.5 text-sm">
                  <div className="text-invest flex justify-between">
                    <span className="text-xs font-bold">再プレイ</span>
                    <span>
                      {member.investMedals.toLocaleString()} {playUnit}
                    </span>
                  </div>
                  <div className="text-collect">
                    <div className="mb-1 text-xs font-bold">出玉</div>
                    <StepInput
                      icon="akar-icons:coin"
                      iconClass="text-base text-collect shrink-0 w-8"
                      value={member.collectMedals}
                      unit={playUnit}
                      steps={[]}
                      onChange={(v) => update("collectMedals", v)}
                      onAdd={() => {}}
                    />
                  </div>
                </div>

                {/* 出玉移動 */}
                {otherMembers && otherMembers.length > 0 && onTransfer && (
                  <div className="mt-2">
                    <button
                      type="button"
                      className="btn btn-xs w-full"
                      onClick={() => setTransferOpen((v) => !v)}
                    >
                      <Icon icon="fa6-solid:right-left" className="size-3" />
                      出玉移動
                      <Icon
                        icon={transferOpen ? "fa6-solid:chevron-up" : "fa6-solid:chevron-down"}
                        className="size-2"
                      />
                    </button>
                    {transferOpen && (
                      <div className="bg-base-200 mt-2 flex items-center gap-1 rounded-lg p-2">
                        <select
                          className="select select-bordered select-xs min-w-0 flex-1"
                          value={transferTarget}
                          onChange={(e) => setTransferTarget(e.target.value)}
                        >
                          {otherMembers.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                        <span className="shrink-0 text-xs leading-6 opacity-60">へ</span>
                        <div className="flex shrink-0 flex-col gap-1">
                          <button
                            type="button"
                            className="btn btn-xs btn-primary h-auto w-full py-1"
                            disabled={
                              !transferTarget ||
                              (() => {
                                const t = otherMembers.find((m) => m.id === transferTarget);
                                if (!t) return true;
                                const amount = Math.max(t.investMedals - t.collectMedals, 0);
                                return amount === 0 || member.collectMedals < amount;
                              })()
                            }
                            onClick={() => {
                              const target = otherMembers.find((m) => m.id === transferTarget);
                              if (target) {
                                const amount = Math.max(
                                  target.investMedals - target.collectMedals,
                                  0,
                                );
                                onTransfer(transferTarget, amount);
                                setTransferOpen(false);
                              }
                            }}
                          >
                            再プレイ補填
                            <br />（
                            {(() => {
                              const t = otherMembers.find((m) => m.id === transferTarget);
                              return Math.max(
                                (t?.investMedals ?? 0) - (t?.collectMedals ?? 0),
                                0,
                              ).toLocaleString();
                            })()}
                            {playUnit}）
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-primary h-auto w-full py-1"
                            disabled={!transferTarget || !member.collectMedals}
                            onClick={() => {
                              onTransfer(transferTarget, member.collectMedals);
                              setTransferOpen(false);
                            }}
                          >
                            出玉全て
                            <br />（{member.collectMedals.toLocaleString()}
                            {playUnit}）
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* メダル収支 */}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold">メダル収支</span>
                  <span
                    className={`font-bold ${member.collectMedals - member.investMedals >= 0 ? "text-plus" : "text-minus"}`}
                  >
                    {member.collectMedals - member.investMedals >= 0 ? "+" : ""}
                    {(member.collectMedals - member.investMedals).toLocaleString()} {playUnit}
                  </span>
                </div>
              </div>

              {/* 現金 */}
              <div>
                <div className="mb-2 text-xs font-bold opacity-50">現金結果</div>
                <div className="flex flex-col gap-0.5 text-xs">
                  <div className="text-invest flex justify-between">
                    <span className="font-bold">現金投資</span>
                    <span>{member.investCash.toLocaleString()} 円</span>
                  </div>
                  <div className="text-invest flex justify-between">
                    <span className="font-bold">再プレイ換算</span>
                    <span>
                      {member.investMedals.toLocaleString()} {playUnit}{" "}
                      <Icon icon="fa6-solid:arrow-right" className="mb-0.5 inline size-2" />{" "}
                      {Math.round(member.investMedals * lendingRate).toLocaleString()} 円
                    </span>
                  </div>
                  <div className="text-collect flex justify-between">
                    <span className="font-bold">出玉換算</span>
                    <span className="flex items-center gap-1">
                      {member.collectMedals.toLocaleString()} {playUnit}{" "}
                      <Icon icon="fa6-solid:arrow-right" className="size-2" />{" "}
                      {Math.round(convertedCollect).toLocaleString()} 円
                    </span>
                  </div>
                  <div className="text-right text-[10px] opacity-60">{convertLabel}</div>
                </div>

                {/* 現金収支 */}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold">換算収支</span>
                  <span
                    className={`font-bold ${convertedCollect - convertedInvest >= 0 ? "text-plus" : "text-minus"}`}
                  >
                    {convertedCollect - convertedInvest >= 0 ? "+" : ""}
                    {Math.round(convertedCollect - convertedInvest).toLocaleString()} 円
                  </span>
                </div>

                {memberResult && (
                  <div>
                    <div className="border-base-300 mt-2 flex items-center justify-between border-t pt-2">
                      <span className="text-sm font-bold">合計</span>
                      <span
                        className={`text-base font-bold ${memberResult.profit >= 0 ? "text-plus" : "text-minus"}`}
                      >
                        {memberResult.profit >= 0 ? "+" : ""}
                        {Math.round(memberResult.profit).toLocaleString()} 円
                      </span>
                    </div>
                    <div className="divider my-1" />
                    <div className="mb-2 text-xs font-bold opacity-50">精算</div>
                    {settlements && settlements.length > 0 ? (
                      <div className="flex flex-col gap-0.5 text-sm">
                        {settlements.map((s, i) => {
                          const isPayer = s.from === memberResult.name;
                          const done = doneSettlements.has(i);
                          return (
                            <div
                              key={i}
                              className={`cursor-pointer transition-opacity select-none ${done ? "line-through opacity-40" : ""}`}
                              onClick={() =>
                                setDoneSettlements((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(i)) next.delete(i);
                                  else next.add(i);
                                  return next;
                                })
                              }
                            >
                              {isPayer ? (
                                <>
                                  <span className="font-bold">{s.to}</span> に{" "}
                                  <span className="font-bold">
                                    {Math.round(s.amount).toLocaleString()} 円
                                  </span>{" "}
                                  渡す
                                </>
                              ) : (
                                <>
                                  <span className="font-bold">{s.from}</span> から{" "}
                                  <span className="font-bold">
                                    {Math.round(s.amount).toLocaleString()} 円
                                  </span>{" "}
                                  受取
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm opacity-50">精算なし</div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
