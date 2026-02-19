import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { StepInput } from "./StepInput";
import { pickRandomEmoji } from "../types";
import type { Member, MemberResult, Settlement } from "../types";

interface Props {
  member: Member;
  exchangeRate: number;
  medalSteps: number[];
  mode: "playing" | "settlement";
  onChange: (updated: Member) => void;
  otherMembers?: { id: string; name: string; investMedals: number }[];
  onTransfer?: (targetId: string, amount: number) => void;
  memberResult?: MemberResult;
  settlements?: Settlement[];
}

const CASH_STEPS = [1000, 10000];
const fmtCash = (v: number) => v.toLocaleString();

export function MemberForm({ member, exchangeRate, medalSteps, mode, onChange, otherMembers, onTransfer, memberResult, settlements }: Props) {
  const [editing, setEditing] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState(otherMembers?.[0]?.id ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const update = (field: keyof Member, value: string | number) => {
    onChange({ ...member, [field]: value });
  };

  const addTo = (field: keyof Member, amount: number) => {
    update(field, (member[field] as number) + amount);
  };

  const handleReset = () => {
    onChange({ ...member, investMedals: 0, investCash: 0, collectMedals: 0, storedMedals: 0 });
  };

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-3">
        <div className="relative">
          <button
            type="button"
            className="absolute -top-1 -left-1 opacity-30 hover:opacity-100 transition-opacity"
            onClick={handleReset}
            aria-label="リセット"
          >
            <Icon icon="fa6-solid:trash-can" className="size-2.5" />
          </button>
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            className="input input-bordered input-sm w-full font-semibold text-center"
            value={member.name}
            onChange={(e) => update("name", e.target.value)}
            onBlur={() => { if (!member.name.trim()) update("name", pickRandomEmoji()); setEditing(false); }}
            onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
          />
        ) : (
          <div
            className="text-lg text-center cursor-pointer py-1 hover:opacity-70 transition-opacity"
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
                <div className="text-xs font-bold text-red-900 mb-1">再プレイ</div>
                <StepInput
                  icon="material-symbols:replay"
                  iconClass="text-base text-red-900 shrink-0 w-8"
                  value={member.investMedals}
                  unit="枚"
                  steps={medalSteps}
                  onChange={(v) => update("investMedals", v)}
                  onAdd={(v) => addTo("investMedals", v)}
                />
              </div>

              {/* 現金投資 */}
              <div>
                <div className="text-xs font-bold text-red-900 mb-1">現金投資</div>
                <StepInput
                  icon="akar-icons:money"
                  iconClass="text-base text-red-900 shrink-0 w-8"
                  value={member.investCash}
                  unit="円"
                  step={1000}
                  steps={CASH_STEPS}
                  onChange={(v) => update("investCash", v)}
                  onAdd={(v) => addTo("investCash", v)}
                  formatStep={fmtCash}
                />
              </div>

              {/* 出玉 */}
              <div>
                <div className="text-xs font-bold text-blue-900 mb-1">出玉</div>
                <StepInput
                  icon="akar-icons:coin"
                  iconClass="text-base text-blue-900 shrink-0 w-8"
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
                <div className="text-xs font-bold opacity-50 mb-2">メダル</div>
                <div className="flex flex-col gap-0.5 text-sm">
                  <div className="flex justify-between text-red-900">
                    <span className="text-xs font-bold">再プレイ</span>
                    <span>{member.investMedals.toLocaleString()} 枚</span>
                  </div>
                  <div className="flex justify-between text-blue-900">
                    <span className="text-xs font-bold">出玉</span>
                    <span>{member.collectMedals.toLocaleString()} 枚</span>
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
                      <Icon icon={transferOpen ? "fa6-solid:chevron-up" : "fa6-solid:chevron-down"} className="size-2" />
                    </button>
                    {transferOpen && (
                      <div className="mt-2 p-2 rounded-lg bg-base-200 flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                          <Icon icon="fa6-solid:arrow-right" className="size-3 opacity-50 shrink-0" />
                          <select
                            className="select select-bordered select-xs flex-1"
                            value={transferTarget}
                            onChange={(e) => setTransferTarget(e.target.value)}
                          >
                            {otherMembers.map((m) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="btn btn-xs btn-primary flex-1"
                            disabled={!transferTarget}
                            onClick={() => {
                              const target = otherMembers.find((m) => m.id === transferTarget);
                              if (target) {
                                onTransfer(transferTarget, target.investMedals);
                                setTransferOpen(false);
                              }
                            }}
                          >
                            再プレイ分
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-primary flex-1"
                            disabled={!transferTarget || !member.collectMedals}
                            onClick={() => {
                              onTransfer(transferTarget, member.collectMedals);
                              setTransferOpen(false);
                            }}
                          >
                            全て
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 貯メダル */}
                <div className="mt-3">
                  <div className="text-xs font-bold text-pink-600 mb-1">貯メダル</div>
                  <StepInput
                    icon="bi:piggy-bank"
                    iconClass="text-base text-pink-600 shrink-0 w-8"
                    value={member.storedMedals}
                    unit="枚"
                    steps={[]}
                    onChange={(v) => update("storedMedals", v)}
                    onAdd={() => {}}
                    error={member.storedMedals > member.collectMedals}
                  />
                  <div className="flex gap-1 mt-1">
                    <button
                      type="button"
                      className="btn btn-xs flex-1 min-w-0"
                      onClick={() => update("storedMedals", member.investMedals)}
                    >
                      投資枚数分
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs flex-1 min-w-0"
                      onClick={() => update("storedMedals", member.collectMedals)}
                    >
                      全て
                    </button>
                  </div>
                  {member.storedMedals > member.collectMedals && (
                    <div className="text-xs text-right mt-1 text-error">
                      貯メダルが出玉を超えています
                    </div>
                  )}
                </div>
              </div>

              {/* 現金 */}
              <div>
                <div className="text-xs font-bold opacity-50 mb-2">現金</div>
                <div className="text-xs flex flex-col gap-0.5">
                  <div className="flex justify-between text-red-900">
                    <span className="font-bold">現金投資</span>
                    <span>{member.investCash.toLocaleString()} 円</span>
                  </div>
                  <div className="flex justify-between text-blue-900">
                    <span className="font-bold">換金</span>
                    <span>{Math.max(member.collectMedals - member.storedMedals, 0).toLocaleString()} 枚 → {Math.round(Math.max(member.collectMedals - member.storedMedals, 0) * exchangeRate).toLocaleString()} 円</span>
                  </div>
                </div>
                {memberResult && (
                  <div>
                    <div className="divider my-1" />
                    <div className="text-xs font-bold opacity-50 mb-2">結果</div>
                    <div className="flex flex-col gap-0.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-xs font-bold">メダル</span>
                        <span className={`font-bold ${member.storedMedals - member.investMedals >= 0 ? "text-blue-500" : "text-red-500"}`}>
                          {member.storedMedals - member.investMedals >= 0 ? "+" : ""}{(member.storedMedals - member.investMedals).toLocaleString()} 枚
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-bold">現金</span>
                        <span className={`font-bold ${Math.max(member.collectMedals - member.storedMedals, 0) * exchangeRate - member.investCash >= 0 ? "text-blue-500" : "text-red-500"}`}>
                          {Math.max(member.collectMedals - member.storedMedals, 0) * exchangeRate - member.investCash >= 0 ? "+" : ""}{Math.round(Math.max(member.collectMedals - member.storedMedals, 0) * exchangeRate - member.investCash).toLocaleString()} 円
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-base-300 pt-1 mt-1">
                        <span className="text-xs font-bold">合計</span>
                        <span className={`font-bold ${memberResult.profit >= 0 ? "text-blue-500" : "text-red-500"}`}>
                          {memberResult.profit >= 0 ? "+" : ""}{Math.round(memberResult.profit).toLocaleString()} 円
                        </span>
                      </div>
                    </div>
                    {settlements && settlements.length > 0 && (
                      <div className="divider my-1" />
                    )}
                    {settlements && settlements.length > 0 && (
                      <div className="flex flex-col gap-0.5 text-sm">
                        {settlements.map((s, i) => {
                          const isPayer = s.from === memberResult.name;
                          return (
                            <div key={i} className="flex justify-between">
                              <span>{isPayer ? `${s.to} に渡す` : `${s.from} から受取`}</span>
                              <span className="font-bold">{Math.round(s.amount).toLocaleString()} 円</span>
                            </div>
                          );
                        })}
                      </div>
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
