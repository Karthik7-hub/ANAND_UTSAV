import React, { useState } from "react";
import { providerAddServiceRequest } from "../utils/providerAuthApi";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Trash2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import Dialog from '../components/Dialog';
import '../css/AddService.css';

export default function AddService() {
  const [form, setForm] = useState({
    name: "",
    categoryName: "",
    priceAmount: "",
    priceUnit: "full-package",
    description: "",
    images: [""],
    minPeople: "",
    maxPeople: "",
    mindaysprior: ""
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // State to manage the dialog's visibility and content
  const [dialogState, setDialogState] = useState({ isOpen: false });

  // Helper functions to control the dialog
  const showDialog = (config) => setDialogState({ ...config, isOpen: true });

  const closeDialog = () => setDialogState(prevState => ({ ...prevState, isOpen: false }));


  // ✨ --- NEW ROBUST HANDLER FOR NUMBER INPUTS --- ✨
  const handleNumberChange = (fieldName, value) => {
    // Allow the user to clear the input field
    if (value === "") {
      setForm({ ...form, [fieldName]: "" });
      return;
    }

    const num = Number(value);
    // Only update state if the value is a valid, non-negative number
    if (!isNaN(num) && num >= 0) {
      setForm({ ...form, [fieldName]: value });
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...form.images];
    newImages[index] = value;
    setForm({ ...form, images: newImages });
  };

  const addImageInput = () => {
    setForm({ ...form, images: [...form.images, ""] });
  };

  const removeImageInput = (index) => {
    const newImages = form.images.filter((_, i) => i !== index);
    setForm({ ...form, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(form.minPeople) < 1) {
      showDialog({ type: 'error', title: 'Invalid Input', icon: <XCircle />, children: "Minimum People must be at least 1.", confirmButtonOnly: true, onConfirm: closeDialog });
      return;
    }

    if (Number(form.maxPeople) > 0 && Number(form.minPeople) > Number(form.maxPeople)) {
      showDialog({ type: 'error', title: 'Invalid Input', icon: <XCircle />, children: "Minimum People cannot be more than Maximum People.", confirmButtonOnly: true, onConfirm: closeDialog });
      return;
    }

    setLoading(true);

    const payload = {
      name: form.name.trim(), categoryName: form.categoryName.trim(), description: form.description.trim(),
      images: form.images.map(img => img.trim()).filter(img => img !== ""),
      priceInfo: { amount: Number(form.priceAmount), unit: form.priceUnit },
      minPeople: Number(form.minPeople), maxPeople: Number(form.maxPeople),
      mindaysprior: Number(form.mindaysprior || 0),
    };

    const res = await providerAddServiceRequest(payload);

    if (res.success) {
      showDialog({
        type: 'success', title: 'Success!', icon: <CheckCircle />,
        children: 'Service added successfully. You will be redirected to your dashboard.',
        confirmButtonOnly: true, confirmText: 'OK',
        onConfirm: () => navigate("/provider/dashboard", { state: { newService: res.service } })
      });
    } else {
      showDialog({
        type: 'error', title: 'Request Failed', icon: <XCircle />,
        children: res.msg || "Failed to add service.",
        confirmButtonOnly: true, onConfirm: closeDialog
      });
    }
    setLoading(false);
  };

  return (
    <div className="asf-add-service-page">
      <Dialog {...dialogState} onClose={closeDialog} />
      <div className="asf-service-form-card">
        <button
          type="button"
          className="asf-back-icon-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back to dashboard"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="asf-form-title">Create a New Service</h2>
        <form onSubmit={handleSubmit} className="asf-service-form">
          {/* --- ROW 1 --- */}
          <div className="asf-form-group">
            <label>Service Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="asf-form-input" />
          </div>
          <div className="asf-form-group">
            <label>Category</label>
            <select value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} required className="asf-form-select">
              <option value="">Select Category</option>
              <option value="Catering">Catering</option>
              <option value="Decorations">Decorations</option>
              <option value="Photography">Photography</option>
              <option value="Videography">Videography</option>
              <option value="Beauty & Makeup">Beauty & Makeup</option>
              <option value="Fashion & Attire">Fashion & Attire</option>
              <option value="Invitations">Invitations</option>
              <option value="Venues">Venues</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Music Bands">Music Bands</option>
              <option value="DJs">DJs</option>
              <option value="Travel">Travel</option>
              <option value="Transport">Transport</option>
              <option value="Event Planning">Event Planning</option>
              <option value="Florists">Florists</option>
              <option value="Production (Sound & Lights)">Production (Sound & Lights)</option>
              <option value="Fireworks">Fireworks</option>
              <option value="Mehndi Artists">Mehndi Artists</option>
              <option value="Gifting">Gifting</option>
              <option value="Jewellery">Jewellery</option>
            </select>
          </div>

          {/* --- ROW 2 --- */}
          <div className="asf-form-group full-width">
            <label>Price</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="number" placeholder="Amount" value={form.priceAmount}
                onChange={(e) => handleNumberChange('priceAmount', e.target.value)}
                required className="asf-form-input" style={{ flex: 2 }} min="0" />
              <select value={form.priceUnit} onChange={(e) => setForm({ ...form, priceUnit: e.target.value })} required className="asf-form-select" style={{ flex: 1 }}>
                <option value="full-package">Full Package</option>
                <option value="per-hour">Per Hour</option>
                <option value="per-day">Per Day</option>
                <option value="per-person">Per Person</option>
              </select>
            </div>
          </div>

          {/* --- ROW 3 --- */}
          <div className="asf-form-group">
            <label>Minimum & Maximum People</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="number" placeholder="Min People" value={form.minPeople}
                onChange={(e) => handleNumberChange('minPeople', e.target.value)}
                required className="asf-form-input" style={{ flex: 1 }} min="1" />
              <input type="number" placeholder="Max People" value={form.maxPeople}
                onChange={(e) => handleNumberChange('maxPeople', e.target.value)}
                required className="asf-form-input" style={{ flex: 1 }} min="1" />
            </div>
          </div>

          {/* Minimum Days Prior Booking */}
          <div className="asf-form-group">
            <label>Minimum Days Prior Booking</label>
            <input type="number" placeholder="e.g., 7" value={form.mindaysprior}
              onChange={(e) => handleNumberChange('mindaysprior', e.target.value)}
              className="asf-form-input" min="0" />
          </div>

          {/* Description */}
          <div className="asf-form-group full-width">
            <label>Description</label>
            <textarea placeholder="Describe your service..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="asf-form-textarea" />
          </div>

          {/* Images */}
          <div className="asf-form-group full-width">
            <label>Image URLs</label>
            {form.images.map((url, index) => (
              <div key={index} className="asf-image-input-group">
                <input type="text" placeholder="https://example.com/image.jpg" value={url} onChange={(e) => handleImageChange(index, e.target.value)} className="asf-form-input" />
                {form.images.length > 1 && (
                  <button type="button" onClick={() => removeImageInput(index)} className="asf-remove-image-btn"><Trash2 size={18} /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={addImageInput} className="asf-add-image-btn">
              <PlusCircle size={16} /> Add another URL
            </button>
          </div>

          <button type="submit" className="asf-submit-btn" disabled={loading}>
            {loading ? "Adding..." : "Add Service"}
          </button>
        </form>
      </div>
    </div>
  );
}