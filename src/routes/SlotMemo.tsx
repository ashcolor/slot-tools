import { SlotMemoCounterPopup } from "../features/slotMemo/SlotMemoCounterPopup";
import { SlotMemoClearDialog } from "../features/slotMemo/SlotMemoClearDialog";
import { SlotMemoConfigDialog } from "../features/slotMemo/SlotMemoConfigDialog";
import { SlotMemoDeleteTemplateDialog } from "../features/slotMemo/SlotMemoDeleteTemplateDialog";
import { SlotMemoEditor } from "../features/slotMemo/SlotMemoEditor";
import { SlotMemoSaveTemplateDialog } from "../features/slotMemo/SlotMemoSaveTemplateDialog";
import { SlotMemoTemplateDialog } from "../features/slotMemo/SlotMemoTemplateDialog";
import { SlotMemoToolbar } from "../features/slotMemo/SlotMemoToolbar";
import { TemplateKeyboard } from "../features/slotMemo/TemplateKeyboard";
import { useSlotMemo } from "../features/slotMemo/useSlotMemo";

export function SlotMemo() {
  const slotMemo = useSlotMemo();

  return (
    <div className="relative left-1/2 -ml-[50vw] w-screen h-[calc(100svh-4rem-1rem)] sm:h-[calc(100svh-4rem-2rem)] px-2 sm:px-4 py-2 flex flex-col gap-2 overflow-hidden">
      <SlotMemoToolbar
        onOpenTemplate={slotMemo.openTemplateModal}
        onOpenConfig={() => slotMemo.configModalRef.current?.showModal()}
        onOpenClear={() => slotMemo.clearModalRef.current?.showModal()}
      />

      <SlotMemoEditor
        memo={slotMemo.draft.memo}
        memoRef={slotMemo.memoRef}
        isMemoFocused={slotMemo.isMemoFocused}
        memoParts={slotMemo.memoParts}
        formulaResults={slotMemo.formulaResults}
        memoFontSizeClass={slotMemo.memoFontSizeClass}
        inlineControlSize={slotMemo.inlineControlSize}
        onMemoFocus={() => slotMemo.setIsMemoFocused(true)}
        onMemoBlur={slotMemo.handleMemoBlur}
        onMemoChange={slotMemo.setMemo}
        onFocusEditor={slotMemo.focusMemoEditor}
        onStepInlineCounter={slotMemo.stepInlineCounter}
        onOpenCounterPopup={slotMemo.openCounterPopup}
      />

      <SlotMemoConfigDialog
        configModalRef={slotMemo.configModalRef}
        memoFontSizeLevel={slotMemo.memoFontSizeLevel}
        onChangeFontSizeLevel={slotMemo.setFontSizeLevel}
      />

      <SlotMemoTemplateDialog
        templateModalRef={slotMemo.templateModalRef}
        templateList={slotMemo.templateList}
        onOpenSaveTemplateModal={slotMemo.openSaveTemplateModal}
        onApplyTemplate={slotMemo.applyTemplate}
        onRequestDeleteTemplate={slotMemo.requestDeleteTemplate}
      />

      <SlotMemoClearDialog clearModalRef={slotMemo.clearModalRef} onClearDraft={slotMemo.clearDraft} />

      <SlotMemoSaveTemplateDialog
        saveTemplateModalRef={slotMemo.saveTemplateModalRef}
        onSaveCurrentAsTemplate={slotMemo.saveCurrentAsTemplate}
      />

      <SlotMemoDeleteTemplateDialog
        deleteTemplateModalRef={slotMemo.deleteTemplateModalRef}
        pendingDeleteTemplate={slotMemo.pendingDeleteTemplate}
        onDeleteTemplate={slotMemo.deleteTemplate}
        onClearPendingDeleteTemplate={slotMemo.clearPendingDeleteTemplate}
      />

      {slotMemo.counterPopup ? (
        <SlotMemoCounterPopup
          value={slotMemo.counterPopup.value}
          anchorX={slotMemo.counterPopup.anchorX}
          anchorY={slotMemo.counterPopup.anchorY}
          onClose={slotMemo.closeCounterPopup}
          onStepDigit={slotMemo.stepPopupCounterDigit}
          onResetToZero={slotMemo.resetPopupCounterToZero}
        />
      ) : null}

      <TemplateKeyboard
        visible={slotMemo.isMemoFocused}
        keyboardInset={slotMemo.keyboardInset}
        selectedCategoryKey={slotMemo.selectedCategoryKey}
        onSelectCategoryKey={slotMemo.setSelectedCategoryKey}
        onInsertCategoryItem={slotMemo.insertTemplateItem}
        onSave={slotMemo.saveMemoEditor}
      />
    </div>
  );
}
