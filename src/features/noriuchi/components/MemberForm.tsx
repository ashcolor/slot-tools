import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { StepInput } from "../../../components/StepInput";
import { pickRandomEmoji } from "../constants";
import type { Member, MemberResult, Settlement } from "../../../types";

interface Props {
  member: Member;
  exchangeRate: number;
  medalSteps: number[];
  mode: "playing" | "settlement";
  onChange: (updated: Member) => void;
  otherMembers?: {
    id: string;
    name: string;
    investMedals: number;
    storedMedals: number;
    collectMedals: number;
  }[];
  onTransfer?: (targetId: string, amount: number, setStoredMedals: boolean) => void;
  memberResult?: MemberResult;
  settlements?: Settlement[];
}
const CASH_STEPS = [1000, 10000];
const fmtCash = (v: number) => v.toLocaleString();

export function MemberForm({
  member,
  exchangeRate,
  medalSteps,
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
                  unit="枚"
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
                  unit="枚"
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
                    <span>{member.investMedals.toLocaleString()} 枚</span>
                  </div>
                  <div className="text-collect">
                    <div className="mb-1 text-xs font-bold">出玉</div>
                    <StepInput
                      icon="akar-icons:coin"
                      iconClass="text-base text-collect shrink-0 w-8"
                      value={member.collectMedals}
                      unit="枚"
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
                                onTransfer(transferTarget, amount, true);
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
                            枚）
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-primary h-auto w-full py-1"
                            disabled={!transferTarget || !member.collectMedals}
                            onClick={() => {
                              onTransfer(transferTarget, member.collectMedals, false);
                              setTransferOpen(false);
                            }}
                          >
                            出玉全て
                            <br />（{member.collectMedals.toLocaleString()}枚）
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 貯メダル */}
                <div className="mt-3">
                  <div className="text-store mb-1 text-xs font-bold">貯メダル</div>
                  <StepInput
                    icon="bi:piggy-bank"
                    iconClass="text-base text-store shrink-0 w-8"
                    value={member.storedMedals}
                    unit="枚"
                    steps={[]}
                    onChange={(v) => update("storedMedals", v)}
                    onAdd={() => {}}
                    error={member.storedMedals > member.collectMedals}
                  />
                  <div className="mt-1 flex gap-1">
                    <button
                      type="button"
                      className="btn btn-xs h-auto min-w-0 flex-1 py-1"
                      onClick={() => update("storedMedals", member.investMedals)}
                    >
                      再プレイ補填
                      <br />（{member.investMedals.toLocaleString()}枚）
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs h-auto min-w-0 flex-1 py-1"
                      onClick={() => update("storedMedals", member.collectMedals)}
                    >
                      全て
                      <br />（{member.collectMedals.toLocaleString()}枚）
                    </button>
                  </div>
                  {member.storedMedals > member.collectMedals && (
                    <div className="text-error mt-1 text-right text-xs">
                      貯メダルが出玉を超えています
                    </div>
                  )}
                </div>

                {/* メダル収支 */}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold">メダル収支</span>
                  <span
                    className={`font-bold ${member.storedMedals - member.investMedals >= 0 ? "text-plus" : "text-minus"}`}
                  >
                    {member.storedMedals - member.investMedals >= 0 ? "+" : ""}
                    {(member.storedMedals - member.investMedals).toLocaleString()} 枚
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
                  <div className="text-collect flex justify-between">
                    <span className="font-bold">換金</span>
                    <span className="flex items-center gap-1">
                      {Math.max(member.collectMedals - member.storedMedals, 0).toLocaleString()} 枚{" "}
                      <Icon icon="fa6-solid:arrow-right" className="size-2" />{" "}
                      {Math.round(
                        Math.max(member.collectMedals - member.storedMedals, 0) * exchangeRate,
                      ).toLocaleString()}{" "}
                      円
                    </span>
                  </div>
                </div>

                {/* 現金収支 */}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold">現金収支</span>
                  <span
                    className={`font-bold ${Math.max(member.collectMedals - member.storedMedals, 0) * exchangeRate - member.investCash >= 0 ? "text-plus" : "text-minus"}`}
                  >
                    {Math.max(member.collectMedals - member.storedMedals, 0) * exchangeRate -
                      member.investCash >=
                    0
                      ? "+"
                      : ""}
                    {Math.round(
                      Math.max(member.collectMedals - member.storedMedals, 0) * exchangeRate -
                        member.investCash,
                    ).toLocaleString()}{" "}
                    円
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
