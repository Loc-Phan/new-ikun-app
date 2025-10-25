import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  BackHandler,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Images } from '../../assets';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import styles from './styles';
import { NewClient } from '../../api';
import { ValidateEmail } from '../../common';

class Assistant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textSearch: '',
      name: props?.user?.info?.full_name || '',
      contact: '',
      subject: '',
      note: '',
      email: props?.user?.info?.email || '',
      loading: false,
      id: null,
      type: '',
    };

    this.backHandler = null;
  }

  async componentDidMount() {
    const { route } = this.props;
    const id = route.params?.id;
    const type = route.params?.type;
    const name = route.params?.name;
    this.setState({ id: id, type: type, subject: name });
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
  }

  componentWillUnmount() {
    if (this.backHandler) {
      this.backHandler.remove();
    }
  }

  handleBackPress = () => {
    const { navigation } = this.props;
    navigation.goBack(null);
    return true;
  };

  goBack = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  validate = () => {
    const { name, contact, email } = this.state;
    const { t, user } = this.props;
    if (!name) {
      Alert.alert(t('assistant.validateName'));
      return false;
    }
    if (!user?.info?.email) {
      if (!email) {
        Alert.alert('', t('registerScreen.emailEmpty'));
        return false;
      }
      if (!ValidateEmail(email)) {
        Alert.alert('', t('registerScreen.validEmail'));
        return false;
      }
    }
    if (!contact) {
      Alert.alert(t('assistant.validateContact'));
      return false;
    }
    return true;
  };

  handleSubmit = async () => {
    const { t, user, navigation } = this.props;
    const { name, contact, subject, note, email } = this.state;
    const emailInput = user?.info?.email || email;
    if (!this.validate()) return;
    const params = {
      name,
      phone: contact,
      subject,
      message: note,
      email: emailInput,
    };
    this.setState({ loading: true });
    const response = await NewClient.contactAssistant(params);
    if (response && response.success) {
      Alert.alert(t('assistant.submitSuccess'));
      if (this.state.type === 'ebook') {
        navigation.navigate('EbooksDetailsScreen', { id: this.state.id });
      } else if (this.state.type === 'course') {
        navigation.navigate('CoursesDetailsScreen', { id: this.state.id });
      }
      this.setState({ loading: false });
    } else {
      Alert.alert(t('assistant.submitFailed'));
      this.setState({ loading: false });
    }
  };

  render() {
    const { t, user } = this.props;
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
                onPress={this.goBack}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Image source={Images.iconBack} style={styles.iconBack} />
              </TouchableOpacity>
              {/* <Text style={styles.title}>{t('assistant.title')}</Text> */}
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
                <Text style={styles.titleChild}>{t('assistant.name')}</Text>
                <Text style={{ color: 'red' }}>{` *`}</Text>
              </View>
              <View style={styles.viewInput}>
                <TextInput
                  style={styles.txtInput}
                  numberOfLines={1}
                  value={this.state.name}
                  onChangeText={value => this.setState({ name: value })}
                />
              </View>
              {!user?.token ? (
                <View>
                  <View style={{ marginBottom: 14, flexDirection: 'row' }}>
                    <Text style={styles.titleChild}>Email</Text>
                    <Text style={{ color: 'red' }}>{` *`}</Text>
                  </View>
                  <View style={styles.viewInput}>
                    <TextInput
                      style={styles.txtInput}
                      numberOfLines={1}
                      value={this.state.email}
                      onChangeText={value => this.setState({ email: value })}
                    />
                  </View>
                </View>
              ) : null}
              <View style={{ marginBottom: 14, flexDirection: 'row' }}>
                <Text style={styles.titleChild}>{t('assistant.contact')}</Text>
                <Text style={{ color: 'red' }}>{` *`}</Text>
              </View>
              <View style={styles.viewInput}>
                <TextInput
                  style={styles.txtInput}
                  numberOfLines={1}
                  value={this.state.contact}
                  onChangeText={value => this.setState({ contact: value })}
                />
              </View>
              <View style={{ marginBottom: 14 }}>
                <Text style={styles.titleChild}>{t('assistant.subject')}</Text>
              </View>
              <View style={styles.viewInput}>
                <TextInput
                  style={styles.txtInput}
                  numberOfLines={1}
                  value={this.state.subject}
                  onChangeText={value => this.setState({ subject: value })}
                />
              </View>
              <View style={{ marginBottom: 14 }}>
                <Text style={styles.titleChild}>{t('assistant.note')}</Text>
              </View>
              <View>
                <TextInput
                  style={{
                    // marginTop: 8,
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
                  value={this.state.note}
                  onChangeText={value => this.setState({ note: value })}
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
                onPress={() => this.handleSubmit()}
              >
                {this.state.loading ? (
                  <View>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                ) : (
                  <Text style={[styles.titleChilds]}>
                    {t('assistant.txtSubmit')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    );
  }
}
const mapStateToProps = ({ user }) => ({
  user,
});
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(Assistant);
