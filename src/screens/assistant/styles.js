import {StyleSheet, Dimensions, Platform} from 'react-native';
import {getStatusBarHeight} from '../../common';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

export default StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    zIndex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : getStatusBarHeight(),
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? getStatusBarHeight() : 0,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  header1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBack: {
    height: 14,
    width: 14,
    resizeMode: 'contain',
    tintColor: '#000',
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 36,
  },
  wrapper: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  description: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    // textTransform: 'uppercase',
    color: '#1180C3',
    textAlign: 'center',
  },
  titleChild: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: '#010101',
  },
  titleChilds: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
  },
  viewInput: {
    width: deviceWidth - 32,
    height: 42,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  txtInput: {
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'center',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginHorizontal: 8,
    color: '#010101',
    flex: 1,
  },
});
