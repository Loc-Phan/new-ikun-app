import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  Text,
  Keyboard,
} from 'react-native';
import React, {useState} from 'react';
import styles from './styles';
import {Images} from '../../assets';
import {ValidateEmail} from '../../common';
import {NewClient} from '../../api';
import {useDispatch} from 'react-redux';
import {setLoading} from '../../actions/common';

const FirstRegisterStep = ({setStep, setUserID}) => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState('');

  const validate = () => {
    if (!email || email.length === 0) {
      Alert.alert('', 'Email không được để trống');
      email.focus();
      return false;
    }
    if (!ValidateEmail(email)) {
      Alert.alert('', 'Email không hợp lệ');
      email.focus();
      return false;
    }
    if (!fullName || fullName.length === 0) {
      Alert.alert('', 'Họ và tên không được để trống');
      fullName.focus();
      return false;
    }
    if (!password || password.length === 0) {
      Alert.alert('', 'Mật khẩu không được để trống');
      password.focus();
      return false;
    }
    if (!confirmPassword || confirmPassword.length === 0) {
      Alert.alert('', 'Xác nhận mật khẩu không được để trống');
      confirmPassword.focus();
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('', 'Mật khẩu không khớp');
      confirmPassword.focus();
      return false;
    }
    return true;
  };

  const handleEmailStep = async () => {
    if (!validate()) {
      return;
    }
    Keyboard.dismiss();

    dispatch(setLoading(true));

    const params = {
      email,
      full_name: fullName,
      password,
      password_confirmation: confirmPassword,      
    };
    const response = await NewClient.firstRegisterStep(params);
    // console.log(response.data.errors.address);

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

    dispatch(setLoading(false));
  };

  return (
    <View style={{paddingHorizontal: 46, marginTop: 35}}>
      <View
        style={[
          styles.viewInput,
          email.length > 0 ? {borderWidth: 2, borderColor: '#000'} : {},
        ]}>
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
          fullName.length > 0 ? {borderWidth: 2, borderColor: '#000'} : {},
        ]}>
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
          password.length > 0 ? {borderWidth: 2, borderColor: '#000'} : {},
        ]}>
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
            ? {borderWidth: 2, borderColor: '#000'}
            : {},
        ]}>
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
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Image source={Images.icEnterPassword} style={styles.icEnter} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.btnSubmit} onPress={handleEmailStep}>
        <Text style={styles.txtSubmit}>Tiếp tục</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FirstRegisterStep;
