// src/components/ServicePreview.jsx

import React, { useState, useEffect } from "react";
import "./ServiceCard"; // Make sure ServiceCard is imported to register its component logic
import ServiceCard from "./ServiceCard";
import "../css/ServicePreview.css"; // ✨ Import the new section-specific stylesheet
import axios from "axios";

const ServiceCardSkeleton = () => (
  <div className="service-card-skeleton">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-line small"></div>
      <div className="skeleton-line title"></div>
      <div className="skeleton-line price"></div>
    </div>
  </div>
);

export default function ServicePreview() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await axios.get("https://anand-u.vercel.app/provider/allservices");
        setServices(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to fetch services:", error);
        setServices([]);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchServices();
  }, []);

  return (
    <section className="services-section">
      <div className="section-header">
        <h3 className="section-title">Explore the Services</h3>
        <p className="section-subtitle">
          Discover and book top-tier professionals for your perfect event.
        </p>
      </div>
      <div className="service-grid">
        {loading
          ? [...Array(8)].map((_, index) => <ServiceCardSkeleton key={index} />)
          : services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
      </div>
    </section>
  );
}