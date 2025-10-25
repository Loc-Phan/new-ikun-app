import React, { useState } from 'react';
import {
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView,
  Keyboard,
} from 'react-native';
import { Images } from '../../assets';
import { NewClient } from '../../api';
import { useDispatch } from 'react-redux';
import { setLoading } from '../../actions/common';
import { useNavigation } from '@react-navigation/native';

import styles from './styles';

const ResetPasswordForm = ({ email, token }) => {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();

  const validate = () => {
    if (!password || password.length === 0) {
      Alert.alert('', 'Mật khẩu là bắt buộc');
      password.focus();
      return false;
    }
    if (!confirmPassword || confirmPassword.length === 0) {
      Alert.alert('', 'Xác nhận mật khẩu là bắt buộc');
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

  const handleResetPassword = async () => {
    if (!validate()) {
      return;
    }
    Keyboard.dismiss();

    dispatch(setLoading(true));

    const params = {
      email,
      password,
      password_confirmation: confirmPassword,
    };
    const response = await NewClient.resetPassword(token, params);
    if (response && response?.success) {
      await Alert.alert('', 'Đặt lại mật khẩu thành công');
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    } else {
      Alert.alert('', response.message);
    }

    dispatch(setLoading(false));
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      bounces={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ marginTop: 50 }}>
        <TouchableOpacity
          style={{ marginLeft: 16, width: 50 }}
          onPress={this.onBack}
        >
          <Image source={Images.iconBack} style={styles.iconBack} />
        </TouchableOpacity>
        <View style={styles.viewLogo}>
          <Image source={Images.LogoSchool} style={styles.logo} />
          <Text style={styles.title}>Đặt lại mật khẩu</Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 46, marginTop: 35 }}>
        <View style={[styles.viewInput]}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Email"
            style={styles.resetTextInput}
            value={email}
            editable={false}
          />
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
            style={styles.resetTextInput}
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
            style={styles.resetTextInput}
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
          onPress={handleResetPassword}
        >
          <Text style={styles.txtSubmit}>Đặt lại mật khẩu</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ResetPasswordForm;
