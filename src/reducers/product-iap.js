/* eslint-disable no-param-reassign */
import Types from '../actions/types';

const INITIAL_STATE = {
  ids: [],
  //transaction example: {
  // example.user@gmail.com:['com.zens.ikun.toeic_01',com.zens.ikun.toeic_basic_02]
  // <username>:[<array productIds>]
  // }
  transaction: {},
};

const productIAP = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case Types.SAVE_PRODUCT_IAP:
      delete action.type;
      return {
        ...state,
        ids: action.ids,
      };
    case Types.SAVE_PRODUCT_TRANSACTION_IAP:
      delete action.type;
      const currentUserTransaction = state.transaction[action.username] || [];
      return {
        ...state,
        transaction: {
          ...state.transaction,
          [action.username]: [...currentUserTransaction, action.productId],
        },
      };
    case Types.UPDATE_PRODUCT_TRANSACTION_IAP:
      delete action.type;
      if (action.productIds.length > 0) {
        return {
          ...state,
          transaction: {
            ...state.transaction,
            [action.username]: action.productIds,
          },
        };
      } else {
        delete state.transaction[action.username];
        return state;
      }
    default:
      return state;
  }
};

export default productIAP;
