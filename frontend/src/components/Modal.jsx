import React, { useEffect } from "react";

/**
 * Modal Component
 * Renders a backdrop and a modal dialog container.
 * Styled using CSS rules in Pages.css.
 */
function Modal({ isOpen, onClose, title, eyebrow, children, footer }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            {eyebrow && <span className="modal__eyebrow">{eyebrow}</span>}
            <h3 className="modal__title">{title}</h3>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="Close modal">
            <svg viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="modal__body">
          {children}
        </div>
        {footer && (
          <div className="modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
