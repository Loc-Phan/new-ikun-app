import {
  ConvertToDateTime,
  ConvertToDay,
  ConvertToHour,
  formatDateNow,
  ConvertToDate,
  secondsToHms,
} from './datetime';
import {ValidateEmail, isURL, isVideo} from './validate';

import {
  ifIphoneX,
  getStatusBarHeight,
  isIphoneXFamilly,
  getBottomSpace,
} from './deviceInfo';

export {
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

  // Device info
  ifIphoneX,
  getStatusBarHeight,
  isIphoneXFamilly,
  getBottomSpace,
};
