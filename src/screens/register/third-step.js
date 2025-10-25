import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Text,
  Keyboard,
} from 'react-native';
import React, {useState} from 'react';
import styles from './styles';
import {NewClient} from '../../api';
import {useDispatch} from 'react-redux';
import {setLoading} from '../../actions/common';
import {useNavigation} from '@react-navigation/native';

const ThirdRegisterStep = ({setStep, userID}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [fullname, setFullname] = useState('');

  const validate = () => {
    if (!fullname || fullname.length === 0) {
      Alert.alert('', 'Họ và tên không được để trống');
      fullname.focus();
      return false;
    }
    return true;
  };

  const handleFinishStep = async () => {
    if (!validate()) {
      return;
    }
    Keyboard.dismiss();

    dispatch(setLoading(true));

    const params = {
      user_id: userID,
      full_name: fullname,
    };
    const response = await NewClient.thirdRegisterStep(params);

    if (response && response?.success) {
      Alert.alert('Đăng kí tài khoản thành công');
      navigation.reset({
        index: 0,
        routes: [{name: 'LoginScreen'}],
      });
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
          fullname.length > 0 ? {borderWidth: 2, borderColor: '#000'} : {},
        ]}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Họ và tên"
          placeholderTextColor="#9E9E9E"
          style={styles.textInput}
          onChangeText={value => setFullname(value)}
        />
      </View>
      <TouchableOpacity style={styles.btnSubmit} onPress={handleFinishStep}>
        <Text style={styles.txtSubmit}>Đăng kí</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ThirdRegisterStep;
