import React from 'react';
import { Link } from 'react-router-dom';
import { allCategories } from '../data/categoriesData'; // Assuming you have this file to look up slugs and images
import '../css/SearchCategoryCard.css';

// Helper to find the full category object from a local data source
const getCategoryDetails = (categoryName) => {
    // This function is necessary because search results may only return the name
    return allCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
};

// Helper to convert a category name to a URL-friendly slug
const slugify = (name) => name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-').replace(/[^\w-]+/g, '');

export default function SearchCategoryCard({ category }) {
    const categoryDetails = getCategoryDetails(category.name);
    const slug = categoryDetails ? slugify(categoryDetails.name) : slugify(category.name);

    // Use the image from your local data, or a placeholder if not found
    const imageUrl = categoryDetails?.image || 'https://via.placeholder.com/100';

    return (
        <Link to={`/category/${slug}`} className="srp-category-card">
            <div className="srp-category-card__image-wrapper">
                <img src={imageUrl} alt={category.name} className="srp-category-card__image" />
            </div>
            <p className="srp-category-card__title">{category.name}</p>
        </Link>
    );
}