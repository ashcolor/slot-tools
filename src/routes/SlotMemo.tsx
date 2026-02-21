import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Icon } from "@iconify/react";
import { Parser } from "expr-eval-fork";
import type { TemplateCategory } from "../constants/slotMemo/template";
import { TemplateKeyboard } from "../features/slotMemo/TemplateKeyboard";
import { useLocalStorage } from "../utils/useLocalStorage";

interface SlotMemoDraft {
  memo: string;
  fontSizeLevel: number;
}

const FORMULA_TOKEN = "[[f:1+1]]";
const COUNTER_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const COUNTER_DIGIT_STEPS = [1000, 100, 10, 1] as const;
const MAX_COUNTER_VALUE = 9999;
const DEFAULT_FONT_SIZE_LEVEL = 3 as const;
const FONT_SIZE_OPTIONS = [
  { level: 1, label: "S", className: "text-sm" },
  { level: 2, label: "M", className: "text-base" },
  { level: 3, label: "L", className: "text-lg" },
  { level: 4, label: "XL", className: "text-xl" },
  { level: 5, label: "2XL", className: "text-2xl" },
] as const;

type MemoPart =
  | { type: "text"; value: string }
  | { type: "counter"; value: number; index: number; name: string | null; legacy: boolean }
  | { type: "formula"; expression: string; index: number };

interface CounterPopupState {
  targetIndex: number;
  anchorX: number;
  anchorY: number;
  value: number;
}

function clampCounterValue(value: number): number {
  return Math.min(MAX_COUNTER_VALUE, Math.max(0, Math.floor(value)));
}

function toCounterDigits(value: number): string[] {
  return clampCounterValue(value).toString().padStart(4, "0").split("");
}

function normalizeFontSizeLevel(level: number): (typeof FONT_SIZE_OPTIONS)[number]["level"] {
  if (!Number.isFinite(level)) return DEFAULT_FONT_SIZE_LEVEL;
  return Math.min(5, Math.max(1, Math.round(level))) as (typeof FONT_SIZE_OPTIONS)[number]["level"];
}

function getInlineControlSize(level: (typeof FONT_SIZE_OPTIONS)[number]["level"]): {
  buttonClass: string;
  formulaClass: string;
  valueWidthClass: string;
  iconClass: string;
  lineHeightClass: string;
} {
  if (level <= 1) {
    return {
      buttonClass: "btn-xs",
      formulaClass: "btn-xs",
      valueWidthClass: "min-w-8",
      iconClass: "size-3",
      lineHeightClass: "leading-8",
    };
  }
  if (level === 2) {
    return {
      buttonClass: "btn-sm",
      formulaClass: "btn-xs",
      valueWidthClass: "min-w-9",
      iconClass: "size-4",
      lineHeightClass: "leading-8",
    };
  }
  if (level === 3) {
    return {
      buttonClass: "btn-sm",
      formulaClass: "btn-sm",
      valueWidthClass: "min-w-10",
      iconClass: "size-4",
      lineHeightClass: "leading-9",
    };
  }
  if (level === 4) {
    return {
      buttonClass: "btn-md",
      formulaClass: "btn-md",
      valueWidthClass: "min-w-12",
      iconClass: "size-5",
      lineHeightClass: "leading-10",
    };
  }
  return {
    buttonClass: "btn-lg",
    formulaClass: "btn-lg",
    valueWidthClass: "min-w-14",
    iconClass: "size-5",
    lineHeightClass: "leading-[2.8rem]",
  };
}

function createDraft(): SlotMemoDraft {
  return {
    fontSizeLevel: DEFAULT_FONT_SIZE_LEVEL,
    memo: `通常ゲーム数：[[c:normal=25]]
AT回数：[[c:at=57]]
初当たり：[[f:normal / at]]`,
  };
}

function parseMemoParts(memo: string): MemoPart[] {
  const parts: MemoPart[] = [];
  const matcher = /\[\[c:([^\]]+)\]\]|\[\[f:([^\]]+)\]\]/g;
  let lastIndex = 0;
  let counterIndex = 0;
  let formulaIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = matcher.exec(memo)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: memo.slice(lastIndex, match.index) });
    }
    if (match[1]) {
      const parsed = parseCounterBody(match[1]);
      parts.push({
        type: "counter",
        value: parsed.value,
        name: parsed.name,
        legacy: parsed.legacy,
        index: counterIndex,
      });
      counterIndex += 1;
    } else {
      parts.push({ type: "formula", expression: match[2], index: formulaIndex });
      formulaIndex += 1;
    }
    lastIndex = matcher.lastIndex;
  }

  if (lastIndex < memo.length) {
    parts.push({ type: "text", value: memo.slice(lastIndex) });
  }

  return parts;
}

function parseCounterBody(rawBody: string): { name: string | null; value: number; legacy: boolean } {
  const body = rawBody.trim();

  if (/^\d+$/.test(body)) {
    return { name: null, value: Number(body), legacy: true };
  }

  const equalIndex = body.indexOf("=");
  if (equalIndex > 0) {
    const maybeName = body.slice(0, equalIndex).trim();
    const maybeValue = body.slice(equalIndex + 1).trim();
    const name = COUNTER_NAME_PATTERN.test(maybeName) ? maybeName : null;
    const value = /^\d+$/.test(maybeValue) ? Number(maybeValue) : 0;
    return { name, value, legacy: false };
  }

  if (COUNTER_NAME_PATTERN.test(body)) {
    return { name: body, value: 0, legacy: false };
  }

  return { name: null, value: 0, legacy: false };
}

function evaluateFormula(expression: string, variables: Record<string, number>): string {
  try {
    const raw = Parser.evaluate(expression, variables);
    const numberValue = Number(raw);
    if (!Number.isFinite(numberValue)) return "ERR";
    if (Number.isInteger(numberValue)) return String(numberValue);
    return numberValue.toFixed(3).replace(/\.?0+$/, "");
  } catch {
    return "ERR";
  }
}

export function SlotMemo() {
  const [draft, setDraft] = useLocalStorage<SlotMemoDraft>("slot-memo-draft", createDraft());
  const [isMemoFocused, setIsMemoFocused] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [counterPopup, setCounterPopup] = useState<CounterPopupState | null>(null);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<TemplateCategory["key"] | null>(null);
  const configModalRef = useRef<HTMLDialogElement>(null);
  const clearModalRef = useRef<HTMLDialogElement>(null);
  const memoRef = useRef<HTMLTextAreaElement>(null);
  const memoParts = useMemo(() => parseMemoParts(draft.memo), [draft.memo]);
  const formulaResults = useMemo(() => {
    const variables: Record<string, number> = {};
    memoParts.forEach((part) => {
      if (part.type === "counter") {
        variables[`c${part.index}`] = part.value;
        if (part.name) variables[part.name] = part.value;
      }
    });

    const results = new Map<number, string>();
    memoParts.forEach((part) => {
      if (part.type === "formula") {
        results.set(part.index, evaluateFormula(part.expression, variables));
      }
    });
    return results;
  }, [memoParts]);
  const memoFontSizeLevel = normalizeFontSizeLevel(draft.fontSizeLevel);
  const memoFontSizeClass =
    FONT_SIZE_OPTIONS.find((option) => option.level === memoFontSizeLevel)?.className ?? "text-lg";
  const inlineControlSize = getInlineControlSize(memoFontSizeLevel);
  const clearDraft = () => {
    setDraft((prev) => ({
      ...createDraft(),
      fontSizeLevel: normalizeFontSizeLevel(prev.fontSizeLevel),
    }));
    setCounterPopup(null);
    setSelectedCategoryKey(null);
    setIsMemoFocused(false);
  };

  useEffect(() => {
    const normalized = normalizeFontSizeLevel(draft.fontSizeLevel);
    if (draft.fontSizeLevel !== normalized) {
      setDraft((prev) => ({ ...prev, fontSizeLevel: normalized }));
    }
  }, [draft.fontSizeLevel, setDraft]);

  useEffect(() => {
    if (!isMemoFocused || typeof window === "undefined" || !window.visualViewport) return;

    const viewport = window.visualViewport;
    const updateInset = () => {
      const next = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setKeyboardInset(Math.round(next));
    };

    updateInset();
    viewport.addEventListener("resize", updateInset);
    viewport.addEventListener("scroll", updateInset);

    return () => {
      viewport.removeEventListener("resize", updateInset);
      viewport.removeEventListener("scroll", updateInset);
    };
  }, [isMemoFocused]);

  const insertTextAtCursor = (text: string) => {
    const field = memoRef.current;

    setDraft((prev) => {
      if (!field) return { ...prev, memo: prev.memo + text };

      const start = field.selectionStart ?? prev.memo.length;
      const end = field.selectionEnd ?? prev.memo.length;
      const nextMemo = `${prev.memo.slice(0, start)}${text}${prev.memo.slice(end)}`;

      requestAnimationFrame(() => {
        field.focus();
        const nextPos = start + text.length;
        field.setSelectionRange(nextPos, nextPos);
      });

      return { ...prev, memo: nextMemo };
    });
  };

  const insertCounterToken = () => {
    const field = memoRef.current;
    const currentCount = memoParts.filter((part) => part.type === "counter").length;
    const tempName = `tmp${currentCount}`;
    const token = `[[c:${tempName}=0]]`;
    const prefixLength = "[[c:".length;

    setDraft((prev) => {
      if (!field) return { ...prev, memo: prev.memo + token };

      const start = field.selectionStart ?? prev.memo.length;
      const end = field.selectionEnd ?? prev.memo.length;
      const nextMemo = `${prev.memo.slice(0, start)}${token}${prev.memo.slice(end)}`;

      requestAnimationFrame(() => {
        field.focus();
        const nameStart = start + prefixLength;
        const nameEnd = nameStart + tempName.length;
        field.setSelectionRange(nameStart, nameEnd);
      });

      return { ...prev, memo: nextMemo };
    });
  };

  const insertFormulaToken = () => {
    insertTextAtCursor(FORMULA_TOKEN);
  };

  const insertTemplateItem = (item: string) => {
    if (item === "カウンター") {
      insertCounterToken();
      return;
    }
    if (item === "数式") {
      insertFormulaToken();
      return;
    }
    insertTextAtCursor(`${item} `);
  };

  const focusMemoEditor = () => {
    setIsMemoFocused(true);
    setCounterPopup(null);
    requestAnimationFrame(() => memoRef.current?.focus());
  };

  const saveMemoEditor = () => {
    memoRef.current?.blur();
    setIsMemoFocused(false);
    setKeyboardInset(0);
    setSelectedCategoryKey(null);
    setCounterPopup(null);
  };

  const updateInlineCounter = (targetIndex: number, updater: (current: number) => number) => {
    setDraft((prev) => {
      let currentIndex = 0;
      return {
        ...prev,
        memo: prev.memo.replace(/\[\[c:([^\]]+)\]\]/g, (token, rawBody) => {
          if (currentIndex !== targetIndex) {
            currentIndex += 1;
            return token;
          }
          const parsed = parseCounterBody(rawBody);
          currentIndex += 1;
          const nextValue = Math.max(0, Math.floor(updater(parsed.value)));
          if (parsed.name) return `[[c:${parsed.name}=${nextValue}]]`;
          if (parsed.legacy) return `[[c:${nextValue}]]`;
          return `[[c:${nextValue}]]`;
        }),
      };
    });
  };

  const stepInlineCounter = (targetIndex: number, delta: number) => {
    updateInlineCounter(targetIndex, (current) => current + delta);
  };

  const openCounterPopup = (
    event: ReactMouseEvent<HTMLButtonElement>,
    targetIndex: number,
    current: number,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCounterPopup({
      targetIndex,
      anchorX: rect.left + rect.width / 2,
      anchorY: rect.bottom + 8,
      value: clampCounterValue(current),
    });
  };

  const stepPopupCounterDigit = (digitStep: number, delta: 1 | -1) => {
    if (!counterPopup) return;
    const nextValue = clampCounterValue(counterPopup.value + digitStep * delta);
    updateInlineCounter(counterPopup.targetIndex, () => nextValue);
    setCounterPopup((prev) => (prev ? { ...prev, value: nextValue } : prev));
  };

  return (
    <div className="relative left-1/2 -ml-[50vw] w-screen h-[calc(100svh-4rem-1rem)] sm:h-[calc(100svh-4rem-2rem)] px-2 sm:px-4 py-2 flex flex-col gap-2 overflow-hidden">
      <div className="flex items-center justify-end">
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
            onClick={() => clearModalRef.current?.showModal()}
            aria-label="クリア"
          >
            <Icon icon="fa6-regular:trash-can" className="size-4" />
          </button>
        </div>
      </div>

      <div className="card flex-1 min-h-0">
        <div className="card-body p-0 flex flex-col min-h-0">
          <div className="form-control flex-1 min-h-0">
            {isMemoFocused ? (
              <textarea
                ref={memoRef}
                className={`textarea textarea-bordered h-full w-full min-h-0 ${memoFontSizeClass} ${inlineControlSize.lineHeightClass}`}
                placeholder="挙動・示唆・反省点など"
                value={draft.memo}
                onFocus={() => setIsMemoFocused(true)}
                onBlur={() => {
                  setIsMemoFocused(false);
                  setKeyboardInset(0);
                  setSelectedCategoryKey(null);
                }}
                onChange={(event) => setDraft((prev) => ({ ...prev, memo: event.target.value }))}
              />
            ) : (
              <div
                className={`textarea textarea-bordered h-full w-full min-h-0 overflow-y-auto whitespace-pre-wrap cursor-text ${memoFontSizeClass} ${inlineControlSize.lineHeightClass}`}
                onClick={focusMemoEditor}
              >
                {memoParts.length === 0 ? (
                  <span className="opacity-40">挙動・示唆・反省点など</span>
                ) : (
                  memoParts.map((part, index) =>
                    part.type === "text" ? (
                      <span key={`text-${index}`}>{part.value}</span>
                    ) : part.type === "counter" ? (
                      <span
                        key={`counter-${part.index}`}
                        className="join join-horizontal align-middle mx-1"
                      >
                        <button
                          type="button"
                          className={`join-item btn ${inlineControlSize.buttonClass} btn-outline px-2 text-minus`}
                          aria-label="減らす"
                          onPointerDown={(event) => event.preventDefault()}
                          onClick={(event) => {
                            event.stopPropagation();
                            stepInlineCounter(part.index, -1);
                          }}
                        >
                          <Icon
                            icon="mdi:minus-circle-outline"
                            className={inlineControlSize.iconClass}
                          />
                        </button>
                        <button
                          type="button"
                          className={`join-item btn  border-neutral z-1 ${inlineControlSize.buttonClass} ${inlineControlSize.valueWidthClass} px-2`}
                          onPointerDown={(event) => event.preventDefault()}
                          onClick={(event) => {
                            event.stopPropagation();
                            openCounterPopup(event, part.index, part.value);
                          }}
                        >
                          {part.value}
                        </button>
                        <button
                          type="button"
                          className={`join-item btn ${inlineControlSize.buttonClass} btn-outline px-2 text-plus`}
                          aria-label="増やす"
                          onPointerDown={(event) => event.preventDefault()}
                          onClick={(event) => {
                            event.stopPropagation();
                            stepInlineCounter(part.index, 1);
                          }}
                        >
                          <Icon
                            icon="mdi:plus-circle-outline"
                            className={inlineControlSize.iconClass}
                          />
                        </button>
                      </span>
                    ) : (
                      <button
                        key={`formula-${part.index}`}
                        type="button"
                        className={`btn ${inlineControlSize.formulaClass} btn-outline align-middle mx-1`}
                        title={part.expression}
                        onPointerDown={(event) => event.preventDefault()}
                        onClick={(event) => {
                          event.stopPropagation();
                          focusMemoEditor();
                        }}
                      >
                        = {formulaResults.get(part.index) ?? "ERR"}
                      </button>
                    ),
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <dialog ref={configModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-3">設定</h3>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span>文字サイズ</span>
              <div className="join">
                {FONT_SIZE_OPTIONS.map((option) => (
                  <input
                    key={option.level}
                    type="radio"
                    name="font-size-options"
                    className="join-item btn btn-xs"
                    aria-label={option.label}
                    checked={memoFontSizeLevel === option.level}
                    onChange={() => {
                      setDraft((prev) => ({ ...prev, fontSizeLevel: option.level }));
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-sm">閉じる</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <dialog ref={clearModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-2">クリア</h3>
          <p className="text-sm opacity-70">現在のメモを消去しますか？</p>
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button className="btn btn-sm">キャンセル</button>
              <button
                className="btn btn-sm btn-error"
                onClick={() => {
                  clearDraft();
                }}
              >
                クリア
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {counterPopup ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setCounterPopup(null)} />
          <div
            className="fixed z-50 -translate-x-1/2"
            style={{ left: `${counterPopup.anchorX}px`, top: `${counterPopup.anchorY}px` }}
          >
            <div
              className="card bg-base-100 border border-base-300 shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="card-body p-3 min-w-52 gap-2">
                <div className="text-xs font-semibold opacity-70">4桁カウンター</div>
                <div className="grid grid-cols-4 gap-1">
                  {COUNTER_DIGIT_STEPS.map((digitStep, index) => {
                    const digit = toCounterDigits(counterPopup.value)[index];
                    return (
                      <div key={digitStep} className="join join-vertical">
                        <button
                          type="button"
                          className="join-item btn btn-xs btn-ghost btn-square text-plus"
                          aria-label={`${digitStep}増やす`}
                          onClick={() => stepPopupCounterDigit(digitStep, 1)}
                        >
                          <Icon icon="mdi:plus-circle-outline" className="size-4" />
                        </button>
                        <div className="join-item w-10 h-10 border border-base-300 flex items-center justify-center font-mono text-lg">
                          {digit}
                        </div>
                        <button
                          type="button"
                          className="join-item btn btn-xs btn-ghost btn-square text-minus"
                          aria-label={`${digitStep}減らす`}
                          onClick={() => stepPopupCounterDigit(digitStep, -1)}
                        >
                          <Icon icon="mdi:minus-circle-outline" className="size-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between gap-1">
                  <button
                    type="button"
                    className="btn btn-xs btn-ghost"
                    onClick={() => {
                      if (!counterPopup) return;
                      updateInlineCounter(counterPopup.targetIndex, () => 0);
                      setCounterPopup((prev) => (prev ? { ...prev, value: 0 } : prev));
                    }}
                  >
                    0000
                  </button>
                  <div className="font-mono text-sm opacity-70">
                    {toCounterDigits(counterPopup.value).join("")}
                  </div>
                  <button
                    type="button"
                    className="btn btn-xs btn-ghost"
                    onClick={() => setCounterPopup(null)}
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <TemplateKeyboard
        visible={isMemoFocused}
        keyboardInset={keyboardInset}
        selectedCategoryKey={selectedCategoryKey}
        onSelectCategoryKey={setSelectedCategoryKey}
        onInsertCategoryItem={insertTemplateItem}
        onSave={saveMemoEditor}
      />
    </div>
  );
}
