import Services from '@/services';
import { createAsyncThunk } from '@reduxjs/toolkit';

const handleThunkError = (error: any, fallbackKey: string, thunkAPI: any) => {
  const errorMessage =
    error?.response?.data?.message || error?.message || fallbackKey;
  return thunkAPI.rejectWithValue(errorMessage);
};

export const login = createAsyncThunk(
  'auth/login',
  async (
    { username, password }: { username: string; password: string },
    thunkAPI,
  ) => {
    try {
      const result = await Services.login({ username, password });
      if (result.data.success) {
        return result.data.user;
      }
    } catch (error: any) {
      return handleThunkError(error, 'errors.auth.login_failed', thunkAPI);
    }
  },
);
