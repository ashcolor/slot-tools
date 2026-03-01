import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import type { MemoHistoryItem } from "../hooks/useMemoEditor";
import { HistoryDialog } from "./HistoryDialog";
import { LlmGuideDialog } from "./LlmGuideDialog";
import { NotationDialog } from "./NotationDialog";
import { ShareDialog } from "./ShareDialog";

interface MemoToolbarProps {
  isHeaderVisible: boolean;
  isMemoLocked: boolean;
  lockFeedbackNonce: number;
  memoHistoryList: MemoHistoryItem[];
  onCopyRawMemo: () => Promise<void>;
  onCopyResolvedMemo: () => Promise<void>;
  onCopyTemplateMemo: () => Promise<void>;
  onCopyResolvedMemoImage: () => Promise<void>;
  onDownloadResolvedMemoImage: () => Promise<void>;
  onCreateNewMemo: () => boolean;
  onRestoreMemoHistory: (historyId: string) => void;
  onDeleteMemoHistory: (historyId: string) => void;
  onClearMemoHistory: () => void;
  onToggleHeaderVisibility?: () => void;
  onToggleMemoLock: () => void;
  onOpenTemplate: () => void;
  onOpenConfig: () => void;
}

const LLM_MEMO_GUIDE_TEXT = `パチスロ用メモアプリのためのテキストを出力して。

## テキスト記法
- カウンター: [[c:name=0]]
  - name は英字または _ で開始し、以降は英数字と _ を使用
- 数式: [[f:big / game]]
- 数式の表示形式: [[f:big / game;fmt=percent]]
  - auto: 自動表示
  - percent: %表示
  - odds: 1/〇〇表示

## テキスト例
\`\`\`
【機種名】
■ゲーム数
ゲーム数：[[c:game=0]]
BIG：[[c:big=0]] [[f:big / game;fmt=odds]]
※ 設定1：1/300、設定6：1/250
REG：[[c:reg=0]] [[f:reg / game;fmt=odds]]
※ 設定1：1/300、設定6：1/250

■小役カウント
ベル：[[c:bell=0]] [[f:bell / game;fmt=odds]]
※ 多いほど高設定期待
チェリー：[[c:cherry=0]] [[f:cherry / game;fmt=odds]]
※ 多いほど高設定期待

■参照サイト
- [DMMぱちタウン](https://p-town.dmm.com/machines/4602)
- [一撃](https://1geki.jp/slot/l_godeater_r/)
\`\`\`

## 注意事項
- 必ずWeb検索を行い、最新の情報を取得すること
- メモ内容だけを出力すること
- :contentReferenceを絶対に使用しないこと

## 作成するテキストの内容
以下に記載されている機種名、またはURLのパチスロ情報を検索し、設定推測ポイントをテキストに反映する。
検索する際はDMMぱちタウンと一撃を優先的に参照すること。

機種名、またはURL：`;

export function Toolbar({
  isHeaderVisible,
  isMemoLocked,
  lockFeedbackNonce,
  memoHistoryList,
  onCopyRawMemo,
  onCopyResolvedMemo,
  onCopyTemplateMemo,
  onCopyResolvedMemoImage,
  onDownloadResolvedMemoImage,
  onCreateNewMemo,
  onRestoreMemoHistory,
  onDeleteMemoHistory,
  onClearMemoHistory,
  onToggleHeaderVisibility,
  onToggleMemoLock,
  onOpenTemplate,
  onOpenConfig,
}: MemoToolbarProps) {
  const shareDialogRef = useRef<HTMLDialogElement>(null);
  const notationDialogRef = useRef<HTMLDialogElement>(null);
  const llmGuideDialogRef = useRef<HTMLDialogElement>(null);
  const historyDialogRef = useRef<HTMLDialogElement>(null);
  const llmCopiedTimerRef = useRef<number | null>(null);
  const newMemoToastTimerRef = useRef<number | null>(null);
  const [isLlmGuideCopied, setIsLlmGuideCopied] = useState(false);
  const [isNewMemoToastVisible, setIsNewMemoToastVisible] = useState(false);

  useEffect(() => {
    return () => {
      if (llmCopiedTimerRef.current !== null) {
        window.clearTimeout(llmCopiedTimerRef.current);
      }
      if (newMemoToastTimerRef.current !== null) {
        window.clearTimeout(newMemoToastTimerRef.current);
      }
    };
  }, []);

  const copyLlmGuide = async () => {
    try {
      if (
        typeof navigator === "undefined" ||
        typeof navigator.clipboard?.writeText !== "function"
      ) {
        throw new Error("このブラウザではクリップボードへのコピーに対応していません。");
      }
      await navigator.clipboard.writeText(LLM_MEMO_GUIDE_TEXT);
      setIsLlmGuideCopied(true);
      if (llmCopiedTimerRef.current !== null) {
        window.clearTimeout(llmCopiedTimerRef.current);
      }
      llmCopiedTimerRef.current = window.setTimeout(() => {
        setIsLlmGuideCopied(false);
        llmCopiedTimerRef.current = null;
      }, 1400);
    } catch (error) {
      const message =
        error instanceof Error && error.message.length > 0
          ? error.message
          : "LLM向け説明のコピーに失敗しました。";
      window.alert(message);
    }
  };

  const handleLlmGuideClick = () => {
    notationDialogRef.current?.close();
    requestAnimationFrame(() => {
      llmGuideDialogRef.current?.showModal();
    });
  };
  const handleCreateNewMemo = () => {
    const didSaveToHistory = onCreateNewMemo();
    if (!didSaveToHistory) return;

    setIsNewMemoToastVisible(true);
    if (newMemoToastTimerRef.current !== null) {
      window.clearTimeout(newMemoToastTimerRef.current);
    }
    newMemoToastTimerRef.current = window.setTimeout(() => {
      setIsNewMemoToastVisible(false);
      newMemoToastTimerRef.current = null;
    }, 1800);
  };

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={`btn btn-ghost btn-sm btn-square ${isHeaderVisible ? "text-primary" : ""}`}
          onClick={onToggleHeaderVisibility}
          aria-label={isHeaderVisible ? "Hide header" : "Show header"}
          title={isHeaderVisible ? "Hide header" : "Show header"}
        >
          <Icon
            icon={
              isHeaderVisible
                ? "fluent:window-header-horizontal-20-filled"
                : "fluent:window-header-horizontal-off-20-filled"
            }
            className="size-4"
          />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={handleCreateNewMemo}
          aria-label="New memo"
          title="新規"
        >
          <Icon icon="mdi:note-plus-outline" className="size-4" />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={() => notationDialogRef.current?.showModal()}
          aria-label="Memo notation help"
          title="メモ記法"
        >
          <Icon icon="bi:info-circle" className="size-4" />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={onOpenTemplate}
          aria-label="Template"
        >
          <Icon icon="mdi:text-box-multiple-outline" className="size-4" />
        </button>
      </div>

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
          onClick={() => historyDialogRef.current?.showModal()}
          aria-label="History"
          title="履歴"
        >
          <Icon icon="mdi:history" className="size-4" />
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
          onClick={onOpenConfig}
          aria-label="Config"
        >
          <Icon icon="fa6-solid:gear" className="size-4" />
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

      <HistoryDialog
        dialogRef={historyDialogRef}
        memoHistoryList={memoHistoryList}
        isMemoLocked={isMemoLocked}
        onRestoreMemoHistory={onRestoreMemoHistory}
        onDeleteMemoHistory={onDeleteMemoHistory}
        onClearMemoHistory={onClearMemoHistory}
      />

      {isNewMemoToastVisible ? (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success">
            <span className="text-sm">履歴に保存しました</span>
          </div>
        </div>
      ) : null}

      <NotationDialog
        dialogRef={notationDialogRef}
        isLlmGuideCopied={isLlmGuideCopied}
        onOpenLlmGuide={handleLlmGuideClick}
      />

      <LlmGuideDialog
        dialogRef={llmGuideDialogRef}
        guideText={LLM_MEMO_GUIDE_TEXT}
        isCopied={isLlmGuideCopied}
        onCopyGuide={() => void copyLlmGuide()}
      />
    </div>
  );
}
