// src/context/ThemeContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import Dialog from '../components/Dialog'; // ✅ Import Dialog here

// We could rename this to UIContext, but ThemeContext works for now
const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // --- Theme State (no changes) ---
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("chat-theme");
        return savedTheme || 'dark';
    });

    // ✅ MOVED: All dialog state is now managed here
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogOptions, setDialogOptions] = useState(null);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem("chat-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // ✅ MOVED: The showDialog function now lives here
    // ✅ Generic showDialog method (supports your custom props)
    const showDialog = ({
        title = 'Dialog',
        message = '',
        type = 'warning',
        icon,
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        onConfirm,
        onCancel,
        confirmButtonOnly = false,
    }) => {
        setDialogOptions({
            title,
            message,
            type,
            icon,
            confirmText,
            cancelText,
            onConfirm,
            onCancel,
            confirmButtonOnly,
        });
        setIsDialogOpen(true);
    };
    // ✅ MOVED: The closeDialog function now lives here
    const closeDialog = () => {
        setIsDialogOpen(false);
    };

    // Provide the theme, dialog functions, and state to all children
    const value = {
        theme,
        toggleTheme,
        showDialog, // ✅ Expose the function to the whole app
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}

            {/* ✅ The Dialog component is rendered here, managed entirely by this context */}
            {isDialogOpen && dialogOptions && (
                <Dialog
                    isOpen={isDialogOpen}
                    onClose={closeDialog}
                    onConfirm={dialogOptions.onConfirm}
                    onCancel={dialogOptions.onCancel}
                    type={dialogOptions.type}
                    icon={dialogOptions.icon}
                    title={dialogOptions.title}
                    confirmText={dialogOptions.confirmText}
                    cancelText={dialogOptions.cancelText}
                    confirmButtonOnly={dialogOptions.confirmButtonOnly}
                >
                    {dialogOptions.message}
                </Dialog>
            )}
        </ThemeContext.Provider>
    );
};