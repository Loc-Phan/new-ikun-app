import { createSlice } from '@reduxjs/toolkit';

interface OnboardingState {
  hasSeen: boolean;
}

const initialState: OnboardingState = { hasSeen: false };

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    completeOnboarding(state) {
      state.hasSeen = true;
    },
    resetOnboarding(state) {
      state.hasSeen = false;
    },
  },
});

export const { completeOnboarding, resetOnboarding } = onboardingSlice.actions;
export default onboardingSlice.reducer;
