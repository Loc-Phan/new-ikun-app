import Services from '@/services';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

const CELL_COUNT = 5;

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const SecondRegisterStep = ({ setStep, userID }: any) => {
  const navigation = useNavigation();

  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const handleOTPStep = async () => {
    Keyboard.dismiss();

    const params = {
      user_id: userID,
      code: value,
    };
    const response: any = await Services.secondRegisterStep(params);

    if (response && response?.data?.success) {
      Alert.alert('Đăng ký thành công');
      router.replace('/auth/login');
    } else {
      Alert.alert('', 'Mã OTP không đúng');
    }
  };

  return (
    <View style={{ paddingHorizontal: 46, marginTop: 35 }}>
      <Text style={{ textAlign: 'center', marginBottom: 16, fontSize: 16 }}>
        Xác nhận mã OTP
      </Text>
      <CodeField
        ref={ref}
        {...props}
        // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
        value={value}
        onChangeText={setValue}
        cellCount={CELL_COUNT}
        rootstyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({ index, symbol, isFocused }) => (
          <View
            key={index}
            onLayout={getCellOnLayoutHandler(index)}
            style={[styles.cellRoot, isFocused && styles.focusCell]}
          >
            <Text style={styles.cellText}>
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          </View>
        )}
      />
      <Text style={{ textAlign: 'center', marginVertical: 8, fontSize: 16 }}>
        Vui lòng đợi mã OTP gửi về email của bạn
      </Text>
      <TouchableOpacity style={styles.btnSubmit} onPress={handleOTPStep}>
        <Text style={styles.txtSubmit}>Tiếp tục</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SecondRegisterStep;

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
