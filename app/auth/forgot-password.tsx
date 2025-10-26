import { Images } from '@/assets';
import Services from '@/services';
import { ValidateEmail } from '@/utils';
import { router, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
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

const deviceWidth = Dimensions.get('window').width;

const ForgotPassword = () => {
  const navigation = useNavigation();
  
  const [hidenBottom, setHidenBottom] = useState(false);
  const [email, setEmail] = useState('');

  const keyboardDidShow = () => {
    setHidenBottom(true);
  };

  const keyboardDidHide = () => {
    setHidenBottom(false);
  };

  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleBackPress = useCallback(() => {
    onBack();
    return true;
  }, [onBack]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      keyboardDidShow,
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      keyboardDidHide,
    );

    return () => {
      backHandler.remove();
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [handleBackPress]);

  const onSend = async () => {
    if (!ValidateEmail(email)) {
      Alert.alert('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    Keyboard.dismiss();

    try {
      const response = await Services.resetEmail({ email });
      if (response && response?.data?.success) {
        Alert.alert('Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.');
        router.replace('/auth/login');
        return;
      } else {
        Alert.alert(response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch {
      Alert.alert('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="always"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginTop: 80 }}>
          <TouchableOpacity
            style={{ marginLeft: 16, width: 50 }}
            onPress={onBack}
          >
            <Image source={Images.iconBack} style={styles.iconBack} />
          </TouchableOpacity>
          <View style={styles.viewLogo}>
            <Image source={Images.LogoSchool} style={styles.logo} />
            <Text style={styles.title}>Quên mật khẩu</Text>
          </View>
        </View>
        <View style={{ paddingHorizontal: 46, marginTop: 35 }}>
          <TextInput
            placeholder="Nhập email của bạn"
            placeholderTextColor="#9E9E9E"
            style={styles.textInput}
            autoCorrect={false}
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity style={styles.btnSubmit} onPress={onSend}>
            <Text style={styles.txtSubmit}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {!hidenBottom && (
        <View style={styles.imgBottom}>
          <Text style={styles.textBottom}>© 2024 iKun App</Text>
        </View>
      )}
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  viewLogo: {
    alignSelf: 'center',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  logo: {
    height: (190 / 1179) * deviceWidth,
    width: (399 / 1179) * deviceWidth,
    resizeMode: 'contain',
  },
  title: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 28,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  iconBack: {
    height: 22,
    width: 22,
    resizeMode: 'contain',
  },
  textInput: {
    height: 52,
    color: '#000',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    backgroundColor: '#F3F3F3',
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: '#F3F3F3',
  },
  btnSubmit: {
    marginTop: 20,
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
  imgBottom: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  textBottom: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
  },
});

export default ForgotPassword;
