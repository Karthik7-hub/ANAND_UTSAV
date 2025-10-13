// The URL of your live API on Hugging Face
const API_URL = 'https://captain17298-search-engine-anand-ustav.hf.space/search';

/**
 * Performs a search query against the semantic search API.
 * @param {string} query The user's search term.
 * @returns {Promise<Array>} A promise that resolves to an array of search results.
 */
export const performSearch = async (query) => {
    if (!query || !query.trim()) {
        return []; // Return empty if query is invalid
    }

    try {
        const searchUrl = `${API_URL}?q=${encodeURIComponent(query)}`;
        const response = await fetch(searchUrl);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.results || []; // Ensure we always return an array
    } catch (error) {
        console.error("Failed to fetch search results:", error);
        // In a real app, you might want to throw the error to be handled by the UI
        // For now, we return an empty array to prevent crashes.
        return [];
    }
};