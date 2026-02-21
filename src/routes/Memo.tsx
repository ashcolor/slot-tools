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

export function Memo() {
  const memo = useMemoEditor();

  return (
    <div className="relative left-1/2 -ml-[50vw] w-screen h-[calc(100svh-4rem-1rem)] sm:h-[calc(100svh-4rem-2rem)] px-2 sm:px-4 py-2 flex flex-col gap-2 overflow-hidden">
      <Toolbar
        onOpenTemplate={memo.openTemplateModal}
        onOpenConfig={() => memo.configModalRef.current?.showModal()}
        onOpenClear={() => memo.clearModalRef.current?.showModal()}
      />

      <Editor
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
        selectedCategoryKey={memo.selectedCategoryKey}
        onSelectCategoryKey={memo.setSelectedCategoryKey}
        onInsertCategoryItem={memo.insertTemplateItem}
        onSave={memo.saveMemoEditor}
      />
    </div>
  );
}
