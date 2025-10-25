import {
  // datetime
  ConvertToDateTime,
  ConvertToDay,
  ConvertToHour,
  formatDateNow,
  ConvertToDate,
  secondsToHms,
  //
  ValidateEmail,
  isURL,
  isVideo,
  ifIphoneX,
  getStatusBarHeight,
  isIphoneXFamilly,
  getBottomSpace,
  //
  tronLog,
  deleteFCMToken,
  registerFCMToken,
} from './util';

function currencyFormat(num) {
  if (num)
    return num.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + ' đ';
}

function getIDfromURL(url) {
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return match[2];
  }

  console.log('The supplied URL is not a valid youtube URL');

  return '';
}

function detectNameFromURL(url) {
  if (url) {
    const array = url.split('/');
    return array[array.length - 1];
  }
  return '';
}

function removeTags(str) {
  if (str === null || str === '') return false;
  else str = str.toString();

  // Regular expression to identify HTML tags in
  // the input string. Replacing the identified
  // HTML tag with a null string.
  return str.replace(/(<([^>]+)>)/gi, '');
}

export {
  // datetime
  ConvertToDateTime,
  ConvertToDay,
  ConvertToHour,
  formatDateNow,
  ConvertToDate,
  secondsToHms,
  currencyFormat,
  ValidateEmail,
  isURL,
  isVideo,
  ifIphoneX,
  getStatusBarHeight,
  isIphoneXFamilly,
  getBottomSpace,
  tronLog,
  deleteFCMToken,
  registerFCMToken,
  getIDfromURL,
  detectNameFromURL,
  removeTags,
};
