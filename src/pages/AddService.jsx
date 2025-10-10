import React, { useState } from "react";
import { providerAddServiceRequest } from "../utils/providerAuthApi";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Trash2 } from 'lucide-react';

export default function AddService() {
  const [form, setForm] = useState({
    name: "",
    categoryName: "",
    priceAmount: "",
    priceUnit: "full",
    description: "",
    images: [""],
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

    const payload = {
      name: form.name.trim(),
      categoryName: form.categoryName.trim(),
      description: form.description.trim(),
      images: form.images.map(img => img.trim()).filter(img => img !== ""),
      priceInfo: {
        amount: Number(form.priceAmount),
        unit: form.priceUnit,
      },
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
    <>
      <style>{`
                :root {
                    --primary-color: #FF9933; /* Saffron */
                    --glass-bg: rgba(255, 255, 255, 0.1);
                    --glass-border: rgba(255, 255, 255, 0.2);
                    --text-light: #f0f0f0;
                    --font-sans: 'Poppins', sans-serif;
                }
                body { background-color: #111827; }

                .asf-add-service-page {
                    font-family: var(--font-sans); color: var(--text-light);
                    background: #111827; padding: 2rem 1rem; min-height: 100vh;
                }
                .asf-service-form-card {
                    max-width: 800px; margin: 0 auto; padding: 2.5rem;
                    background: var(--glass-bg); border-radius: 20px;
                    border: 1px solid var(--glass-border); backdrop-filter: blur(15px);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                    overflow: visible; 
                }
                .asf-form-title {
                    font-size: 2.5rem; margin-bottom: 2rem;
                    text-align: center; color: #fff;
                }
                .asf-service-form {
                    display: grid; grid-template-columns: 1fr; /* Single column layout */
                    gap: 1.5rem;
                }
                .asf-form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .asf-form-group label { font-weight: 500; font-size: 0.9rem; }
                .asf-form-input, .asf-form-select, .asf-form-textarea {
                    width: 100%; background: var(--glass-bg);
                    border: 1px solid var(--glass-border); border-radius: 8px;
                    padding: 12px; color: var(--text-light); font-size: 1rem;
                    font-family: var(--font-sans); transition: all 0.3s ease;
                }
                .asf-form-input::placeholder, .asf-form-textarea::placeholder { color: #aaa; }
                .asf-form-input:focus, .asf-form-select:focus, .asf-form-textarea:focus {
                    outline: none; border-color: var(--primary-color);
                    box-shadow: 0 0 10px rgba(255, 153, 51, 0.5);
                }

                /* --- ✨ Corrected Dropdown Arrow Style --- */
                .asf-form-select {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                }
                .asf-form-select option { background: #1f2937; color: var(--text-light); }
                
                .asf-form-textarea { resize: vertical; min-height: 120px; }
                .asf-image-input-group { display: flex; align-items: center; gap: 0.5rem; }
                .asf-remove-image-btn {
                    background: transparent; border: none; color: #ff6b6b; cursor: pointer;
                    padding: 8px; display: flex; align-items: center; justify-content: center;
                    border-radius: 50%;
                }
                .asf-remove-image-btn:hover { background: rgba(255, 107, 107, 0.2); }
                .asf-add-image-btn {
                    justify-self: start; display: inline-flex;
                    align-items: center; gap: 0.5rem; background: transparent;
                    border: 1px dashed var(--glass-border); color: var(--text-light);
                    padding: 8px 16px; border-radius: 8px; cursor: pointer;
                    transition: all 0.3s ease;
                    align-self: flex-start;
                }
                .asf-add-image-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }
                .asf-submit-btn {
                    align-self: center;
                    background-color: var(--primary-color); color: #fff; border: none;
                    padding: 12px 32px; border-radius: 50px; font-size: 1rem;
                    font-weight: 600; cursor: pointer; transition: all 0.3s ease;
                    width: 50%;
                    margin-top: 1rem;
                }
                .asf-submit-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 4px 15px rgba(255, 153, 51, 0.4);
                }
                .asf-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                @media (max-width: 600px) {
                    .asf-submit-btn { width: 100%; }
                }
            `}</style>
      <div className="asf-add-service-page">
        <div className="asf-service-form-card">
          <h2 className="asf-form-title">Create a New Service</h2>
          <form onSubmit={handleSubmit} className="asf-service-form">

            <div className="asf-form-group">
              <label htmlFor="name">Service Name</label>
              <input id="name" type="text" placeholder="e.g., Royal Wedding Catering" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="asf-form-input" />
            </div>

            <div className="asf-form-group">
              <label htmlFor="category">Category</label>
              <select id="category" value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} required className="asf-form-select">
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

            <div className="asf-form-group">
              <label htmlFor="description">Description</label>
              <textarea id="description" placeholder="Describe your service in detail..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="asf-form-textarea" />
            </div>

            <div className="asf-form-group">
              <label>Image URLs</label>
              {form.images.map((url, index) => (
                <div key={index} className="asf-image-input-group" style={{ marginBottom: '0.5rem' }}>
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
    </>
  );
}