// src/context/ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the context
const ThemeContext = createContext();

// Create a custom hook for easy access in any component
export const useTheme = () => useContext(ThemeContext);

// Create the Provider component that will wrap your entire app
export const ThemeProvider = ({ children }) => {
    // We will store the theme as 'light' or 'dark' strings
    const [theme, setTheme] = useState(() => {
        // Use 'chat-theme' as the single key
        const savedTheme = localStorage.getItem("chat-theme");
        return savedTheme || 'dark'; // Default to dark theme
    });

    // This effect runs whenever the theme state changes
    useEffect(() => {
        // Apply the theme to the entire HTML document
        document.documentElement.setAttribute('data-theme', theme);
        // Save the current theme to localStorage
        localStorage.setItem("chat-theme", theme);
    }, [theme]);

    // The function to toggle the theme
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // Provide the theme state and the toggle function to all children
    const value = { theme, toggleTheme };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};