import { Icon } from "@iconify/react";

type IosInstallGuideModalProps = {
  open: boolean;
  onClose: () => void;
};

export function IosInstallGuideModal({ open, onClose }: IosInstallGuideModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-lg font-bold">ホーム画面に追加</h3>
        <p className="mt-2 text-sm leading-relaxed opacity-80">
          iOS/iPadOS は次の手順で追加できます。
        </p>

        <ul className="steps steps-vertical mt-3 w-full">
          <li className="step step-primary py-1">
            <div className="text-left text-sm leading-relaxed">
              <kbd className="kbd kbd-sm inline-flex items-center gap-1">
                <Icon icon="bi:share" className="size-3" />
                <span>共有アイコン</span>
              </kbd>
              <span className="ml-2">(共有)をクリック</span>
            </div>
          </li>

          <li className="step step-primary py-1">
            <div className="text-left text-sm leading-relaxed">
              <kbd className="kbd kbd-sm inline-flex items-center gap-1">
                <Icon icon="fa6-solid:chevron-down" className="size-2.5" />
                <span>もっと見る</span>
              </kbd>
              <span className="ml-2">をクリック</span>
            </div>
          </li>

          <li className="step step-primary py-1">
            <div className="text-left text-sm leading-relaxed">
              <kbd className="kbd kbd-sm inline-flex items-center gap-1">
                <Icon icon="material-symbols:add-box-rounded-outline" className="size-3" />
                <span>ホーム画面に追加</span>
              </kbd>
              <span className="ml-2">をクリック</span>
            </div>
          </li>

          <li className="step step-primary py-1">
            <div className="text-left text-sm leading-relaxed">
              <kbd className="kbd kbd-sm inline-flex items-center gap-1">
                <Icon icon="fa6-solid:plus" className="size-2.5" />
                <span>追加</span>
              </kbd>
              <span className="ml-2">をクリック</span>
            </div>
          </li>
        </ul>

        <div className="modal-action">
          <button type="button" className="btn btn-sm" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>

      <button
        type="button"
        className="modal-backdrop"
        aria-label="インストール案内を閉じる"
        onClick={onClose}
      />
    </div>
  );
}
