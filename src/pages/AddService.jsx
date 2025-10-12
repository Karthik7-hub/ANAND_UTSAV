import React, { useState } from "react";
import { providerAddServiceRequest } from "../utils/providerAuthApi";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Trash2 } from 'lucide-react';

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
    setLoading(true);

    if (Number(form.minPeople) > Number(form.maxPeople)) {
      alert("Minimum People cannot be more than Maximum People");
      setLoading(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      categoryName: form.categoryName.trim(),
      description: form.description.trim(),
      images: form.images.map(img => img.trim()).filter(img => img !== ""),
      priceInfo: {
        amount: Number(form.priceAmount),
        unit: form.priceUnit,
      },
      minPeople: Number(form.minPeople),
      maxPeople: Number(form.maxPeople),
      mindaysprior: Number(form.mindaysprior || 0),
    };

    const res = await providerAddServiceRequest(payload);

    if (res.success) {
      alert("✅ Service added successfully");
      navigate("/provider/dashboard", { state: { newService: res.service } });
    } else {
      alert(res.msg || "❌ Failed to add service");
    }
    setLoading(false);
  };

  return (
    <div className="asf-add-service-page">
      <div className="asf-service-form-card">
        <h2 className="asf-form-title">Create a New Service</h2>
        <form onSubmit={handleSubmit} className="asf-service-form">

          {/* Service Name */}
          <div className="asf-form-group">
            <label>Service Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="asf-form-input" />
          </div>

          {/* Category */}
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

          {/* Price */}
          <div className="asf-form-group">
            <label>Price</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="number" placeholder="Amount" value={form.priceAmount} onChange={(e) => setForm({ ...form, priceAmount: e.target.value })} required className="asf-form-input" style={{ flex: 2 }} />
              <select value={form.priceUnit} onChange={(e) => setForm({ ...form, priceUnit: e.target.value })} required className="asf-form-select" style={{ flex: 1 }}>
                <option value="full-package">Full Package</option>
                <option value="per-hour">Per Hour</option>
                <option value="per-day">Per Day</option>
                <option value="per-person">Per Person</option>
              </select>
            </div>
          </div>

          {/* Min / Max People */}
          <div className="asf-form-group">
            <label>Minimum & Maximum People</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="number" placeholder="Min People" value={form.minPeople} onChange={(e) => setForm({ ...form, minPeople: e.target.value })} required className="asf-form-input" style={{ flex: 1 }} />
              <input type="number" placeholder="Max People" value={form.maxPeople} onChange={(e) => setForm({ ...form, maxPeople: e.target.value })} required className="asf-form-input" style={{ flex: 1 }} />
            </div>
          </div>

          {/* Mindaysprior */}
          <div className="asf-form-group">
            <label>Minimum Days Prior Booking</label>
            <input type="number" placeholder="e.g., 7" value={form.mindaysprior} onChange={(e) => setForm({ ...form, mindaysprior: e.target.value })} className="asf-form-input" />
          </div>

          {/* Description */}
          <div className="asf-form-group">
            <label>Description</label>
            <textarea placeholder="Describe your service..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="asf-form-textarea" />
          </div>

          {/* Images */}
          <div className="asf-form-group">
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
