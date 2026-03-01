import { useCallback, useEffect, useRef, useState } from "react";
import { ApplyTemplateDialog } from "../features/memo/components/ApplyTemplateDialog";
import { CounterPopup } from "../features/memo/components/CounterPopup";
import { ClearDialog } from "../features/memo/components/ClearDialog";
import { ConfigDialog } from "../features/memo/components/ConfigDialog";
import { DeleteTemplateDialog } from "../features/memo/components/DeleteTemplateDialog";
import { Editor } from "../features/memo/components/Editor";
import { FormulaPopup } from "../features/memo/components/FormulaPopup";
import { LlmGuideDialog } from "../features/memo/components/LlmGuideDialog";
import { LoadUrlMemoDialog } from "../features/memo/components/LoadUrlMemoDialog";
import { Stamp } from "../features/memo/components/Stamp";
import { TemplateDialog } from "../features/memo/components/TemplateDialog";
import { Toolbar } from "../features/memo/components/Toolbar";
import { useMemoEditor } from "../features/memo/hooks/useMemoEditor";
import { LLM_MEMO_GUIDE_TEXT } from "../features/memo/llmGuide";
import { useLocalStorage } from "../utils/useLocalStorage";

interface MemoProps {
  onEditingChange?: (isEditing: boolean) => void;
  isHeaderVisible?: boolean;
  onToggleHeaderVisibility?: () => void;
}

export function Memo({
  onEditingChange,
  isHeaderVisible = true,
  onToggleHeaderVisibility,
}: MemoProps) {
  const memo = useMemoEditor();
  const [isMemoLocked, setIsMemoLocked] = useState(false);
  const [lockFeedbackNonce, setLockFeedbackNonce] = useState(0);
  const [isLlmGuideCopied, setIsLlmGuideCopied] = useState(false);
  const saveEditorRef = useRef(memo.saveMemoEditor);
  const memoBackGuardActiveRef = useRef(false);
  const memoBackGuardConsumedRef = useRef(false);
  const llmGuideDialogRef = useRef<HTMLDialogElement>(null);
  const llmCopiedTimerRef = useRef<number | null>(null);
  const [isStampVisible, setIsStampVisible] = useLocalStorage<boolean>(
    "slot-memo-stamp-visible",
    true,
  );
  const rootStyle =
    memo.isMemoFocused && memo.keyboardInset > 0
      ? { height: `calc(100svh - ${memo.keyboardInset}px)` }
      : undefined;
  const editingTopMargin = 0;
  const editingBottomMargin = 0;
  const nonEditingHeightClass = isHeaderVisible
    ? "h-[calc(100svh-4rem-1rem)] sm:h-[calc(100svh-4rem-2rem)]"
    : "h-[100svh]";
  const rootClassName = memo.isMemoFocused
    ? "relative left-1/2 -ml-[50vw] w-screen h-[100svh] px-0 py-0 flex flex-col gap-0 overflow-hidden"
    : `relative left-1/2 -ml-[50vw] w-screen ${nonEditingHeightClass} px-2 sm:px-4 py-2 flex flex-col gap-2 overflow-hidden`;
  const triggerLockFeedback = useCallback(() => {
    setLockFeedbackNonce((current) => current + 1);
  }, []);
  const handleOpenLlmGuide = useCallback(() => {
    llmGuideDialogRef.current?.showModal();
  }, []);
  const copyLlmGuide = useCallback(async () => {
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
  }, []);
  const handleToggleMemoLock = useCallback(() => {
    if (!isMemoLocked) {
      memo.saveMemoEditor();
      memo.closeFormulaPopup();
    }
    setIsMemoLocked((current) => !current);
  }, [isMemoLocked, memo]);
  const handleFocusEditor = useCallback(
    (cursorPosition?: number) => {
      if (isMemoLocked) {
        triggerLockFeedback();
        return;
      }
      memo.focusMemoEditor(cursorPosition);
    },
    [isMemoLocked, memo, triggerLockFeedback],
  );
  const handleOpenFormulaPopup: typeof memo.openFormulaPopup = useCallback(
    (event, targetIndex, expression, displayMode) => {
      if (isMemoLocked) {
        triggerLockFeedback();
        return;
      }
      memo.openFormulaPopup(event, targetIndex, expression, displayMode);
    },
    [isMemoLocked, memo, triggerLockFeedback],
  );
  const handleCreateNewMemo = useCallback(() => {
    if (isMemoLocked) {
      triggerLockFeedback();
      return false;
    }
    return memo.createNewMemo();
  }, [isMemoLocked, memo, triggerLockFeedback]);
  const handleResetMemoCounters = useCallback(() => {
    if (isMemoLocked) {
      triggerLockFeedback();
      return;
    }
    memo.resetMemoCounters();
  }, [isMemoLocked, memo, triggerLockFeedback]);
  const handleRestoreMemoHistory = useCallback(
    (historyId: string) => {
      if (isMemoLocked) {
        triggerLockFeedback();
        return;
      }
      memo.restoreMemoHistory(historyId);
    },
    [isMemoLocked, memo, triggerLockFeedback],
  );

  useEffect(() => {
    onEditingChange?.(memo.isMemoFocused);
  }, [memo.isMemoFocused, onEditingChange]);

  useEffect(() => {
    return () => {
      if (llmCopiedTimerRef.current !== null) {
        window.clearTimeout(llmCopiedTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => onEditingChange?.(false);
  }, [onEditingChange]);

  useEffect(() => {
    saveEditorRef.current = memo.saveMemoEditor;
  }, [memo.saveMemoEditor]);

  useEffect(() => {
    if (!memo.isMemoFocused || typeof document === "undefined") return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscrollBehaviorY = html.style.overscrollBehaviorY;
    const prevBodyOverscrollBehaviorY = body.style.overscrollBehaviorY;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehaviorY = "none";
    body.style.overscrollBehaviorY = "none";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehaviorY = prevHtmlOverscrollBehaviorY;
      body.style.overscrollBehaviorY = prevBodyOverscrollBehaviorY;
    };
  }, [memo.isMemoFocused]);

  useEffect(() => {
    if (!memo.isMemoFocused || typeof window === "undefined") return;

    const currentState =
      window.history.state && typeof window.history.state === "object" ? window.history.state : {};
    const hasMemoGuard = (currentState as Record<string, unknown>).__memoEditBackGuard === true;

    if (!hasMemoGuard) {
      window.history.pushState(
        {
          ...currentState,
          __memoEditBackGuard: true,
        },
        "",
        window.location.href,
      );
    }

    memoBackGuardActiveRef.current = true;
    memoBackGuardConsumedRef.current = false;

    const handlePopState = () => {
      if (!memoBackGuardActiveRef.current) return;
      memoBackGuardConsumedRef.current = true;
      memoBackGuardActiveRef.current = false;
      saveEditorRef.current();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (memoBackGuardConsumedRef.current) {
        memoBackGuardConsumedRef.current = false;
      }
      memoBackGuardActiveRef.current = false;
    };
  }, [memo.isMemoFocused]);

  return (
    <div className={rootClassName} style={rootStyle}>
      {!memo.isMemoFocused ? (
        <Toolbar
          isHeaderVisible={isHeaderVisible}
          isMemoLocked={isMemoLocked}
          lockFeedbackNonce={lockFeedbackNonce}
          memoUrl={memo.memoUrl}
          memoHistoryList={memo.memoHistoryList}
          onCopyResolvedMemo={memo.copyResolvedMemoToClipboard}
          onCopyResolvedMemoImage={memo.copyResolvedMemoImageToClipboard}
          onCopyMemoUrl={memo.copyMemoUrlToClipboard}
          onDownloadResolvedMemoImage={memo.downloadResolvedMemoImage}
          onCreateNewMemo={handleCreateNewMemo}
          onResetMemoCounters={handleResetMemoCounters}
          onRestoreMemoHistory={handleRestoreMemoHistory}
          onDeleteMemoHistory={memo.deleteMemoHistory}
          onClearMemoHistory={memo.clearMemoHistory}
          onToggleHeaderVisibility={onToggleHeaderVisibility}
          onToggleMemoLock={handleToggleMemoLock}
          onOpenTemplate={memo.openTemplateModal}
          onOpenConfig={() => memo.configModalRef.current?.showModal()}
        />
      ) : null}

      <Editor
        memo={memo.draft.memo}
        memoRef={memo.memoRef}
        isMemoFocused={memo.isMemoFocused}
        isMemoLocked={isMemoLocked}
        isStampVisible={isStampVisible}
        editingTopMargin={editingTopMargin}
        editingBottomMargin={editingBottomMargin}
        memoParts={memo.memoParts}
        formulaResults={memo.formulaResults}
        memoFontSizeClass={memo.memoFontSizeClass}
        inlineControlSize={memo.inlineControlSize}
        onMemoFocus={() => memo.setIsMemoFocused(true)}
        onMemoBlur={memo.handleMemoBlur}
        onMemoChange={memo.setMemo}
        onFocusEditor={handleFocusEditor}
        onLockedAction={triggerLockFeedback}
        onSaveEditor={memo.saveMemoEditor}
        onToggleStamp={() => setIsStampVisible((current) => !current)}
        onStepInlineCounter={memo.stepInlineCounter}
        onOpenCounterPopup={memo.openCounterPopup}
        onOpenFormulaPopup={handleOpenFormulaPopup}
      />

      <ConfigDialog
        configModalRef={memo.configModalRef}
        memoFontSizeLevel={memo.memoFontSizeLevel}
        formulaRoundDecimalPlaces={memo.formulaRoundDecimalPlaces}
        memoHistoryAutoSaveIntervalMinutes={memo.memoHistoryAutoSaveIntervalMinutes}
        onChangeFontSizeLevel={memo.setFontSizeLevel}
        onChangeFormulaRoundDecimalPlaces={memo.setFormulaRoundDecimalPlaces}
        onChangeMemoHistoryAutoSaveIntervalMinutes={memo.setMemoHistoryAutoSaveIntervalMinutes}
      />

      <TemplateDialog
        templateModalRef={memo.templateModalRef}
        templateList={memo.templateList}
        isLlmGuideCopied={isLlmGuideCopied}
        onSaveCurrentAsTemplate={memo.saveCurrentAsTemplate}
        onOpenLlmGuide={handleOpenLlmGuide}
        onApplyTemplate={memo.applyTemplate}
        onRequestDeleteTemplate={memo.requestDeleteTemplate}
      />

      <ClearDialog clearModalRef={memo.clearModalRef} onClearDraft={memo.clearDraft} />

      <DeleteTemplateDialog
        deleteTemplateModalRef={memo.deleteTemplateModalRef}
        pendingDeleteTemplate={memo.pendingDeleteTemplate}
        onDeleteTemplate={memo.deleteTemplate}
        onClearPendingDeleteTemplate={memo.clearPendingDeleteTemplate}
      />

      <ApplyTemplateDialog
        applyTemplateModalRef={memo.applyTemplateModalRef}
        onConfirmApplyTemplate={memo.confirmApplyTemplate}
        onCancelApplyTemplate={memo.cancelApplyTemplate}
      />

      <LoadUrlMemoDialog
        dialogRef={memo.urlMemoConfirmModalRef}
        pendingUrlMemo={memo.pendingUrlMemo}
        onConfirmOverwrite={memo.confirmUrlMemoOverwrite}
        onKeepCurrentMemo={memo.cancelUrlMemoOverwrite}
      />

      <LlmGuideDialog
        dialogRef={llmGuideDialogRef}
        guideText={LLM_MEMO_GUIDE_TEXT}
        isCopied={isLlmGuideCopied}
        onCopyGuide={() => void copyLlmGuide()}
      />

      {memo.counterPopup ? (
        <CounterPopup
          value={memo.counterPopup.value}
          name={memo.counterPopup.name}
          isNameInvalid={memo.isCounterPopupNameInvalid}
          anchorX={memo.counterPopup.anchorX}
          anchorY={memo.counterPopup.anchorY}
          onClose={memo.closeCounterPopup}
          onStepDigit={memo.stepPopupCounterDigit}
          onNameChange={memo.setCounterPopupName}
        />
      ) : null}

      {memo.formulaPopup && !isMemoLocked ? (
        <FormulaPopup
          expression={memo.formulaPopup.expression}
          displayMode={memo.formulaPopup.displayMode}
          isExpressionInvalid={memo.isFormulaPopupExpressionInvalid}
          anchorX={memo.formulaPopup.anchorX}
          anchorY={memo.formulaPopup.anchorY}
          variables={memo.formulaVariableList}
          onExpressionChange={memo.setFormulaPopupExpression}
          onDisplayModeChange={memo.setFormulaPopupDisplayMode}
          onConfirm={memo.applyFormulaPopup}
          onClose={memo.closeFormulaPopup}
        />
      ) : null}

      <Stamp
        visible={memo.isMemoFocused && isStampVisible}
        selectedCategoryKey={memo.selectedCategoryKey}
        onSelectCategoryKey={memo.setSelectedCategoryKey}
        onInsertCategoryItem={memo.insertTemplateItem}
      />
    </div>
  );
}
