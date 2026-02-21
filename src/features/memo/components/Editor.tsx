import type { ChangeEvent, MouseEvent as ReactMouseEvent, RefObject } from "react";
import type { InlineControlSize, MemoPart } from "../hooks/useMemoEditor";
import { EMPTY_MEMO_PLACEHOLDER } from "../constants";
import { InlineCounter } from "./InlineCounter";
import { InlineFormula } from "./InlineFormula";

interface MemoEditorProps {
  memo: string;
  memoRef: RefObject<HTMLTextAreaElement | null>;
  isMemoFocused: boolean;
  memoParts: MemoPart[];
  formulaResults: Map<number, string>;
  memoFontSizeClass: string;
  inlineControlSize: InlineControlSize;
  onMemoFocus: () => void;
  onMemoBlur: () => void;
  onMemoChange: (memo: string) => void;
  onFocusEditor: () => void;
  onStepInlineCounter: (targetIndex: number, delta: number) => void;
  onOpenCounterPopup: (
    event: ReactMouseEvent<HTMLButtonElement>,
    targetIndex: number,
    current: number,
  ) => void;
}

export function Editor({
  memo,
  memoRef,
  isMemoFocused,
  memoParts,
  formulaResults,
  memoFontSizeClass,
  inlineControlSize,
  onMemoFocus,
  onMemoBlur,
  onMemoChange,
  onFocusEditor,
  onStepInlineCounter,
  onOpenCounterPopup,
}: MemoEditorProps) {
  const handleMemoChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onMemoChange(event.target.value);
  };

  return (
    <div className="card flex-1 min-h-0">
      <div className="card-body p-0 flex flex-col min-h-0">
        <div className="form-control flex-1 min-h-0">
          {isMemoFocused ? (
            <textarea
              ref={memoRef}
              className={`textarea textarea-bordered h-full w-full min-h-0 ${memoFontSizeClass} ${inlineControlSize.lineHeightClass}`}
              placeholder={EMPTY_MEMO_PLACEHOLDER}
              value={memo}
              onFocus={onMemoFocus}
              onBlur={onMemoBlur}
              onChange={handleMemoChange}
            />
          ) : (
            <div
              className={`textarea textarea-bordered h-full w-full min-h-0 overflow-y-auto whitespace-pre-wrap cursor-text ${memoFontSizeClass} ${inlineControlSize.lineHeightClass}`}
              onClick={onFocusEditor}
            >
              {memoParts.length === 0 ? (
                <span className="opacity-40">{EMPTY_MEMO_PLACEHOLDER}</span>
              ) : (
                memoParts.map((part, index) =>
                  part.type === "text" ? (
                    <span key={`text-${index}`}>{part.value}</span>
                  ) : part.type === "counter" ? (
                    <InlineCounter
                      key={`counter-${part.index}`}
                      part={part}
                      inlineControlSize={inlineControlSize}
                      onStepInlineCounter={onStepInlineCounter}
                      onOpenCounterPopup={onOpenCounterPopup}
                    />
                  ) : (
                    <InlineFormula
                      key={`formula-${part.index}`}
                      part={part}
                      result={formulaResults.get(part.index) ?? "--"}
                      inlineControlSize={inlineControlSize}
                      onFocusEditor={onFocusEditor}
                    />
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
