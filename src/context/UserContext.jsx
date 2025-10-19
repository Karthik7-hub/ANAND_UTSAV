// src/context/UserContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User } from 'lucide-react';
import { useTheme } from './ThemeContext';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { showDialog } = useTheme();

    // --- Restore session on page load ---
    useEffect(() => {
        const restoreSession = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                setLoading(false);
                return;
            }

            setToken(storedToken);

            try {
                // 1. Fetch user details directly
                const res = await axios.get('https://anand-u.vercel.app/user/me', {
                    headers: { Authorization: `Bearer ${storedToken}` },
                });
                setUser(res.data); // Set in state, NOT localStorage

                // 2. Fetch favourites
                fetchFavourites(storedToken);
            } catch (err) {
                console.error('Failed to restore session:', err);
                logout(); // clear invalid token
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
        // We only want this to run once on mount, so we leave the dependency array empty.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Login ---
    // This function now trusts the data from your login component.
    const login = (userData, authToken) => {
        localStorage.setItem('token', authToken); // ONLY store the token
        setToken(authToken);
        setUser(userData); // Set user data from login response
        fetchFavourites(authToken); // Fetch associated data
        // REMOVED: Redundant fetchUserDetails() call
        // REMOVED: localStorage.setItem('user', ...)
    };

    // --- Logout ---
    const logout = () => {
        localStorage.removeItem('token'); // ONLY remove the token
        // REMOVED: localStorage.removeItem('user')
        setToken(null);
        setUser(null);
        setFavourites([]);
    };

    // --- Fetch favourites (No changes needed here) ---
    const fetchFavourites = async (authToken) => {
        try {
            const res = await axios.get('https://anand-u.vercel.app/user/getFavorite', {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            if (res.data.success) {
                const favIds = res.data.favorites.map(f => f._id ? f._id : f);
                setFavourites(favIds);
            }
        } catch (err) {
            console.error('Error fetching favourites:', err);
        }
    };

    // --- ADDED: Function to refresh user data on demand ---
    // Call this after a user edits their profile
    const refreshUser = async () => {
        if (!token) return; // Don't refresh if not logged in

        setLoading(true); // Optional: show a loading state
        try {
            const res = await axios.get('https://anand-u.vercel.app/user/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(res.data);
            // Also refresh favourites in case they changed
            fetchFavourites(token);
        } catch (err) {
            console.error('Failed to refresh user data:', err);
            logout(); // Log out if token is now invalid
        } finally {
            setLoading(false);
        }
    };

    // --- Toggle favourite (No changes needed here) ---
    const toggleFavourite = async (serviceId) => {
        if (!user) {
            showDialog({
                title: 'Login Required',
                message: 'Please log in to manage your favourites.',
                type: 'warning',
                icon: <User />,
                confirmText: 'Login',
                cancelText: 'Cancel',
                confirmButtonOnly: false,
                onConfirm: () => {
                    navigate('/login');
                },
            });
            return;
        }

        const isFav = favourites.includes(serviceId);
        const updatedFavourites = isFav
            ? favourites.filter(id => id !== serviceId)
            : [...favourites, serviceId];

        setFavourites(updatedFavourites); // Optimistic update

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
            setFavourites(favourites); // Rollback on error
            showDialog({
                title: 'Error',
                message: 'Failed to update favourites. Please try again.',
                type: 'error',
                confirmText: 'Close',
                confirmButtonOnly: true,
            });
        }
    };

    const value = {
        user,
        token,
        login,
        logout,
        favourites,
        toggleFavourite,
        loading,
        refreshUser, // ADDED
        showDialog,  // This is still from useTheme, but fine to pass through
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};