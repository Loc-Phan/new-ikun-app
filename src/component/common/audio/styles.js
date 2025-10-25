import {StyleSheet} from 'react-native';


export default StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#0B2337',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 16,
  },
  actionWrapper: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 20,
    marginTop: 8,
    height: 50,
  },
  playWrapper: {},
  actionWrapperInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#fff',
    paddingVertical: 8,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  iconAction: {
    fontSize: 28,
    color: '#fff',
  },
  progressBar: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  progressBarText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#fff',
    alignSelf: 'center',
    width: '20%',
  },
  speedWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  speedText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
});
