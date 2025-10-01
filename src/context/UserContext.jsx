import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('authToken'));

    // ✅ Load user + favourites from localStorage if session exists
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedFavourites = JSON.parse(localStorage.getItem('favourites')) || [];

        if (storedToken) {
            setToken(storedToken);
            setUser({
                loggedIn: true,
                favourites: storedFavourites,
            });
        }
    }, []);

    // ✅ Function to handle login
    const login = (userData, authToken) => {
        localStorage.setItem('authToken', authToken);
        setToken(authToken);

        // If no favourites in userData, set empty array
        const updatedUser = { ...userData, favourites: userData.favourites || [] };

        setUser(updatedUser);
        localStorage.setItem('favourites', JSON.stringify(updatedUser.favourites));
    };

    // ✅ Function to handle logout
    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('favourites');
        setToken(null);
        setUser(null);
    };

    // ✅ Function to toggle favourite section
    const toggleFavourite = (sectionId) => {
        if (!user) return;

        let updatedFavourites;
        if (user.favourites?.includes(sectionId)) {
            updatedFavourites = user.favourites.filter(id => id !== sectionId);
        } else {
            updatedFavourites = [...(user.favourites || []), sectionId];
        }

        const updatedUser = { ...user, favourites: updatedFavourites };
        setUser(updatedUser);

        // persist locally
        localStorage.setItem('favourites', JSON.stringify(updatedFavourites));
    };

    const value = { user, token, login, logout, toggleFavourite };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
