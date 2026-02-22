import { Icon } from "@iconify/react";

interface MemoToolbarProps {
  onOpenTemplate: () => void;
  onOpenConfig: () => void;
  onOpenClear: () => void;
}

export function Toolbar({ onOpenTemplate, onOpenConfig, onOpenClear }: MemoToolbarProps) {
  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={onOpenTemplate}
          aria-label="テンプレート"
        >
          <Icon icon="mdi:text-box-multiple-outline" className="size-4" />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={onOpenConfig}
          aria-label="設定"
        >
          <Icon icon="fa6-solid:gear" className="size-4" />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={onOpenClear}
          aria-label="クリア"
        >
          <Icon icon="fa6-regular:trash-can" className="size-4" />
        </button>
      </div>
    </div>
  );
}
