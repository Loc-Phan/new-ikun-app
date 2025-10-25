import { put } from 'redux-saga/effects';
import { setLoading } from '../actions/common';
import { Circle } from '../component/progress-bar';

export function* showLoading(actions) {
  const { loading, isNative } = actions.data;
  if (isNative) {
    loading ? Circle.showSpinIndeterminate() : Circle.dismiss();
    return;
  }

  yield put(setLoading(loading));
}
