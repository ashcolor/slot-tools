import { Icon } from "@iconify/react";
import { useRef } from "react";
import { ShareDialog } from "./ShareDialog";

interface MemoToolbarProps {
  onCopyRawMemo: () => Promise<void>;
  onCopyResolvedMemo: () => Promise<void>;
  onCopyTemplateMemo: () => Promise<void>;
  onCopyResolvedMemoImage: () => Promise<void>;
  onDownloadResolvedMemoImage: () => Promise<void>;
  onOpenTemplate: () => void;
  onOpenConfig: () => void;
  onOpenClear: () => void;
}

export function Toolbar({
  onCopyRawMemo,
  onCopyResolvedMemo,
  onCopyTemplateMemo,
  onCopyResolvedMemoImage,
  onDownloadResolvedMemoImage,
  onOpenTemplate,
  onOpenConfig,
  onOpenClear,
}: MemoToolbarProps) {
  const shareDialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={() => shareDialogRef.current?.showModal()}
          aria-label="共有"
        >
          <Icon icon="lucide:share" className="size-4" />
        </button>
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

      <ShareDialog
        dialogRef={shareDialogRef}
        onCopyRawMemo={onCopyRawMemo}
        onCopyResolvedMemo={onCopyResolvedMemo}
        onCopyTemplateMemo={onCopyTemplateMemo}
        onCopyResolvedMemoImage={onCopyResolvedMemoImage}
        onDownloadResolvedMemoImage={onDownloadResolvedMemoImage}
      />
    </div>
  );
}
