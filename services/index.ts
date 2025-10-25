import http from "@/utils/axios";

const Services = {
  // --- Auth ---
  login: (params: any) => http.post('/login', params),
  firstRegisterStep: (params: any) => http.post('/register/step/1', params),
  secondRegisterStep: (params: any) => http.post('/register/step/2', params),
  thirdRegisterStep: (params: any) => http.post('/register/step/3', params),

  // --- User ---
  getUser: () => http.get('/panel/profile-setting'),
  updateUser: (params: any) => http.put('/panel/profile-setting', params),
  changePassword: (params: any) =>
    http.put('/panel/profile-setting/password', params),
  deleteAccount: (params: any) =>
    http.get('/panel/profile-setting/soft-delete', { params }),

  // --- Password reset ---
  resetEmail: (params: any) => http.post('/forget-password', params),
  resetPassword: (token: string, params: any) =>
    http.post(`/reset-password/${token}`, params),

  // --- Courses ---
  getCategory: (params?: any) => http.get('/categories', { params }),
  topCoursesWithStudent: (params?: any) =>
    http.get('/featured-courses', { params }),
  course: (params?: any) => http.get('/courses', { params }),
  courseDetails: (id: string) => http.get(`/courses/${id}`),
  contentCourseDetails: (id: string) => http.get(`/courses/${id}/content`),
  finishCourseDetails: (id: string, params: any) =>
    http.post(`/courses/${id}/toggle`, params),
  myCourse: (params?: any) =>
    http.get('/panel/webinars/purchases', { params }),
  iOSBuyCourse: (params: any) => http.post('/panel/payments/applepay', params),

  // --- Search ---
  search: (params?: any) => http.get('/search', { params }),

  // --- Instructors ---
  getIntructor: (params?: any) => http.get('/providers/instructors', { params }),
  getIntructorUser: (userId: string) => http.get(`/users/${userId}/profile`),

  // --- Ebooks ---
  getEbooks: (params?: any) => http.get('/products', { params }),
  getFeaturedEbooks: (params?: any) => http.get('/featured-ebooks', { params }),
  getEbookDetails: (id: string) => http.get(`/products/${id}`),
  getPurchaseEbook: (params?: any) =>
    http.get('/panel/store/purchases', { params }),
  getEbooksCategories: (params?: any) =>
    http.get('/product_categories', { params }),
  leaveEbookReview: (params: any) =>
    http.post('/panel/reviews/product', params),
  leaveCourseReview: (params: any) => http.post('/panel/reviews', params),
  postEbookComment: (params: any) => http.post('/panel/comments', params),

  // --- Contact ---
  contactAssistant: (params: any) => http.post('/contact', params),

  // --- Advertising & Reviews ---
  getAdvertising: (params?: any) => http.get('/advertising-banner', { params }),
  getReviews: (params?: any) => http.get('/reviews', { params }),
  getEbookReviews: (params?: any) => http.get('/reviews/product', { params }),

  // --- Notifications ---
  registerFCMToken: (params: any) =>
    http.post('/panel/users/register-device', params),
  deleteFCMToken: (params: any) =>
    http.delete('/panel/users/delete-device', { data: params }),
  getNotifications: (params?: any) =>
    http.get('/panel/notifications/app', { params }),
  readNotification: (id: string, params: any) =>
    http.post(`/panel/notifications/${id}/seen/app`, params),
};

export default Services;
