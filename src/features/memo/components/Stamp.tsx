import { Icon } from "@iconify/react";
import { useMemo } from "react";
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_COUNTER_ITEM_LABEL,
  TEMPLATE_FORMULA_ITEM_LABEL,
} from "../constants";
import type { TemplateCategory } from "../constants";

interface StampProps {
  visible: boolean;
  selectedCategoryKey: TemplateCategory["key"] | null;
  onSelectCategoryKey: (key: TemplateCategory["key"] | null) => void;
  onInsertCategoryItem: (item: string) => void;
}

export function Stamp({
  visible,
  selectedCategoryKey,
  onSelectCategoryKey,
  onInsertCategoryItem,
}: StampProps) {
  const selectedCategory = useMemo(() => {
    const fallback = TEMPLATE_CATEGORIES[0];
    return TEMPLATE_CATEGORIES.find((category) => category.key === selectedCategoryKey) ?? fallback;
  }, [selectedCategoryKey]);

  if (!visible) return null;

  return (
    <div data-stamp-root="true" className="z-10 w-full shrink-0">
      <div
        className="border-base-300 bg-base-100/98 border-t px-2 pt-1 backdrop-blur"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.25rem)" }}
      >
        <div className="mx-auto max-w-4xl">
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
          <div className="mt-1 flex items-center gap-1 overflow-x-auto">
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
