import { Images } from '@/assets';
import Services from '@/services';
import { RootState } from '@/store';
import { logout } from '@/store/auth/authSlice';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useNavigation } from 'expo-router';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

export default function ProfileScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const goBack = () => {
    navigation.goBack();
  };
  const onLogout = () => {
    dispatch(logout());
    router.replace('/auth/login');
  };
  const onDelete = () => {
    Alert.alert(
      '',
      'Bạn có chắc chắn muốn xoá tài khoản Ikun',
      [
        {
          text: 'Huỷ',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Đồng ý',
          onPress: async () => {
            if (user?.user_id) {
              const response = await Services.deleteAccount({
                user_id: user?.user_id,
              });
              if (response?.data?.success) {
                dispatch(logout());
                router.replace('/auth/login');
              }
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.header1}>
          <TouchableOpacity
            onPress={goBack}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Image source={Images.iconBack} style={styles.iconBack} />
          </TouchableOpacity>
          <Text style={styles.title}>Hồ sơ</Text>
          <View
            style={{
              width: 40,
              height: 40,
            }}
          />
        </View>
      </View>
      {accessToken ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={{ flexDirection: 'row' }}>
            <Image
              source={{
                uri:
                  user?.avatar ||
                  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMjCj43UJiVu-3Qp9b5yj-SwLGR-kndCzqLaiMv5SMkITd4CcbQQ7vX_CEZd-xxqka8ZM&usqp=CAU',
              }}
              style={styles.avatar}
            />
            <View style={{ marginLeft: 15, flex: 1 }}>
              <Text style={styles.fullName}>{user?.full_name}</Text>
              {user?.description !== '' && (
                <Text style={styles.txtContent}>{user?.bio || 'Tiểu sử'}</Text>
              )}
              {user?.email && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name="mail" size={18} color="#F8C719" />
                  <Text style={styles.txtPhone}>{user?.email}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.border} />
          <View style={{ alignSelf: 'center' }}>
            <View>
              <TouchableOpacity
                onPress={() => navigation.navigate('settings')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 15,
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    backgroundColor: '#1180C3',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Feather name="settings" size={20} color="#fff" />
                </View>
                <Text style={styles.txt1}>Cài đặt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('myorder')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 15,
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    backgroundColor: '#25C2E8',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Feather name="shopping-bag" size={20} color="#fff" />
                </View>
                <Text style={styles.txt1}>Đơn hàng của tôi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 15,
                }}
                onPress={onLogout}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    backgroundColor: '#F19D3A',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Feather name="log-out" size={20} color="#fff" />
                </View>
                <Text style={[styles.txt1]}>Đăng xuất</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 15,
                }}
                onPress={onDelete}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    backgroundColor: '#C5C5C5',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name="person-remove-outline"
                    size={24}
                    color="black"
                  />
                </View>
                <Text style={[styles.txt1]}>Xoá tài khoản</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity
                onPress={() => navigation.navigate('YourCoursesScreen')}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    backgroundColor: '#3DBCF3',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconF name="book" size={20} color="#fff" />
                </View>
                <Text style={styles.txt1}>Your Courses</Text>
              </TouchableOpacity> */}
            </View>
            <View style={[styles.border, { marginBottom: 30 }]} />
          </View>
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter-Regular',
              fontSize: 16,
              marginBottom: 20,
              color: '#444',
            }}
          >
            Bạn cần đăng nhập để xem thông tin cá nhân
          </Text>
          <TouchableOpacity
            style={{
              marginTop: 10,
              borderWidth: 1,
              backgroundColor: '#000',
              paddingVertical: 10,
              paddingHorizontal: 30,
              borderRadius: 5,
            }}
            onPress={() => navigation.navigate('auth/login')}
          >
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 14,
                color: '#fff',
              }}
            >
              Đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <Text
        style={{
          fontSize: 10,
          position: 'absolute',
          bottom: 100,
          textAlign: 'center',
          left: 0,
          right: 0,
          color: '#666',
        }}
      >
        Version: {DeviceInfo.getVersion()} - Build:{' '}
        {DeviceInfo.getBuildNumber()}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    zIndex: 1,
  },
  header: {
    paddingHorizontal: 16,
  },
  header1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewInput: {
    borderRadius: 12,
    width: deviceWidth - 32,
    height: 40,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  inputSearch: {
    flex: 1,
    marginRight: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#000',
  },
  txtPhone: {
    marginLeft: 10,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#000',
  },
  iconBack: {
    height: 14,
    width: 14,
    resizeMode: 'contain',
    tintColor: '#000',
  },
  icon: {
    height: 15,
    width: 15,
    resizeMode: 'contain',
  },
  imgBanner: {
    width: (276 / 375) * deviceWidth,
    height: (209 / 375) * deviceWidth,
    resizeMode: 'contain',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: -1,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 36,
    textAlign: 'center',
    flex: 1,
  },
  fullName: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
  },
  txt1: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 20,
  },
  txtContent: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#8D8D8D',
    marginTop: 6,
    marginBottom: 6,
  },
  viewSearch: {
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },

  iconSearch: {
    height: 14,
    width: 14,
    resizeMode: 'contain',
    tintColor: '#000',
  },
  viewFilter: {
    backgroundColor: '#fff',
    width: 64,
    height: 24,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  txtFilter: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    lineHeight: 15,
    marginRight: 4,
  },
  viewUpdateRole: {
    zIndex: 1000,
    flex: 1,
    position: 'absolute',
    // backgroundColor: 'rgba(0,0,0,0.5)',
    width: deviceWidth,
    height: deviceHeight,
  },
  viewModalFilter: {
    width: 107,
    height: 131,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 6,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  txtFilterItem: {
    marginBottom: 10,
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    lineHeight: 15,
    color: '#A9A9A9',
  },
  content: {
    paddingHorizontal: 16,
    marginTop: 20,
    paddingBottom: 300,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  border: {
    width: deviceWidth * 0.7,
    height: 1,
    backgroundColor: '#F0F0F0',
    alignSelf: 'center',
    marginTop: 35,
    marginBottom: 40,
  },
});
