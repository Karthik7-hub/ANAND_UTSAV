import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../css/Dialog.css';

function Dialog({
    isOpen,
    onClose,
    onConfirm,
    type = 'warning',
    icon,
    title,
    children,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmButtonOnly = false,
    confirmationLabel,
    confirmationText,
}) {
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (isOpen) {
            setInputValue('');
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    // ✅ FIX: This function conditionally calls onClose only for the 'info' type.
    const handleOverlayClick = () => {
        if (type === 'info') {
            onClose();
        }
        // For 'success', 'error', 'warning', etc., this does nothing.
    };

    const isConfirmDisabled = confirmationText ? inputValue !== confirmationText : false;
    const confirmButtonModifier = (type === 'error' || type === 'warning') ? 'danger' : 'success';

    const dialogJsx = (
        <div
            className="dialog-overlay dialog-overlay--visible"
            // ✅ FIX: The overlay now uses our new conditional handler.
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
        >
            <div onClick={(e) => e.stopPropagation()} className={`dialog-card dialog-card--${type}`}>
                {icon && <div className="dialog-card__icon">{icon}</div>}

                <div className="dialog-card__content">
                    <h3 id="dialog-title" className="dialog-card__title">{title}</h3>
                    <p className="dialog-card__message">{children}</p>

                    {confirmationText && (
                        <div className="dialog-card__confirmation">
                            <label htmlFor="confirmation-input">{confirmationLabel}</label>
                            <input
                                id="confirmation-input"
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                autoComplete="off"
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                <div className="dialog-card__actions">
                    {!confirmButtonOnly && (
                        <button className="dialog-card__btn dialog-card__btn--secondary" onClick={onClose}>
                            {cancelText}
                        </button>
                    )}
                    <button
                        className={`dialog-card__btn dialog-card__btn--${confirmButtonModifier}`}
                        onClick={onConfirm}
                        disabled={isConfirmDisabled}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );

    if (!document.getElementById('dialog-root')) {
        const portalRoot = document.createElement('div');
        portalRoot.id = 'dialog-root';
        document.body.appendChild(portalRoot);
    }

    return createPortal(dialogJsx, document.getElementById('dialog-root'));
}

export default Dialog;