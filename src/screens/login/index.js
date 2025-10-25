import React, { PureComponent } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  BackHandler,
  Alert,
  Keyboard,
  StatusBar,
  Linking,
} from 'react-native';
import { Images } from '../../assets';
import { NewClient, setToken } from '../../api';
import LinearGradient from 'react-native-linear-gradient';
import { connect } from 'react-redux';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { deleteFCMToken } from '../../common';
import styles from './styles';
import { saveUserToken, setUser } from '../../actions/user';
import { setLoading } from '../../actions/common';
import { WEB_URL } from '../../config';

class Login extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      showPassword: false,
    };
    this.backHandler = null;
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
  }

  componentWillUnmount() {
    if (this.backHandler) {
      this.backHandler.remove();
    }
  }

  handleBackPress = () => {
    this.onBack();
    return true;
  };

  onRegister = () => {
    const { navigation } = this.props;
    navigation.navigate('RegisterScreen');
  };

  validate() {
    const { t } = this.props;
    const { username, password } = this.state;
    if (!username || username.length === 0) {
      Alert.alert('', t('loginScreen.usernameEmpty'));
      return false;
    }
    if (!password || password.length === 0) {
      Alert.alert('', t('loginScreen.passwordEmpty'));
      return false;
    }
    return true;
  }

  onLogin = async () => {
    const { t } = this.props;
    Keyboard.dismiss();
    const { dispatch } = this.props;
    if (!this.validate()) {
      return;
    }

    dispatch(setLoading(true));

    const { username, password } = this.state;

    const params = {
      username,
      password,
    };

    const response = await NewClient.login(params);
    console.log('responseUser', response);
    if (response && response?.data?.token) {
      dispatch(saveUserToken(response.data.token));
      setToken(response.data.token);
      const responseUser = await NewClient.getUser();
      if (responseUser && responseUser?.data?.user) {
        dispatch(
          setUser({
            ...responseUser.data.user,
            user_id: response.data.user_id,
          }),
        );
      }
      // Delete FCM Token.
      // await deleteFCMToken();

      // Register FCM Token.
      // await registerFCMToken();

      const { navigation, route } = this.props;

      if (route.params?.screen) {
        if (
          route.params?.screen === 'CoursesDetailsScreen' &&
          route.params?.id
        ) {
          navigation.navigate('CoursesDetailsScreen', {
            id: route.params.id,
          });
        } else {
          navigation.navigate(route.params.screen);
        }
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeTabScreen' }],
        });
      }
    } else if (response?.status === 'soft_deleted') {
      Alert.alert(
        '',
        'Tài khoản đang tạm khoá. Vui lòng liên hệ hỗ trợ qua cothuyikun@gmail.com hoặc 0909923897',
      );
    } else {
      Alert.alert('', t('loginScreen.passwordNotCorrect'));
    }

    dispatch(setLoading(false));
  };

  onBack = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  render() {
    const { username, password } = this.state;
    const { t, navigation } = this.props;

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
              onPress={this.onBack}
              hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
            >
              <Image source={Images.iconBack} style={styles.iconBack} />
            </TouchableOpacity>
            <View style={styles.viewLogo}>
              <Image source={Images.LogoSchool} style={styles.logo} />
            </View>
          </View>
          <View style={styles.wrapper}>
            <Text style={styles.title}>{t('loginScreen.title')}</Text>

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
                    ref={ref => {
                      this.username = ref;
                    }}
                    placeholder={t('loginScreen.usernamePlaceholder')}
                    placeholderTextColor="#9E9E9E"
                    style={styles.textInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={value => this.setState({ username: value })}
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
                    ref={ref => {
                      this.password = ref;
                    }}
                    secureTextEntry={!this.state.showPassword}
                    placeholder={t('loginScreen.passwordPlaceholder')}
                    placeholderTextColor="#9E9E9E"
                    style={styles.textInput}
                    value={password}
                    onChangeText={value => this.setState({ password: value })}
                  />
                  {password.length > 0 && (
                    <TouchableOpacity
                      onPress={() =>
                        this.setState({
                          showPassword: !this.state.showPassword,
                        })
                      }
                    >
                      <Image
                        source={Images.icEnterPassword}
                        style={styles.icEnter}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.btnSubmit}
                  onPress={this.onLogin}
                >
                  <Text style={styles.txtSubmit}>
                    {t('loginScreen.btnLogin')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotScreen')}
                >
                  <Text style={styles.txtForgot}>
                    {t('loginScreen.forgotPassword')}
                  </Text>
                </TouchableOpacity>
                <View style={styles.registerWrapper}>
                  <Text style={styles.txtYet}>Chưa có tài khoản?</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('RegisterScreen')}
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
  }
}
const mapStateToProps = ({ network }) => ({
  network,
});
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(Login);
