import { useEffect, useMemo, useRef } from "react";
import { TEMPLATE_CATEGORIES } from "../constants";
import type { TemplateCategory } from "../constants";

interface TemplateKeyboardProps {
  visible: boolean;
  keyboardInset: number;
  selectedCategoryKey: TemplateCategory["key"] | null;
  onSelectCategoryKey: (key: TemplateCategory["key"] | null) => void;
  onInsertCategoryItem: (item: string) => void;
  onSave: () => void;
  onHeightChange?: (height: number) => void;
}

export function TemplateKeyboard({
  visible,
  keyboardInset,
  selectedCategoryKey,
  onSelectCategoryKey,
  onInsertCategoryItem,
  onSave,
  onHeightChange,
}: TemplateKeyboardProps) {
  const keyboardRef = useRef<HTMLDivElement>(null);
  const selectedCategory = useMemo(() => {
    const fallback = TEMPLATE_CATEGORIES[0];
    return TEMPLATE_CATEGORIES.find((category) => category.key === selectedCategoryKey) ?? fallback;
  }, [selectedCategoryKey]);

  useEffect(() => {
    if (!onHeightChange) return;
    if (!visible) {
      onHeightChange(0);
      return;
    }

    const keyboardElement = keyboardRef.current;
    if (!keyboardElement) {
      onHeightChange(0);
      return;
    }

    const updateHeight = () => {
      onHeightChange(Math.ceil(keyboardElement.getBoundingClientRect().height));
    };

    updateHeight();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateHeight);
      observer.observe(keyboardElement);
      return () => observer.disconnect();
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateHeight);
      return () => window.removeEventListener("resize", updateHeight);
    }
  }, [onHeightChange, visible]);

  if (!visible) return null;

  return (
    <div
      ref={keyboardRef}
      className="fixed inset-x-0 z-50 px-2 pb-2"
      style={{ bottom: `calc(${keyboardInset}px + env(safe-area-inset-bottom, 0px))` }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-2 px-2 flex justify-center">
          <button type="button" className="btn btn-primary btn-sm" onClick={onSave}>
            保存
          </button>
        </div>
        <div className="border border-base-300 bg-base-100/95 backdrop-blur rounded-xl shadow-lg p-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {TEMPLATE_CATEGORIES.map((category) => (
              <button
                key={category.key}
                type="button"
                className={`btn btn-sm px-1 shrink-0 ${selectedCategory.key === category.key ? "btn-neutral" : "btn-ghost"}`}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => onSelectCategoryKey(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 overflow-x-auto mt-2">
            {selectedCategory.items.map((item) => (
              <button
                key={item}
                type="button"
                className="btn btn-sm btn-ghost px-1.5 shrink-0"
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => onInsertCategoryItem(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
