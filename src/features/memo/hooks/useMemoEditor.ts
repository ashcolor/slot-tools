import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Parser } from "expr-eval-fork";
import { deflate, inflate } from "pako";
import {
  COUNTER_NAME_PATTERN,
  DEFAULT_FONT_SIZE_LEVEL,
  FONT_SIZE_OPTIONS,
  FORMULA_TOKEN,
  MAX_COUNTER_VALUE,
} from "../../../constants";
import { useLocalStorage } from "../../../utils/useLocalStorage";
import {
  INITIAL_TEMPLATES,
  type TemplateCategory,
  TEMPLATE_COUNTER_ITEM_LABEL,
  TEMPLATE_FORMULA_ITEM_LABEL,
} from "../constants";

export interface MemoDraft {
  memo: string;
  fontSizeLevel: number;
  formulaRoundDecimalPlaces: number;
}

export interface MemoTemplate {
  id: string;
  memo: string;
  fontSizeLevel: number;
  createdAt: string;
}

export interface MemoHistoryItem {
  id: string;
  memo: string;
  createdAt: string;
}

export type FormulaDisplayMode = "auto" | "percent" | "odds";

export type MemoPart =
  | { type: "text"; value: string }
  | { type: "counter"; value: number; index: number; name: string | null; legacy: boolean }
  | { type: "formula"; expression: string; index: number; displayMode: FormulaDisplayMode };

export interface CounterPopupState {
  targetIndex: number;
  anchorX: number;
  anchorY: number;
  value: number;
  name: string;
}

export interface FormulaPopupState {
  targetIndex: number;
  anchorX: number;
  anchorY: number;
  expression: string;
  displayMode: FormulaDisplayMode;
}

export interface InlineControlSize {
  buttonClass: string;
  formulaClass: string;
  valueWidthClass: string;
  iconClass: string;
  lineHeightClass: string;
}

function clampCounterValue(value: number): number {
  return Math.min(MAX_COUNTER_VALUE, Math.max(0, Math.floor(value)));
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const textareaScrollAnimationFrameMap = new WeakMap<HTMLTextAreaElement, number>();
const STAMP_ROOT_SELECTOR = "[data-stamp-root='true']";
const FORMULA_ROUND_DECIMAL_PLACES_MIN = 0;
const FORMULA_ROUND_DECIMAL_PLACES_MAX = 3;
const FORMULA_ROUND_DECIMAL_PLACES_DEFAULT = 1;
const FORMULA_OPTION_PATTERN = /^(.*);([^=;]+)=([^;]+)$/;
const FORMULA_PERCENT_DISPLAY_MIN = 0.01;
const FORMULA_PERCENT_DISPLAY_MAX = 0.99;
const MEMO_IMAGE_MAX_TEXT_WIDTH = 960;
const MEMO_IMAGE_PADDING = 24;
const MEMO_IMAGE_MIN_HEIGHT = 120;
const MEMO_QUERY_KEY = "m";
const MEMO_HISTORY_LIMIT = 50;

function bytesToBase64Url(bytes: Uint8Array): string | null {
  if (typeof btoa !== "function") return null;

  try {
    let binary = "";
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      const chunk = bytes.subarray(index, index + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  } catch {
    return null;
  }
}

function base64UrlToBytes(encoded: string): Uint8Array | null {
  if (typeof atob !== "function" || typeof Uint8Array === "undefined") return null;

  const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);

  try {
    const binary = atob(`${normalized}${padding}`);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

function encodeMemoForUrl(memo: string): string | null {
  if (memo.length === 0) return "";
  if (typeof TextEncoder === "undefined") return null;

  try {
    const inputBytes = new TextEncoder().encode(memo);
    const compressedBytes = deflate(inputBytes);
    return bytesToBase64Url(compressedBytes);
  } catch {
    return null;
  }
}

function decodeMemoFromUrl(encoded: string): string | null {
  if (encoded.length === 0 || typeof TextDecoder === "undefined") return null;

  const bytes = base64UrlToBytes(encoded);
  if (!bytes) return null;

  try {
    return new TextDecoder().decode(inflate(bytes));
  } catch {
    return null;
  }
}

function readMemoFromLocationSearch(search: string): string | null {
  const params = new URLSearchParams(search);
  const encoded = params.get(MEMO_QUERY_KEY);
  if (!encoded) return null;
  return decodeMemoFromUrl(encoded);
}

function easeOutCubic(progress: number): number {
  const inverse = 1 - progress;
  return 1 - inverse * inverse * inverse;
}

function animateTextareaScrollTop(
  textarea: HTMLTextAreaElement,
  targetScrollTop: number,
  durationMs: number,
): void {
  const ownerWindow = textarea.ownerDocument.defaultView;
  if (!ownerWindow || durationMs <= 0) {
    textarea.scrollTop = targetScrollTop;
    return;
  }

  const existingFrame = textareaScrollAnimationFrameMap.get(textarea);
  if (typeof existingFrame === "number") {
    ownerWindow.cancelAnimationFrame(existingFrame);
    textareaScrollAnimationFrameMap.delete(textarea);
  }

  const startScrollTop = textarea.scrollTop;
  const delta = targetScrollTop - startScrollTop;
  if (Math.abs(delta) < 1) {
    textarea.scrollTop = targetScrollTop;
    return;
  }

  const startTime = ownerWindow.performance.now();
  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = clampNumber(elapsed / durationMs, 0, 1);
    const eased = easeOutCubic(progress);
    textarea.scrollTop = startScrollTop + delta * eased;

    if (progress < 1) {
      const frame = ownerWindow.requestAnimationFrame(step);
      textareaScrollAnimationFrameMap.set(textarea, frame);
      return;
    }

    textarea.scrollTop = targetScrollTop;
    textareaScrollAnimationFrameMap.delete(textarea);
  };

  const frame = ownerWindow.requestAnimationFrame(step);
  textareaScrollAnimationFrameMap.set(textarea, frame);
}

function measureCaretTopInTextarea(textarea: HTMLTextAreaElement, position: number): number | null {
  const ownerDocument = textarea.ownerDocument;
  const ownerWindow = ownerDocument.defaultView;
  if (!ownerWindow || !ownerDocument.body) return null;

  const style = ownerWindow.getComputedStyle(textarea);
  const mirror = ownerDocument.createElement("div");
  mirror.style.position = "absolute";
  mirror.style.top = "0";
  mirror.style.left = "-9999px";
  mirror.style.visibility = "hidden";
  mirror.style.pointerEvents = "none";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordBreak = "break-word";
  mirror.style.overflowWrap = "break-word";
  mirror.style.boxSizing = style.boxSizing;
  mirror.style.width = `${textarea.clientWidth}px`;
  mirror.style.font = style.font;
  mirror.style.letterSpacing = style.letterSpacing;
  mirror.style.lineHeight = style.lineHeight;
  mirror.style.padding = style.padding;
  mirror.style.border = style.border;
  mirror.style.textIndent = style.textIndent;
  mirror.style.textTransform = style.textTransform;
  mirror.style.setProperty("tab-size", style.getPropertyValue("tab-size") || "8");

  const caretMarker = ownerDocument.createElement("span");
  mirror.textContent = textarea.value.slice(0, position);
  caretMarker.textContent = "\u200b";
  mirror.appendChild(caretMarker);

  ownerDocument.body.appendChild(mirror);
  const markerRect = caretMarker.getBoundingClientRect();
  const mirrorRect = mirror.getBoundingClientRect();
  mirror.remove();

  const markerTop = markerRect.top - mirrorRect.top;
  if (!Number.isFinite(markerTop)) return null;

  const paddingTop = Number.parseFloat(style.paddingTop) || 0;
  return Math.max(0, markerTop - paddingTop);
}

function getTextareaLineHeightPx(textarea: HTMLTextAreaElement): number {
  const ownerWindow = textarea.ownerDocument.defaultView;
  if (!ownerWindow) return 20;

  const style = ownerWindow.getComputedStyle(textarea);
  const parsedLineHeight = Number.parseFloat(style.lineHeight);
  if (Number.isFinite(parsedLineHeight) && parsedLineHeight > 0) return parsedLineHeight;

  const parsedFontSize = Number.parseFloat(style.fontSize);
  if (Number.isFinite(parsedFontSize) && parsedFontSize > 0) return parsedFontSize * 1.2;

  return 20;
}

function getViewportBottomInDocument(textarea: HTMLTextAreaElement): number {
  const ownerWindow = textarea.ownerDocument.defaultView;
  if (!ownerWindow) return textarea.ownerDocument.documentElement.clientHeight;

  const viewport = ownerWindow.visualViewport;
  if (viewport) return viewport.height + viewport.offsetTop;
  return ownerWindow.innerHeight;
}

function getKeyboardInsetInPixels(textarea: HTMLTextAreaElement): number {
  const ownerWindow = textarea.ownerDocument.defaultView;
  if (!ownerWindow) return 0;

  const viewport = ownerWindow.visualViewport;
  if (!viewport) return 0;

  return Math.max(0, ownerWindow.innerHeight - viewport.height - viewport.offsetTop);
}

function getStampTop(textarea: HTMLTextAreaElement, fallbackBottom: number): number {
  const stampElement = textarea.ownerDocument.querySelector<HTMLElement>(STAMP_ROOT_SELECTOR);
  if (!stampElement) return fallbackBottom;

  const rect = stampElement.getBoundingClientRect();
  return Number.isFinite(rect.top) ? rect.top : fallbackBottom;
}

function scrollCaretAboveStamp(textarea: HTMLTextAreaElement, position: number): void {
  if (getKeyboardInsetInPixels(textarea) <= 0) return;

  const targetTop = measureCaretTopInTextarea(textarea, position);
  if (targetTop === null) return;

  const ownerWindow = textarea.ownerDocument.defaultView;
  if (!ownerWindow) return;

  const style = ownerWindow.getComputedStyle(textarea);
  const paddingTop = Number.parseFloat(style.paddingTop) || 0;
  const rect = textarea.getBoundingClientRect();
  const lineHeightPx = getTextareaLineHeightPx(textarea);
  const caretBottom = rect.top + paddingTop + targetTop - textarea.scrollTop + lineHeightPx;
  const viewportBottom = getViewportBottomInDocument(textarea);
  const stampTop = getStampTop(textarea, viewportBottom);
  if (caretBottom <= stampTop) return;

  const requiredDelta = caretBottom - stampTop;
  const maxScrollTop = Math.max(0, textarea.scrollHeight - textarea.clientHeight);
  const nextScrollTop = clampNumber(textarea.scrollTop + requiredDelta, 0, maxScrollTop);
  const prefersReducedMotion =
    ownerWindow?.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  if (prefersReducedMotion) {
    textarea.scrollTop = nextScrollTop;
    return;
  }

  animateTextareaScrollTop(textarea, nextScrollTop, 180);
}

export function toCounterDigits(value: number): string[] {
  return clampCounterValue(value).toString().padStart(5, "0").split("");
}

function normalizeFontSizeLevel(level: number): (typeof FONT_SIZE_OPTIONS)[number]["level"] {
  if (!Number.isFinite(level)) return DEFAULT_FONT_SIZE_LEVEL;
  const minLevel = FONT_SIZE_OPTIONS[0].level;
  const maxLevel = FONT_SIZE_OPTIONS[FONT_SIZE_OPTIONS.length - 1].level;
  return Math.min(
    maxLevel,
    Math.max(minLevel, Math.round(level)),
  ) as (typeof FONT_SIZE_OPTIONS)[number]["level"];
}

function getInlineControlSize(
  level: (typeof FONT_SIZE_OPTIONS)[number]["level"],
): InlineControlSize {
  if (level <= 1) {
    return {
      buttonClass: "btn-xs",
      formulaClass: "btn-xs",
      valueWidthClass: "min-w-8",
      iconClass: "size-3",
      lineHeightClass: "leading-7",
    };
  }
  if (level === 2) {
    return {
      buttonClass: "btn-xs",
      formulaClass: "btn-xs",
      valueWidthClass: "min-w-8",
      iconClass: "size-3",
      lineHeightClass: "leading-8",
    };
  }
  if (level === 3) {
    return {
      buttonClass: "btn-sm",
      formulaClass: "btn-xs",
      valueWidthClass: "min-w-9",
      iconClass: "size-4",
      lineHeightClass: "leading-9",
    };
  }
  if (level === 4) {
    return {
      buttonClass: "btn-sm",
      formulaClass: "btn-sm",
      valueWidthClass: "min-w-10",
      iconClass: "size-4",
      lineHeightClass: "leading-10",
    };
  }
  if (level === 5) {
    return {
      buttonClass: "btn-md",
      formulaClass: "btn-md",
      valueWidthClass: "min-w-12",
      iconClass: "size-5",
      lineHeightClass: "leading-[2.8rem]",
    };
  }
  return {
    buttonClass: "btn-md",
    formulaClass: "btn-md",
    valueWidthClass: "min-w-12",
    iconClass: "size-5",
    lineHeightClass: "leading-[2.8rem]",
  };
}

function normalizeFormulaRoundDecimalPlaces(value: number): number {
  if (!Number.isFinite(value)) return FORMULA_ROUND_DECIMAL_PLACES_DEFAULT;
  const integer = Math.trunc(value);
  return clampNumber(integer, FORMULA_ROUND_DECIMAL_PLACES_MIN, FORMULA_ROUND_DECIMAL_PLACES_MAX);
}

function createDraft(): MemoDraft {
  return {
    fontSizeLevel: DEFAULT_FONT_SIZE_LEVEL,
    memo: "",
    formulaRoundDecimalPlaces: FORMULA_ROUND_DECIMAL_PLACES_DEFAULT,
  };
}

function createTemplateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isFormulaDisplayMode(value: string): value is FormulaDisplayMode {
  return value === "auto" || value === "percent" || value === "odds";
}

function parseFormulaBody(rawBody: string): {
  expression: string;
  displayMode: FormulaDisplayMode;
} {
  const body = rawBody.trim();
  let expression = body;
  let displayMode: FormulaDisplayMode = "auto";

  while (true) {
    const optionMatch = expression.match(FORMULA_OPTION_PATTERN);
    if (!optionMatch) break;

    const nextExpression = optionMatch[1].trim();
    const optionKey = optionMatch[2].trim().toLowerCase();
    const optionValue = optionMatch[3].trim().toLowerCase();

    if (optionKey === "ceil") {
      expression = nextExpression;
      continue;
    }
    if (
      (optionKey === "fmt" || optionKey === "format" || optionKey === "display") &&
      isFormulaDisplayMode(optionValue)
    ) {
      displayMode = optionValue;
      expression = nextExpression;
      continue;
    }
    break;
  }

  if (expression.length === 0) {
    return { expression: body, displayMode: "auto" };
  }
  return { expression, displayMode };
}

function buildFormulaBody(expression: string, displayMode: FormulaDisplayMode): string {
  const trimmedExpression = expression.trim();
  if (displayMode === "auto") return trimmedExpression;
  return `${trimmedExpression};fmt=${displayMode}`;
}

function roundToDecimalPlaces(value: number, decimalPlaces: number): number {
  const factor = 10 ** decimalPlaces;
  if (!Number.isFinite(factor) || factor <= 0) return Math.round(value);
  return Math.round(value * factor) / factor;
}

function formatFormulaNumber(value: number, roundDecimalPlaces: number): string {
  const normalizedRoundDecimalPlaces = normalizeFormulaRoundDecimalPlaces(roundDecimalPlaces);
  const roundedValue = roundToDecimalPlaces(value, normalizedRoundDecimalPlaces);
  if (Number.isInteger(roundedValue)) return String(roundedValue);
  return roundedValue.toFixed(normalizedRoundDecimalPlaces).replace(/\.?0+$/, "");
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
      const parsed = parseFormulaBody(match[2]);
      parts.push({
        type: "formula",
        expression: parsed.expression,
        index: formulaIndex,
        displayMode: parsed.displayMode,
      });
      formulaIndex += 1;
    }
    lastIndex = matcher.lastIndex;
  }

  if (lastIndex < memo.length) {
    parts.push({ type: "text", value: memo.slice(lastIndex) });
  }

  return parts;
}

function parseCounterBody(rawBody: string): {
  name: string | null;
  value: number;
  legacy: boolean;
} {
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

function buildResolvedMemoText(memoParts: MemoPart[], formulaResults: Map<number, string>): string {
  return memoParts
    .map((part) => {
      if (part.type === "text") return part.value;
      if (part.type === "counter") return String(clampCounterValue(part.value));
      return formulaResults.get(part.index) ?? "--";
    })
    .join("");
}

function getMemoImageFontSize(fontSizeLevel: number): number {
  if (fontSizeLevel <= 1) return 14;
  if (fontSizeLevel === 2) return 16;
  if (fontSizeLevel === 3) return 18;
  if (fontSizeLevel === 4) return 20;
  if (fontSizeLevel === 5) return 22;
  return 22;
}

function wrapLineToWidth(
  context: CanvasRenderingContext2D,
  line: string,
  maxWidth: number,
): string[] {
  if (line.length === 0) return [""];

  const lines: string[] = [];
  let current = "";

  for (const char of line) {
    const next = `${current}${char}`;
    if (current.length > 0 && context.measureText(next).width > maxWidth) {
      lines.push(current);
      current = char;
      continue;
    }
    current = next;
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines;
}

async function renderMemoTextImage(text: string, fontSizeLevel: number): Promise<Blob> {
  if (typeof document === "undefined") {
    throw new Error("画像生成に失敗しました。");
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("画像生成に失敗しました。");
  }

  const fontSize = getMemoImageFontSize(fontSizeLevel);
  const lineHeight = Math.round(fontSize * 1.6);
  const fontFamily = "'Noto Sans JP', 'Yu Gothic', sans-serif";
  context.font = `400 ${fontSize}px ${fontFamily}`;

  const sourceLines = text.split(/\r?\n/);
  const wrappedLines = sourceLines.flatMap((line) =>
    wrapLineToWidth(context, line, MEMO_IMAGE_MAX_TEXT_WIDTH),
  );
  const printableLines = wrappedLines.length > 0 ? wrappedLines : [""];
  const widestLineWidth = printableLines.reduce(
    (max, line) => Math.max(max, context.measureText(line).width),
    0,
  );

  const width = Math.ceil(Math.max(240, widestLineWidth + MEMO_IMAGE_PADDING * 2));
  const height = Math.ceil(
    Math.max(MEMO_IMAGE_MIN_HEIGHT, printableLines.length * lineHeight + MEMO_IMAGE_PADDING * 2),
  );
  const devicePixelRatio =
    typeof window === "undefined" ? 1 : Math.min(3, Math.max(1, window.devicePixelRatio || 1));

  canvas.width = Math.ceil(width * devicePixelRatio);
  canvas.height = Math.ceil(height * devicePixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const drawingContext = canvas.getContext("2d");
  if (!drawingContext) {
    throw new Error("画像生成に失敗しました。");
  }

  drawingContext.scale(devicePixelRatio, devicePixelRatio);
  drawingContext.fillStyle = "#ffffff";
  drawingContext.fillRect(0, 0, width, height);
  drawingContext.fillStyle = "#111827";
  drawingContext.font = `400 ${fontSize}px ${fontFamily}`;
  drawingContext.textBaseline = "top";

  printableLines.forEach((line, index) => {
    drawingContext.fillText(line, MEMO_IMAGE_PADDING, MEMO_IMAGE_PADDING + index * lineHeight);
  });

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((nextBlob) => resolve(nextBlob), "image/png");
  });
  if (!blob) {
    throw new Error("画像生成に失敗しました。");
  }
  return blob;
}

function evaluateFormula(
  expression: string,
  variables: Record<string, number>,
  roundDecimalPlaces: number,
  displayMode: FormulaDisplayMode,
): string {
  try {
    const raw = Parser.evaluate(expression, variables);
    const numberValue = Number(raw);
    if (!Number.isFinite(numberValue)) return "--";

    if (displayMode === "percent") {
      return `${formatFormulaNumber(numberValue * 100, roundDecimalPlaces)}%`;
    }

    if (displayMode === "odds") {
      if (numberValue <= 0) return "--";
      return `1/${formatFormulaNumber(1 / numberValue, roundDecimalPlaces)}`;
    }

    if (numberValue >= FORMULA_PERCENT_DISPLAY_MIN && numberValue <= FORMULA_PERCENT_DISPLAY_MAX) {
      return `${formatFormulaNumber(numberValue * 100, roundDecimalPlaces)}%`;
    }
    if (numberValue > 0 && numberValue < FORMULA_PERCENT_DISPLAY_MIN) {
      return `1/${formatFormulaNumber(1 / numberValue, roundDecimalPlaces)}`;
    }
    return formatFormulaNumber(numberValue, roundDecimalPlaces);
  } catch {
    return "--";
  }
}

function isValidFormulaExpression(expression: string, variables: Record<string, number>): boolean {
  try {
    const parsed = Parser.parse(expression);
    const referencedVariables = parsed.variables();
    return referencedVariables.every((name) =>
      Object.prototype.hasOwnProperty.call(variables, name),
    );
  } catch {
    return false;
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
    INITIAL_TEMPLATES as MemoTemplate[],
  );
  const [memoHistory, setMemoHistory] = useLocalStorage<MemoHistoryItem[]>("slot-memo-history", []);
  const [isUrlMemoHydrated, setIsUrlMemoHydrated] = useState(false);
  const [pendingUrlMemo, setPendingUrlMemo] = useState<string | null>(null);
  const [isMemoFocused, setIsMemoFocused] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [counterPopup, setCounterPopup] = useState<CounterPopupState | null>(null);
  const [formulaPopup, setFormulaPopup] = useState<FormulaPopupState | null>(null);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<TemplateCategory["key"] | null>(
    null,
  );
  const [pendingApplyTemplateId, setPendingApplyTemplateId] = useState<string | null>(null);
  const [pendingDeleteTemplateId, setPendingDeleteTemplateId] = useState<string | null>(null);

  const memoRef = useRef<HTMLTextAreaElement>(null);
  const templateModalRef = useRef<HTMLDialogElement>(null);
  const applyTemplateModalRef = useRef<HTMLDialogElement>(null);
  const configModalRef = useRef<HTMLDialogElement>(null);
  const clearModalRef = useRef<HTMLDialogElement>(null);
  const deleteTemplateModalRef = useRef<HTMLDialogElement>(null);
  const urlMemoConfirmModalRef = useRef<HTMLDialogElement>(null);
  const pendingKeyboardAvoidCaretPositionRef = useRef<number | null>(null);
  const didInitUrlMemoRef = useRef(false);

  const templateList = useMemo(() => (Array.isArray(templates) ? templates : []), [templates]);
  const memoHistoryList = useMemo(
    () => (Array.isArray(memoHistory) ? memoHistory : []),
    [memoHistory],
  );
  const pendingApplyTemplate = useMemo(
    () => templateList.find((template) => template.id === pendingApplyTemplateId) ?? null,
    [pendingApplyTemplateId, templateList],
  );
  const pendingDeleteTemplate = useMemo(
    () => templateList.find((template) => template.id === pendingDeleteTemplateId) ?? null,
    [pendingDeleteTemplateId, templateList],
  );
  const memoParts = useMemo(() => parseMemoParts(draft.memo), [draft.memo]);
  const formulaVariables = useMemo(() => {
    const variables = new Map<string, number>();
    memoParts.forEach((part) => {
      if (part.type !== "counter") return;
      variables.set(`c${part.index}`, part.value);
      if (part.name) variables.set(part.name, part.value);
    });
    return variables;
  }, [memoParts]);
  const formulaVariableList = useMemo(() => {
    const namedVariables = new Map<string, number>();
    memoParts.forEach((part) => {
      if (part.type !== "counter" || !part.name) return;
      namedVariables.set(part.name, part.value);
    });
    return [...namedVariables.entries()].map(([name, value]) => ({ name, value }));
  }, [memoParts]);
  const formulaResults = useMemo(() => {
    const variables = Object.fromEntries(formulaVariables);
    const normalizedRoundDecimalPlaces = normalizeFormulaRoundDecimalPlaces(
      draft.formulaRoundDecimalPlaces,
    );

    const results = new Map<number, string>();
    memoParts.forEach((part) => {
      if (part.type === "formula") {
        results.set(
          part.index,
          evaluateFormula(
            part.expression,
            variables,
            normalizedRoundDecimalPlaces,
            part.displayMode,
          ),
        );
      }
    });
    return results;
  }, [draft.formulaRoundDecimalPlaces, memoParts, formulaVariables]);
  const resolvedMemoText = useMemo(
    () => buildResolvedMemoText(memoParts, formulaResults),
    [memoParts, formulaResults],
  );
  const isCounterPopupNameInvalid = useMemo(() => {
    if (!counterPopup) return false;
    if (counterPopup.name.length === 0) return false;
    return !COUNTER_NAME_PATTERN.test(counterPopup.name);
  }, [counterPopup]);
  const isFormulaPopupExpressionInvalid = useMemo(() => {
    if (!formulaPopup) return false;
    const expression = formulaPopup.expression.trim();
    if (expression.length === 0) return true;
    return !isValidFormulaExpression(expression, Object.fromEntries(formulaVariables));
  }, [formulaPopup, formulaVariables]);

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
    const normalized = normalizeFormulaRoundDecimalPlaces(draft.formulaRoundDecimalPlaces);
    if (draft.formulaRoundDecimalPlaces !== normalized) {
      setDraft((prev) => ({ ...prev, formulaRoundDecimalPlaces: normalized }));
    }
  }, [draft.formulaRoundDecimalPlaces, setDraft]);

  useEffect(() => {
    if (didInitUrlMemoRef.current) return;
    didInitUrlMemoRef.current = true;

    if (typeof window === "undefined") {
      setIsUrlMemoHydrated(true);
      return;
    }

    const memoFromUrl = readMemoFromLocationSearch(window.location.search);
    if (typeof memoFromUrl !== "string") {
      setIsUrlMemoHydrated(true);
      return;
    }

    if (draft.memo === memoFromUrl) {
      setIsUrlMemoHydrated(true);
      return;
    }

    if (draft.memo.trim().length > 0) {
      setPendingUrlMemo(memoFromUrl);
      return;
    }

    setDraft((prev) => (prev.memo === memoFromUrl ? prev : { ...prev, memo: memoFromUrl }));
    setIsUrlMemoHydrated(true);
  }, [draft.memo, setDraft]);

  useEffect(() => {
    if (!pendingUrlMemo) return;
    const modal = urlMemoConfirmModalRef.current;
    if (!modal || modal.open) return;
    try {
      modal.showModal();
    } catch {
      return;
    }
  }, [pendingUrlMemo]);

  useEffect(() => {
    if (!isUrlMemoHydrated || typeof window === "undefined") return;

    const encodedMemo = encodeMemoForUrl(draft.memo);
    if (encodedMemo === null) return;

    const url = new URL(window.location.href);
    if (encodedMemo.length > 0) {
      url.searchParams.set(MEMO_QUERY_KEY, encodedMemo);
    } else {
      url.searchParams.delete(MEMO_QUERY_KEY);
    }

    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl === currentUrl) return;

    window.history.replaceState(window.history.state, "", nextUrl);
  }, [draft.memo, isUrlMemoHydrated]);

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

  useEffect(() => {
    if (!isMemoFocused || keyboardInset <= 0) return;

    const pendingPosition = pendingKeyboardAvoidCaretPositionRef.current;
    if (typeof pendingPosition !== "number") return;

    const field = memoRef.current;
    if (!field) return;

    requestAnimationFrame(() => {
      scrollCaretAboveStamp(field, pendingPosition);
      pendingKeyboardAvoidCaretPositionRef.current = null;
    });
  }, [isMemoFocused, keyboardInset]);

  const setMemo = (memo: string) => {
    setDraft((prev) => ({ ...prev, memo }));
  };

  const setFontSizeLevel = (level: number) => {
    setDraft((prev) => ({ ...prev, fontSizeLevel: level }));
  };

  const setFormulaRoundDecimalPlaces = (roundDecimalPlaces: number) => {
    const normalized = normalizeFormulaRoundDecimalPlaces(roundDecimalPlaces);
    setDraft((prev) => ({ ...prev, formulaRoundDecimalPlaces: normalized }));
  };

  const clearDraft = () => {
    setDraft((prev) => ({
      ...createDraft(),
      fontSizeLevel: normalizeFontSizeLevel(prev.fontSizeLevel),
      formulaRoundDecimalPlaces: normalizeFormulaRoundDecimalPlaces(prev.formulaRoundDecimalPlaces),
    }));
    setCounterPopup(null);
    setFormulaPopup(null);
    setIsMemoFocused(false);
    pendingKeyboardAvoidCaretPositionRef.current = null;
  };

  const createNewMemo = (): boolean => {
    let didSaveToHistory = false;
    if (draft.memo.trim().length > 0) {
      didSaveToHistory = true;
      const nextHistory: MemoHistoryItem = {
        id: createTemplateId(),
        memo: draft.memo,
        createdAt: new Date().toISOString(),
      };
      setMemoHistory((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return [nextHistory, ...list].slice(0, MEMO_HISTORY_LIMIT);
      });
    }

    setDraft((prev) => ({ ...prev, memo: "" }));
    setCounterPopup(null);
    setFormulaPopup(null);
    setIsMemoFocused(false);
    pendingKeyboardAvoidCaretPositionRef.current = null;
    return didSaveToHistory;
  };

  const restoreMemoHistory = (historyId: string) => {
    const target = memoHistoryList.find((item) => item.id === historyId);
    if (!target) return;

    setDraft((prev) => ({ ...prev, memo: target.memo }));
    setCounterPopup(null);
    setFormulaPopup(null);
    setIsMemoFocused(false);
    pendingKeyboardAvoidCaretPositionRef.current = null;
  };

  const handleMemoBlur = () => {
    setIsMemoFocused(false);
    setKeyboardInset(0);
    pendingKeyboardAvoidCaretPositionRef.current = null;
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
    if (item === TEMPLATE_COUNTER_ITEM_LABEL) {
      insertCounterToken();
      return;
    }
    if (item === TEMPLATE_FORMULA_ITEM_LABEL) {
      insertFormulaToken();
      return;
    }
    insertTextAtCursor(`${item} `);
  };

  const focusMemoEditor = (cursorPosition?: number) => {
    setIsMemoFocused(true);
    setCounterPopup(null);
    setFormulaPopup(null);
    requestAnimationFrame(() => {
      const field = memoRef.current;
      if (!field) return;

      field.focus();
      let nextPosition = field.selectionStart ?? field.value.length;
      if (typeof cursorPosition === "number") {
        const boundedPosition = Math.min(
          field.value.length,
          Math.max(0, Math.floor(cursorPosition)),
        );
        field.setSelectionRange(boundedPosition, boundedPosition);
        nextPosition = boundedPosition;
      }
      pendingKeyboardAvoidCaretPositionRef.current = nextPosition;
    });
  };

  const saveMemoEditor = () => {
    memoRef.current?.blur();
    setIsMemoFocused(false);
    setKeyboardInset(0);
    setCounterPopup(null);
    setFormulaPopup(null);
    pendingKeyboardAvoidCaretPositionRef.current = null;
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

  const updateInlineCounterName = (targetIndex: number, nextName: string | null) => {
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
          if (nextName) return `[[c:${nextName}=${parsed.value}]]`;
          return `[[c:${parsed.value}]]`;
        }),
      };
    });
  };

  const updateInlineFormula = (
    targetIndex: number,
    expression: string,
    displayMode: FormulaDisplayMode,
  ) => {
    setDraft((prev) => {
      let currentIndex = 0;
      return {
        ...prev,
        memo: prev.memo.replace(/\[\[f:([^\]]+)\]\]/g, (token) => {
          if (currentIndex !== targetIndex) {
            currentIndex += 1;
            return token;
          }
          currentIndex += 1;
          const nextExpression = expression.trim();
          if (nextExpression.length === 0) return token;
          return `[[f:${buildFormulaBody(nextExpression, displayMode)}]]`;
        }),
      };
    });
  };

  const openCounterPopup = (
    event: ReactMouseEvent<HTMLButtonElement>,
    targetIndex: number,
    current: number,
    name: string | null,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setFormulaPopup(null);
    setCounterPopup({
      targetIndex,
      anchorX: rect.left + rect.width / 2,
      anchorY: rect.bottom,
      value: clampCounterValue(current),
      name: name ?? "",
    });
  };

  const setCounterPopupName = (name: string) => {
    if (!counterPopup) return;
    const normalized = name.trim();
    setCounterPopup((prev) => (prev ? { ...prev, name: normalized } : prev));
    if (normalized.length > 0 && !COUNTER_NAME_PATTERN.test(normalized)) return;
    updateInlineCounterName(counterPopup.targetIndex, normalized.length > 0 ? normalized : null);
  };

  const stepPopupCounterDigit = (digitStep: number, delta: 1 | -1) => {
    if (!counterPopup) return;
    const nextValue = clampCounterValue(counterPopup.value + digitStep * delta);
    updateInlineCounter(counterPopup.targetIndex, () => nextValue);
    setCounterPopup((prev) => (prev ? { ...prev, value: nextValue } : prev));
  };

  const closeCounterPopup = () => {
    setCounterPopup(null);
  };

  const openFormulaPopup = (
    event: ReactMouseEvent<HTMLButtonElement>,
    targetIndex: number,
    expression: string,
    displayMode: FormulaDisplayMode,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCounterPopup(null);
    setFormulaPopup({
      targetIndex,
      anchorX: rect.left + rect.width / 2,
      anchorY: rect.bottom,
      expression,
      displayMode,
    });
  };

  const setFormulaPopupExpression = (expression: string) => {
    setFormulaPopup((prev) => (prev ? { ...prev, expression } : prev));
  };

  const setFormulaPopupDisplayMode = (displayMode: FormulaDisplayMode) => {
    setFormulaPopup((prev) => (prev ? { ...prev, displayMode } : prev));
  };

  const applyFormulaPopup = () => {
    if (!formulaPopup) return;
    updateInlineFormula(
      formulaPopup.targetIndex,
      formulaPopup.expression,
      formulaPopup.displayMode,
    );
    setFormulaPopup(null);
  };

  const closeFormulaPopup = () => {
    setFormulaPopup(null);
  };

  const copyRawMemoToClipboard = async () => {
    if (typeof navigator === "undefined" || typeof navigator.clipboard?.writeText !== "function") {
      throw new Error("このブラウザではクリップボードへのコピーに対応していません。");
    }
    await navigator.clipboard.writeText(draft.memo);
  };

  const copyResolvedMemoToClipboard = async () => {
    if (typeof navigator === "undefined" || typeof navigator.clipboard?.writeText !== "function") {
      throw new Error("このブラウザではクリップボードへのコピーに対応していません。");
    }
    await navigator.clipboard.writeText(resolvedMemoText);
  };

  const copyTemplateMemoToClipboard = async () => {
    if (typeof navigator === "undefined" || typeof navigator.clipboard?.writeText !== "function") {
      throw new Error("このブラウザではクリップボードへのコピーに対応していません。");
    }
    await navigator.clipboard.writeText(resetCounterValues(draft.memo));
  };

  const copyResolvedMemoImageToClipboard = async () => {
    if (typeof navigator === "undefined" || typeof navigator.clipboard?.write !== "function") {
      throw new Error("このブラウザでは画像コピーに対応していません。");
    }
    if (typeof ClipboardItem === "undefined") {
      throw new Error("このブラウザでは画像コピーに対応していません。");
    }

    const blob = await renderMemoTextImage(resolvedMemoText, memoFontSizeLevel);
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
  };

  const downloadResolvedMemoImage = async () => {
    const blob = await renderMemoTextImage(resolvedMemoText, memoFontSizeLevel);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileTimestamp = new Date().toISOString().replace(/[:.]/g, "-");

    link.href = url;
    link.download = `memo-${fileTimestamp}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const openTemplateModal = () => {
    saveMemoEditor();
    templateModalRef.current?.showModal();
  };

  const applyTemplate = (template: MemoTemplate) => {
    if (draft.memo.trim().length > 0) {
      setPendingApplyTemplateId(template.id);
      templateModalRef.current?.close();
      applyTemplateModalRef.current?.showModal();
      return;
    }

    setDraft((prev) => ({
      ...prev,
      memo: template.memo,
      fontSizeLevel: normalizeFontSizeLevel(template.fontSizeLevel),
    }));
    setCounterPopup(null);
    setFormulaPopup(null);
    templateModalRef.current?.close();
  };

  const confirmApplyTemplate = () => {
    if (!pendingApplyTemplate) return;
    setDraft((prev) => ({
      ...prev,
      memo: pendingApplyTemplate.memo,
      fontSizeLevel: normalizeFontSizeLevel(pendingApplyTemplate.fontSizeLevel),
    }));
    setCounterPopup(null);
    setFormulaPopup(null);
    setPendingApplyTemplateId(null);
    applyTemplateModalRef.current?.close();
  };

  const cancelApplyTemplate = () => {
    setPendingApplyTemplateId(null);
    applyTemplateModalRef.current?.close();
    templateModalRef.current?.showModal();
  };

  const confirmUrlMemoOverwrite = () => {
    if (pendingUrlMemo) {
      setDraft((prev) => (prev.memo === pendingUrlMemo ? prev : { ...prev, memo: pendingUrlMemo }));
    }
    setPendingUrlMemo(null);
    setIsUrlMemoHydrated(true);
    urlMemoConfirmModalRef.current?.close();
  };

  const cancelUrlMemoOverwrite = () => {
    setPendingUrlMemo(null);
    setIsUrlMemoHydrated(true);
    urlMemoConfirmModalRef.current?.close();
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
    deleteTemplateModalRef.current?.close();
    templateModalRef.current?.showModal();
  };

  const deleteTemplate = () => {
    if (!pendingDeleteTemplateId) return;
    setTemplates((prev) =>
      Array.isArray(prev) ? prev.filter((item) => item.id !== pendingDeleteTemplateId) : [],
    );
    setPendingDeleteTemplateId(null);
  };

  return {
    draft,
    isMemoFocused,
    keyboardInset,
    selectedCategoryKey,
    memoRef,
    templateModalRef,
    applyTemplateModalRef,
    configModalRef,
    clearModalRef,
    deleteTemplateModalRef,
    urlMemoConfirmModalRef,
    templateList,
    memoHistoryList,
    pendingUrlMemo,
    pendingApplyTemplate,
    pendingDeleteTemplate,
    counterPopup,
    isCounterPopupNameInvalid,
    formulaPopup,
    isFormulaPopupExpressionInvalid,
    memoParts,
    formulaResults,
    formulaVariableList,
    memoFontSizeLevel,
    formulaRoundDecimalPlaces: normalizeFormulaRoundDecimalPlaces(draft.formulaRoundDecimalPlaces),
    memoFontSizeClass,
    inlineControlSize,
    setMemo,
    setFontSizeLevel,
    setFormulaRoundDecimalPlaces,
    setSelectedCategoryKey,
    setIsMemoFocused,
    clearDraft,
    createNewMemo,
    restoreMemoHistory,
    handleMemoBlur,
    insertTemplateItem,
    focusMemoEditor,
    saveMemoEditor,
    stepInlineCounter,
    openCounterPopup,
    openFormulaPopup,
    setCounterPopupName,
    stepPopupCounterDigit,
    closeCounterPopup,
    setFormulaPopupExpression,
    setFormulaPopupDisplayMode,
    applyFormulaPopup,
    closeFormulaPopup,
    copyRawMemoToClipboard,
    copyResolvedMemoToClipboard,
    copyTemplateMemoToClipboard,
    copyResolvedMemoImageToClipboard,
    downloadResolvedMemoImage,
    openTemplateModal,
    applyTemplate,
    confirmApplyTemplate,
    cancelApplyTemplate,
    confirmUrlMemoOverwrite,
    cancelUrlMemoOverwrite,
    saveCurrentAsTemplate,
    requestDeleteTemplate,
    clearPendingDeleteTemplate,
    deleteTemplate,
  };
}
