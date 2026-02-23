import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef } from "react";
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_COUNTER_ITEM_LABEL,
  TEMPLATE_FORMULA_ITEM_LABEL,
} from "../constants";
import type { TemplateCategory } from "../constants";

interface StampProps {
  visible: boolean;
  keyboardInset: number;
  floatingGap: number;
  selectedCategoryKey: TemplateCategory["key"] | null;
  onSelectCategoryKey: (key: TemplateCategory["key"] | null) => void;
  onInsertCategoryItem: (item: string) => void;
  onOccupiedHeightChange?: (occupiedHeight: number) => void;
}

export function Stamp({
  visible,
  keyboardInset,
  floatingGap,
  selectedCategoryKey,
  onSelectCategoryKey,
  onInsertCategoryItem,
  onOccupiedHeightChange,
}: StampProps) {
  const stampRef = useRef<HTMLDivElement>(null);
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

    const stampElement = stampRef.current;
    if (!stampElement) {
      onOccupiedHeightChange(0);
      return;
    }

    const updateLayout = () => {
      const rect = stampElement.getBoundingClientRect();
      const viewportBottom = window.visualViewport
        ? window.visualViewport.height + window.visualViewport.offsetTop
        : window.innerHeight;
      onOccupiedHeightChange(Math.max(0, Math.ceil(viewportBottom - rect.top)));
    };

    updateLayout();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateLayout);
      observer.observe(stampElement);
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
      ref={stampRef}
      data-stamp-root="true"
      className="fixed inset-x-0 z-50 px-2 pb-2"
      style={{
        bottom: `calc(${keyboardInset}px + env(safe-area-inset-bottom, 0px) + ${floatingGap}px)`,
      }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="border-base-300 bg-base-100/95 rounded-xl border p-2 shadow-lg backdrop-blur">
          <div className="overflow-x-auto">
            <div className="join">
              {TEMPLATE_CATEGORIES.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  role="radio"
                  aria-checked={selectedCategory.key === category.key}
                  className={`join-item btn btn-sm gap-1 ${selectedCategory.key === category.key ? "btn-neutral" : ""}`}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => onSelectCategoryKey(category.key)}
                >
                  {category.key === "calc" ? (
                    <Icon icon="ic:baseline-widgets" className="size-4" aria-hidden />
                  ) : null}
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 overflow-x-auto">
            {selectedCategory.items.map((item) => (
              <button
                key={item}
                type="button"
                className="btn btn-sm btn-ghost shrink-0 gap-1 px-1.5"
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => onInsertCategoryItem(item)}
              >
                {item === TEMPLATE_COUNTER_ITEM_LABEL ? (
                  <Icon icon="mdi:counter" className="size-4 opacity-60" aria-hidden />
                ) : null}
                {item === TEMPLATE_FORMULA_ITEM_LABEL ? (
                  <Icon icon="mdi:calculator" className="size-4 opacity-60" aria-hidden />
                ) : null}
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
