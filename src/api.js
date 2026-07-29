import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const CHAT_URL = import.meta.env.VITE_CHAT_API_URL || BASE_URL;
export const SEARCH_API_URL = `${import.meta.env.VITE_ML_API_URL || 'https://captain17298-anandustav-ai-recommendation.hf.space'}/search`;

// Setup default axios instance with credentials
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically attach authorization Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token") || localStorage.getItem("providerToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * Generic API request handler to catch errors uniformly
 */
const handleRequest = async (requestPromise) => {
  try {
    const res = await requestPromise;
    return res.data;
  } catch (err) {
    console.error("API Request Error:", err);
    return {
      success: false,
      msg: err.response?.data?.msg || err.response?.data?.message || err.message || "Something went wrong. Please try again.",
      message: err.response?.data?.message || err.response?.data?.msg || err.message || "Network error. Please check your connection."
    };
  }
};

/**
 * Generic fetch wrapper for endpoints still using native fetch
 */
const fetchRequest = async (endpoint, payload) => {
  try {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${BASE_URL}${cleanEndpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { success: response.ok, msg: text || "Request processed" };
    }

    if (!response.ok) {
      return { success: false, message: data.message || data.msg || `Server error: ${response.status}`, msg: data.msg || data.message };
    }

    return { ...data, success: data.success ?? true, message: data.message || data.msg || "" };
  } catch (err) {
    console.error(`Fetch Request Error to ${endpoint}:`, err);
    return {
      success: false,
      msg: "Unable to connect to server. Please check your internet connection or backend server status.",
      message: "Unable to connect to server. Please check your internet connection or backend server status."
    };
  }
};

// ==========================================
// 🧑‍💼 PROVIDER API endpoints
// ==========================================
export const providerLoginRequest = (formData) =>
  handleRequest(api.post('/provider/auth/login', {
    email: formData?.email?.trim(),
    password: formData?.password?.trim(),
  }));

export const providerLogoutRequest = () => handleRequest(api.post('/provider/auth/logout', {}));

export const providerRegisterRequest = (formData) =>
  handleRequest(api.post('/provider/auth/register', {
    name: formData?.name?.trim(),
    gender: formData?.gender?.trim(),
    phone: formData?.phone?.trim(),
    location: formData?.location?.trim(),
    lat: formData?.lat,
    lng: formData?.lng,
    email: formData?.email?.trim(),
    password: formData?.password?.trim(),
  }));

export const providerForgotPasswordRequest = (email) => handleRequest(api.post('/provider/auth/forgototp', { email: email?.trim() }));

export const providerResetPasswordRequest = (formData) =>
  handleRequest(api.post('/provider/auth/verifyOtp', {
    email: formData?.email?.trim(),
    otp: formData?.otp?.trim(),
    newpassword: formData?.password?.trim(),
  }));

// Note: FormData request drops the global 'Content-Type: application/json' header automatically in axios
export const providerAddServiceRequest = (formData) => handleRequest(api.post('/provider/addService', formData, { headers: { 'Content-Type': 'multipart/form-data' }}));
export const providerUpdateServiceRequest = (serviceData) => handleRequest(api.put('/provider/updateService', serviceData, { headers: { 'Content-Type': serviceData instanceof FormData ? 'multipart/form-data' : 'application/json' }}));

export const providerFetchServices = async () => {
  const data = await handleRequest(api.get('/provider/getallServicesByProvider'));
  return { success: data.success ?? true, services: Array.isArray(data.services) ? data.services : [] };
};

export const providerDeleteService = (id) => handleRequest(api.delete(`/provider/deleteService/${id}`));
export const providerFetchNewBookings = () => handleRequest(api.get('/provider/getnewbookings'));
export const providerFetchUpcomingBookings = () => handleRequest(api.get('/provider/getupComingBookings'));
export const providerFetchCompletedBookings = () => handleRequest(api.get('/provider/getcompletedBookings'));
export const providerRespondBooking = (bookingId, action) => handleRequest(api.post('/booking/response', { bookingId, action }));


// ==========================================
// 👤 USER / FESTIVE API endpoints
// ==========================================
export const sendOtpRequest = (tab, formData) => {
  const isLogin = tab === "login";
  const endpoint = isLogin ? "/auth/login/enteremail" : "/auth/register/enterdetails";
  const payload = isLogin
    ? { email: formData.email }
    : {
        email: formData.email,
        username: formData.username,
        fullName: formData.fullName,
        phone: formData.phone,
        location: formData.location,
        lat: formData.lat,
        lng: formData.lng,
        gender: formData.gender,
      };
  return handleRequest(api.post(endpoint, payload));
};

export const verifyOtpRequest = (tab, formData) => {
  const endpoint = tab === "login" ? "/auth/login/verifyotp" : "/auth/register/verifyotp";
  const payload = { email: formData.email, userOtp: formData.otp };
  return handleRequest(api.post(endpoint, payload));
};


// ==========================================
// 🔍 SEARCH / RECOMMENDATION API endpoints
// ==========================================
export const performSearch = async (query, lat, lng) => {
  if (!query || !query.trim()) return [];
  try {
    let url = `${SEARCH_API_URL}?q=${encodeURIComponent(query)}`;
    if (lat && lng) {
        url += `&lat=${lat}&lng=${lng}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    const combinedResults = [];

    if (data.categories && Array.isArray(data.categories)) {
      data.categories.forEach(res => {
        if (res.item) {
          combinedResults.push({ ...res.item, score: res.score, isCategory: true });
        }
      });
    }

    if (data.services && Array.isArray(data.services)) {
      data.services.forEach(res => {
        if (res.item) {
          const item = { ...res.item };
          if (item.category && !item.categories) {
            item.categories = item.category;
          }
          combinedResults.push({ ...item, score: res.score });
        }
      });
    }

    if (combinedResults.length > 0) {
      return combinedResults;
    }

    return data.results || [];
  } catch (error) {
    console.error("Failed to fetch search results from ML space, falling back to local search:", error);
    try {
      const allServices = await fetchAllServices();
      if (Array.isArray(allServices)) {
        const cleanQuery = query.toLowerCase().trim();
        const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);
        return allServices.filter(service => {
          const name = service.name?.toLowerCase() || "";
          const desc = service.description?.toLowerCase() || "";
          const catName = service.categories?.name?.toLowerCase() || "";
          return queryTokens.every(token => 
            name.includes(token) || 
            desc.includes(token) || 
            catName.includes(token)
          );
        });
      }
    } catch (fallbackError) {
      console.error("Local search fallback failed:", fallbackError);
    }
    return [];
  }
};
// Alias for backward compatibility
export const performSemanticSearch = performSearch;

export const fetchSmartHomeFeed = (lat, lng, recentSearches = []) => {
  const params = new URLSearchParams();
  if (lat) params.append('lat', lat);
  if (lng) params.append('lng', lng);
  if (recentSearches && recentSearches.length > 0) {
    params.append('recentSearches', JSON.stringify(recentSearches));
  }
  return handleRequest(api.get(`/recommendation/feed?${params.toString()}`));
};

export const searchPlatformProviders = (queryParams) => {
  const params = new URLSearchParams(queryParams);
  return handleRequest(api.get(`/recommendation/search?${params.toString()}`));
};

export const fetchAllServices = () => handleRequest(api.get('/provider/allservices'));

export const fetchMLRecommendations = async (targetUser, topN = 4) => {
  try {
    const mlBase = SEARCH_API_URL.replace('/search', '');
    const url = `${mlBase}/recommend/collaborative/user-based?target_user=${encodeURIComponent(targetUser)}&top_n=${topN}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return data.recommendations || [];
  } catch (error) {
    console.error("Failed to fetch ML recommendations:", error);
    return [];
  }
};

// ==========================================
// 📅 BOOKING API endpoints
// ==========================================
export const checkServiceAvailability = (payload) => handleRequest(api.post('/booking/availabilty', payload));
export const createBooking = (payload) => handleRequest(api.post('/booking/book', payload));
export const fetchUserBookings = () => handleRequest(api.get('/booking/getUserBookings'));
export const payDemoPayment = (bookingId) => handleRequest(api.post('/booking/demo-payment', { bookingId }));

// ==========================================
// ✍️ REVIEWS API endpoints
// ==========================================
export const submitReview = (serviceId, rating, reviewText) => handleRequest(api.post('/review/givereview', { serviceId, rating, review: reviewText }));

// ==========================================
// 💬 CONVERSATIONS API endpoints
// ==========================================
export const createConversation = (providerId) => handleRequest(api.post('/convo/', { providerId }));

// ==========================================
// 🛍️ SERVICES & CATEGORIES API endpoints
// ==========================================
export const fetchServiceById = (id) => handleRequest(api.get(`/provider/getServiceById/${id}`));
export const fetchServicesByCategory = (slug) => handleRequest(api.get(`/category/services/${slug}`));

// ==========================================
// ✍️ EXTENDED REVIEWS API endpoints
// ==========================================
export const fetchServiceReviews = (id) => handleRequest(api.get(`/review/serviceReview/${id}`));
export const fetchUserReviews = () => handleRequest(api.get('/review/userReview'));
export const deleteReview = (reviewId) => handleRequest(api.delete(`/review/removereview/${reviewId}`));

// ==========================================
// 👤 USER PROFILE / FAVORITES API endpoints
// ==========================================
export const fetchCurrentUser = () => handleRequest(api.get('/user/me'));
export const updateCurrentUser = (formData) => handleRequest(api.put('/user/updateUser', formData, { headers: { 'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json' }}));
export const deleteCurrentUserAccount = () => handleRequest(api.delete('/user/deleteAccount'));
export const fetchFavoritesList = () => handleRequest(api.get('/user/getFavorite'));
export const addToFavorites = (serviceId) => handleRequest(api.post('/user/addFavorite', { serviceId }));
export const removeFromFavorites = (serviceId) => handleRequest(api.delete('/user/removeFavorite', { data: { serviceId } }));

// ==========================================
// 🧑‍💼 PROVIDER PROFILE API endpoints
// ==========================================
export const fetchCurrentProvider = () => handleRequest(api.get('/provider/me'));

// ==========================================
// 📩 CONTACT & FRAUD REPORT API endpoints
// ==========================================
export const submitContactForm = (formData) => handleRequest(api.post('/contact/send', formData));
export const submitFraudReport = (reportData) => handleRequest(api.post('/contact/report-fraud', reportData));

export default api;
