import { useEffect, useMemo, useRef } from "react";
import { TEMPLATE_CATEGORIES } from "../constants";
import type { TemplateCategory } from "../constants";

interface TemplateKeyboardProps {
  visible: boolean;
  keyboardInset: number;
  floatingGap: number;
  selectedCategoryKey: TemplateCategory["key"] | null;
  onSelectCategoryKey: (key: TemplateCategory["key"] | null) => void;
  onInsertCategoryItem: (item: string) => void;
  onOccupiedHeightChange?: (occupiedHeight: number) => void;
}

export function TemplateKeyboard({
  visible,
  keyboardInset,
  floatingGap,
  selectedCategoryKey,
  onSelectCategoryKey,
  onInsertCategoryItem,
  onOccupiedHeightChange,
}: TemplateKeyboardProps) {
  const keyboardRef = useRef<HTMLDivElement>(null);
  const selectedCategory = useMemo(() => {
    const fallback = TEMPLATE_CATEGORIES[0];
    return TEMPLATE_CATEGORIES.find((category) => category.key === selectedCategoryKey) ?? fallback;
  }, [selectedCategoryKey]);

  useEffect(() => {
    if (!onOccupiedHeightChange) return;
    if (!visible) {
      onOccupiedHeightChange(0);
      return;
    }

    const keyboardElement = keyboardRef.current;
    if (!keyboardElement) {
      onOccupiedHeightChange(0);
      return;
    }

    const updateLayout = () => {
      const rect = keyboardElement.getBoundingClientRect();
      const viewportBottom = window.visualViewport
        ? window.visualViewport.height + window.visualViewport.offsetTop
        : window.innerHeight;
      onOccupiedHeightChange(Math.max(0, Math.ceil(viewportBottom - rect.top)));
    };

    updateLayout();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateLayout);
      observer.observe(keyboardElement);
      window.addEventListener("resize", updateLayout);
      return () => {
        observer.disconnect();
        window.removeEventListener("resize", updateLayout);
      };
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateLayout);
      return () => window.removeEventListener("resize", updateLayout);
    }
  }, [onOccupiedHeightChange, visible]);

  if (!visible) return null;

  return (
    <div
      ref={keyboardRef}
      className="fixed inset-x-0 z-50 px-2 pb-2"
      style={{ bottom: `calc(${keyboardInset}px + env(safe-area-inset-bottom, 0px) + ${floatingGap}px)` }}
    >
      <div className="mx-auto max-w-4xl">
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
