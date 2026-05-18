// src/components/ServicePreview.jsx

import React, { useState, useEffect } from "react";
import "./ServiceCard"; // Make sure ServiceCard is imported to register its component logic
import ServiceCard from "./ServiceCard";
import "../css/ServicePreview.css"; // Import the new section-specific stylesheet
import { fetchAllServices, fetchSmartHomeFeed } from "../api";
import { Loader2 } from "lucide-react"; // Smooth premium spinner icon

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
  const [visibleCount, setVisibleCount] = useState(8);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const storedLoc = localStorage.getItem("userLocation");
        let lat, lng;
        if (storedLoc) {
            const parsed = JSON.parse(storedLoc);
            lat = parsed.lat;
            lng = parsed.lng;
        }

        const storedSearches = localStorage.getItem("recentSearches");
        let recentSearches = [];
        if (storedSearches) {
            recentSearches = JSON.parse(storedSearches);
        }

        // 1. Fetch recommendation feed
        let feedServices = [];
        try {
          const data = await fetchSmartHomeFeed(lat, lng, recentSearches);
          if (data && data.success && data.data) {
              const seenIds = new Set();
              const feed = data.data;
              const collections = [
                  feed.recommendedForYou,
                  feed.nearbyServices,
                  feed.trendingInCity,
                  feed.basedOnSearches,
                  feed.similarUsersBooked,
                  feed.topRatedNearby
              ];
              
              collections.forEach(collection => {
                  if (Array.isArray(collection)) {
                      collection.forEach(item => {
                          const svc = item.item || item;
                          if (svc && svc._id && !seenIds.has(svc._id)) {
                              seenIds.add(svc._id);
                              feedServices.push(svc);
                          }
                      });
                  }
              });
          }
        } catch (feedErr) {
          console.error("Failed to load recommendation feed:", feedErr);
        }

        // 2. Fetch all services
        const fallbackData = await fetchAllServices();
        const allServicesArr = Array.isArray(fallbackData) ? fallbackData : [];

        // 3. Combine: recommendations first, then remaining local services
        const combined = [...feedServices];
        const combinedIds = new Set(feedServices.map(s => s._id));

        allServicesArr.forEach(svc => {
            if (svc && svc._id && !combinedIds.has(svc._id)) {
                combined.push(svc);
            }
        });

        setServices(combined);
      } catch (error) {
        console.error("Failed to fetch services:", error);
        setServices([]);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchServices();
  }, []);

  // --- Infinite Scroll Scroll Listener ---
  useEffect(() => {
    if (services.length === 0) return;

    const handleScroll = () => {
      // If we have already displayed everything, remove listener
      if (visibleCount >= services.length) return;

      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 400
      ) {
        setLoadingMore(true);
        // Add a slight delay for premium feeling loading micro-animations
        setTimeout(() => {
          setVisibleCount((prev) => {
            const next = Math.min(prev + 8, services.length);
            setLoadingMore(false);
            return next;
          });
        }, 600);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [services.length, visibleCount]);

  const displayedServices = services.slice(0, visibleCount);

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
          : displayedServices.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
      </div>

      {/* Infinite Scroll loading indicators / loaded message */}
      {!loading && services.length > 0 && (
        <div className="infinite-scroll-status" style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "3rem 0 1rem 0",
          color: "var(--text-color-light)",
          fontFamily: "var(--font-body)",
          fontSize: "0.95rem"
        }}>
          {visibleCount < services.length ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              <span>Loading more services...</span>
            </div>
          ) : (
            <span style={{ opacity: 0.6 }}>All {services.length} services loaded successfully</span>
          )}
        </div>
      )}

      {/* Embedded CSS for spin animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}