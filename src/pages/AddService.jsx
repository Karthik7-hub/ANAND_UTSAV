import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { providerAddServiceRequest } from "../utils/providerAuthApi";
import { useTheme } from '../context/ThemeContext'; // ✅ Uses the global showDialog function from ThemeContext
import { PlusCircle, Trash2, CheckCircle, XCircle, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import '../css/AddService.css';

// ✅ The self-contained modal for viewing images is included.
const ImageViewerModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="asf-image-viewer-overlay" onClick={onClose}>
      <div className="asf-image-viewer-content" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Full size preview" className="asf-image-viewer-img" />
        <button onClick={onClose} className="asf-close-viewer-btn"><X size={24} /></button>
      </div>
    </div>
  );
};

export default function AddService() {
  const [form, setForm] = useState({
    name: "",
    categoryName: "",
    priceAmount: "",
    priceUnit: "full-package",
    description: "",
    images: [null], // This will hold the File objects
    minPeople: "",
    maxPeople: "",
    mindaysprior: ""
  });

  const [imagePreviews, setImagePreviews] = useState([null]);
  const [viewingImage, setViewingImage] = useState(null); // URL of the image to view
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { showDialog } = useTheme();

  // Handles changes for all number inputs to prevent invalid entries
  const handleNumberChange = (fieldName, value) => {
    if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setForm({ ...form, [fieldName]: value });
    }
  };

  // ✅ Handles file selection and generates previews.
  const handleImageChange = (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const newImages = [...form.images];
    newImages[index] = file;
    setForm({ ...form, images: newImages });

    const newImagePreviews = [...imagePreviews];
    newImagePreviews[index] = URL.createObjectURL(file);
    setImagePreviews(newImagePreviews);
  };

  // Adds a new empty slot for another file upload
  const addImageInput = () => {
    setForm({ ...form, images: [...form.images, null] });
    setImagePreviews([...imagePreviews, null]);
  };

  // Removes a file upload slot and its corresponding preview
  const removeImageInput = (index) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (Number(form.minPeople) < 1) {
      showDialog({ type: 'error', title: 'Invalid Input', icon: <XCircle />, message: "Minimum People must be at least 1.", confirmButtonOnly: true });
      return;
    }
    if (Number(form.maxPeople) > 0 && Number(form.minPeople) > Number(form.maxPeople)) {
      showDialog({ type: 'error', title: 'Invalid Input', icon: <XCircle />, message: "Minimum People cannot be more than Maximum People.", confirmButtonOnly: true });
      return;
    }

    setLoading(true);

    // Construct a FormData object to send files
    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('categoryName', form.categoryName.trim());
    formData.append('description', form.description.trim());
    formData.append('priceInfo', JSON.stringify({ amount: Number(form.priceAmount), unit: form.priceUnit }));
    formData.append('minPeople', Number(form.minPeople));
    formData.append('maxPeople', Number(form.maxPeople));
    formData.append('mindaysprior', Number(form.mindaysprior || 0));

    // Append each valid file with the key 'images'
    form.images.forEach(file => {
      if (file) {
        // Change this line
        formData.append('previousWorkImages', file); // ✅ Corrected Key
      }
    });

    const res = await providerAddServiceRequest(formData);

    if (res.success) {
      showDialog({
        type: 'success', title: 'Success!', icon: <CheckCircle />,
        message: 'Service added successfully. You will be redirected to your dashboard.',
        confirmButtonOnly: true, confirmText: 'OK',
        onConfirm: () => navigate("/provider/dashboard", { state: { newService: res.service } })
      });
    } else {
      showDialog({
        type: 'error', title: 'Request Failed', icon: <XCircle />,
        message: res.msg || "Failed to add service.",
        confirmButtonOnly: true,
      });
    }
    setLoading(false);
  };

  return (
    <div className="asf-add-service-page">
      <ImageViewerModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />

      <div className="asf-service-form-card">
        <button type="button" className="asf-back-icon-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={24} />
        </button>
        <h2 className="asf-form-title">Create a New Service</h2>
        <form onSubmit={handleSubmit} className="asf-service-form">
          {/* --- ROW 1: Service Name & Category --- */}
          <div className="asf-form-group">
            <label>Service Name</label>
            <input type="text" placeholder="e.g., Premium Wedding Photography" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="asf-form-input" />
          </div>

          {/* ✅ Uses the simple <select> dropdown for categories as you requested. */}
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

          {/* --- ROW 2: Price --- */}
          <div className="asf-form-group full-width">
            <label>Price</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="number" placeholder="Amount" value={form.priceAmount} onChange={(e) => handleNumberChange('priceAmount', e.target.value)} required className="asf-form-input" style={{ flex: 2 }} min="0" />
              <select value={form.priceUnit} onChange={(e) => setForm({ ...form, priceUnit: e.target.value })} required className="asf-form-select" style={{ flex: 1 }}>
                <option value="full-package">Full Package</option>
                <option value="per-event">Per Event</option>
                <option value="per-hour">Per Hour</option>
                <option value="per-day">Per Day</option>
                <option value="per-person">Per Person</option>
              </select>
            </div>
          </div>

          {/* --- ROW 3: People & Booking Days --- */}
          <div className="asf-form-group">
            <label>Guest Capacity</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="number" placeholder="Min People" value={form.minPeople} onChange={(e) => handleNumberChange('minPeople', e.target.value)} required className="asf-form-input" style={{ flex: 1 }} min="1" />
              <input type="number" placeholder="Max People" value={form.maxPeople} onChange={(e) => handleNumberChange('maxPeople', e.target.value)} required className="asf-form-input" style={{ flex: 1 }} min="1" />
            </div>
          </div>
          <div className="asf-form-group">
            <label>Minimum Days Prior Booking</label>
            <input type="number" placeholder="e.g., 7" value={form.mindaysprior} onChange={(e) => handleNumberChange('mindaysprior', e.target.value)} className="asf-form-input" min="0" />
          </div>

          {/* --- ROW 4: Description --- */}
          <div className="asf-form-group full-width">
            <label>Description</label>
            <textarea placeholder="Describe your service in detail..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="asf-form-textarea" />
          </div>

          {/* --- ROW 5: IMAGES (File Uploads) --- */}
          {/* --- IMAGES --- */}
          <div className="asf-form-group full-width">
            <label>Service Images</label>
            {form.images.map((_, index) => (
              <div key={index} className="asf-image-input-group">
                {/* ✅ FIX: Image preview is now separate from the label */}
                <div className="asf-image-preview-wrapper">
                  {imagePreviews[index] ? (
                    <img
                      src={imagePreviews[index]}
                      alt={`Preview ${index}`}
                      className="asf-image-preview"
                      onClick={() => setViewingImage(imagePreviews[index])}
                    />
                  ) : (
                    <label htmlFor={`image-upload-${index}`} className="asf-image-placeholder">
                      <ImageIcon size={24} />
                      <span>Click to select image</span>
                    </label>
                  )}
                </div>
                <input id={`image-upload-${index}`} type="file" accept="image/*" onChange={(e) => handleImageChange(index, e)} className="asf-form-input-hidden" />
                {form.images.length > 1 && (
                  <button type="button" onClick={() => removeImageInput(index)} className="asf-remove-image-btn"><Trash2 size={18} /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={addImageInput} className="asf-add-image-btn">
              <PlusCircle size={16} /> Add another Image
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