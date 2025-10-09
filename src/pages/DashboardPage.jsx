// src/pages/DashboardPage.jsx

import React from 'react';
import { User, Heart, CalendarCheck, MessageSquare, Star } from 'lucide-react';
import { NavLink } from "react-router-dom";
import '../css/Dashboard.css';

export default function DashboardPage() {
    // ✨ We no longer need useState or the renderContent function

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
            </div>

            {/* ✨ The content area is removed as this is now a navigation-only page */}
        </div>
    );
}