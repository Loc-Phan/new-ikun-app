import Types from './types';

// eslint-disable-next-line import/prefer-default-export
export const saveProductIAP = ids => ({
  type: Types.SAVE_PRODUCT_IAP,
  ids,
});

export const pushProductTransactionIAP = ({username, productId}) => ({
  type: Types.SAVE_PRODUCT_TRANSACTION_IAP,
  username,
  productId,
});

export const saveProductTransactionIAP = ({username, productIds}) => ({
  type: Types.UPDATE_PRODUCT_TRANSACTION_IAP,
  username,
  productIds,
});
