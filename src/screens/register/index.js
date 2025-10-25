import React, {useState} from 'react';
import {Image, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {Images} from '../../assets';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import styles from './styles';
import FirstRegisterStep from './first-step';
import SecondRegisterStep from './second-step';
import ThirdRegisterStep from './third-step';

const STEPS = [
  {Component: FirstRegisterStep},
  {Component: SecondRegisterStep},
  {Component: ThirdRegisterStep},
];

const Register = ({navigation}) => {
  const [step, setStep] = useState(0);
  const [userID, setUserID] = useState(undefined);
  const {Component} = STEPS[step];

  const onBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
    return true;
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="always">
      <View style={{marginTop: 80}}>
        <TouchableOpacity style={{marginLeft: 16, width: 50}} onPress={onBack}>
          <Image source={Images.iconBack} style={styles.iconBack} />
        </TouchableOpacity>
        <View style={styles.viewLogo}>
          <Image source={Images.LogoSchool} style={styles.logo} />
          <Text style={styles.title}>Đăng kí tài khoản</Text>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled">
        <Component {...{setStep, userID, setUserID}} />
      </ScrollView>
    </KeyboardAwareScrollView>
  );
};

export default Register;
