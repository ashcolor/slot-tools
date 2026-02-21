import { MemoCounterPopup } from "../features/memo/components/MemoCounterPopup";
import { MemoClearDialog } from "../features/memo/components/MemoClearDialog";
import { MemoConfigDialog } from "../features/memo/components/MemoConfigDialog";
import { MemoDeleteTemplateDialog } from "../features/memo/components/MemoDeleteTemplateDialog";
import { MemoEditor } from "../features/memo/components/MemoEditor";
import { MemoSaveTemplateDialog } from "../features/memo/components/MemoSaveTemplateDialog";
import { MemoTemplateDialog } from "../features/memo/components/MemoTemplateDialog";
import { MemoToolbar } from "../features/memo/components/MemoToolbar";
import { TemplateKeyboard } from "../features/memo/components/TemplateKeyboard";
import { useMemoEditor } from "../features/memo/hooks/useMemoEditor";

export function Memo() {
  const memo = useMemoEditor();

  return (
    <div className="relative left-1/2 -ml-[50vw] w-screen h-[calc(100svh-4rem-1rem)] sm:h-[calc(100svh-4rem-2rem)] px-2 sm:px-4 py-2 flex flex-col gap-2 overflow-hidden">
      <MemoToolbar
        onOpenTemplate={memo.openTemplateModal}
        onOpenConfig={() => memo.configModalRef.current?.showModal()}
        onOpenClear={() => memo.clearModalRef.current?.showModal()}
      />

      <MemoEditor
        memo={memo.draft.memo}
        memoRef={memo.memoRef}
        isMemoFocused={memo.isMemoFocused}
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

      <MemoConfigDialog
        configModalRef={memo.configModalRef}
        memoFontSizeLevel={memo.memoFontSizeLevel}
        onChangeFontSizeLevel={memo.setFontSizeLevel}
      />

      <MemoTemplateDialog
        templateModalRef={memo.templateModalRef}
        templateList={memo.templateList}
        onOpenSaveTemplateModal={memo.openSaveTemplateModal}
        onApplyTemplate={memo.applyTemplate}
        onRequestDeleteTemplate={memo.requestDeleteTemplate}
      />

      <MemoClearDialog clearModalRef={memo.clearModalRef} onClearDraft={memo.clearDraft} />

      <MemoSaveTemplateDialog
        saveTemplateModalRef={memo.saveTemplateModalRef}
        onSaveCurrentAsTemplate={memo.saveCurrentAsTemplate}
      />

      <MemoDeleteTemplateDialog
        deleteTemplateModalRef={memo.deleteTemplateModalRef}
        pendingDeleteTemplate={memo.pendingDeleteTemplate}
        onDeleteTemplate={memo.deleteTemplate}
        onClearPendingDeleteTemplate={memo.clearPendingDeleteTemplate}
      />

      {memo.counterPopup ? (
        <MemoCounterPopup
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
        selectedCategoryKey={memo.selectedCategoryKey}
        onSelectCategoryKey={memo.setSelectedCategoryKey}
        onInsertCategoryItem={memo.insertTemplateItem}
        onSave={memo.saveMemoEditor}
      />
    </div>
  );
}
