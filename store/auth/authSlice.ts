import { createSlice } from '@reduxjs/toolkit';
import { login } from './authThunk';
interface AuthState {
  user: any;
  accessToken: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(login.fulfilled, (state, { payload }) => {
        state.user = payload;
      })
      .addCase(login.rejected, state => {
        state.user = null;
      });
  },
});

export const { logout } = slice.actions;
export default slice.reducer;
