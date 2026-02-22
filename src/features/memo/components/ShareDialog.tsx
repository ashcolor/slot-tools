import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

interface ShareDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  onCopyRawMemo: () => Promise<void>;
  onCopyResolvedMemo: () => Promise<void>;
  onCopyTemplateMemo: () => Promise<void>;
  onCopyResolvedMemoImage: () => Promise<void>;
  onDownloadResolvedMemoImage: () => Promise<void>;
}

type CopyActionKey = "raw" | "resolved" | "template" | "image";

export function ShareDialog({
  dialogRef,
  onCopyRawMemo,
  onCopyResolvedMemo,
  onCopyTemplateMemo,
  onCopyResolvedMemoImage,
  onDownloadResolvedMemoImage,
}: ShareDialogProps) {
  const copiedTimerRef = useRef<number | null>(null);
  const [copiedActionKey, setCopiedActionKey] = useState<CopyActionKey | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  const setCopiedWithReset = (actionKey: CopyActionKey) => {
    setCopiedActionKey(actionKey);
    if (copiedTimerRef.current !== null) {
      window.clearTimeout(copiedTimerRef.current);
    }
    copiedTimerRef.current = window.setTimeout(() => {
      setCopiedActionKey(null);
      copiedTimerRef.current = null;
    }, 1400);
  };

  const runShareAction = async (action: () => Promise<void>, actionKey?: CopyActionKey) => {
    try {
      await action();
      if (actionKey) {
        setCopiedWithReset(actionKey);
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message.length > 0
          ? error.message
          : "共有処理に失敗しました。";
      window.alert(message);
    }
  };

  const copyIcon = (actionKey: CopyActionKey) =>
    copiedActionKey === actionKey ? "fa6-solid:check" : "fa6-regular:clipboard";

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box">
        <h3 className="mb-1 text-lg font-bold">共有</h3>

        <div className="flex flex-col gap-4">
          <section className="flex flex-col gap-2">
            <p className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide opacity-70">
              <Icon icon="fa6-regular:file-lines" className="size-3.5" />
              <span>テキスト</span>
            </p>
            <button
              type="button"
              className="btn btn-primary btn-soft justify-start"
              onClick={() => void runShareAction(onCopyResolvedMemo, "resolved")}
            >
              <Icon icon={copyIcon("resolved")} className="size-4" />
              <span>結果コピー</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-soft justify-start"
              onClick={() => void runShareAction(onCopyRawMemo, "raw")}
            >
              <Icon icon={copyIcon("raw")} className="size-4" />
              <span>数式のままコピー</span>
            </button>
          </section>

          <section className="flex flex-col gap-2">
            <p className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide opacity-70">
              <Icon icon="fa6-regular:image" className="size-3.5" />
              <span>画像</span>
            </p>
            <button
              type="button"
              className="btn btn-primary btn-soft justify-start"
              onClick={() => void runShareAction(onCopyResolvedMemoImage, "image")}
            >
              <Icon icon={copyIcon("image")} className="size-4" />
              <span>コピー</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-soft justify-start"
              onClick={() => void runShareAction(onDownloadResolvedMemoImage)}
            >
              <Icon icon="fa6-solid:download" className="size-4" />
              <span>ダウンロード</span>
            </button>
          </section>
        </div>

        <form method="dialog" className="mt-5 flex justify-end">
          <button type="submit" className="btn">
            閉じる
          </button>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" aria-label="共有モーダルを閉じる">
          close
        </button>
      </form>
    </dialog>
  );
}
