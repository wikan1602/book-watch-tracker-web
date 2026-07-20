"use client";

import Modal from "./Modal";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Remove",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="flex flex-col gap-5">
        <p className="text-sm text-ink-dim">{message}</p>
        <div className="flex justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="rounded-md border border-border px-4 py-2 text-[13px] font-semibold text-ink-dim"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md border border-danger px-4 py-2 text-[13px] font-bold text-danger"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
