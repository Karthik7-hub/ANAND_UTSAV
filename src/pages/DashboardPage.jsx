// src/pages/DashboardPage.jsx
import { User, Heart, CalendarCheck, MessageSquare, Star, TriangleAlert } from 'lucide-react';
import React, { useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import axios from 'axios';
import '../css/Dashboard.css';
import Dialog from '../components/Dialog';
import { useUser } from '../context/UserContext';

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user, token, logout } = useUser();

    // 1. We now have a state for each dialog's visibility
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [resultDialog, setResultDialog] = useState(null); // This will control the success/error pop-up

    // 2. The delete handler now sets the resultDialog state instead of using alert()
    const handleAccountDelete = async () => {
        setConfirmOpen(false); // Close the confirmation dialog first

        try {
            const res = await axios.delete("https://anand-u.vercel.app/user/deleteAccount", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) {
                // On success, configure the result dialog to show a success message
                setResultDialog({
                    type: 'success',
                    title: 'Account Deleted',
                    message: 'Your account has been successfully deleted.',
                    // The onConfirm for the success dialog will log the user out
                    onConfirm: () => {
                        logout();
                        navigate("/");
                    }
                });
            }
        } catch (err) {
            console.error("Error deleting account:", err);
            // On error, configure the result dialog to show an error message
            setResultDialog({
                type: 'error',
                title: 'Deletion Failed',
                message: err.response?.data?.message || 'An unexpected error occurred. Please try again.'
            });
        }
    };

    if (!user) {
        return <div>Loading Dashboard...</div>;
    }

    return (
        <div className="dashboard-page">
            <h1 className="dashboard-title">My Dashboard</h1>
            <div className="dashboard-nav">
                {/* ✨ Switched to NavLink and simplified the className logic */}
                <NavLink
                    to="/my-account"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <User />
                    <span>Account</span>
                </NavLink>

                <NavLink
                    to="/bookings"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <CalendarCheck />
                    <span>Bookings</span>
                </NavLink>

                <NavLink
                    to="/favourites"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <Heart />
                    <span>Favorites</span>
                </NavLink>

                <NavLink
                    to="/chat"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <MessageSquare />
                    <span>Chats</span>
                </NavLink>
                <NavLink
                    to="/my-reviews"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <Star />
                    <span>My Reviews</span>
                </NavLink>
                <button className="nav-item delete-trigger" onClick={() => setConfirmOpen(true)}>
                    <TriangleAlert />
                    <span>Delete Account</span>
                </button>
            </div>
            {/* DIALOG 1: For Confirmation */}
            <Dialog
                isOpen={isConfirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleAccountDelete}
                type="warning"
                icon={<TriangleAlert />}
                title="Confirm Account Deletion"
                confirmText="Yes, Delete My Account"
                cancelText="No, Keep My Account"
                confirmationLabel={`To confirm, please type "${user.username}" below:`}
                confirmationText={user.username}
            >
                This action is permanent and cannot be undone.
            </Dialog>

            {/* 3. DIALOG 2: For showing the Success/Error Result */}
            <Dialog
                isOpen={!!resultDialog}
                onClose={() => setResultDialog(null)}
                onConfirm={resultDialog?.onConfirm || (() => setResultDialog(null))}
                type={resultDialog?.type || 'info'}
                title={resultDialog?.title}
                confirmText="OK"
                confirmButtonOnly={true} // This hides the "Cancel" button
            >
                {resultDialog?.message}
            </Dialog>
        </div>
    );
}