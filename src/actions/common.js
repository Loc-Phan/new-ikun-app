import Types from './types';

export function setAppOpen(isAppOpen) {
  return {
    type: Types.SET_APP_OPEN,
    isAppOpen,
  };
}
export function showLoading(loading, isNative) {
  return {
    type: Types.SHOW_LOADING,
    data: {loading, isNative},
  };
}
export function setLoading(loading) {
  return {
    type: Types.SET_LOADING,
    loading,
  };
}
