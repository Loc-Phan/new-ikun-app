import {View, TouchableOpacity, Alert, Text, Keyboard} from 'react-native';
import React, {useState} from 'react';
import Styles from './styles';
import {NewClient} from '../../api';
import {useDispatch} from 'react-redux';
import {setLoading} from '../../actions/common';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {useNavigation} from '@react-navigation/native';

const CELL_COUNT = 5;

const SecondRegisterStep = ({setStep, userID}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const handleOTPStep = async () => {
    Keyboard.dismiss();

    dispatch(setLoading(true));

    const params = {
      user_id: userID,
      code: value,
    };
    const response = await NewClient.secondRegisterStep(params);

    if (response && response?.success) {
      Alert.alert('Đăng ký thành công');
      navigation.reset({
        index: 0,
        routes: [{name: 'LoginScreen'}],
      });
    } else {
      Alert.alert('', 'Mã OTP không đúng');
    }

    dispatch(setLoading(false));
  };

  return (
    <View style={{paddingHorizontal: 46, marginTop: 35}}>
      <Text style={{textAlign: 'center', marginBottom: 16, fontSize: 16}}>
        Xác nhận OTP
      </Text>
      <CodeField
        ref={ref}
        {...props}
        // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
        value={value}
        onChangeText={setValue}
        cellCount={CELL_COUNT}
        rootStyle={Styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({index, symbol, isFocused}) => (
          <View
            key={index}
            onLayout={getCellOnLayoutHandler(index)}
            style={[Styles.cellRoot, isFocused && Styles.focusCell]}>
            <Text style={Styles.cellText}>
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          </View>
        )}
      />
      <Text style={{textAlign: 'center', marginVertical: 8, fontSize: 16}}>
        Vui lòng đợi mã OTP gửi về email của bạn
      </Text>
      <TouchableOpacity style={Styles.btnSubmit} onPress={handleOTPStep}>
        <Text style={Styles.txtSubmit}>Tiếp tục</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SecondRegisterStep;
