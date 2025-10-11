import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Restore session on page load
    useEffect(() => {
        const restoreSession = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                setLoading(false);
                return;
            }

            setToken(storedToken);

            try {
                const res = await axios.get('https://anand-u.vercel.app/user/me', {
                    headers: { Authorization: `Bearer ${storedToken}` },
                });
                setUser(res.data);
                localStorage.setItem('user', JSON.stringify(res.data));

                // fetch favourites
                fetchFavourites(storedToken);
            } catch (err) {
                console.error('Failed to restore session:', err);
                logout(); // clear invalid token
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    const fetchUserDetails = async (authToken) => {
        try {
            const res = await axios.get('https://anand-u.vercel.app/user/me', {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            return res.data;
        } catch (err) {
            console.error('Failed to fetch user details:', err);
            return null;
        }
    };
    // Login
    // MODIFIED: Now saves the user object to localStorage
    const login = (userData, authToken) => {
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData)); // ADDED: Save user object
        setToken(authToken);
        setUser(userData);
        fetchUserDetails(authToken);
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


    const value = { user, token, login, logout, favourites, toggleFavourite, loading };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
