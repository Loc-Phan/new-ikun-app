import { Images } from '@/assets';
import Services from '@/services';
import { AppDispatch, RootState } from '@/store';
import { logout } from '@/store/auth/authSlice';
import { getProfile } from '@/store/auth/authThunk';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<any>({
    isGenaral: true,
    isPassword: false,
    isDeleteAccount: false,
    bio: user?.bio || '',
    full_name: user?.full_name || '',
  });
  const goBack = () => {
    navigation.goBack();
  };
  const onClickGenaral = () => {
    setState({
      ...state,
      isGenaral: true,
      isPassword: false,
      isDeleteAccount: false,
    });
  };
  const onClickPassword = () => {
    setState({
      ...state,
      isGenaral: false,
      isPassword: true,
      isDeleteAccount: false,
    });
  };
  const submitGeneral = async () => {
    Keyboard.dismiss();

    const { bio, full_name } = state;

    if (full_name.trim() === '') {
      Alert.alert('Vui lòng nhập Họ và tên');
      return;
    }

    const params = {
      bio,
      full_name,
    };
    setIsLoading(true);
    const response = await Services.updateUser(params);
    setIsLoading(false);
    if (response?.data?.success) {
      Alert.alert('Lưu thông tin thành công');
      await dispatch(getProfile());
    } else {
      Alert.alert(response?.data?.message || 'Error');
    }
  };
  const submitPassword = async () => {
    Keyboard.dismiss();
    const { oldPassword, newPassword, confirmPassword } = state;

    if (oldPassword.trim() === '') {
      Alert.alert('', 'Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (newPassword.trim() === '') {
      Alert.alert('', 'Vui lòng nhập mật khẩu mới');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('', 'Mật khẩu mới không khớp');
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert('', 'Mật khẩu mới không được trùng với mật khẩu hiện tại');
      return;
    }

    const params = {
      current_password: oldPassword,
      new_password: newPassword,
    };
    setIsLoading(true);
    const response = await Services.changePassword(params);
    setIsLoading(false);
    if (response?.data?.success) {
      Alert.alert('Cập nhật mật khẩu thành công');
      dispatch(logout());
    } else {
      Alert.alert(response?.data?.message || 'Error');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="always"
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.header}>
            <View style={styles.header1}>
              <TouchableOpacity
                onPress={goBack}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Image source={Images.iconBack} style={styles.iconBack} />
              </TouchableOpacity>
              <Text style={styles.title}>Cài đặt</Text>
              <View
                style={{
                  width: 40,
                  height: 40,
                }}
              />
            </View>
          </View>
          <View style={styles.content}>
            <View style={styles.menu}>
              <TouchableOpacity
                style={styles.btnGenaral}
                onPress={onClickGenaral}
              >
                <Text
                  style={[
                    styles.txtActive,
                    { color: state.isGenaral ? '#1180C3' : '#999' },
                  ]}
                >
                  Cài đặt thông tin
                </Text>
                {state.isGenaral && <View style={styles.lineButton} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnGenaral}
                onPress={onClickPassword}
              >
                <Text
                  style={[
                    styles.txtActive,
                    { color: state.isPassword ? '#1180C3' : '#999' },
                  ]}
                >
                  Cài đặt mật khẩu
                </Text>
                {state.isPassword && <View style={styles.lineButton} />}
              </TouchableOpacity>
            </View>
            {state.isGenaral && (
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                  }}
                >
                  <Text style={styles.titleChild}>Tiểu sử</Text>
                  <Feather name="edit-2" color="#D2D2D2" size={17} />
                </View>
                <View style={styles.viewInputBio}>
                  <TextInput
                    style={styles.textInputBio}
                    multiline
                    value={state.bio}
                    onChangeText={value => setState({ ...state, bio: value })}
                  />
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                  }}
                >
                  <Text style={styles.titleChild}>Họ và tên</Text>
                  <Feather name="edit-2" color="#D2D2D2" size={17} />
                </View>
                <View style={styles.viewInput}>
                  <TextInput
                    style={styles.txtInput}
                    numberOfLines={1}
                    value={state.full_name}
                    onChangeText={value =>
                      setState({ ...state, full_name: value })
                    }
                  />
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#1180C3',
                    height: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    marginTop: 14,
                  }}
                  onPress={() => submitGeneral()}
                  disabled={isLoading}
                >
                  <Text style={styles.titleChilds}>Lưu</Text>
                </TouchableOpacity>
              </View>
            )}
            {state.isPassword && (
              <View>
                <View style={{ marginBottom: 14 }}>
                  <Text style={styles.titleChild}>Mật khẩu hiện tại</Text>
                </View>
                <View style={styles.viewInput}>
                  <TextInput
                    style={styles.txtInput}
                    numberOfLines={1}
                    secureTextEntry={!showCurrentPassword}
                    onChangeText={value =>
                      setState({ ...state, oldPassword: value })
                    }
                  />
                  <TouchableOpacity
                    style={styles.btnViewPass}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <Feather name="eye" color="#D2D2D2" size={18} />
                    ) : (
                      <Feather name="eye-off" color="#D2D2D2" size={18} />
                    )}
                  </TouchableOpacity>
                </View>
                <View style={{ marginBottom: 14 }}>
                  <Text style={styles.titleChild}>Mật khẩu mới</Text>
                </View>
                <View style={styles.viewInput}>
                  <TextInput
                    style={styles.txtInput}
                    numberOfLines={1}
                    secureTextEntry={!showNewPassword}
                    onChangeText={value =>
                      setState({ ...state, newPassword: value })
                    }
                  />
                  <TouchableOpacity
                    style={styles.btnViewPass}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <Feather name="eye" color="#D2D2D2" size={18} />
                    ) : (
                      <Feather name="eye-off" color="#D2D2D2" size={18} />
                    )}
                  </TouchableOpacity>
                </View>
                <View style={{ marginBottom: 14 }}>
                  <Text style={styles.titleChild}>Xác nhận mật khẩu mới</Text>
                </View>
                <View style={styles.viewInput}>
                  <TextInput
                    style={styles.txtInput}
                    numberOfLines={1}
                    secureTextEntry={!showConfirmPassword}
                    onChangeText={value =>
                      setState({ ...state, confirmPassword: value })
                    }
                  />
                  <TouchableOpacity
                    style={styles.btnViewPass}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <Feather name="eye" color="#D2D2D2" size={18} />
                    ) : (
                      <Feather name="eye-off" color="#D2D2D2" size={18} />
                    )}
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#1180C3',
                    height: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    marginTop: 14,
                  }}
                  onPress={() => submitPassword()}
                  disabled={isLoading}
                >
                  <Text style={[styles.titleChilds]}>Lưu</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
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
  menu: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  btnGenaral: {
    marginRight: 31,
    marginBottom: 4,
  },
  txtActive: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    fontSize: 14,
    textTransform: 'uppercase',
    lineHeight: 24,
  },
  lineButton: {
    height: 2,
    width: '100%',
    backgroundColor: '#1180C3',
  },
  inputSearch: {
    flex: 1,
    marginRight: 8,
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 21,
    color: '#000',
  },
  txtPhone: {
    marginLeft: 14,
    fontFamily: 'Inter',
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
    fontFamily: 'Inter-SemiBold',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 36,
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
    lineHeight: 24,
    marginLeft: 20,
  },
  txtBtnUpload: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
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
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
    fontSize: 10,
    lineHeight: 15,
    color: '#A9A9A9',
  },
  content: {
    paddingHorizontal: 16,
    marginTop: 20,
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
    marginTop: 20,
    marginBottom: 40,
  },
  viewAvatar: {
    width: deviceWidth - 32,
    height: (250 / 375) * deviceWidth,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    marginBottom: 20,
  },
  titleChild: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
    fontWeight: '500',
  },
  titleChilds: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
  },
  viewInputBio: {
    width: deviceWidth - 32,
    height: 100,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 8,
    marginBottom: 16,
  },
  textInputBio: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    // lineHeight: 19,
    margin: 8,
    // marginTop: 15,
    color: '#010101',
    flex: 1,
    textAlignVertical: 'top',
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
  btnViewPass: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtInput: {
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'center',
    fontFamily: 'Inter',
    fontSize: 16,
    marginHorizontal: 8,
    color: '#010101',
    flex: 1,
  },
});
