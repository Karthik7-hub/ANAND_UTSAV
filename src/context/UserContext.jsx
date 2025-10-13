import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Dialog from '../components/Dialog'; // ✅ Import your dialog component
import { User } from 'lucide-react';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [dialogOptions, setDialogOptions] = useState(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
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

    const closeDialog = () => {
        setIsDialogOpen(false);
    };


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

    // --- Login
    const login = (userData, authToken) => {
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(authToken);
        setUser(userData);
        fetchUserDetails(authToken);
        fetchFavourites(authToken);
    };

    // --- Logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setFavourites([]);
    };

    // --- Fetch favourites
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

    // --- Toggle favourite (uses dialog instead of alert)
    const toggleFavourite = async (serviceId) => {
        if (!user) {
            showDialog({
                title: 'Login Required',
                message: 'Please log in to manage your favourites.',
                type: 'warning',
                icon: <User />,
                confirmText: 'Login',
                cancelText: 'Cancel',
                confirmButtonOnly: false, // ✅ shows both buttons
                onConfirm: () => {
                    closeDialog();
                    navigate('/login'); // ✅ Redirect to login
                },
            });
            return;
        }

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
            setFavourites(favourites); // rollback
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
        showDialog,
    };

    return (
        <UserContext.Provider value={value}>
            {children}

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
        </UserContext.Provider>
    );
};
