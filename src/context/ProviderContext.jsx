// src/context/ProviderContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchCurrentProvider } from '../api'; // Import fetchCurrentProvider

// Create the context
const ProviderContext = createContext(null);

// Create a custom hook for easy access to the context
export const useProvider = () => useContext(ProviderContext);

// Create the Provider component
export const ProviderProvider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('providerToken'));
    const [loading, setLoading] = useState(true); // ADDED loading state

    // ADDED: Effect to restore the provider's session on component mount
    useEffect(() => {
        const restoreProviderSession = async () => {
            const storedToken = localStorage.getItem('providerToken');

            if (!storedToken) {
                setLoading(false);
                return;
            }

            setToken(storedToken);

            try {
                // Fetch provider data from server
                const data = await fetchCurrentProvider();
                if (data && data.success !== false) {
                    setProvider(data);
                } else {
                    logout();
                }
            } catch (err) {
                console.error('Failed to restore provider session:', err);
                logout(); // Clear invalid token
            } finally {
                setLoading(false);
            }
        };

        restoreProviderSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Login function: stores ONLY token in localStorage
    const login = (providerData, authToken) => {
        localStorage.setItem('providerToken', authToken); // ONLY token
        setToken(authToken);
        setProvider(providerData);
        // REMOVED: localStorage.setItem('provider', ...)
    };

    // Logout function: clears ONLY token from localStorage
    const logout = () => {
        localStorage.removeItem('providerToken'); // ONLY token
        // REMOVED: localStorage.removeItem('provider')
        setToken(null);
        setProvider(null);
    };

    // ADDED: Function to refresh provider data on demand
    const refreshProvider = async () => {
        if (!token) return; // Don't refresh if not logged in

        setLoading(true);
        try {
            const data = await fetchCurrentProvider();
            if (data && data.success !== false) {
                setProvider(data);
            } else {
                logout();
            }
        } catch (err) {
            console.error('Failed to refresh provider data:', err);
            logout(); // Log out if token is now invalid
        } finally {
            setLoading(false);
        }
    };


    // The value provided to consuming components
    const value = {
        provider,
        token,
        login,
        logout,
        loading,        // ADDED
        refreshProvider // ADDED
    };

    return (
        <ProviderContext.Provider value={value}>
            {children}
        </ProviderContext.Provider>
    );
};