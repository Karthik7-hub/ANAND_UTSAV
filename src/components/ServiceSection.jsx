import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/ServiceStyles.css";
import ServiceCard from "./ServiceCard";
import axios from "axios";

export default function ServicePreview() {
  const [previewServices, setPreviewServices] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ loading state

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true); // start loading
      try {
        const response = await axios.get(
          "https://anand-u.vercel.app/provider/allservices"
        );

        console.log("Fetched services:", response.data);

        const serviceList = Array.isArray(response.data) ? response.data : [];
        setPreviewServices(serviceList); // first 6
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false); // stop loading
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="services-section">
      <h3 className="section-title">Book Top-Tier Services</h3>
      {loading ? ( // ✅ show loading while fetching
        <p>Loading services...</p>
      ) : (
        <div className="service-grid">
          {previewServices.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      )}
    </section>
  );
}
