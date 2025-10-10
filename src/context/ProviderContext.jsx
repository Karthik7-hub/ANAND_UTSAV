// src/context/ProviderContext.jsx
// src/context/ProviderContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const ProviderContext = createContext(null);

// Create a custom hook for easy access to the context
export const useProvider = () => useContext(ProviderContext);

// Create the Provider component that will wrap your app or provider routes
export const ProviderProvider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('providerToken'));

    // Effect to restore the provider's session on component mount
    useEffect(() => {
        const storedToken = localStorage.getItem('providerToken');
        const storedProvider = localStorage.getItem('provider');

        if (storedToken && storedProvider) {
            setToken(storedToken);
            setProvider(JSON.parse(storedProvider));
        }
    }, []);

    // Login function: stores provider data and token in state and localStorage
    const login = (providerData, authToken) => {
        localStorage.setItem('providerToken', authToken);
        localStorage.setItem('provider', JSON.stringify(providerData)); // Use 'provider' key
        setToken(authToken);
        setProvider(providerData);
    };

    // Logout function: clears provider data from state and localStorage
    const logout = () => {
        localStorage.removeItem('providerToken');
        localStorage.removeItem('provider'); // Clear 'provider' key
        setToken(null);
        setProvider(null);
    };

    // The value provided to consuming components
    const value = { provider, token, login, logout };

    return (
        <ProviderContext.Provider value={value}>
            {children}
        </ProviderContext.Provider>
    );
};