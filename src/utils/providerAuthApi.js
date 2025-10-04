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
export const providerAddServiceRequest = async (serviceData) => {
  try {
    const res = await axios.post(`${SERVICE_URL}/addService`, serviceData, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    return { success: false, msg: err.response?.data?.msg || "Add service failed" };
  }
};

// // --- FETCH SERVICES ---
// export const providerFetchServices = async () => {
//   try {
//     const res = await axios.get(`${SERVICE_URL}/services`, {
//       withCredentials: true,
//     });
//     return res.data;
//   } catch (err) {
//     return { success: false, msg: "Failed to fetch services", services: [] };
//   }
// };

// // --- DELETE SERVICE ---
// export const providerDeleteService = async (id) => {
//   try {
//     const res = await axios.delete(`${SERVICE_URL}/services/${id}`, {
//       withCredentials: true,
//     });
//     return res.data;
//   } catch (err) {
//     return { success: false, msg: "Failed to delete service" };
//   }
// };
