import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Package, Tag } from 'lucide-react';
import { allCategories } from "../data/categoriesData";

const categoryImageMap = allCategories.reduce((map, category) => {
  map[category.name.toLowerCase()] = category.image;
  return map;
}, {});

export default function ServiceProviderCard({ service, onDelete }) {
    const navigate = useNavigate();

    const getSafeUrl = (imgData) => {
        if (!imgData) return null;
        if (typeof imgData === "string") return imgData;
        if (imgData.url && typeof imgData.url === "string") return imgData.url;
        return null;
    };

    const primaryImageRaw = service.images?.[0];
    const primaryImage = getSafeUrl(primaryImageRaw);

    const categoryImage = service.categories?.name
        ? categoryImageMap[service.categories.name.toLowerCase()]
        : service.categoryName
        ? categoryImageMap[service.categoryName.toLowerCase()]
        : null;

    const getInitialImage = () => {
        if (primaryImage) return primaryImage;
        if (categoryImage) return categoryImage;
        return null;
    };

    const [currentImageSrc, setCurrentImageSrc] = useState(getInitialImage);

    useEffect(() => {
        setCurrentImageSrc(getInitialImage());
    }, [service._id, primaryImage]);

    const handleImageError = () => {
        if (currentImageSrc === primaryImage) {
            if (categoryImage) {
                setCurrentImageSrc(categoryImage);
            } else {
                setCurrentImageSrc(null);
            }
        } else if (currentImageSrc === categoryImage) {
            setCurrentImageSrc(null);
        }
    };

    const handleEdit = (e) => {
        e.preventDefault();
        navigate("/provider/edit-service", { state: { service } });
    };

    const handleDeleteClick = (e) => {
        e.preventDefault();
        onDelete();
    };

    return (
        <>
            <style>{`
                .provider-card {
                    background-color: #1e293b;
                    border-radius: 16px;
                    overflow: hidden;
                    position: relative;
                    height: 350px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .provider-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                }
                .card-bg-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 1;
                    transition: transform 0.4s ease;
                }
                .provider-card:hover .card-bg-image {
                    transform: scale(1.05);
                }
                .card-image-placeholder {
                    width: 100%; height: 100%; display: grid; place-items:center;
                    background-color: #1e293b; color: #94a3b8;
                    position: absolute; top: 0; left: 0; z-index: 1;
                }
                .content-overlay {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%, rgba(0,0,0,0.1) 100%);
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .top-section {
                    display: flex;
                    justify-content: flex-start;
                }
                .category-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    font-size: 0.8rem;
                    padding: 0.25rem 0.7rem;
                    border-radius: 20px;
                    background-color: rgba(0,0,0,0.4);
                    backdrop-filter: blur(5px);
                    color: #fff;
                }
                .service-name {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #fff;
                    margin: 0 0 0.5rem 0;
                    line-height: 1.2;
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.7);
                }
                .price-and-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .service-price {
                    font-size: 1.1rem;
                    font-weight: bold;
                    color: var(--primary-color, #FF9B33);
                    margin: 0;
                }
                .card-actions {
                    display: flex;
                    gap: 0.5rem;
                }
                .card-action-btn {
                    width: 40px; height: 40px; border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: #fff; display: grid; place-items: center;
                    cursor: pointer; transition: all 0.2s ease;
                }
                .card-action-btn:hover { background-color: var(--primary-color, #FF9B33); }
                .card-action-btn.delete-btn:hover { background-color: #ef4444; }
            `}</style>
            <div className="provider-card">
                {currentImageSrc ? (
                    <img src={currentImageSrc} className="card-bg-image" alt={service.name} onError={handleImageError} />
                ) : (
                    <div className="card-image-placeholder"><Package size={48} /></div>
                )}
                <div className="content-overlay">
                    <div className="top-section">
                        <span className="category-tag"><Tag size={14} /> {service.categoryName}</span>
                    </div>
                    <div className="bottom-section">
                        <h4 className="service-name">{service.name}</h4>
                        <div className="price-and-actions">
                            <p className="service-price">₹{service.priceInfo.amount} / {service.priceInfo.unit}</p>
                            <div className="card-actions">
                                <button onClick={handleEdit} className="card-action-btn" title="Edit Service">
                                    <Edit size={18} />
                                </button>
                                <button onClick={handleDeleteClick} className="card-action-btn delete-btn" title="Delete Service">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}