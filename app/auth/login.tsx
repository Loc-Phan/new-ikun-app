import { Images } from '@/assets';
import { AppDispatch } from '@/store';
import { getProfile, login } from '@/store/auth/authThunk';
import { router, useGlobalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch } from 'react-redux';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { screen, id }: { screen: string; id: string } = useGlobalSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<any>();

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  const handleBackPress = () => {
    onBack();
    return true;
  };

  const onRegister = () => {
    navigation.navigate('RegisterScreen');
  };

  const validate = () => {
    if (!username || username.length === 0) {
      Alert.alert('', 'Tên đăng nhập là bắt buộc');
      return false;
    }
    if (!password || password.length === 0) {
      Alert.alert('', 'Mật khẩu là bắt buộc');
      return false;
    }
    return true;
  };

  const onLogin = async () => {
    Keyboard.dismiss();
    if (!validate()) {
      return;
    }

    try {
      const result = await dispatch(login({ username, password }));
      
      if (login.fulfilled.match(result)) {
        await dispatch(getProfile());
        if (screen) {
          if (screen === 'coursedetails' && id) {
            navigation.navigate('coursedetails', {
              id,
            });
          } else {
            navigation.navigate(screen);
          }
        } else {
          router.replace('/(tabs)');
        }
      } else {
        const errorMessage = result.payload as string;
        if (errorMessage?.includes('soft_deleted')) {
          Alert.alert(
            '',
            'Tài khoản đang tạm khoá. Vui lòng liên hệ hỗ trợ qua cothuyikun@gmail.com hoặc 0909923897',
          );
        } else {
          Alert.alert('', 'Tên đăng nhập hoặc mật khẩu không chính xác');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('', 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const onBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="always"
    >
      <StatusBar backgroundColor="transparent" />
      <LinearGradient
        colors={['#FED600', '#F7A322', '#F2793E']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 0.2 }}
      >
        <View style={styles.imgBanner} />
        <View style={{ marginTop: 80 }}>
          <TouchableOpacity
            style={{ marginLeft: 16, width: 50 }}
            onPress={onBack}
            hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
          >
            <Image source={Images.iconBack} style={styles.iconBack} />
          </TouchableOpacity>
          <View style={styles.viewLogo}>
            <Image source={Images.LogoSchool} style={styles.logo} />
          </View>
        </View>
        <View style={styles.wrapper}>
          <Text style={styles.title}>Đăng nhập tài khoản</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ paddingHorizontal: 46, marginTop: 35 }}>
              <View
                style={[
                  styles.viewInput,
                  username.length > 0
                    ? { borderWidth: 2, borderColor: '#000' }
                    : {},
                ]}
              >
                <TextInput
                  ref={usernameRef}
                  placeholder="Tên đăng nhập"
                  placeholderTextColor="#9E9E9E"
                  style={styles.textInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setUsername}
                />
                {username.length > 0 && (
                  <Image
                    source={Images.icEnterUsername}
                    style={styles.icEnter}
                  />
                )}
              </View>
              <View
                style={[
                  styles.viewInput,
                  password.length > 0
                    ? { borderWidth: 2, borderColor: '#000' }
                    : {},
                ]}
              >
                <TextInput
                  ref={passwordRef}
                  secureTextEntry={!showPassword}
                  placeholder="Mật khẩu"
                  placeholderTextColor="#9E9E9E"
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                />
                {password.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Image
                      source={Images.icEnterPassword}
                      style={styles.icEnter}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity style={styles.btnSubmit} onPress={onLogin}>
                <Text style={styles.txtSubmit}>Đăng nhập</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('auth/forgot-password')}
              >
                <Text style={styles.txtForgot}>Quên mật khẩu</Text>
              </TouchableOpacity>
              <View style={styles.registerWrapper}>
                <Text style={styles.txtYet}>Chưa có tài khoản?</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('auth/register')}
                >
                  <Text style={styles.txtRegister}>Đăng ký</Text>
                </TouchableOpacity>
              </View>
              {/* <View style={styles.viewLine}>
            <View style={styles.line} />
            <Text>or</Text>
            <View style={styles.line} />
          </View>
          <View style={styles.viewButton}>
            <TouchableOpacity>
              <Image
                source={Images.iconFacebook}
                style={styles.iconFacebook}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={Images.iconTwitter} style={styles.iconTwitter} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={Images.iconGoogle} style={styles.iconGoogle} />
            </TouchableOpacity>
          </View> */}
            </View>
          </ScrollView>
          {/* <View style={styles.bottomLeftBackground} />
        <Image
          source={Images.loginBackground}
          style={styles.rightBottomBackground}
        /> */}
        </View>
      </LinearGradient>
    </KeyboardAwareScrollView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1673A',
    flex: 1,
  },
  imgBanner: {
    width: (986 / 1179) * deviceWidth,
    height: (986 / 1179) * deviceWidth,
    backgroundColor: '#ffffff',
    opacity: 0.2,
    borderRadius: 99999,
    position: 'absolute',
    right: '-42%',
  },
  wrapper: {
    position: 'relative',
    flex: 1,
    marginTop: 40,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: (215 / 1179) * deviceWidth,
  },
  imgBottom: {
    marginTop: 10,
    resizeMode: 'contain',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  textBottom: {
    marginTop: 40,
    fontSize: 14,
    color: '#000',
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
  },
  logo: {
    height: (190 / 1179) * deviceWidth,
    width: (399 / 1179) * deviceWidth,
    resizeMode: 'contain',
    // position: "absolute",
  },
  viewLogo: {
    alignSelf: 'center',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 28,
    fontFamily: 'Inter-SemiBold',
  },
  containerImg: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  text: {
    fontSize: 15,
    color: '#000',
  },
  textInput: {
    flex: 1,
    height: 52,
    color: '#000',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  icEnter: {
    width: 17,
    height: 17,
    resizeMode: 'contain',
  },
  button: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 1,
    top: deviceHeight / 2 - 20,
  },
  nextButton: {
    height: (264 / 375) * deviceWidth,
    width: (264 / 375) * deviceWidth,
    resizeMode: 'contain',
  },
  iconBack: {
    height: 22,
    width: 22,
    resizeMode: 'contain',
  },
  txtAccept: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#9E9E9E',
  },
  iconCheck: {
    fontSize: 22,
    color: '#9E9E9E',
    marginRight: 12,
  },
  btnSubmit: {
    marginTop: 0,
    flex: 1,
    height: 60,
    backgroundColor: '#1180C3',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 36,
  },
  txtSubmit: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#fff',
  },
  line: {
    width: 90,
    height: 1,
    backgroundColor: '#DBDBDB',
  },
  iconFacebook: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  iconTwitter: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  iconGoogle: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  txtForgot: {
    marginTop: 24,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    fontSize: 15,
    color: '#F32626',
  },
  registerWrapper: {
    marginTop: 48,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  txtYet: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#000000',
    marginRight: 6,
  },
  txtRegister: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#1180C3',
  },
  viewLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 250,
    alignSelf: 'center',
    marginTop: 71,
  },
  viewButton: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 120,
    alignSelf: 'center',
  },
  viewInput: {
    flex: 1,
    color: '#000',
    backgroundColor: '#F3F3F3',
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 2,
    borderColor: '#F3F3F3',
  },
  bottomLeftBackground: {
    width: (986 / 1179) * deviceWidth,
    height: (986 / 1179) * deviceWidth,
    backgroundColor: '#FFC224',
    opacity: 0.2,
    borderRadius: 99999,
    position: 'absolute',
    left: 0,
    bottom: '-30%',
  },
  rightBottomBackground: {
    width: (695 / 1179) * deviceWidth,
    height: (695 / 1179) * deviceWidth,
    resizeMode: 'contain',
    position: 'absolute',
    right: '-20%',
    bottom: '-12%',
  },
});
