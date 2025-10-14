import axios from "axios";

// ✅ Backend base URLs
const AUTH_URL = "https://anand-u.vercel.app/provider/auth";
const SERVICE_URL = "https://anand-u.vercel.app/provider";

async function apiRequest(url, payload) {
  try {
    const res = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true, // important for cookies
    });
    return res.data;
  } catch (err) {
    return {
      success: false,
      msg:
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Something went wrong. Please try again.",
    };
  }
}

// --- LOGIN ---
export const providerLoginRequest = (formData) =>
  apiRequest(`${AUTH_URL}/login`, {
    email: formData?.email?.trim(),
    password: formData?.password?.trim(),
  });
export const providerLogoutRequest = async () => {
  try {
    const res = await axios.post(`${AUTH_URL}/logout`, {}, { withCredentials: true });
    return res.data;
  } catch (err) {
    return { success: false, msg: "Logout failed" };
  }
};


// --- REGISTER ---
export const providerRegisterRequest = (formData) =>
  apiRequest(`${AUTH_URL}/register`, {
    name: formData?.name?.trim(),
    gender: formData?.gender?.trim(),
    phone: formData?.phone?.trim(),
    location: formData?.location?.trim(),
    email: formData?.email?.trim(),
    password: formData?.password?.trim(),
  });

// --- FORGOT PASSWORD ---
export const providerForgotPasswordRequest = (email) =>
  apiRequest(`${AUTH_URL}/forgototp`, { email: email?.trim() });

// --- RESET PASSWORD ---
export const providerResetPasswordRequest = (formData) =>
  apiRequest(`${AUTH_URL}/verifyOtp`, {
    email: formData?.email?.trim(),
    otp: formData?.otp?.trim(),
    newpassword: formData?.password?.trim(),
  });

// --- ADD SERVICE ---
export const providerAddServiceRequest = async (formData) => {
  try {
    const res = await axios.post(`${SERVICE_URL}/addService`, formData, {
      // REMOVED: No 'headers' object. Axios handles it for FormData.
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    return { success: false, msg: err.response?.data?.msg || "Add service failed" };
  }
};


// --- FETCH SERVICES ---
export const providerFetchServices = async () => {
  try {
    const res = await axios.get(`${SERVICE_URL}/getallServicesByProvider`, {
      withCredentials: true,
    });

    // Backend returns { services: [...] } -> use res.data.services
    const servicesArray = Array.isArray(res.data.services) ? res.data.services : [];

    return { success: true, services: servicesArray };
  } catch (err) {
    console.error(err.response || err);
    return { success: false, msg: "Failed to fetch services", services: [] };
  }
};


// --- DELETE SERVICE ---
export const providerDeleteService = async (id) => {
  try {
    const res = await axios.delete(`${SERVICE_URL}/deleteService/${id}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    return { success: false, msg: "Failed to delete service" };
  }
};
// --- UPDATE SERVICE ---
export const providerUpdateServiceRequest = async (serviceData) => {
  try {
    const res = await axios.put(`${SERVICE_URL}/updateService`, serviceData, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    return { success: false, msg: err.response?.data?.msg || "Failed to update service" };
  }
};

// --- FETCH NEW BOOKINGS ---
export const providerFetchNewBookings = async () => {
  try {
    const res = await axios.get("https://anand-u.vercel.app/provider/getnewbookings", {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching new bookings:", err);
    return { success: false, msg: "Failed to fetch new bookings", newBookings: [] };
  }
};

// --- FETCH UPCOMING BOOKINGS ---
export const providerFetchUpcomingBookings = async () => {
  try {
    const res = await axios.get("https://anand-u.vercel.app/provider/getupComingBookings", {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching upcoming bookings:", err);
    return { success: false, msg: "Failed to fetch upcoming bookings", newBookings: [] };
  }
};

// --- FETCH COMPLETED BOOKINGS ---
export const providerFetchCompletedBookings = async () => {
  try {
    const res = await axios.get("https://anand-u.vercel.app/provider/getcompletedBookings", {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching completed bookings:", err);
    return { success: false, msg: "Failed to fetch completed bookings", newBookings: [] };
  }
};

// --- RESPOND TO BOOKING (ACCEPT / REJECT) ---
export const providerRespondBooking = async (bookingId, action) => {
  try {
    const res = await axios.post(
      "https://anand-u.vercel.app/booking/response",
      { bookingId, action },
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("Error responding to booking:", err);
    return { success: false, msg: "Failed to respond to booking" };
  }
};

