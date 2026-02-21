import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Parser } from "expr-eval-fork";
import type { TemplateCategory } from "../../../constants/memo/template";
import { useLocalStorage } from "../../../utils/useLocalStorage";

export interface MemoDraft {
  memo: string;
  fontSizeLevel: number;
}

export interface MemoTemplate {
  id: string;
  memo: string;
  fontSizeLevel: number;
  createdAt: string;
}

export type MemoPart =
  | { type: "text"; value: string }
  | { type: "counter"; value: number; index: number; name: string | null; legacy: boolean }
  | { type: "formula"; expression: string; index: number };

export interface CounterPopupState {
  targetIndex: number;
  anchorX: number;
  anchorY: number;
  value: number;
}

export interface InlineControlSize {
  buttonClass: string;
  formulaClass: string;
  valueWidthClass: string;
  iconClass: string;
  lineHeightClass: string;
}

const FORMULA_TOKEN = "[[f:1+1]]";
const COUNTER_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const MAX_COUNTER_VALUE = 9999;
const DEFAULT_FONT_SIZE_LEVEL = 3 as const;
const SAMPLE_TEMPLATE_MEMO = `■ゲーム数
ゲーム数：[[c:game=0]]
BIG：[[c:big=0]] [[f:big / game]]
REG：[[c:reg=0]] [[f:reg / game]]

■小役カウント
🔔：[[c:bell=0]] [[f:bell / game]]
🍒：[[c:cherry=0]] [[f:cherry / game]]
🍉：[[c:suika=0]] [[f:suika / game]]

■終了画面
偶数：[[c:even=0]] [[f:even / (even + odd + high)]]
奇数：[[c:odd=0]] [[f:odd / (even + odd + high)]]
高設定：[[c:high=0]] [[f:high / (even + odd + high)]]`;
const INITIAL_TEMPLATES: MemoTemplate[] = [
  {
    id: "default-slot-sample-template-v1",
    memo: SAMPLE_TEMPLATE_MEMO,
    fontSizeLevel: DEFAULT_FONT_SIZE_LEVEL,
    createdAt: "2026-02-21T00:00:00.000Z",
  },
];

export const COUNTER_DIGIT_STEPS = [1000, 100, 10, 1] as const;
export const FONT_SIZE_OPTIONS = [
  { level: 1, label: "S", className: "text-sm" },
  { level: 2, label: "M", className: "text-base" },
  { level: 3, label: "L", className: "text-lg" },
  { level: 4, label: "XL", className: "text-xl" },
  { level: 5, label: "2XL", className: "text-2xl" },
] as const;

function clampCounterValue(value: number): number {
  return Math.min(MAX_COUNTER_VALUE, Math.max(0, Math.floor(value)));
}

export function toCounterDigits(value: number): string[] {
  return clampCounterValue(value).toString().padStart(4, "0").split("");
}

function normalizeFontSizeLevel(level: number): (typeof FONT_SIZE_OPTIONS)[number]["level"] {
  if (!Number.isFinite(level)) return DEFAULT_FONT_SIZE_LEVEL;
  return Math.min(5, Math.max(1, Math.round(level))) as (typeof FONT_SIZE_OPTIONS)[number]["level"];
}

function getInlineControlSize(level: (typeof FONT_SIZE_OPTIONS)[number]["level"]): InlineControlSize {
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

function createDraft(): MemoDraft {
  return {
    fontSizeLevel: DEFAULT_FONT_SIZE_LEVEL,
    memo: "",
  };
}

function createTemplateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

function resetCounterValues(memo: string): string {
  return memo.replace(/\[\[c:([^\]]+)\]\]/g, (_token, rawBody) => {
    const parsed = parseCounterBody(rawBody);
    if (parsed.name) return `[[c:${parsed.name}=0]]`;
    return "[[c:0]]";
  });
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

export function formatTemplateDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getTemplateTitle(memo: string): string {
  const firstLine = memo
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  return firstLine ? firstLine.slice(0, 28) : "空のメモ";
}

export function useMemoEditor() {
  const [draft, setDraft] = useLocalStorage<MemoDraft>("slot-memo-draft", createDraft());
  const [templates, setTemplates] = useLocalStorage<MemoTemplate[]>(
    "slot-memo-templates",
    INITIAL_TEMPLATES,
  );
  const [isMemoFocused, setIsMemoFocused] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [counterPopup, setCounterPopup] = useState<CounterPopupState | null>(null);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<TemplateCategory["key"] | null>(null);
  const [pendingDeleteTemplateId, setPendingDeleteTemplateId] = useState<string | null>(null);

  const memoRef = useRef<HTMLTextAreaElement>(null);
  const templateModalRef = useRef<HTMLDialogElement>(null);
  const configModalRef = useRef<HTMLDialogElement>(null);
  const clearModalRef = useRef<HTMLDialogElement>(null);
  const saveTemplateModalRef = useRef<HTMLDialogElement>(null);
  const deleteTemplateModalRef = useRef<HTMLDialogElement>(null);

  const templateList = useMemo(() => (Array.isArray(templates) ? templates : []), [templates]);
  const pendingDeleteTemplate = useMemo(
    () => templateList.find((template) => template.id === pendingDeleteTemplateId) ?? null,
    [pendingDeleteTemplateId, templateList],
  );
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

  const setMemo = (memo: string) => {
    setDraft((prev) => ({ ...prev, memo }));
  };

  const setFontSizeLevel = (level: number) => {
    setDraft((prev) => ({ ...prev, fontSizeLevel: level }));
  };

  const clearDraft = () => {
    setDraft((prev) => ({
      ...createDraft(),
      fontSizeLevel: normalizeFontSizeLevel(prev.fontSizeLevel),
    }));
    setCounterPopup(null);
    setSelectedCategoryKey(null);
    setIsMemoFocused(false);
  };

  const handleMemoBlur = () => {
    setIsMemoFocused(false);
    setKeyboardInset(0);
    setSelectedCategoryKey(null);
  };

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

  const resetPopupCounterToZero = () => {
    if (!counterPopup) return;
    updateInlineCounter(counterPopup.targetIndex, () => 0);
    setCounterPopup((prev) => (prev ? { ...prev, value: 0 } : prev));
  };

  const closeCounterPopup = () => {
    setCounterPopup(null);
  };

  const openTemplateModal = () => {
    saveMemoEditor();
    templateModalRef.current?.showModal();
  };

  const applyTemplate = (template: MemoTemplate) => {
    setDraft((prev) => ({
      ...prev,
      memo: template.memo,
      fontSizeLevel: normalizeFontSizeLevel(template.fontSizeLevel),
    }));
    setCounterPopup(null);
    templateModalRef.current?.close();
  };

  const openSaveTemplateModal = () => {
    templateModalRef.current?.close();
    saveTemplateModalRef.current?.showModal();
  };

  const saveCurrentAsTemplate = () => {
    const nextTemplate: MemoTemplate = {
      id: createTemplateId(),
      memo: resetCounterValues(draft.memo),
      fontSizeLevel: memoFontSizeLevel,
      createdAt: new Date().toISOString(),
    };
    setTemplates((prev) => [nextTemplate, ...(Array.isArray(prev) ? prev : [])]);
  };

  const requestDeleteTemplate = (templateId: string) => {
    setPendingDeleteTemplateId(templateId);
    templateModalRef.current?.close();
    deleteTemplateModalRef.current?.showModal();
  };

  const clearPendingDeleteTemplate = () => {
    setPendingDeleteTemplateId(null);
  };

  const deleteTemplate = () => {
    if (!pendingDeleteTemplateId) return;
    setTemplates((prev) => (Array.isArray(prev) ? prev.filter((item) => item.id !== pendingDeleteTemplateId) : []));
    setPendingDeleteTemplateId(null);
  };

  return {
    draft,
    isMemoFocused,
    keyboardInset,
    selectedCategoryKey,
    memoRef,
    templateModalRef,
    configModalRef,
    clearModalRef,
    saveTemplateModalRef,
    deleteTemplateModalRef,
    templateList,
    pendingDeleteTemplate,
    counterPopup,
    memoParts,
    formulaResults,
    memoFontSizeLevel,
    memoFontSizeClass,
    inlineControlSize,
    setMemo,
    setFontSizeLevel,
    setSelectedCategoryKey,
    setIsMemoFocused,
    clearDraft,
    handleMemoBlur,
    insertTemplateItem,
    focusMemoEditor,
    saveMemoEditor,
    stepInlineCounter,
    openCounterPopup,
    stepPopupCounterDigit,
    resetPopupCounterToZero,
    closeCounterPopup,
    openTemplateModal,
    applyTemplate,
    openSaveTemplateModal,
    saveCurrentAsTemplate,
    requestDeleteTemplate,
    clearPendingDeleteTemplate,
    deleteTemplate,
  };
}

