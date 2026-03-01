import { Icon } from "@iconify/react";
import { useMemo } from "react";
import type { ChangeEvent, MouseEvent as ReactMouseEvent, ReactNode, RefObject } from "react";
import type { InlineControlSize, MemoPart } from "../hooks/useMemoEditor";
import { EMPTY_MEMO_PLACEHOLDER } from "../constants";
import { InlineCounter } from "./InlineCounter";
import { InlineFormula } from "./InlineFormula";

interface MemoEditorProps {
  memo: string;
  memoRef: RefObject<HTMLTextAreaElement | null>;
  isMemoFocused: boolean;
  isMemoLocked: boolean;
  isStampVisible: boolean;
  editingTopMargin: number;
  editingBottomMargin: number;
  memoParts: MemoPart[];
  formulaResults: Map<number, string>;
  memoFontSizeClass: string;
  inlineControlSize: InlineControlSize;
  onMemoFocus: () => void;
  onMemoBlur: () => void;
  onMemoChange: (memo: string) => void;
  onFocusEditor: (cursorPosition?: number) => void;
  onLockedAction: () => void;
  onSaveEditor: () => void;
  onToggleStamp: () => void;
  onStepInlineCounter: (targetIndex: number, delta: number) => void;
  onOpenCounterPopup: (
    event: ReactMouseEvent<HTMLButtonElement>,
    targetIndex: number,
    current: number,
    name: string | null,
  ) => void;
  onOpenFormulaPopup: (
    event: ReactMouseEvent<HTMLButtonElement>,
    targetIndex: number,
    expression: string,
    displayMode: Extract<MemoPart, { type: "formula" }>["displayMode"],
  ) => void;
}

interface PreviewPart {
  part: MemoPart;
  start: number;
  end: number;
}

interface TextFragment {
  type: "text" | "link";
  value: string;
  url?: string;
}

const MARKDOWN_LINK_PATTERN = /\[(?!\[)([^\]]*)\]\(([^)]+)\)/g;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseTextFragments(value: string): TextFragment[] {
  const fragments: TextFragment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = MARKDOWN_LINK_PATTERN.exec(value)) !== null) {
    if (match.index > lastIndex) {
      fragments.push({ type: "text", value: value.slice(lastIndex, match.index) });
    }

    const rawLabel = match[1].trim();
    const rawUrl = match[2].trim();
    if (rawUrl.length === 0) {
      fragments.push({ type: "text", value: match[0] });
    } else {
      fragments.push({ type: "link", value: rawLabel.length > 0 ? rawLabel : rawUrl, url: rawUrl });
    }

    lastIndex = MARKDOWN_LINK_PATTERN.lastIndex;
  }

  if (lastIndex < value.length) {
    fragments.push({ type: "text", value: value.slice(lastIndex) });
  }

  if (fragments.length === 0) {
    fragments.push({ type: "text", value });
  }

  MARKDOWN_LINK_PATTERN.lastIndex = 0;
  return fragments;
}

function buildLinkedTextNodes(
  value: string,
  keyPrefix: string,
  onLinkClick: (event: ReactMouseEvent<HTMLAnchorElement>) => void,
): ReactNode[] {
  const fragments = parseTextFragments(value);

  return fragments.map((fragment, index) => {
    if (fragment.type === "text") {
      return <span key={`${keyPrefix}-text-${index}`}>{fragment.value}</span>;
    }

    return (
      <a
        key={`${keyPrefix}-link-${index}`}
        href={fragment.url}
        target="_blank"
        rel="noreferrer"
        className="link link-primary break-all"
        onClick={onLinkClick}
      >
        {fragment.value}
      </a>
    );
  });
}

function buildPreviewParts(memo: string, memoParts: MemoPart[]): PreviewPart[] {
  const tokenMatcher = /\[\[c:[^\]]+\]\]|\[\[f:[^\]]+\]\]/g;
  const parts: PreviewPart[] = [];
  let cursor = 0;

  memoParts.forEach((part) => {
    if (part.type === "text") {
      const next = cursor + part.value.length;
      parts.push({ part, start: cursor, end: next });
      cursor = next;
      return;
    }

    tokenMatcher.lastIndex = cursor;
    const match = tokenMatcher.exec(memo);

    if (match && match.index === cursor) {
      const next = cursor + match[0].length;
      parts.push({ part, start: cursor, end: next });
      cursor = next;
      return;
    }

    const fallbackToken =
      part.type === "formula"
        ? `[[f:${part.expression}${part.displayMode === "auto" ? "" : `;fmt=${part.displayMode}`}]]`
        : part.name
          ? `[[c:${part.name}=${part.value}]]`
          : `[[c:${part.value}]]`;
    const next = cursor + fallbackToken.length;
    parts.push({ part, start: cursor, end: next });
    cursor = next;
  });

  return parts;
}

function getPreviewPartElement(node: Node | null, container: HTMLElement): HTMLElement | null {
  if (!node) return null;
  const sourceElement =
    node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  if (!sourceElement) return null;

  const target = sourceElement.closest<HTMLElement>("[data-memo-start][data-memo-end]");
  if (!target || !container.contains(target)) return null;
  return target;
}

function getPositionFromPartElement(
  element: HTMLElement,
  clientX: number,
  offsetNode: Node | null,
  offset: number | null,
): number | null {
  const start = Number(element.dataset.memoStart);
  const end = Number(element.dataset.memoEnd);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (end < start) return null;

  if (element.dataset.memoType === "text" && offsetNode && typeof offset === "number") {
    const ownerDocument = element.ownerDocument;
    const walker = ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let accumulated = 0;
    let currentNode = walker.nextNode();

    while (currentNode) {
      const textNode = currentNode as Text;
      const textLength = textNode.nodeValue?.length ?? 0;
      if (textNode === offsetNode) {
        const boundedOffset = clamp(offset, 0, textLength);
        return clamp(start + accumulated + boundedOffset, start, end);
      }
      accumulated += textLength;
      currentNode = walker.nextNode();
    }
  }

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0) return start;
  return clientX <= rect.left + rect.width / 2 ? start : end;
}

function getCursorPositionFromPreviewClick(
  event: ReactMouseEvent<HTMLDivElement>,
  fallbackPosition: number,
): number {
  const container = event.currentTarget;
  const documentWithCaret = container.ownerDocument as Document & {
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };

  if (typeof documentWithCaret.caretPositionFromPoint === "function") {
    const caret = documentWithCaret.caretPositionFromPoint(event.clientX, event.clientY);
    if (caret) {
      const partElement = getPreviewPartElement(caret.offsetNode, container);
      if (partElement) {
        const position = getPositionFromPartElement(
          partElement,
          event.clientX,
          caret.offsetNode,
          caret.offset,
        );
        if (typeof position === "number") return position;
      }
    }
  }

  if (typeof documentWithCaret.caretRangeFromPoint === "function") {
    const range = documentWithCaret.caretRangeFromPoint(event.clientX, event.clientY);
    if (range) {
      const partElement = getPreviewPartElement(range.startContainer, container);
      if (partElement) {
        const position = getPositionFromPartElement(
          partElement,
          event.clientX,
          range.startContainer,
          range.startOffset,
        );
        if (typeof position === "number") return position;
      }
    }
  }

  const elementAtPoint = container.ownerDocument.elementFromPoint(event.clientX, event.clientY);
  const partElement = getPreviewPartElement(elementAtPoint, container);
  if (partElement) {
    const position = getPositionFromPartElement(partElement, event.clientX, null, null);
    if (typeof position === "number") return position;
  }

  return fallbackPosition;
}

export function Editor({
  memo,
  memoRef,
  isMemoFocused,
  isMemoLocked,
  isStampVisible,
  editingTopMargin,
  editingBottomMargin,
  memoParts,
  formulaResults,
  memoFontSizeClass,
  inlineControlSize,
  onMemoFocus,
  onMemoBlur,
  onMemoChange,
  onFocusEditor,
  onLockedAction,
  onSaveEditor,
  onToggleStamp,
  onStepInlineCounter,
  onOpenCounterPopup,
  onOpenFormulaPopup,
}: MemoEditorProps) {
  const handleMemoChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onMemoChange(event.target.value);
  };
  const previewParts = useMemo(() => buildPreviewParts(memo, memoParts), [memo, memoParts]);
  const handleLinkClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  };

  const handlePreviewClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (isMemoLocked) {
      onLockedAction();
      return;
    }
    const cursorPosition = getCursorPositionFromPreviewClick(event, memo.length);
    onFocusEditor(cursorPosition);
  };

  const editingMarginStyle =
    isMemoFocused && (editingTopMargin > 0 || editingBottomMargin > 0)
      ? {
          marginTop: `${editingTopMargin}px`,
          marginBottom: `${editingBottomMargin}px`,
        }
      : undefined;

  return (
    <div className="card min-h-0 flex-1" style={editingMarginStyle}>
      <div className="card-body flex min-h-0 flex-col p-0">
        <div className="form-control relative min-h-0 flex-1">
          {isMemoFocused ? (
            <>
              <textarea
                ref={memoRef}
                className={`textarea textarea-bordered h-full min-h-0 w-full overscroll-y-contain border-transparent pr-20 pb-16 shadow-none focus:border-transparent focus:outline-none ${memoFontSizeClass} ${inlineControlSize.lineHeightClass}`}
                placeholder={EMPTY_MEMO_PLACEHOLDER}
                value={memo}
                onFocus={onMemoFocus}
                onBlur={onMemoBlur}
                onChange={handleMemoChange}
              />
              <div className="pointer-events-none absolute inset-0">
                <div className="pointer-events-auto absolute right-3 bottom-3 flex flex-col items-end gap-2">
                  <button
                    type="button"
                    className={`btn btn-circle btn-lg shadow-lg ${isStampVisible ? "btn-info" : "btn-ghost bg-base-100"}`}
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={onToggleStamp}
                    aria-label={isStampVisible ? "スタンプをオフ" : "スタンプをオン"}
                  >
                    <Icon icon="fa-solid:stamp" className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg btn-circle shadow-lg"
                    onClick={onSaveEditor}
                    aria-label="save"
                  >
                    <Icon icon="fa6-solid:check" className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div
              className={`textarea textarea-bordered h-full min-h-0 w-full overflow-y-auto whitespace-pre-wrap ${isMemoLocked ? "cursor-default" : "cursor-text"} ${memoFontSizeClass} ${inlineControlSize.lineHeightClass}`}
              onClick={handlePreviewClick}
            >
              {memoParts.length === 0 ? (
                <span className="opacity-40">{EMPTY_MEMO_PLACEHOLDER}</span>
              ) : (
                previewParts.map(({ part, start, end }, index) =>
                  part.type === "text" ? (
                    <span
                      key={`text-${index}`}
                      data-memo-start={start}
                      data-memo-end={end}
                      data-memo-type="text"
                    >
                      {buildLinkedTextNodes(part.value, `text-${index}`, handleLinkClick)}
                    </span>
                  ) : part.type === "counter" ? (
                    <span
                      key={`counter-${part.index}`}
                      data-memo-start={start}
                      data-memo-end={end}
                      data-memo-type="counter"
                    >
                      <InlineCounter
                        part={part}
                        inlineControlSize={inlineControlSize}
                        onStepInlineCounter={onStepInlineCounter}
                        onOpenCounterPopup={onOpenCounterPopup}
                      />
                    </span>
                  ) : (
                    <span
                      key={`formula-${part.index}`}
                      data-memo-start={start}
                      data-memo-end={end}
                      data-memo-type="formula"
                    >
                      <InlineFormula
                        part={part}
                        result={formulaResults.get(part.index) ?? "--"}
                        inlineControlSize={inlineControlSize}
                        disabled={isMemoLocked}
                        onDisabledClick={onLockedAction}
                        onOpenFormulaPopup={onOpenFormulaPopup}
                      />
                    </span>
                  ),
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
