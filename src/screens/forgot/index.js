import React, { PureComponent } from 'react';
import {
  Alert,
  BackHandler,
  Image,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Images } from '../../assets';
import { COPYRIGHTS } from '../../config';
import { NewClient } from '../../api';
import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ValidateEmail } from '../../common';
import ResetPasswordForm from './reset-password-form';
import { setLoading } from '../../actions/common';
import styles from './styles';

class Forgot extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hidenBottom: false,
      email: '',
      step: 1,
      token: undefined,
    };

    this.backHandler = null;
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide,
    );
  }

  componentWillUnmount() {
    if (this.backHandler) {
      this.backHandler.remove();
    }
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow = () => {
    this.setState({
      hidenBottom: true,
    });
  };

  _keyboardDidHide = () => {
    this.setState({
      hidenBottom: false,
    });
  };

  handleBackPress = () => {
    this.onBack(); // works best when the goBack is async
    return true;
  };

  onBack = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  onSend = async () => {
    const { email } = this.state;
    const { dispatch, navigation } = this.props;
    if (!ValidateEmail(email)) {
      Alert.alert('Please enter a valid email address');
      return;
    }
    Keyboard.dismiss();

    dispatch(setLoading(true));
    try {
      const response = await NewClient.resetEmail({ email });
      if (response && response?.success) {
        Alert.alert('Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.');
        dispatch(setLoading(false));
        navigation.reset({
          index: 0,
          routes: [{ name: 'LoginScreen' }],
        });
        this.setState({ token: response?.data?.token, step: 2 });
      } else {
        Alert.alert(response?.message);
      }
    } catch (e) {
      Alert.alert(e);
    }
    dispatch(setLoading(false));
  };

  render() {
    const { t } = this.props;
    const { hidenBottom, email } = this.state;
    return (
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="always"
      >
        {this.state.step === 1 ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ marginTop: 80 }}>
              <TouchableOpacity
                style={{ marginLeft: 16, width: 50 }}
                onPress={this.onBack}
              >
                <Image source={Images.iconBack} style={styles.iconBack} />
              </TouchableOpacity>
              <View style={styles.viewLogo}>
                <Image source={Images.LogoSchool} style={styles.logo} />
                <Text style={styles.title}>{t('forgot.title')}</Text>
                {/* <Text style={styles.childTitle}>{t('forgot.description')}</Text> */}
              </View>
            </View>
            <View style={{ paddingHorizontal: 46, marginTop: 35 }}>
              <TextInput
                placeholder={t('forgot.emailPlaceholder')}
                placeholderTextColor="#9E9E9E"
                style={styles.textInput}
                autoCorrect={false}
                autoCapitalize="none"
                value={email}
                onChangeText={value => this.setState({ email: value })}
              />
              <TouchableOpacity style={styles.btnSubmit} onPress={this.onSend}>
                <Text style={styles.txtSubmit}>{t('forgot.confirm')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <ResetPasswordForm
            email={this.state.email}
            token={this.state.token}
          />
        )}
        {!hidenBottom && (
          <View style={styles.imgBottom}>
            <Text style={styles.textBottom}>{COPYRIGHTS}</Text>
          </View>
        )}
      </KeyboardAwareScrollView>
    );
  }
}
const mapStateToProps = ({ network }) => ({
  network,
});
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(Forgot);
