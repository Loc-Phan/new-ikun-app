import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  avatarReview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: 'contain',
  },
  reviewName: {
    marginVertical: 16,
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#0B2337',
  },
  reviewText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  reviewSubText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#707172',
  },
  rate: {
    backgroundColor: '#1180C3',
    borderRadius: 4,
    padding: 4,
    fontSize: 12,
    color: '#fff',
  },
});
