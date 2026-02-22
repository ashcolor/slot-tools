import { useCallback, useEffect, useState } from "react";
import { CounterPopup } from "../features/memo/components/CounterPopup";
import { ClearDialog } from "../features/memo/components/ClearDialog";
import { ConfigDialog } from "../features/memo/components/ConfigDialog";
import { DeleteTemplateDialog } from "../features/memo/components/DeleteTemplateDialog";
import { Editor } from "../features/memo/components/Editor";
import { SaveTemplateDialog } from "../features/memo/components/SaveTemplateDialog";
import { TemplateDialog } from "../features/memo/components/TemplateDialog";
import { Toolbar } from "../features/memo/components/Toolbar";
import { TemplateKeyboard } from "../features/memo/components/TemplateKeyboard";
import { useMemoEditor } from "../features/memo/hooks/useMemoEditor";

interface MemoProps {
  onEditingChange?: (isEditing: boolean) => void;
}

export function Memo({ onEditingChange }: MemoProps) {
  const floatingGap = 8;
  const memo = useMemoEditor();
  const [templateKeyboardOccupiedHeight, setTemplateKeyboardOccupiedHeight] = useState(0);
  const rootStyle =
    memo.isMemoFocused && memo.keyboardInset > 0 ? { height: `calc(100svh - ${memo.keyboardInset}px)` } : undefined;
  const editingTopMargin = memo.isMemoFocused ? floatingGap : 0;
  const editingBottomMargin = memo.isMemoFocused ? templateKeyboardOccupiedHeight + floatingGap : 0;
  const handleTemplateKeyboardOccupiedHeightChange = useCallback((occupiedHeight: number) => {
    setTemplateKeyboardOccupiedHeight((current) => (current === occupiedHeight ? current : occupiedHeight));
  }, []);
  const rootClassName = memo.isMemoFocused
    ? "relative left-1/2 -ml-[50vw] w-screen h-[100svh] px-2 sm:px-4 py-0 flex flex-col gap-0 overflow-hidden"
    : "relative left-1/2 -ml-[50vw] w-screen h-[calc(100svh-4rem-1rem)] sm:h-[calc(100svh-4rem-2rem)] px-2 sm:px-4 py-2 flex flex-col gap-2 overflow-hidden";

  useEffect(() => {
    onEditingChange?.(memo.isMemoFocused);
  }, [memo.isMemoFocused, onEditingChange]);

  useEffect(() => {
    return () => onEditingChange?.(false);
  }, [onEditingChange]);

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

  return (
    <div className={rootClassName} style={rootStyle}>
      {!memo.isMemoFocused ? (
        <Toolbar
          onOpenTemplate={memo.openTemplateModal}
          onOpenConfig={() => memo.configModalRef.current?.showModal()}
          onOpenClear={() => memo.clearModalRef.current?.showModal()}
        />
      ) : null}

      <Editor
        memo={memo.draft.memo}
        memoRef={memo.memoRef}
        isMemoFocused={memo.isMemoFocused}
        editingTopMargin={editingTopMargin}
        editingBottomMargin={editingBottomMargin}
        memoParts={memo.memoParts}
        formulaResults={memo.formulaResults}
        memoFontSizeClass={memo.memoFontSizeClass}
        inlineControlSize={memo.inlineControlSize}
        onMemoFocus={() => memo.setIsMemoFocused(true)}
        onMemoBlur={memo.handleMemoBlur}
        onMemoChange={memo.setMemo}
        onFocusEditor={memo.focusMemoEditor}
        onSaveEditor={memo.saveMemoEditor}
        onStepInlineCounter={memo.stepInlineCounter}
        onOpenCounterPopup={memo.openCounterPopup}
      />

      <ConfigDialog
        configModalRef={memo.configModalRef}
        memoFontSizeLevel={memo.memoFontSizeLevel}
        onChangeFontSizeLevel={memo.setFontSizeLevel}
      />

      <TemplateDialog
        templateModalRef={memo.templateModalRef}
        templateList={memo.templateList}
        onOpenSaveTemplateModal={memo.openSaveTemplateModal}
        onApplyTemplate={memo.applyTemplate}
        onRequestDeleteTemplate={memo.requestDeleteTemplate}
      />

      <ClearDialog clearModalRef={memo.clearModalRef} onClearDraft={memo.clearDraft} />

      <SaveTemplateDialog
        saveTemplateModalRef={memo.saveTemplateModalRef}
        onSaveCurrentAsTemplate={memo.saveCurrentAsTemplate}
      />

      <DeleteTemplateDialog
        deleteTemplateModalRef={memo.deleteTemplateModalRef}
        pendingDeleteTemplate={memo.pendingDeleteTemplate}
        onDeleteTemplate={memo.deleteTemplate}
        onClearPendingDeleteTemplate={memo.clearPendingDeleteTemplate}
      />

      {memo.counterPopup ? (
        <CounterPopup
          value={memo.counterPopup.value}
          anchorX={memo.counterPopup.anchorX}
          anchorY={memo.counterPopup.anchorY}
          onClose={memo.closeCounterPopup}
          onStepDigit={memo.stepPopupCounterDigit}
          onResetToZero={memo.resetPopupCounterToZero}
        />
      ) : null}

      <TemplateKeyboard
        visible={memo.isMemoFocused}
        keyboardInset={memo.keyboardInset}
        floatingGap={floatingGap}
        selectedCategoryKey={memo.selectedCategoryKey}
        onSelectCategoryKey={memo.setSelectedCategoryKey}
        onInsertCategoryItem={memo.insertTemplateItem}
        onOccupiedHeightChange={handleTemplateKeyboardOccupiedHeightChange}
      />
    </div>
  );
}
