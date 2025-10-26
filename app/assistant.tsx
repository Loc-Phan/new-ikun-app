import { Images } from '@/assets';
import Services from '@/services';
import { ValidateEmail } from '@/utils';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const deviceWidth = Dimensions.get('window').width;

const Assistant = () => {
  const navigation = useNavigation<any>();
  const params = useLocalSearchParams<{
    id?: string;
    type?: string;
    name?: string;
  }>();
  const user = useSelector((state: RootState) => state.auth?.user);
  const [state, setState] = useState({
    textSearch: '',
    name: user?.full_name || '',
    contact: '',
    subject: '',
    note: '',
    email: user?.email || '',
    loading: false,
    id: null as string | null,
    type: '',
  });

  const handleBackPress = useCallback(() => {
    navigation.goBack(null);
    return true;
  }, [navigation]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    const id = params?.id;
    const type = params?.type;
    const name = params?.name;
    setState(prevState => ({
      ...prevState,
      id: id || null,
      type: type || '',
      subject: name || '',
    }));

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => {
      backHandler.remove();
    };
  }, [params, handleBackPress]);

  const validate = useCallback(() => {
    const { name, contact, email } = state;
    if (!name) {
      Alert.alert('Họ và tên không được để trống');
      return false;
    }
    if (!user?.email) {
      if (!email) {
        Alert.alert('Email không được để trống');
        return false;
      }
      if (!ValidateEmail(email)) {
        Alert.alert('Email không hợp lệ');
        return false;
      }
    }
    if (!contact) {
      Alert.alert('Số điện thoại không được để trống');
      return false;
    }
    return true;
  }, [state, user]);

  const handleSubmit = useCallback(async () => {
    const { name, contact, subject, note, email } = state;
    const emailInput = user?.email || email;
    if (!validate()) return;

    const params = {
      name,
      phone: contact,
      subject,
      message: note,
      email: emailInput,
    };

    setState(prevState => ({ ...prevState, loading: true }));

    try {
      const response = await Services.contactAssistant(params);
      if (response && response.data) {
        Alert.alert('Yêu cầu đã được gửi thành công!');
        if (state.type === 'ebook') {
          navigation.navigate(
            'EbooksDetailsScreen' as never,
            { id: state.id } as never,
          );
        } else if (state.type === 'course') {
          navigation.navigate(
            'CoursesDetailsScreen' as never,
            { id: state.id } as never,
          );
        }
      } else {
        Alert.alert('Yêu cầu không thành công');
      }
    } catch {
      Alert.alert('Yêu cầu không thành công');
    } finally {
      setState(prevState => ({ ...prevState, loading: false }));
    }
  }, [state, user, validate, navigation]);

  const updateState = useCallback((key: string, value: any) => {
    setState(prevState => ({ ...prevState, [key]: value }));
  }, []);

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      bounces={false}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="always"
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.header}>
          <View style={styles.header1}>
            <TouchableOpacity
              onPress={goBack}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Image source={Images.iconBack} style={styles.iconBack} />
            </TouchableOpacity>
            <View
              style={{
                width: 40,
                height: 40,
              }}
            />
          </View>
        </View>
        <View style={styles.wrapper}>
          <Text style={styles.description}>
            Xác nhận yêu cầu hỗ trợ mở khoá Khoá học
          </Text>
          <Text
            style={{
              marginTop: 16,
              fontSize: 16,
              paddingHorizontal: 24,
              textAlign: 'center',
            }}
          >
            Mời bạn xác nhận các thông tin sau để chúng tôi liên lạc hỗ trợ mở
            khoá Khoá học
          </Text>
          <View style={{ marginTop: 16 }}>
            <View style={{ marginBottom: 14, flexDirection: 'row' }}>
              <Text style={styles.titleChild}>Họ và tên</Text>
              <Text style={{ color: 'red' }}>{` *`}</Text>
            </View>
            <View style={styles.viewInput}>
              <TextInput
                style={styles.txtInput}
                numberOfLines={1}
                value={state.name}
                onChangeText={value => updateState('name', value)}
              />
            </View>
            {!user ? (
              <View>
                <View style={{ marginBottom: 14, flexDirection: 'row' }}>
                  <Text style={styles.titleChild}>Email</Text>
                  <Text style={{ color: 'red' }}>{` *`}</Text>
                </View>
                <View style={styles.viewInput}>
                  <TextInput
                    style={styles.txtInput}
                    numberOfLines={1}
                    value={state.email}
                    onChangeText={value => updateState('email', value)}
                  />
                </View>
              </View>
            ) : null}
            <View style={{ marginBottom: 14, flexDirection: 'row' }}>
              <Text style={styles.titleChild}>Số điện thoại</Text>
              <Text style={{ color: 'red' }}>{` *`}</Text>
            </View>
            <View style={styles.viewInput}>
              <TextInput
                style={styles.txtInput}
                numberOfLines={1}
                value={state.contact}
                onChangeText={value => updateState('contact', value)}
              />
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={styles.titleChild}>Chủ đề</Text>
            </View>
            <View style={styles.viewInput}>
              <TextInput
                style={styles.txtInput}
                numberOfLines={1}
                value={state.subject}
                onChangeText={value => updateState('subject', value)}
              />
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={styles.titleChild}>Ghi chú</Text>
            </View>
            <View>
              <TextInput
                style={{
                  marginBottom: 16,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#EBEBEB',
                  textAlignVertical: 'center',
                  paddingHorizontal: 8,
                  fontSize: 16,
                  minHeight: 80,
                  fontFamily: 'Inter-Regular',
                  color: '#010101',
                }}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={state.note}
                onChangeText={value => updateState('note', value)}
              />
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: '#1180C3',
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                marginTop: 14,
              }}
              onPress={handleSubmit}
            >
              {state.loading ? (
                <View>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              ) : (
                <Text style={[styles.titleChilds]}>Gửi yêu cầu</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    zIndex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  header1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBack: {
    height: 14,
    width: 14,
    resizeMode: 'contain',
    tintColor: '#000',
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 36,
  },
  wrapper: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  description: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#1180C3',
    textAlign: 'center',
  },
  titleChild: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: '#010101',
  },
  titleChilds: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
  },
  viewInput: {
    width: deviceWidth - 32,
    height: 42,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  txtInput: {
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'center',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginHorizontal: 8,
    color: '#010101',
    flex: 1,
  },
});

export default Assistant;
