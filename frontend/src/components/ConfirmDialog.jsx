import React from "react";
import Modal from "./Modal";

/**
 * ConfirmDialog Component
 * A reusable confirmation dialog box.
 * Uses Modal under the hood.
 */
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  itemName = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = true,
  isLoading = false
}) {
  const footer = (
    <>
      <button className="btn-cancel" onClick={onClose} disabled={isLoading}>
        {cancelText}
      </button>
      <button
        className={isDanger ? "btn-danger" : "btn-submit"}
        onClick={onConfirm}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : confirmText}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <div className="confirm-dialog__icon">⚠️</div>
      <p className="confirm-dialog__msg">
        {message}{" "}
        {itemName && (
          <span className="confirm-dialog__name">
            "{itemName}"
          </span>
        )}
      </p>
    </Modal>
  );
}

export default ConfirmDialog;
