import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../css/Dialog.css'; // The stylesheet with BEM class names

/**
 * A flexible, portal-based dialog component.
 * Its visibility is controlled by the `isOpen` prop from the parent.
 */
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
    // State to manage the text inside the confirmation input field
    const [inputValue, setInputValue] = useState('');

    // This effect resets the input field every time the dialog is opened.
    // This prevents old text from appearing when the user reopens it.
    useEffect(() => {
        if (isOpen) {
            setInputValue('');
        }
    }, [isOpen]);

    // If the dialog is not supposed to be open, render nothing.
    if (!isOpen) {
        return null;
    }

    // Determine if the confirmation button should be disabled
    const isConfirmDisabled = confirmationText ? inputValue !== confirmationText : false;
    const confirmButtonModifier = type === 'success' ? 'success' : 'danger';

    // The JSX for the entire dialog, which will be "teleported" by the Portal
    const dialogJsx = (
        <div className="dialog-overlay dialog-overlay--visible" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} className={`dialog-card dialog-card--${type}`}>
                {icon && <div className="dialog-card__icon">{icon}</div>}
                <div className="dialog-card__content">
                    <h3 className="dialog-card__title">{title}</h3>
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
                                // Automatically focus the input when the dialog opens
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

    // Use the Portal to teleport the JSX to the 'dialog-root' div in your main HTML file
    return createPortal(dialogJsx, document.getElementById('dialog-root'));
}

export default Dialog;