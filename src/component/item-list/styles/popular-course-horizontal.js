import {StyleSheet} from 'react-native';
import {Colors} from '../../../assets';

const {text, background} = Colors;
export default StyleSheet.create({
  container: {
    width: 220,
    marginRight: 8,
    minHeight: 179,
    backgroundColor: '#F4F6F8',

    // marginVertical: 8,
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
  },
  item: {marginHorizontal: 12, flex: 1},
  smallContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  image: {
    width: 220,
    height: 134,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    resizeMode: 'cover',
    backgroundColor: '#E5E5E5',
  },
  price: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    lineHeight: 15,
    color: '#000',
  },
  oldPrice: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    lineHeight: 15,
    color: '#B0B0B0',
    textDecorationLine: 'line-through',
    marginLeft: 13,
  },
  rate: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    lineHeight: 15,
    color: '#fff',
    marginLeft: 3,
    marginTop: 2,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    height: 40,
    color: '#0B2337',
    marginTop: 8,
  },
  duration: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 20,
    color: '#707172',
    marginTop: 8,
    marginBottom: 8,
  },
  content: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    // lineHeight: 15,
    color: '#939393',
    // marginTop: 2,
  },
  txtSale: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    lineHeight: 15,
    color: '#fff',
  },
  icon: {
    width: 17,
    height: 17,
    resizeMode: 'contain',
    // tintColor: '#FBC815',
  },
  txt3: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 6,
    color: '#314753',
  },
  txt2: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#F11616',
  },
});
