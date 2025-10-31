import { Images } from '@/assets';
import Services from '@/services';
import { ValidateEmail } from '@/utils';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const FirstRegisterStep = ({ setStep, setUserID }: any) => {
  const [email, setEmail] = useState<any>('');
  const [fullName, setFullName] = useState<any>('');
  const [password, setPassword] = useState<any>('');
  const [confirmPassword, setConfirmPassword] = useState<any>('');
  const [showPassword, setShowPassword] = useState<any>('');
  const [showConfirmPassword, setShowConfirmPassword] = useState<any>('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email || email.length === 0) {
      Alert.alert('', 'Email không được để trống');
      return false;
    }
    if (!ValidateEmail(email)) {
      Alert.alert('', 'Email không hợp lệ');
      return false;
    }
    if (!fullName || fullName.length === 0) {
      Alert.alert('', 'Họ và tên không được để trống');
      return false;
    }
    if (!password || password.length === 0) {
      Alert.alert('', 'Mật khẩu không được để trống');
      return false;
    }
    if (!confirmPassword || confirmPassword.length === 0) {
      Alert.alert('', 'Xác nhận mật khẩu không được để trống');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('', 'Mật khẩu không khớp');
      return false;
    }
    return true;
  };

  const handleEmailStep = async () => {
    if (!validate()) {
      return;
    }
    Keyboard.dismiss();

    const params = {
      email,
      full_name: fullName,
      password,
      password_confirmation: confirmPassword,
    };
    setLoading(true);
    const response: any = (await Services.firstRegisterStep(params)).data;
    console.log(response);
    setLoading(false);

    if (response && response?.success) {
      setUserID(response?.data?.user_id);
      setStep(1);
    } else if (response && response?.message.includes('auth.go_step_2')) {
      setStep(1);
    } else if (response?.data?.errors?.email) {
      Alert.alert('Email đã được sử dụng');
    } else {
      Alert.alert('', response.message);
    }
  };

  return (
    <View style={{ paddingHorizontal: 46, marginTop: 35 }}>
      <View
        style={[
          styles.viewInput,
          email.length > 0 ? { borderWidth: 2, borderColor: '#000' } : {},
        ]}
      >
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Email"
          placeholderTextColor="#9E9E9E"
          style={styles.textInput}
          onChangeText={value => setEmail(value)}
        />
        {email.length > 0 && (
          <Image source={Images.icEnterEmail} style={styles.icEnter} />
        )}
      </View>
      <View
        style={[
          styles.viewInput,
          fullName.length > 0 ? { borderWidth: 2, borderColor: '#000' } : {},
        ]}
      >
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Họ và tên"
          placeholderTextColor="#9E9E9E"
          style={styles.textInput}
          onChangeText={value => setFullName(value)}
        />
        {/* {fullName.length > 0 && (
          <Image source={Images.icEnterEmail} style={styles.icEnter} />
        )} */}
      </View>
      <View
        style={[
          styles.viewInput,
          password.length > 0 ? { borderWidth: 2, borderColor: '#000' } : {},
        ]}
      >
        <TextInput
          secureTextEntry={!showPassword}
          placeholder="Mật khẩu"
          placeholderTextColor="#9E9E9E"
          style={styles.textInput}
          value={password}
          onChangeText={value => setPassword(value)}
        />
        {password.length > 0 && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image source={Images.icEnterPassword} style={styles.icEnter} />
          </TouchableOpacity>
        )}
      </View>
      <View
        style={[
          styles.viewInput,
          confirmPassword.length > 0
            ? { borderWidth: 2, borderColor: '#000' }
            : {},
        ]}
      >
        <TextInput
          placeholder="Xác nhận mật khẩu"
          placeholderTextColor="#9E9E9E"
          style={styles.textInput}
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={value => setConfirmPassword(value)}
        />
        {confirmPassword.length > 0 && (
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Image source={Images.icEnterPassword} style={styles.icEnter} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={styles.btnSubmit}
        onPress={handleEmailStep}
        disabled={loading}
      >
        <Text style={styles.txtSubmit}>
          {loading ? 'Đang tải...' : 'Tiếp tục'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default FirstRegisterStep;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  containerAll: {},
  imgBanner: {
    width: (1120 / 1500) * deviceWidth,
    height: (1272 / 1500) * deviceWidth,
    resizeMode: 'contain',
    position: 'absolute',
    right: 0,
  },
  imgBottom: {
    width: deviceWidth,
    height: (380 / 1500) * deviceWidth,
    resizeMode: 'contain',
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  textBottom: {
    marginTop: 40,
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
  },
  logo: {
    height: (98 / 375) * deviceWidth,
    width: (73 / 375) * deviceWidth,
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
    fontSize: 28,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
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
  textInput: {
    flex: 1,
    height: 45,
    color: '#000',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
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
    fontSize: 11,
    color: '#000',
    fontWeight: '400',
    lineHeight: 16,
  },
  iconCheck: {
    fontSize: 22,
    color: '#9E9E9E',
    marginRight: 12,
  },
  btnSubmit: {
    marginTop: 26,
    flex: 1,
    height: 50,
    backgroundColor: '#FFC224',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  txtSubmit: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#000',
    fontWeight: '400',
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
  icEnter: {
    width: 17,
    height: 17,
    resizeMode: 'contain',
  },
  root: { flex: 1, padding: 20 },
  codeTitle: { textAlign: 'center', fontSize: 30 },
  codeFieldRoot: { width: 320, marginLeft: 'auto', marginRight: 'auto' },
  cellRoot: {
    width: 40,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#9E9E9E',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  cellText: {
    fontSize: 32,
    color: 'black',
    textAlign: 'center',
  },
  focusCell: {
    borderBottomColor: '#FFC224',
  },
});
