import {config} from './newConfig';

const NewClient = {
  login: params => config.post('/login', params),

  deleteAccount: params =>
    config.get('/panel/profile-setting/soft-delete', {...params}),

  firstRegisterStep: params => config.post('/register/step/1', params),

  secondRegisterStep: params => config.post('/register/step/2', params),

  thirdRegisterStep: params => config.post('/register/step/3', params),

  getCategory: params => config.get('/categories', {...params}),

  topCoursesWithStudent: params => config.get('/featured-courses', {...params}),

  course: params => config.get('/courses', {...params}),

  courseDetails: id => config.get(`/courses/${id}`),

  contentCourseDetails: id => config.get(`/courses/${id}/content`),

  finishCourseDetails: (id, params) =>
    config.post(`/courses/${id}/toggle`, params),

  myCourse: params => config.get('/panel/webinars/purchases', params),

  iOSBuyCourse: params => config.post('/panel/payments/applepay', params),

  search: params => config.get(`/search`, params),

  getIntructor: params => config.get('/providers/instructors', {...params}),

  getIntructorUser: userId => config.get(`/users/${userId}/profile`),

  getUser: () => config.get('/panel/profile-setting'),

  updateUser: params => config.put('/panel/profile-setting', params),

  changePassword: params =>
    config.put('/panel/profile-setting/password', params),

  resetEmail: params => config.post('/forget-password', params),

  resetPassword: (token, params) =>
    config.post(`/reset-password/${token}`, params),

  getEbooks: params => config.get('/products', params),

  getFeaturedEbooks: params => config.get('/featured-ebooks', params),

  getEbookDetails: id => config.get(`/products/${id}`),

  getPurchaseEbook: params => config.get('/panel/store/purchases', params),

  getEbooksCategories: params => config.get('/product_categories', params),

  leaveEbookReview: params => config.post('/panel/reviews/product', params),

  leaveCourseReview: params => config.post('/panel/reviews', params),

  postEbookComment: params => config.post('/panel/comments', params),

  contactAssistant: params => config.post('/contact', params),

  getAdvertising: params => config.get('/advertising-banner', params),

  getReviews: params => config.get('/reviews', params),

  getEbookReviews: params => config.get('/reviews/product', params),

  registerFCMToken: params =>
    config.post('/panel/users/register-device', params),

  deleteFCMToken: params => config.delete('/panel/users/delete-device', params),

  getNotifications: params => config.get('/panel/notifications/app', params),

  readNotification: (id, params) =>
    config.post(`/panel/notifications/${id}/seen/app`, params),
};

export default NewClient;
