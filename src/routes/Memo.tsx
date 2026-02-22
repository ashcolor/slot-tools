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
  const [saveButtonBottom, setSaveButtonBottom] = useState(0);
  const [templateKeyboardOccupiedHeight, setTemplateKeyboardOccupiedHeight] = useState(0);
  const editingTopMargin = memo.isMemoFocused ? saveButtonBottom + floatingGap : 0;
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
    if (!memo.isMemoFocused || typeof window === "undefined") return;

    const saveButtonElement = document.getElementById("memo-save-floating");
    if (!saveButtonElement) return;

    const updateBottom = () => {
      const rect = saveButtonElement.getBoundingClientRect();
      const next = Math.ceil(rect.bottom);
      setSaveButtonBottom((current) => (current === next ? current : next));
    };

    updateBottom();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateBottom);
      observer.observe(saveButtonElement);
      window.addEventListener("resize", updateBottom);
      return () => {
        observer.disconnect();
        window.removeEventListener("resize", updateBottom);
      };
    }

    window.addEventListener("resize", updateBottom);
    return () => window.removeEventListener("resize", updateBottom);
  }, [memo.isMemoFocused]);

  return (
    <div className={rootClassName}>
      {!memo.isMemoFocused ? (
        <Toolbar
          onOpenTemplate={memo.openTemplateModal}
          onOpenConfig={() => memo.configModalRef.current?.showModal()}
          onOpenClear={() => memo.clearModalRef.current?.showModal()}
        />
      ) : null}

      {memo.isMemoFocused ? (
        <div
          id="memo-save-floating"
          className="fixed inset-x-0 z-50 px-2"
          style={{ top: `calc(env(safe-area-inset-top, 0px) + ${floatingGap}px)` }}
        >
          <div className="mx-auto max-w-4xl flex justify-center">
            <button type="button" className="btn btn-primary btn-sm" onClick={memo.saveMemoEditor}>
              保存
            </button>
          </div>
        </div>
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
