// services/adminApi.js
import axios from 'axios';

const API_BASE_URL = '/api/admin';

// Mock data store
const mockData = {
  users: [
    {
      _id: '1',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@gmail.com',
      mobile: '+91-9876543210',
      gender: 'Male',
      dob: '1995-06-15',
      age: 28,
      height: '5\'10"',
      status: 'Approved',
      religion: 'Sikh',
      caste: 'Jatt',
      marital_status: 'Never Married',
      location: {
        address: '123 Green Park',
        city: 'Ludhiana',
        pincode: '141001'
      },
      metadata: {
        register_date: '2024-01-15',
        exp_date: '2025-01-15'
      },
      is_deleted: false
    },
    {
      _id: '2',
      name: 'Simran Kaur',
      email: 'simran.kaur@gmail.com',
      mobile: '+91-9876543211',
      gender: 'Female',
      dob: '1997-03-22',
      age: 26,
      height: '5\'5"',
      status: 'Pending',
      religion: 'Sikh',
      caste: 'Khatri',
      marital_status: 'Never Married',
      location: {
        address: '456 Model Town',
        city: 'Chandigarh',
        pincode: '160001'
      },
      metadata: {
        register_date: '2024-02-20',
        exp_date: '2025-02-20'
      },
      is_deleted: false
    },
    {
      _id: '3',
      name: 'Harpreet Singh',
      email: 'harpreet.singh@gmail.com',
      mobile: '+91-9876543212',
      gender: 'Male',
      dob: '1993-11-08',
      age: 30,
      height: '6\'0"',
      status: 'Approved',
      religion: 'Sikh',
      caste: 'Arora',
      marital_status: 'Divorced',
      location: {
        address: '789 Sector 35',
        city: 'Amritsar',
        pincode: '143001'
      },
      metadata: {
        register_date: '2024-01-10',
        exp_date: '2025-01-10'
      },
      is_deleted: false
    },
    {
      _id: '4',
      name: 'Manpreet Kaur',
      email: 'manpreet.kaur@gmail.com',
      mobile: '+91-9876543213',
      gender: 'Female',
      dob: '1998-07-25',
      age: 25,
      height: '5\'4"',
      status: 'Expired',
      religion: 'Sikh',
      caste: 'Saini',
      marital_status: 'Never Married',
      location: {
        address: '321 Civil Lines',
        city: 'Jalandhar',
        pincode: '144001'
      },
      metadata: {
        register_date: '2023-01-25',
        exp_date: '2024-01-25'
      },
      is_deleted: false
    },
    {
      _id: '5',
      name: 'Gurpreet Singh',
      email: 'gurpreet.singh@gmail.com',
      mobile: '+91-9876543214',
      gender: 'Male',
      dob: '1991-12-10',
      age: 32,
      height: '5\'11"',
      status: 'Incomplete',
      religion: 'Sikh',
      caste: 'Ramgarhia',
      marital_status: 'Never Married',
      location: {
        address: '654 New Colony',
        city: 'Patiala',
        pincode: '147001'
      },
      metadata: {
        register_date: '2024-03-05',
        exp_date: null
      },
      is_deleted: false
    }
  ],

  testimonials: [
    {
      _id: '1',
      user_name: 'Rajesh & Simran',
      message: 'We found each other through Punjabi Rishtey and it was the best decision of our lives. The platform made it easy to connect with genuine profiles.',
      image_url: 'https://via.placeholder.com/300x200',
      groom_registration_date: '2023-01-15',
      bride_registration_date: '2023-02-20',
      marriage_date: '2024-04-15',
      created_at: '2024-05-01'
    },
    {
      _id: '2',
      user_name: 'Harpreet & Manpreet',
      message: 'Thank you Punjabi Rishtey for helping us find our soulmates. Your service is truly exceptional!',
      image_url: 'https://via.placeholder.com/300x200',
      groom_registration_date: '2023-03-10',
      bride_registration_date: '2023-03-25',
      marriage_date: '2024-06-20',
      created_at: '2024-07-01'
    }
  ],

  inquiries: [
    {
      _id: '1',
      name: 'Amandeep Singh',
      email: 'amandeep@gmail.com',
      phone: '+91-9876543220',
      subject: 'Unable to login',
      message: 'I am unable to login to my account. Please help.',
      status: 'open',
      createdAt: '2024-12-20',
      updatedAt: '2024-12-20'
    },
    {
      _id: '2',
      name: 'Jaspreet Kaur',
      email: 'jaspreet@gmail.com',
      phone: '+91-9876543221',
      subject: 'Profile visibility issue',
      message: 'My profile is not visible to other users even after payment.',
      status: 'replied',
      createdAt: '2024-12-19',
      updatedAt: '2024-12-19'
    }
  ],

  payments: [
    {
      _id: '1',
      user: '1',
      fullName: 'Rajesh Kumar',
      phoneNumber: '+91-9876543210',
      screenshotUrl: 'https://via.placeholder.com/400x300',
      status: 'pending',
      couponCode: 'SAVE20',
      discountAmount: 200,
      createdAt: '2024-12-21',
      expiresAt: null
    },
    {
      _id: '2',
      user: '2',
      fullName: 'Simran Kaur',
      phoneNumber: '+91-9876543211',
      screenshotUrl: 'https://via.placeholder.com/400x300',
      status: 'approved',
      couponCode: null,
      discountAmount: 0,
      createdAt: '2024-12-20',
      expiresAt: '2025-12-20'
    }
  ],

  membershipPlans: [
    {
      _id: '1',
      name: 'Basic Plan',
      price: 999,
      duration: 90,
      premiumProfilesView: '50',
      created_at: '2024-01-01'
    },
    {
      _id: '2',
      name: 'Premium Plan',
      price: 2999,
      duration: 180,
      premiumProfilesView: '200',
      created_at: '2024-01-01'
    },
    {
      _id: '3',
      name: 'Platinum Plan',
      price: 4999,
      duration: 365,
      premiumProfilesView: 'Unlimited',
      created_at: '2024-01-01'
    }
  ],

  coupons: [
    {
      _id: '1',
      code: 'SAVE20',
      discountType: 'percentage',
      discountValue: 20,
      isActive: true
    },
    {
      _id: '2',
      code: 'FLAT500',
      discountType: 'flat',
      discountValue: 500,
      isActive: true
    },
    {
      _id: '3',
      code: 'EXPIRED10',
      discountType: 'percentage',
      discountValue: 10,
      isActive: false
    }
  ],

  messages: [
    {
      _id: '1',
      message: 'Welcome to Punjabi Rishtey! Complete your profile to get better matches.',
      createdAt: '2024-12-01',
      expiresAt: '2025-01-01'
    },
    {
      _id: '2',
      message: 'New Year Special: Get 20% off on all premium plans. Use code NEWYEAR2025',
      createdAt: '2024-12-20',
      expiresAt: '2025-01-15'
    }
  ],

  reviews: [
    {
      _id: '1',
      user_name: 'Rajesh Kumar',
      message: 'Excellent platform for finding genuine matches. Highly recommended!',
      ratings: 5,
      created_at: '2024-12-15'
    },
    {
      _id: '2',
      user_name: 'Simran Kaur',
      message: 'Good service but needs more filters for searching.',
      ratings: 4,
      created_at: '2024-12-10'
    },
    {
      _id: '3',
      user_name: 'Harpreet Singh',
      message: 'Found my life partner here. Thank you!',
      ratings: 5,
      created_at: '2024-12-05'
    }
  ],

  qrcodes: [
    {
      _id: '1',
      name: 'App Download',
      imageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://punjabi-rishtey.com/app',
      createdAt: '2024-12-01',
      updatedAt: '2024-12-01'
    },
    {
      _id: '2',
      name: 'Website Link',
      imageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://punjabi-rishtey.com',
      createdAt: '2024-12-05',
      updatedAt: '2024-12-05'
    }
  ],

  analytics: {
    totalUsers: 1250,
    userGrowth: 12.5,
    activeSubscriptions: 450,
    subscriptionGrowth: 8.3,
    monthlyRevenue: 125000,
    revenueGrowth: 15.2,
    successStories: 85,
    storiesGrowth: 22.1,
    avgProfileCompletion: 78,
    recentApprovals: 12,
    pendingProfiles: 34,
    expiringSubscriptions: 23,
    activeCoupons: 2,
    couponsUsedThisMonth: 45,
    totalDiscountAmount: 15000,
    dailyActiveUsers: 320,
    avgSessionDuration: '24m',
    conversionRate: 12,
    avgTimeToConvert: 7,
    couponsUsed: 156,
    totalDiscountGiven: 45000,
    userStatusData: [
      { name: 'Approved', value: 650 },
      { name: 'Pending', value: 250 },
      { name: 'Expired', value: 200 },
      { name: 'Incomplete', value: 150 }
    ],
    signupData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      signups: Math.floor(Math.random() * 20) + 10
    })),
    revenueByPlan: [
      { name: 'Basic', revenue: 25000 },
      { name: 'Premium', revenue: 65000 },
      { name: 'Platinum', revenue: 35000 }
    ],
    monthlyRevenueData: [
      { month: 'Jan', revenue: 95000 },
      { month: 'Feb', revenue: 105000 },
      { month: 'Mar', revenue: 115000 },
      { month: 'Apr', revenue: 108000 },
      { month: 'May', revenue: 125000 }
    ]
  }
};

// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API implementation
const mockApi = {
  get: async (url, config) => {
    await delay(300);
    
    if (url.includes('/analytics')) {
      return { data: mockData.analytics };
    }
    
    if (url.includes('/users')) {
      let users = [...mockData.users];
      if (config?.params?.status && config.params.status !== 'all') {
        users = users.filter(u => u.status === config.params.status);
      }
      return { data: { users } };
    }
    
    if (url.includes('/testimonials')) {
      return { data: { testimonials: mockData.testimonials } };
    }
    
    if (url.includes('/inquiries')) {
      let inquiries = [...mockData.inquiries];
      if (config?.params?.status && config.params.status !== 'all') {
        inquiries = inquiries.filter(i => i.status === config.params.status);
      }
      return { data: { inquiries } };
    }
    
    if (url.includes('/payments')) {
      let payments = [...mockData.payments];
      if (config?.params?.status && config.params.status !== 'all') {
        payments = payments.filter(p => p.status === config.params.status);
      }
      return { data: { payments } };
    }
    
    if (url.includes('/membership')) {
      return { data: { plans: mockData.membershipPlans } };
    }
    
    if (url.includes('/coupons')) {
      return { data: { coupons: mockData.coupons } };
    }
    
    if (url.includes('/messages')) {
      return { data: { messages: mockData.messages } };
    }
    
    if (url.includes('/reviews')) {
      return { data: { reviews: mockData.reviews } };
    }
    
    if (url.includes('/qrcodes')) {
      return { data: { qrcodes: mockData.qrcodes } };
    }
    
    return { data: {} };
  },

  post: async (url, data) => {
    await delay(300);
    
    if (url.includes('/login')) {
      if (data.email === 'admin@punjabi-rishtey.com' && data.password === 'admin123') {
        return { data: { token: 'mock-jwt-token-12345', user: { email: data.email, role: 'admin' } } };
      }
      throw { response: { status: 401, data: { message: 'Invalid credentials' } } };
    }
    
    if (url.includes('/testimonials')) {
      const newTestimonial = { ...data, _id: Date.now().toString(), created_at: new Date().toISOString() };
      mockData.testimonials.push(newTestimonial);
      return { data: newTestimonial };
    }
    
    if (url.includes('/membership')) {
      const newPlan = { ...data, _id: Date.now().toString(), created_at: new Date().toISOString() };
      mockData.membershipPlans.push(newPlan);
      return { data: newPlan };
    }
    
    if (url.includes('/coupons')) {
      const newCoupon = { ...data, _id: Date.now().toString() };
      mockData.coupons.push(newCoupon);
      return { data: newCoupon };
    }
    
    if (url.includes('/messages')) {
      const newMessage = { ...data, _id: Date.now().toString(), createdAt: new Date().toISOString() };
      mockData.messages.push(newMessage);
      return { data: newMessage };
    }
    
    if (url.includes('/qrcodes')) {
      const newQR = { 
        ...data, 
        _id: Date.now().toString(), 
        imageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.imageUrl)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockData.qrcodes.push(newQR);
      return { data: newQR };
    }
    
    if (url.includes('/reply')) {
      const inquiryId = url.match(/inquiries\/(\w+)\/reply/)?.[1];
      const inquiry = mockData.inquiries.find(i => i._id === inquiryId);
      if (inquiry) {
        inquiry.status = 'replied';
      }
      return { data: { success: true } };
    }
    
    if (url.includes('/utility/recompute-profiles')) {
      return { data: { success: true, message: 'Profile recomputation started' } };
    }
    
    return { data: { success: true } };
  },

  put: async (url, data) => {
    await delay(300);
    
    if (url.includes('/testimonials')) {
      const id = url.match(/testimonials\/(\w+)/)?.[1];
      const index = mockData.testimonials.findIndex(t => t._id === id);
      if (index !== -1) {
        mockData.testimonials[index] = { ...mockData.testimonials[index], ...data };
      }
      return { data: mockData.testimonials[index] };
    }
    
    if (url.includes('/membership')) {
      const id = url.match(/membership\/(\w+)/)?.[1];
      const index = mockData.membershipPlans.findIndex(p => p._id === id);
      if (index !== -1) {
        mockData.membershipPlans[index] = { ...mockData.membershipPlans[index], ...data };
      }
      return { data: mockData.membershipPlans[index] };
    }
    
    if (url.includes('/coupons')) {
      const id = url.match(/coupons\/(\w+)/)?.[1];
      const index = mockData.coupons.findIndex(c => c._id === id);
      if (index !== -1) {
        mockData.coupons[index] = { ...mockData.coupons[index], ...data };
      }
      return { data: mockData.coupons[index] };
    }
    
    if (url.includes('/restore')) {
      const id = url.match(/users\/(\w+)\/restore/)?.[1];
      const user = mockData.users.find(u => u._id === id);
      if (user) {
        user.is_deleted = false;
      }
      return { data: user };
    }
    
    if (url.includes('/approve')) {
      const id = url.match(/payments\/(\w+)\/approve/)?.[1];
      const payment = mockData.payments.find(p => p._id === id);
      if (payment) {
        payment.status = 'approved';
        payment.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      }
      return { data: payment };
    }
    
    if (url.includes('/reject')) {
      const id = url.match(/payments\/(\w+)\/reject/)?.[1];
      const payment = mockData.payments.find(p => p._id === id);
      if (payment) {
        payment.status = 'rejected';
      }
      return { data: payment };
    }
    
    if (url.includes('/close')) {
      const id = url.match(/inquiries\/(\w+)\/close/)?.[1];
      const inquiry = mockData.inquiries.find(i => i._id === id);
      if (inquiry) {
        inquiry.status = 'closed';
      }
      return { data: inquiry };
    }
    
    return { data: { success: true } };
  },

  delete: async (url) => {
    await delay(300);
    
    if (url.includes('/users')) {
      const id = url.match(/users\/(\w+)/)?.[1];
      const user = mockData.users.find(u => u._id === id);
      if (user) {
        user.is_deleted = true;
      }
      return { data: { success: true } };
    }
    
    if (url.includes('/testimonials')) {
      const id = url.match(/testimonials\/(\w+)/)?.[1];
      mockData.testimonials = mockData.testimonials.filter(t => t._id !== id);
      return { data: { success: true } };
    }
    
    if (url.includes('/membership')) {
      const id = url.match(/membership\/(\w+)/)?.[1];
      mockData.membershipPlans = mockData.membershipPlans.filter(p => p._id !== id);
      return { data: { success: true } };
    }
    
    if (url.includes('/coupons')) {
      const id = url.match(/coupons\/(\w+)/)?.[1];
      mockData.coupons = mockData.coupons.filter(c => c._id !== id);
      return { data: { success: true } };
    }
    
    if (url.includes('/messages')) {
      const id = url.match(/messages\/(\w+)/)?.[1];
      mockData.messages = mockData.messages.filter(m => m._id !== id);
      return { data: { success: true } };
    }
    
    if (url.includes('/reviews')) {
      const id = url.match(/reviews\/(\w+)/)?.[1];
      mockData.reviews = mockData.reviews.filter(r => r._id !== id);
      return { data: { success: true } };
    }
    
    if (url.includes('/qrcodes')) {
      const id = url.match(/qrcodes\/(\w+)/)?.[1];
      mockData.qrcodes = mockData.qrcodes.filter(q => q._id !== id);
      return { data: { success: true } };
    }
    
    return { data: { success: true } };
  }
};

// Use mock API instead of axios
const api = {
  ...mockApi,
  create: () => api,
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} }
  }
};

// Admin API Service
const adminApi = {
  // Auth
  login: (credentials) => api.post('/login', credentials),
  
  // Users
  fetchUsers: (params) => api.get('/users', { params }),
  deleteUser: (id) => api.delete(`/users/${id}`),
  restoreUser: (id) => api.put(`/users/${id}/restore`),
  
  // Testimonials
  fetchTestimonials: () => api.get('/testimonials'),
  createTestimonial: (data) => api.post('/testimonials', data),
  updateTestimonial: (id, data) => api.put(`/testimonials/${id}`, data),
  deleteTestimonial: (id) => api.delete(`/testimonials/${id}`),
  
  // Analytics
  fetchAnalytics: (params) => api.get('/analytics', { params }),
  
  // Customer Support (Inquiries)
  fetchInquiries: (params) => api.get('/inquiries', { params }),
  replyToInquiry: (id, data) => api.post(`/inquiries/${id}/reply`, data),
  closeInquiry: (id) => api.put(`/inquiries/${id}/close`),
  
  // Payment Requests
  fetchPaymentRequests: (params) => api.get('/payments', { params }),
  approvePayment: (id) => api.put(`/payments/${id}/approve`),
  rejectPayment: (id) => api.put(`/payments/${id}/reject`),
  
  // Membership Plans
  fetchMembershipPlans: () => api.get('/membership'),
  createMembershipPlan: (data) => api.post('/membership', data),
  updateMembershipPlan: (id, data) => api.put(`/membership/${id}`, data),
  deleteMembershipPlan: (id) => api.delete(`/membership/${id}`),
  
  // Coupons
  fetchCoupons: () => api.get('/coupons'),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
  
  // Messages
  fetchMessages: () => api.get('/messages'),
  createMessage: (data) => api.post('/messages', data),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
  
  // Reviews
  fetchReviews: () => api.get('/reviews'),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  
  // Utility
  fetchQRCodes: () => api.get('/qrcodes'),
  createQRCode: (data) => api.post('/qrcodes', data),
  deleteQRCode: (id) => api.delete(`/qrcodes/${id}`),
  bulkRecomputeProfiles: () => api.post('/utility/recompute-profiles')
};

export default adminApi;