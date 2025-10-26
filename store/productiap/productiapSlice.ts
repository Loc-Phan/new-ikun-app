import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProductIAPState {
  ids: string[];
  transaction: Record<string, string[]>;
}

const initialState: ProductIAPState = {
  ids: [],
  // transaction example: {
  // example.user@gmail.com:['com.zens.ikun.toeic_01','com.zens.ikun.toeic_basic_02']
  // <username>:[<array productIds>]
  // }
  transaction: {},
};

const productIAPSlice = createSlice({
  name: 'productIAP',
  initialState,
  reducers: {
    saveProductIAP: (state, action: PayloadAction<string[]>) => {
      state.ids = action.payload;
    },
    pushProductTransactionIAP: (
      state,
      action: PayloadAction<{ username: string; productId: string }>
    ) => {
      const { username, productId } = action.payload;
      const currentUserTransaction = state.transaction[username] || [];
      state.transaction[username] = [...currentUserTransaction, productId];
    },
    saveProductTransactionIAP: (
      state,
      action: PayloadAction<{ username: string; productIds: string[] }>
    ) => {
      const { username, productIds } = action.payload;
      if (productIds.length > 0) {
        state.transaction[username] = productIds;
      } else {
        delete state.transaction[username];
      }
    },
  },
});

export const {
  saveProductIAP,
  pushProductTransactionIAP,
  saveProductTransactionIAP,
} = productIAPSlice.actions;

export default productIAPSlice.reducer;