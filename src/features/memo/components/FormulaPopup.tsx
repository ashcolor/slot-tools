import { Icon } from "@iconify/react";
import { flip, offset, shift, useFloating, type VirtualElement } from "@floating-ui/react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useLayoutEffect, useMemo, useRef } from "react";

const FORMULA_SYMBOL_BUTTONS = [
  { symbol: "+", icon: "mdi:plus", label: "Add" },
  { symbol: "-", icon: "mdi:minus", label: "Subtract" },
  { symbol: "*", icon: "mdi:multiplication", label: "Multiply" },
  { symbol: "/", icon: "mdi:division", label: "Divide" },
  { symbol: "(", icon: "mdi:chevron-left", label: "Open Parenthesis" },
  { symbol: ")", icon: "mdi:chevron-right", label: "Close Parenthesis" },
] as const;

interface FormulaVariable {
  name: string;
  value: number;
}

interface MemoFormulaPopupProps {
  expression: string;
  isExpressionInvalid: boolean;
  anchorX: number;
  anchorY: number;
  variables: FormulaVariable[];
  onClose: () => void;
  onExpressionChange: (value: string) => void;
  onConfirm: () => void;
}

export function FormulaPopup({
  expression,
  isExpressionInvalid,
  anchorX,
  anchorY,
  variables,
  onClose,
  onExpressionChange,
  onConfirm,
}: MemoFormulaPopupProps) {
  const expressionInputRef = useRef<HTMLInputElement>(null);
  const { refs, floatingStyles } = useFloating({
    open: true,
    strategy: "fixed",
    placement: "bottom",
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
  });
  const { setReference, setFloating } = refs;
  const virtualReference = useMemo<VirtualElement>(
    () => ({
      getBoundingClientRect: () => new DOMRect(anchorX, anchorY, 0, 0),
    }),
    [anchorX, anchorY],
  );

  useLayoutEffect(() => {
    setReference(virtualReference);
  }, [setReference, virtualReference]);

  const handleExpressionChange = (event: ChangeEvent<HTMLInputElement>) => {
    onExpressionChange(event.target.value);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    onConfirm();
  };

  const insertExpressionText = (text: string) => {
    const input = expressionInputRef.current;
    const start = input?.selectionStart ?? expression.length;
    const end = input?.selectionEnd ?? expression.length;
    const nextExpression = `${expression.slice(0, start)}${text}${expression.slice(end)}`;
    const nextCursor = start + text.length;
    onExpressionChange(nextExpression);

    requestAnimationFrame(() => {
      const field = expressionInputRef.current;
      if (!field) return;
      field.focus();
      field.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const handleVariableClick = (name: string) => {
    insertExpressionText(name);
  };

  const handleSymbolClick = (symbol: string) => {
    insertExpressionText(symbol);
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={(node) => {
          setFloating(node);
        }}
        className="z-50"
        style={floatingStyles}
      >
        <div
          className="card bg-base-100 border-base-300 w-[min(92vw,34rem)] border shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="card-body gap-3 p-4">
            <label className="form-control gap-1">
              <span className="text-xs opacity-70">式</span>
              <input
                ref={expressionInputRef}
                type="text"
                className={`input w-full font-mono ${isExpressionInvalid ? "input-error" : "input-bordered"}`}
                value={expression}
                onChange={handleExpressionChange}
                onKeyDown={handleInputKeyDown}
                autoFocus
              />
            </label>

            <div className="flex flex-col gap-1">
              <span className="text-xs opacity-70">変数</span>
              <div className="flex max-h-32 flex-wrap content-start gap-2 overflow-y-auto rounded-md p-1">
                {variables.length === 0 ? (
                  <span className="text-xs opacity-60">変数なし</span>
                ) : (
                  variables.map((variable) => (
                    <button
                      key={variable.name}
                      type="button"
                      className="btn btn-xs"
                      title={`${variable.name}：${variable.value}`}
                      onClick={() => handleVariableClick(variable.name)}
                    >
                      <span className="max-w-40 overflow-hidden font-mono text-ellipsis whitespace-nowrap">
                        {variable.name}：{variable.value}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs opacity-70">記号</span>
              <div className="flex flex-wrap gap-2">
                {FORMULA_SYMBOL_BUTTONS.map((button) => (
                  <button
                    key={button.symbol}
                    type="button"
                    className="btn btn-sm min-w-10"
                    aria-label={`Insert ${button.symbol}`}
                    title={button.label}
                    onClick={() => handleSymbolClick(button.symbol)}
                  >
                    <Icon icon={button.icon} className="size-4" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 items-center">
              <button
                type="button"
                className="btn btn-xs btn-circle btn-error btn-soft justify-self-start"
                aria-label="Cancel"
                onClick={onClose}
              >
                <Icon icon="mdi:close" className="size-4" />
              </button>
              <button
                type="button"
                className="btn btn-xs btn-circle btn-primary justify-self-end"
                aria-label="Confirm"
                onClick={onConfirm}
              >
                <Icon icon="mdi:check" className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
