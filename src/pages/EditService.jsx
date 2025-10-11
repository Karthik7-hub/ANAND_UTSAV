import React, { useState, useEffect } from "react";
import { providerAddServiceRequest, providerUpdateServiceRequest } from "../utils/providerAuthApi";
import { useNavigate, useLocation } from "react-router-dom";
import { PlusCircle, Trash2 } from 'lucide-react';

export default function EditService() {
  const navigate = useNavigate();
  const location = useLocation();
  const serviceToEdit = location.state?.service; // passed from dashboard

  const [form, setForm] = useState({
    serviceId: "",
    name: "",
    categoryName: "",
    priceAmount: "",
    priceUnit: "full-package",
    description: "",
    images: [""],
    minPeople: 0,
    maxPeople: 0,
    mindaysprior: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (serviceToEdit) {
      setForm({
        serviceId: serviceToEdit._id,
        name: serviceToEdit.name || "",
        categoryName: serviceToEdit.categories?.name || "",
        priceAmount: serviceToEdit.priceInfo?.amount || "",
        priceUnit: serviceToEdit.priceInfo?.unit || "full-package",
        description: serviceToEdit.description || "",
        images: serviceToEdit.images.length ? serviceToEdit.images : [""],
        minPeople: serviceToEdit.minPeople || 0,
        maxPeople: serviceToEdit.maxPeople || 0,
        mindaysprior: serviceToEdit.mindaysprior || 0,
      });
    }
  }, [serviceToEdit]);

  const handleImageChange = (index, value) => {
    const newImages = [...form.images];
    newImages[index] = value;
    setForm({ ...form, images: newImages });
  };

  const addImageInput = () => setForm({ ...form, images: [...form.images, ""] });
  const removeImageInput = (index) => setForm({ ...form, images: form.images.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      serviceId: form.serviceId,
      name: form.name.trim(),
      categories: form.categoryName.trim(),
      description: form.description.trim(),
      images: form.images.map(img => img.trim()).filter(img => img !== ""),
      priceInfo: {
        amount: Number(form.priceAmount),
        unit: form.priceUnit,
      },
      minPeople: Number(form.minPeople),
      maxPeople: Number(form.maxPeople),
      mindaysprior: Number(form.mindaysprior),
    };

    const res = await providerUpdateServiceRequest(payload);

    if (res.success) {
      alert("✅ Service updated successfully");
      navigate("/provider/dashboard", { state: { updatedService: res.service } });
    } else {
      alert(res.msg || "❌ Failed to update service");
    }
    setLoading(false);
  };

  return (
    <div className="asf-add-service-page">
      <div className="asf-service-form-card">
        <h2 className="asf-form-title">Edit Service</h2>
        <form className="asf-service-form" onSubmit={handleSubmit}>
          {/* Service Name */}
          <div className="asf-form-group">
            <label>Service Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="asf-form-input"
            />
          </div>

          {/* Category */}
          <div className="asf-form-group">
            <label>Category</label>
            <input
              type="text"
              value={form.categoryName}
              onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
              required
              className="asf-form-input"
            />
          </div>

          {/* Price */}
          <div className="asf-form-group">
            <label>Price</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="number"
                value={form.priceAmount}
                onChange={(e) => setForm({ ...form, priceAmount: e.target.value })}
                required
                className="asf-form-input"
                style={{ flex: 2 }}
              />
              <select
                value={form.priceUnit}
                onChange={(e) => setForm({ ...form, priceUnit: e.target.value })}
                className="asf-form-select"
                style={{ flex: 1 }}
              >
                <option value="full-package">Full Package</option>
                <option value="per-hour">Per Hour</option>
                <option value="per-day">Per Day</option>
                <option value="per-person">Per Person</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="asf-form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="asf-form-textarea"
            />
          </div>

          {/* Images */}
          <div className="asf-form-group">
            <label>Image URLs</label>
            {form.images.map((url, index) => (
              <div key={index} className="asf-image-input-group">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  className="asf-form-input"
                />
                {form.images.length > 1 && (
                  <button type="button" onClick={() => removeImageInput(index)} className="asf-remove-image-btn">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addImageInput} className="asf-add-image-btn">
              <PlusCircle size={16} /> Add another URL
            </button>
          </div>

          {/* Min / Max People & Mindaysprior */}
          <div className="asf-form-group">
            <label>Minimum People</label>
            <input
              type="number"
              value={form.minPeople}
              onChange={(e) => setForm({ ...form, minPeople: e.target.value })}
              className="asf-form-input"
            />
          </div>
          <div className="asf-form-group">
            <label>Maximum People</label>
            <input
              type="number"
              value={form.maxPeople}
              onChange={(e) => setForm({ ...form, maxPeople: e.target.value })}
              className="asf-form-input"
            />
          </div>
          <div className="asf-form-group">
            <label>Days Prior Booking Required</label>
            <input
              type="number"
              value={form.mindaysprior}
              onChange={(e) => setForm({ ...form, mindaysprior: e.target.value })}
              className="asf-form-input"
            />
          </div>

          <button type="submit" className="asf-submit-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Service"}
          </button>
        </form>
      </div>
    </div>
  );
}
