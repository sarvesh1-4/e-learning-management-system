"use client"
import Modal from "./Modal"

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-300">{message}</p>
      </div>
      <div className="flex justify-end space-x-3">
        <button onClick={onClose} className="btn-secondary">
          {cancelText}
        </button>
        <button onClick={onConfirm} className="btn-danger">
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
