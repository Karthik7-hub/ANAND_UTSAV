import React, { useState, useEffect } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import axios from 'axios';
import { allCategories } from '../data/categoriesData';
import ServiceCard from '../components/ServiceCard';
import "../css/AllServicesPage.css";
// 🔗 Map backend MongoDB category IDs to readable names
function getCategoryName(id) {
  const cat = allCategories.find((c) => c.id === id);
  return cat ? cat.name : 'Unknown';
}

export default function AllServicesPage() {
  const [services, setServices] = useState([]);
  const [categories] = useState(allCategories);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);

  
  // Fetch all services
  const fetchAllServices = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://anand-u.vercel.app/provider/allservices');
      const allServices = Array.isArray(res.data) ? res.data : [];
      

      const servicesWithCategory = allServices.map((s) => ({
  ...s,
  categoryName: getCategoryName(s.categories || s.categoryId || s.category),
}));

      setServices(servicesWithCategory);
    } catch (err) {
      console.error('❌ Failed to fetch services:', err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Load services once on mount
  useEffect(() => {
    fetchAllServices();
  }, []);
  // Handle category filter change
  // Handle category filter change
const handleCategoryChange = async (category) => {
  let updatedCategories = [...selectedCategories];

  // Add or remove the selected category
  if (selectedCategories.includes(category.id)) {
    updatedCategories = updatedCategories.filter(id => id !== category.id);
  } else {
    updatedCategories.push(category.id);
  }

  setSelectedCategories(updatedCategories);

  if (updatedCategories.length === 0) {
    fetchAllServices();
    return;
  }

  // Helper function to convert category name → slug
  const slugify = (name) =>
    name.toLowerCase()
        .replace(/ & /g, '-')
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');

  try {
    setLoading(true);

    // Map each selected category id to its name, then slugify and fetch
    const resArray = await Promise.all(
      updatedCategories.map(id => {
        const cat = allCategories.find(c => c.id === id);
        const slug = slugify(cat?.name || "");
        return axios.get(`https://anand-u.vercel.app/category/services/${slug}`);
      })
    );

    // Combine all fetched services
    const combinedServices = resArray.flatMap((r) => {
  const services = Array.isArray(r.data) ? r.data : [];
  return services.map((s) => ({
    ...s,
    categoryName: getCategoryName(s.categories || s.categoryId || s.category),
  }));
});


    setServices(combinedServices);
  } catch (err) {
    console.error("❌ Failed to fetch services for selected categories:", err);
    setServices([]);
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="services-page-background">
      <div className="services-page-container">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <h3>Categories</h3>
          <div className="category-checkboxes">
            {allCategories.map(cat => (
              <label key={cat._id} className="category-label">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => handleCategoryChange(cat)}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="view-toggle">
            <button onClick={() => setViewMode('grid')}><LayoutGrid /></button>
            <button onClick={() => setViewMode('list')}><List /></button>
          </div>

          {loading ? (
            <p>Loading services...</p>
          ) : (
            <div className={viewMode === 'grid' ? 'service-grid-view' : 'service-list-view'}>
              {services.length > 0 ? (
                services.map(service => (
                  <ServiceCard
                    key={service._id}
                    service={service}
                    viewMode={viewMode}
                    categories={categories}
                  />
                ))
              ) : (
                <div className="no-results">
                  <h3>No Services Found</h3>
                  <p>Select another category.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}