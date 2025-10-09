// src/pages/MyAccountPage.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import "../css/MyAccountPage.css";

const ProfileSkeleton = () => (
  <div className="my-account-page">
    <div className="skeleton-line title-skeleton"></div>
    <div className="profile-card skeleton-card">
      <div className="skeleton-field">
        <div className="skeleton-line label-skeleton"></div>
        <div className="skeleton-line input-skeleton"></div>
      </div>
      <div className="skeleton-field">
        <div className="skeleton-line label-skeleton"></div>
        <div className="skeleton-line input-skeleton"></div>
      </div>
      <div className="skeleton-field">
        <div className="skeleton-line label-skeleton"></div>
        <div className="skeleton-line input-skeleton"></div>
      </div>
      <div className="skeleton-field">
        <div className="skeleton-line label-skeleton"></div>
        <div className="skeleton-line input-skeleton"></div>
      </div>
      <div className="profile-buttons skeleton-buttons">
        <div className="skeleton-line button-skeleton"></div>
      </div>
    </div>
  </div>
);

export default function MyAccountPage() {
  const { token, logout } = useUser();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await axios.get("https://anand-u.vercel.app/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserDetails(res.data);
        setFormData({
          fullName: res.data.fullName || "",
          username: res.data.username || "",
          phone: res.data.phone || "",
          location: res.data.location || "",
        });
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    if (token) fetchUserDetails();
    else setLoading(false);
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value, }));
  };

  const handleSave = async () => {
    try {
      const res = await axios.put("https://anand-u.vercel.app/user/updateUser", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserDetails(res.data);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    try {
      const res = await axios.delete("https://anand-u.vercel.app/user/deleteAccount", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        alert("Account deleted successfully");
        logout();
        navigate("/");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("Failed to delete account");
    }
  };

  if (loading) return <ProfileSkeleton />;

  if (!userDetails) return <p>Please log in to view your profile.</p>;

  return (
    <div className="my-account-page">
      <h2>My Profile</h2>
      <div className="profile-card">
        {/* Full Name Field */}
        <div className="form-field">
          <label htmlFor="fullName">Full Name</label>
          {editing ? (
            <input id="fullName" type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
          ) : (
            <p className="field-value">{userDetails.fullName || "-"}</p>
          )}
        </div>

        {/* Username Field */}
        <div className="form-field">
          <label htmlFor="username">Username</label>
          {editing ? (
            <input id="username" type="text" name="username" value={formData.username} onChange={handleChange} />
          ) : (
            <p className="field-value">{userDetails.username || "-"}</p>
          )}
        </div>

        {/* Phone Field */}
        <div className="form-field">
          <label htmlFor="phone">Phone</label>
          {editing ? (
            <input id="phone" type="text" name="phone" value={formData.phone} onChange={handleChange} />
          ) : (
            <p className="field-value">{userDetails.phone || "-"}</p>
          )}
        </div>

        {/* Location Field */}
        <div className="form-field">
          <label htmlFor="location">Location</label>
          {editing ? (
            <input id="location" type="text" name="location" value={formData.location} onChange={handleChange} />
          ) : (
            <p className="field-value">{userDetails.location || "-"}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="profile-buttons">
          {editing ? (
            <>
              <button onClick={handleSave} className="save-btn">Save</button>
              <button onClick={() => setEditing(false)} className="cancel-btn">Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="edit-btn">Edit Profile</button>
          )}
          {/* ✨ "My Reviews" button has been removed from here */}
          <button onClick={handleDelete} className="delete-btn">Delete Account</button>
        </div>
      </div>
    </div>
  );
}