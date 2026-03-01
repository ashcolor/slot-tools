import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import type { MemoHistoryItem } from "../hooks/useMemoEditor";
import { HistoryDialog } from "./HistoryDialog";
import { LlmGuideDialog } from "./LlmGuideDialog";
import { NotationDialog } from "./NotationDialog";
import { ResetCountersDialog } from "./ResetCountersDialog";
import { ShareDialog } from "./ShareDialog";

interface MemoToolbarProps {
  isHeaderVisible: boolean;
  isMemoLocked: boolean;
  lockFeedbackNonce: number;
  memoUrl: string;
  memoHistoryList: MemoHistoryItem[];
  onCopyResolvedMemo: () => Promise<void>;
  onCopyResolvedMemoImage: () => Promise<void>;
  onCopyMemoUrl: () => Promise<void>;
  onDownloadResolvedMemoImage: () => Promise<void>;
  onCreateNewMemo: () => boolean;
  onResetMemoCounters: () => void;
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
  memoUrl,
  memoHistoryList,
  onCopyResolvedMemo,
  onCopyResolvedMemoImage,
  onCopyMemoUrl,
  onDownloadResolvedMemoImage,
  onCreateNewMemo,
  onResetMemoCounters,
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
  const resetCountersDialogRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const llmCopiedTimerRef = useRef<number | null>(null);
  const [isLlmGuideCopied, setIsLlmGuideCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);

    if (typeof document === "undefined") return;

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement && menuRef.current?.contains(activeElement)) {
      activeElement.blur();
    }
  };

  useEffect(() => {
    return () => {
      if (llmCopiedTimerRef.current !== null) {
        window.clearTimeout(llmCopiedTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen || typeof document === "undefined") return;

    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      closeMenu();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

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

  const handleOpenNotation = () => {
    closeMenu();
    notationDialogRef.current?.showModal();
  };

  const handleOpenHistory = () => {
    closeMenu();
    historyDialogRef.current?.showModal();
  };

  const handleOpenTemplate = () => {
    closeMenu();
    onOpenTemplate();
  };

  const handleOpenShare = () => {
    closeMenu();
    shareDialogRef.current?.showModal();
  };

  const handleOpenConfig = () => {
    closeMenu();
    onOpenConfig();
  };

  const handleCreateNewMemo = () => {
    closeMenu();
    onCreateNewMemo();
  };

  const handleResetMemoCounters = () => {
    closeMenu();
    if (isMemoLocked) {
      onResetMemoCounters();
      return;
    }
    resetCountersDialogRef.current?.showModal();
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
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={handleOpenShare}
          aria-label="共有"
          title="共有"
        >
          <Icon icon="lucide:share" className="size-4" />
        </button>

        <div ref={menuRef} className={`dropdown dropdown-end ${isMenuOpen ? "dropdown-open" : ""}`}>
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-ghost btn-sm btn-square ${isMenuOpen ? "text-primary" : ""}`}
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label="メニュー"
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            title="メニュー"
          >
            <Icon icon="mdi:dots-vertical" className="size-4" />
          </div>

          <ul
            tabIndex={-1}
            className="dropdown-content menu z-[60] mt-1 w-56 rounded-box bg-base-100 p-2 shadow-sm"
            role="menu"
            aria-label="メモのメニュー"
          >
            <li role="none">
              <button type="button" role="menuitem" onClick={handleCreateNewMemo}>
                <Icon icon="mdi:note-plus-outline" className="size-4" />
                <span>新規</span>
              </button>
            </li>
            <li role="none">
              <button type="button" role="menuitem" onClick={handleOpenTemplate}>
                <Icon icon="mdi:text-box-multiple-outline" className="size-4" />
                <span>テンプレート</span>
              </button>
            </li>
            <li role="none">
              <button type="button" role="menuitem" onClick={handleResetMemoCounters}>
                <Icon icon="mdi:restore" className="size-4" />
                <span>カウンター初期化</span>
              </button>
            </li>
            <li role="none" aria-hidden="true">
              <hr className="my-1 border-base-300" />
            </li>
            <li role="none">
              <button type="button" role="menuitem" onClick={handleOpenNotation}>
                <Icon icon="bi:info-circle" className="size-4" />
                <span>使い方</span>
              </button>
            </li>
            <li role="none">
              <button type="button" role="menuitem" onClick={handleOpenHistory}>
                <Icon icon="mdi:history" className="size-4" />
                <span>履歴</span>
              </button>
            </li>
            <li role="none">
              <button type="button" role="menuitem" onClick={handleOpenConfig}>
                <Icon icon="fa6-solid:gear" className="size-4" />
                <span>設定</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <ShareDialog
        dialogRef={shareDialogRef}
        memoUrl={memoUrl}
        onCopyResolvedMemo={onCopyResolvedMemo}
        onCopyResolvedMemoImage={onCopyResolvedMemoImage}
        onCopyMemoUrl={onCopyMemoUrl}
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

      <NotationDialog dialogRef={notationDialogRef} />

      <LlmGuideDialog
        dialogRef={llmGuideDialogRef}
        guideText={LLM_MEMO_GUIDE_TEXT}
        isCopied={isLlmGuideCopied}
        onCopyGuide={() => void copyLlmGuide()}
      />

      <ResetCountersDialog dialogRef={resetCountersDialogRef} onConfirm={onResetMemoCounters} />
    </div>
  );
}
