import { useRef, useEffect } from "react";
import type { Member } from "../types";

interface Props {
  pendingShare: Omit<Member, "id"> | null;
  memberCount: number;
  filledMembers: Member[];
  onApply: (index: number) => void;
  onCancel: () => void;
}

export function ImportModal({ pendingShare, memberCount, filledMembers, onApply, onCancel }: Props) {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (pendingShare) {
      modalRef.current?.showModal();
    }
  }, [pendingShare]);

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">データの読み込み</h3>
        {pendingShare && memberCount <= 2 ? (
          <>
            <p className="py-4">
              「{filledMembers[1]?.name}」を「{pendingShare.name}」のデータで上書きしますか？
            </p>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn btn-sm" onClick={onCancel}>キャンセル</button>
              </form>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  onApply(1);
                  modalRef.current?.close();
                }}
              >
                上書き
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="py-4">どのメンバーに展開しますか？</p>
            <div className="flex flex-col gap-2">
              {filledMembers.slice(1).map((m, i) => (
                <button
                  key={m.id}
                  className="btn btn-sm"
                  onClick={() => {
                    onApply(i + 1);
                    modalRef.current?.close();
                  }}
                >
                  {m.name}
                </button>
              ))}
            </div>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn btn-sm" onClick={onCancel}>キャンセル</button>
              </form>
            </div>
          </>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onCancel}>close</button>
      </form>
    </dialog>
  );
}
