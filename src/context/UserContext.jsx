import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [favourites, setFavourites] = useState([]);

    // Restore session
    // MODIFIED: Now restores the full user object, not just a generic one
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user'); // ADDED: Get the user string

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser)); // MODIFIED: Parse and set the full user object
            fetchFavourites(storedToken);
        }
    }, []);

    // Login
    // MODIFIED: Now saves the user object to localStorage
    const login = (userData, authToken) => {
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData)); // ADDED: Save user object
        setToken(authToken);
        setUser(userData);
        fetchFavourites(authToken);
    };

    // Logout
    // MODIFIED: Now clears the user object from localStorage
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // ADDED: Clear user object
        setToken(null);
        setUser(null);
        setFavourites([]);
    };

    // --- Fetch favourites from backend
const fetchFavourites = async (authToken) => {
    try {
        const res = await axios.get('https://anand-u.vercel.app/user/getFavorite', {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.data.success) {
            // store only IDs
            const favIds = res.data.favorites.map(f => f._id ? f._id : f);
            setFavourites(favIds);
        }
    } catch (err) {
        console.error('Error fetching favourites:', err);
    }
};

// --- Toggle favourite (optimistic UI)
const toggleFavourite = async (serviceId) => {
    if (!user) return alert('Please login to manage favourites');

    const isFav = favourites.includes(serviceId);
    const updatedFavourites = isFav
        ? favourites.filter(id => id !== serviceId)
        : [...favourites, serviceId];

    setFavourites(updatedFavourites);

    try {
        if (isFav) {
            await axios.delete('https://anand-u.vercel.app/user/removeFavorite', {
                data: { serviceId },
                headers: { Authorization: `Bearer ${token}` },
            });
        } else {
            await axios.post(
                'https://anand-u.vercel.app/user/addFavorite',
                { serviceId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        }
    } catch (err) {
        console.error('Error toggling favourite:', err);
        setFavourites(favourites); // rollback if error
    }
};


    const value = { user, token, login, logout, favourites, toggleFavourite };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
