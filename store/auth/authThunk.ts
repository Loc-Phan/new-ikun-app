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
      console.log("result.data?.data?.token",result.data?.data?.token);
      if (result.data?.success) {
        return result.data?.data?.token;
      }
    } catch (error: any) {
      return handleThunkError(error, 'errors.auth.login_failed', thunkAPI);
    }
  },
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, thunkAPI) => {
    try {
      const result = await Services.getUser();
      console.log("result",result.data?.data);
      if (result.data.success) {
        return result.data?.data?.user;
      }
    } catch (error: any) {
      console.log("error",error);
      return handleThunkError(error, 'errors.auth.get_profile_failed', thunkAPI);
    }
  },
);
