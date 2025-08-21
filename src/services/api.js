import axios from "axios";

const BASE_URL = "https://backend-nm1z.onrender.com/api";
const API_BASE_URL = `${BASE_URL}/admin/auth`;
const TESTIMONIALS_BASE = `${BASE_URL}/testimonials`;
const COUPONS_BASE = `${BASE_URL}/coupons`;
const MESSAGES_BASE = `${BASE_URL}/messages`;
const REVIEWS_BASE = `${BASE_URL}/review`;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

const adminApi = {
  // USERS
  fetchUsers: async (filters) => {
    const status = filters.status === "all" ? "Total" : filters.status;
    const res = await axios.get(`${API_BASE_URL}/users/${status}`, {
      headers: getAuthHeader(),
    });
    return { users: res.data };
  },

  fetchUserDetails: async (userId) => {
    const res = await axios.get(`${API_BASE_URL}/user/${userId}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  updateUserDetails: async (userId, data, section) => {
    try {
      let endpoint;
      switch (section) {
        case "user":
          endpoint = `${API_BASE_URL}/users/edit/${userId}`;
          break;
        case "astrology":
          endpoint = `${API_BASE_URL}/astrologies/${userId}`;
          break;
        case "education":
          endpoint = `${API_BASE_URL}/educations/${userId}`;
          break;
        case "family":
          endpoint = `${API_BASE_URL}/families/${userId}`;
          break;
        case "profession":
          endpoint = `${API_BASE_URL}/professions/${userId}`;
          break;
        default:
          throw new Error("Invalid section");
      }
      const response = await axios.put(endpoint, data, {
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || `Failed to update ${section} details`
      );
    }
  },

  uploadProfilePicture: async (userId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "unsigned");
      formData.append("folder", "profile_test5");
      const cloudinaryResponse = await axios.post(
        "https://api.cloudinary.com/v1_1/dkbzoosmm/image/upload",
        formData
      );
      const imageUrl = cloudinaryResponse.data.secure_url;
      const response = await axios.put(
        `${API_BASE_URL}/users/edit/${userId}`,
        { profile_pictures: [imageUrl] },
        {
          headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        }
      );
      return imageUrl;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to upload profile picture"
      );
    }
  },

  changeUserPassword: async (userId, newPassword) => {
    const res = await axios.put(
      `${API_BASE_URL}/change-password/${userId}`,
      { newPassword },
      {
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
      }
    );
    return res.data;
  },

  deleteUser: async (id) => {
    await axios.delete(`${API_BASE_URL}/deleteuser/${id}`, {
      headers: getAuthHeader(),
    });
  },

  restoreUser: async (id) => {
    console.warn("Restore API not implemented.");
  },

  updateUserStatus: async (id, status) => {
    const expiry = 6;
    const startDate = new Date().toISOString();
    if (status === "Approved") {
      await axios.put(
        `${API_BASE_URL}/users/approve/${id}?expiry=${expiry}&startDate=${startDate}`,
        {},
        { headers: getAuthHeader() }
      );
    } else if (status === "Expired" || status === "Canceled") {
      await axios.put(
        `${API_BASE_URL}/users/block/${id}`,
        {},
        {
          headers: getAuthHeader(),
        }
      );
    }
  },

  approveUserWithDates: async (userId, startDate, expiryMonths) => {
    return await axios.put(
      `${API_BASE_URL}/users/approve/${userId}?startDate=${startDate}&expiry=${expiryMonths}`,
      {},
      { headers: getAuthHeader() }
    );
  },

  updateUserToPending: async (userId) => {
    return await axios.put(
      `${BASE_URL}/users/${userId}`,
      { status: "Pending" },
      {
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
      }
    );
  },

  rejectPayment: async (userId) => {
    const payload = { status: "Canceled" };
    return await axios.put(`${API_BASE_URL}/user/${userId}/profile`, payload, {
      headers: getAuthHeader(),
    });
  },

  // TESTIMONIALS
  fetchTestimonials: async () => {
    const res = await axios.get(`${TESTIMONIALS_BASE}/all`, {
      headers: getAuthHeader(),
    });
    return { testimonials: res.data };
  },

  createTestimonial: async (formData) => {
    const form = new FormData();
    for (let key in formData) {
      if (key === "image_url" && formData[key] instanceof File) {
        form.append("image", formData[key]);
      } else if (key !== "image_url") {
        form.append(key, formData[key]);
      }
    }
    return await axios.post(`${TESTIMONIALS_BASE}/add`, form, {
      headers: {
        ...getAuthHeader(),
        // Let browser set Content-Type for FormData
      },
    });
  },

  updateTestimonial: async (id, formData) => {
    const form = new FormData();
    for (let key in formData) {
      if (key === "image_url" && formData[key] instanceof File) {
        form.append("image", formData[key]);
      } else if (key !== "image_url") {
        form.append(key, formData[key]);
      }
    }
    return await axios.put(`${TESTIMONIALS_BASE}/edit/${id}`, form, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteTestimonial: async (id) => {
    return await axios.delete(`${TESTIMONIALS_BASE}/${id}`, {
      headers: getAuthHeader(),
    });
  },

  // INQUIRIES
  fetchInquiries: async () => {
    const res = await axios.get(`${API_BASE_URL}/inquiries/all`, {
      headers: getAuthHeader(),
    });
    return { inquiries: res.data };
  },

  replyToInquiry: async (id, payload) => {
    return await axios.post(`${API_BASE_URL}/inquiries/${id}/reply`, payload, {
      headers: getAuthHeader(),
    });
  },

  closeInquiry: async (id) => {
    return await axios.put(
      `${API_BASE_URL}/inquiries/${id}/close`,
      {},
      { headers: getAuthHeader() }
    );
  },

  // PAYMENT REQUESTS
  fetchPaymentRequests: async () => {
    const res = await axios.get(`${API_BASE_URL}/subscriptions`, {
      headers: getAuthHeader(),
    });
    return { payments: res.data.subscriptions };
  },

  approvePayment: async (userId) => {
    const expiry = 12;
    const startDate = new Date().toISOString();
    return await axios.put(
      `${API_BASE_URL}/users/approve/${userId}?expiry=${expiry}&startDate=${startDate}`,
      {},
      { headers: getAuthHeader() }
    );
  },

  // MEMBERSHIP PLANS
  fetchMembershipPlans: async () => {
    const res = await axios.get(`${BASE_URL}/memberships/all`, {
      headers: getAuthHeader(),
    });
    return { data: { plans: res.data } };
  },

  createMembershipPlan: async (formData) => {
    return await axios.post(`${BASE_URL}/memberships/add`, formData, {
      headers: getAuthHeader(),
    });
  },

  updateMembershipPlan: async (id, formData) => {
    return await axios.put(`${BASE_URL}/memberships/edit/${id}`, formData, {
      headers: getAuthHeader(),
    });
  },

  deleteMembershipPlan: async (id) => {
    return await axios.delete(`${BASE_URL}/memberships/delete/${id}`, {
      headers: getAuthHeader(),
    });
  },

  // COUPONS
  fetchCoupons: async () => {
    const res = await axios.get(`${COUPONS_BASE}`, {
      headers: getAuthHeader(),
    });
    return { data: { coupons: res.data } };
  },

  createCoupon: async (data) => {
    return await axios.post(`${COUPONS_BASE}`, data, {
      headers: getAuthHeader(),
    });
  },

  updateCoupon: async (id, data) => {
    return await axios.put(`${COUPONS_BASE}/${id}`, data, {
      headers: getAuthHeader(),
    });
  },

  deleteCoupon: async (id) => {
    return await axios.delete(`${COUPONS_BASE}/${id}`, {
      headers: getAuthHeader(),
    });
  },

  // MESSAGES
  fetchMessages: async () => {
    const res = await axios.get(`${MESSAGES_BASE}`, {
      headers: getAuthHeader(),
    });
    return { messages: res.data };
  },

  createMessage: async (data) => {
    return await axios.post(`${MESSAGES_BASE}`, data, {
      headers: getAuthHeader(),
    });
  },

  deleteMessage: async (id) => {
    return await axios.delete(`${MESSAGES_BASE}/${id}`, {
      headers: getAuthHeader(),
    });
  },

  // REVIEWS
  fetchReviews: async () => {
    const res = await axios.get(`${REVIEWS_BASE}/all`, {
      headers: getAuthHeader(),
    });
    return { reviews: res.data };
  },

  deleteReview: async (id) => {
    return await axios.delete(`${REVIEWS_BASE}/${id}`, {
      headers: getAuthHeader(),
    });
  },

  // ANALYTICS
  fetchAnalytics: async () => {
    const res = await axios.get(`${API_BASE_URL}/dashboard`, {
      headers: getAuthHeader(),
    });
    return { data: res.data };
  },

  // USER CREATION
  createUser: async (formData) => {
    try {
      const res = await axios.post(`${BASE_URL}/users/register`, formData, {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};

export default adminApi;

// v2
// import axios from "axios";

// const API_BASE_URL = "https://backend-nm1z.onrender.com/api/admin/auth";

// const getAuthHeader = () => {
//   const token = localStorage.getItem("token");
//   return { Authorization: `Bearer ${token}` };
// };

// const adminApi = {
//   fetchUserDetails: async (userId) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/user/${userId}`, {
//         headers: getAuthHeader(),
//       });
//       return response.data;
//     } catch (error) {
//       throw new Error(
//         error.response?.data?.message || "Failed to fetch user details"
//       );
//     }
//   },

//   updateUserDetails: async (userId, data, section) => {
//     try {
//       let endpoint;
//       switch (section) {
//         case "user":
//           endpoint = `${API_BASE_URL}/users/edit/${userId}`;
//           break;
//         case "astrology":
//           endpoint = `${API_BASE_URL}/astrologies/${userId}`;
//           break;
//         case "education":
//           endpoint = `${API_BASE_URL}/educations/${userId}`;
//           break;
//         case "family":
//           endpoint = `${API_BASE_URL}/families/${userId}`;
//           break;
//         case "profession":
//           endpoint = `${API_BASE_URL}/professions/${userId}`;
//           break;
//         default:
//           throw new Error("Invalid section");
//       }
//       const response = await axios.put(endpoint, data, {
//         headers: { ...getAuthHeader(), "Content-Type": "application/json" },
//       });
//       return response.data;
//     } catch (error) {
//       throw new Error(
//         error.response?.data?.message || `Failed to update ${section} details`
//       );
//     }
//   },

//   uploadProfilePicture: async (userId, file) => {
//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("upload_preset", "your_cloudinary_upload_preset"); // Replace with actual Cloudinary upload preset
//       const cloudinaryResponse = await axios.post(
//         "https://api.cloudinary.com/v1_1/your_cloudinary_cloud_name/image/upload", // Replace with your Cloudinary cloud name
//         formData
//       );
//       const imageUrl = cloudinaryResponse.data.secure_url;
//       const response = await axios.put(
//         `${API_BASE_URL}/users/edit/${userId}`,
//         { profile_pictures: [imageUrl] },
//         {
//           headers: { ...getAuthHeader(), "Content-Type": "application/json" },
//         }
//       );
//       return imageUrl;
//     } catch (error) {
//       throw new Error(
//         error.response?.data?.message || "Failed to upload profile picture"
//       );
//     }
//   },

//   changeUserPassword: async (userId, newPassword) => {
//     try {
//       const response = await axios.put(
//         `${API_BASE_URL}/change-password/${userId}`,
//         { newPassword },
//         {
//           headers: { ...getAuthHeader(), "Content-Type": "application/json" },
//         }
//       );
//       return response.data;
//     } catch (error) {
//       throw new Error(
//         error.response?.data?.message || "Failed to change password"
//       );
//     }
//   },
// };

// export default adminApi;

// v1
// // services/adminApi.js
// import axios from "axios";

// const BASE_URL = "https://backend-nm1z.onrender.com/api";
// const ADMIN_BASE = `${BASE_URL}/admin/auth`;
// const TESTIMONIALS_BASE = `${BASE_URL}/testimonials`;
// const COUPONS_BASE = `${BASE_URL}/coupons`;
// const MESSAGES_BASE = `${BASE_URL}/messages`;
// const REVIEWS_BASE = `${BASE_URL}/review`;

// const token = localStorage.getItem("token");
// const headers = {
//   // Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YWY5NTNlZjExNWNlYTQxODg1ZjFlNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjE1MDM3NCwiZXhwIjoxNzUyNzU1MTc0fQ.XxLD-AncG-f_HdzOWTZshjYp5Zu6IPyaO5mhzJyH-O8`, // You can switch this to hardcoded token for testing if needed
//   Authorization: `Bearer ${token}`, // You can switch this to hardcoded token for testing if needed
// };

// const adminApi = {
//   // USERS
//   fetchUsers: async (filters) => {
//     const status = filters.status === "all" ? "Total" : filters.status;
//     const res = await axios.get(`${ADMIN_BASE}/users/${status}`, { headers });
//     console.log(res.data);
//     return { users: res.data };
//   },

//   deleteUser: async (id) => {
//     await axios.delete(`${ADMIN_BASE}/deleteuser/${id}`, { headers });
//   },

//   restoreUser: async (id) => {
//     console.warn("Restore API not implemented.");
//   },

//   updateUserStatus: async (id, status) => {
//     const expiry = 6;
//     const startDate = new Date().toISOString();
//     if (status === "Approved") {
//       await axios.put(
//         `${ADMIN_BASE}/users/approve/${id}?expiry=${expiry}&startDate=${startDate}`,
//         {},
//         { headers }
//       );
//     } else if (status === "Expired" || status === "Canceled") {
//       await axios.put(`${ADMIN_BASE}/users/block/${id}`, {}, { headers });
//     }
//   },

//   fetchUserDetails: async (id) => {
//     const res = await axios.get(`${ADMIN_BASE}/user/${id}`, { headers });
//     return res.data;
//   },

//   // TESTIMONIALS
//   fetchTestimonials: async () => {
//     const res = await axios.get(`${TESTIMONIALS_BASE}/all`, { headers });
//     return { testimonials: res.data };
//   },

//   createTestimonial: async (formData) => {
//     const form = new FormData();
//     form.append("user_name", formData.user_name);
//     form.append("message", formData.message);
//     form.append("groom_registration_date", formData.groom_registration_date);
//     form.append("bride_registration_date", formData.bride_registration_date);
//     form.append("marriage_date", formData.marriage_date);

//     if (formData.image_url instanceof File) {
//       form.append("image", formData.image_url);
//     }

//     return await axios.post(`${TESTIMONIALS_BASE}/add`, form, {
//       headers: {
//         ...headers,
//         "Content-Type": "multipart/form-data",
//       },
//     });
//   },

//   updateTestimonial: async (id, formData) => {
//     const form = new FormData();
//     form.append("user_name", formData.user_name);
//     form.append("message", formData.message);
//     form.append("groom_registration_date", formData.groom_registration_date);
//     form.append("bride_registration_date", formData.bride_registration_date);
//     form.append("marriage_date", formData.marriage_date);

//     if (formData.image_url instanceof File) {
//       form.append("image", formData.image_url);
//     }

//     return await axios.put(`${TESTIMONIALS_BASE}/edit/${id}`, form, {
//       headers: {
//         ...headers,
//         "Content-Type": "multipart/form-data",
//       },
//     });
//   },

//   deleteTestimonial: async (id) => {
//     return await axios.delete(`${TESTIMONIALS_BASE}/${id}`, { headers });
//   },

//   // INQUIRIES
//   fetchInquiries: async () => {
//     const res = await axios.get(`${ADMIN_BASE}/inquiries/all`, { headers });
//     return { inquiries: res.data };
//   },

//   replyToInquiry: async (id, payload) => {
//     return await axios.post(`${ADMIN_BASE}/inquiries/${id}/reply`, payload, {
//       headers,
//     });
//   },

//   closeInquiry: async (id) => {
//     return await axios.put(
//       `${ADMIN_BASE}/inquiries/${id}/close`,
//       {},
//       { headers }
//     );
//   },

//   // PAYMENT REQUESTS
//   fetchPaymentRequests: async () => {
//     const res = await axios.get(`${ADMIN_BASE}/subscriptions`, { headers });
//     return { payments: res.data.subscriptions };
//   },

//   approvePayment: async (userId) => {
//     const expiry = 12;
//     const startDate = new Date().toISOString();
//     return await axios.put(
//       `${ADMIN_BASE}/users/approve/${userId}?expiry=${expiry}&startDate=${startDate}`,
//       {},
//       { headers }
//     );
//   },

//   approveUserWithDates: async (userId, startDate, expiryMonths) => {
//     return await axios.put(
//       `${ADMIN_BASE}/users/approve/${userId}?startDate=${startDate}&expiry=${expiryMonths}`,
//       {},
//       { headers }
//     );
//   },

//   rejectPayment: async (userId) => {
//     const payload = { status: "Canceled" };
//     return await axios.put(`${ADMIN_BASE}/user/${userId}/profile`, payload, {
//       headers,
//     });
//   },

//   // MEMBERSHIP PLANS
//   fetchMembershipPlans: async () => {
//     const res = await axios.get(`${BASE_URL}/memberships/all`, { headers });
//     return { data: { plans: res.data } };
//   },

//   createMembershipPlan: async (formData) => {
//     return await axios.post(`${BASE_URL}/memberships/add`, formData, {
//       headers,
//     });
//   },

//   updateMembershipPlan: async (id, formData) => {
//     return await axios.put(`${BASE_URL}/memberships/edit/${id}`, formData, {
//       headers,
//     });
//   },

//   deleteMembershipPlan: async (id) => {
//     return await axios.delete(`${BASE_URL}/memberships/delete/${id}`, {
//       headers,
//     });
//   },

//   // COUPONS
//   fetchCoupons: async () => {
//     const res = await axios.get(`${COUPONS_BASE}`, { headers });
//     return { data: { coupons: res.data } };
//   },

//   createCoupon: async (data) => {
//     return await axios.post(`${COUPONS_BASE}`, data, { headers });
//   },

//   updateCoupon: async (id, data) => {
//     return await axios.put(`${COUPONS_BASE}/${id}`, data, { headers });
//   },

//   deleteCoupon: async (id) => {
//     return await axios.delete(`${COUPONS_BASE}/${id}`, { headers });
//   },

//   // MESSAGES
//   fetchMessages: async () => {
//     const res = await axios.get(`${MESSAGES_BASE}`, { headers });
//     console.log(res.data);
//     return { data: { messages: res.data } };
//   },

//   createMessage: async (data) => {
//     return await axios.post(`${MESSAGES_BASE}`, data, { headers });
//   },

//   deleteMessage: async (id) => {
//     return await axios.delete(`${MESSAGES_BASE}/${id}`, { headers });
//   },

//   // REVIEWS
//   fetchReviews: async () => {
//     const res = await axios.get(`${REVIEWS_BASE}/all`, { headers });
//     return { reviews: res.data }; // ✅ directly return reviews array
//   },

//   deleteReview: async (id) => {
//     return await axios.delete(`${REVIEWS_BASE}/${id}`, { headers });
//   },

//   fetchAnalytics: async () => {
//     const res = await axios.get(`${ADMIN_BASE}/dashboard`, { headers });
//     console.log(res.data);
//     return { data: res.data };
//   },

//   createUser: async (formData) => {
//     try {
//       const res = await axios.post(`${BASE_URL}/users/register`, formData, {
//         headers: {
//           ...headers,
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       return res.data;
//     } catch (error) {
//       throw error;
//     }
//   },
// };

// export default adminApi;
