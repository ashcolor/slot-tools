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
  onChange: (updated: Member) => void;
  memberResult?: MemberResult;
  settlements?: Settlement[];
}
const CASH_STEPS = [1000, 10000];
const CASH_STEP_COLORS: Partial<Record<number, string>> = {
  1000: "#4D5B6D",
  10000: "#6D5A4D",
};
const fmtCash = (v: number) => {
  if (v === 1000) return "1千";
  if (v === 10000) return "1万";
  return v.toLocaleString();
};

export function MemberForm({
  member,
  lendingRate,
  exchangeRate,
  collectCalculationMode,
  medalSteps,
  playUnit,
  onChange,
  memberResult,
  settlements,
}: Props) {
  const [editing, setEditing] = useState(false);
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
              stepColors={CASH_STEP_COLORS}
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

          <div>
            <div className="mb-2 flex justify-center opacity-40">
              <Icon icon="fa6-solid:angle-down" className="size-3" />
            </div>
            {/* 投資 */}
            <div>
              <div className="text-invest mb-2 flex items-center justify-between text-sm font-bold">
                <span>投資</span>
                <span>{Math.round(convertedInvest).toLocaleString()} 円</span>
              </div>
              <div className="flex flex-col gap-0.5 text-xs">
                <div className="flex justify-between">
                  <span>再プレイ</span>
                  <span>
                    {member.investMedals.toLocaleString()} {playUnit}{" "}
                    <Icon icon="fa6-solid:arrow-right" className="mb-0.5 inline size-2" />{" "}
                    {Math.round(member.investMedals * lendingRate).toLocaleString()} 円
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>現金投資</span>
                  <span>{member.investCash.toLocaleString()} 円</span>
                </div>
              </div>
            </div>

            {/* 回収 */}
            <div className="mt-4">
              <div className="text-collect mb-2 flex items-center justify-between text-sm font-bold">
                <span>回収</span>
                <span className="flex items-center gap-1">
                  <span className="text-base-content flex items-center gap-1 text-xs font-normal">
                    {member.collectMedals.toLocaleString()} {playUnit}
                    <Icon icon="fa6-solid:arrow-right" className="size-2" />
                  </span>
                  <span>{Math.round(convertedCollect).toLocaleString()} 円</span>
                </span>
              </div>
              <div className="flex flex-col gap-0.5 text-sm">
                <div className="text-right text-[10px] opacity-60">{convertLabel}</div>
              </div>
            </div>

            {memberResult && (
              <div>
                <div className="border-base-300 mt-2 flex items-center justify-between border-t pt-2">
                  <span className="font-bold">収支</span>
                  <span
                    className={`text-base font-bold ${memberResult.profit >= 0 ? "text-plus" : "text-minus"}`}
                  >
                    {memberResult.profit >= 0 ? "+" : ""}
                    {Math.round(memberResult.profit).toLocaleString()} 円
                  </span>
                </div>
                <div className="my-1 flex justify-center opacity-40">
                  <Icon icon="fa6-solid:angle-down" className="size-3" />
                </div>
                {settlements && settlements.length > 0 ? (
                  <div className="flex flex-col gap-0.5 text-base">
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
                              <span className="text-invest font-bold">
                                {Math.round(s.amount).toLocaleString()} 円
                              </span>{" "}
                              渡す
                            </>
                          ) : (
                            <span className="opacity-60">
                              <span className="font-bold">{s.from}</span> から{" "}
                              <span className="font-bold">
                                {Math.round(s.amount).toLocaleString()} 円
                              </span>{" "}
                              受取
                              <span />
                            </span>
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
        </div>
      </div>
    </div>
  );
}
