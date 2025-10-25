import Types from './types';

export const saveUserToken = token => ({
  type: Types.SAVE_USER_TOKEN,
  token,
});
export const setUser = user => ({
  type: Types.SAVE_USER,
  user,
});
export const setRecentSearch = recentSearch => ({
  type: Types.RECENT_SEARCH,
  recentSearch,
});
export const setOverview = overview => ({
  type: Types.SET_OVERVIEW,
  overview,
});
export const setFCMToken = fcmToken => ({
  type: Types.SET_FCM_TOKEN,
  fcmToken,
});
