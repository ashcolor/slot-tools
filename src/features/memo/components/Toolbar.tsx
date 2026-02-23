import { Icon } from "@iconify/react";
import { useRef } from "react";
import { ShareDialog } from "./ShareDialog";

interface MemoToolbarProps {
  isMemoLocked: boolean;
  lockFeedbackNonce: number;
  onCopyRawMemo: () => Promise<void>;
  onCopyResolvedMemo: () => Promise<void>;
  onCopyTemplateMemo: () => Promise<void>;
  onCopyResolvedMemoImage: () => Promise<void>;
  onDownloadResolvedMemoImage: () => Promise<void>;
  onToggleMemoLock: () => void;
  onOpenTemplate: () => void;
  onOpenConfig: () => void;
  onOpenClear: () => void;
}

export function Toolbar({
  isMemoLocked,
  lockFeedbackNonce,
  onCopyRawMemo,
  onCopyResolvedMemo,
  onCopyTemplateMemo,
  onCopyResolvedMemoImage,
  onDownloadResolvedMemoImage,
  onToggleMemoLock,
  onOpenTemplate,
  onOpenConfig,
  onOpenClear,
}: MemoToolbarProps) {
  const shareDialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center gap-1">
        <button
          key={`memo-lock-feedback-${lockFeedbackNonce}`}
          type="button"
          className={`btn btn-ghost btn-sm btn-square transition ${isMemoLocked ? "text-primary" : ""} ${lockFeedbackNonce > 0 ? "memo-lock-shake" : ""}`}
          onClick={onToggleMemoLock}
          aria-label={isMemoLocked ? "Unlock memo editing" : "Lock memo editing"}
          title={isMemoLocked ? "Unlock memo editing" : "Lock memo editing"}
        >
          <Icon
            icon={isMemoLocked ? "mdi:lock" : "mdi:lock-open-variant-outline"}
            className="size-4"
          />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={() => shareDialogRef.current?.showModal()}
          aria-label="Share"
        >
          <Icon icon="lucide:share" className="size-4" />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={onOpenTemplate}
          aria-label="Template"
        >
          <Icon icon="mdi:text-box-multiple-outline" className="size-4" />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={onOpenConfig}
          aria-label="Config"
        >
          <Icon icon="fa6-solid:gear" className="size-4" />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={onOpenClear}
          aria-label="Clear"
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
