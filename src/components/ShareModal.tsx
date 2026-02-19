import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  url: string;
  onClose: () => void;
}

export function ShareModal({ url, onClose }: Props) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <dialog ref={modalRef} className="modal modal-open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box flex flex-col items-center gap-4">
        <h3 className="font-bold text-lg">共有</h3>

        <QRCodeSVG value={url} size={200} />

        <div className="flex items-center gap-2 w-full">
          <input
            type="text"
            readOnly
            value={url}
            className="input input-bordered input-sm flex-1 min-w-0 text-xs"
          />
          <button type="button" className="btn btn-sm btn-square btn-neutral shrink-0" onClick={handleCopy} aria-label="コピー">
            {copied ? (
              <Icon icon="fa6-solid:check" className="size-4" />
            ) : (
              <Icon icon="fa6-regular:copy" className="size-4" />
            )}
          </button>
        </div>

        <p className="text-xs opacity-50 text-center">
          このURLを共有すると、メンバーのデータが自動入力されます
        </p>

        <div className="modal-action">
          <button type="button" className="btn btn-sm" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </dialog>
  );
}
