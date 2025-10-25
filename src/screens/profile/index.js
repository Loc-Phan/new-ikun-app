import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  ScrollView,
  BackHandler,
  TouchableOpacity,
  Alert,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { Images } from '../../assets';
import IconF from 'react-native-vector-icons/Feather';
import IconI from 'react-native-vector-icons/Ionicons';

import { NewClient, setToken } from '../../api';
import { deleteFCMToken } from '../../common';
import { connect } from 'react-redux';
import styles from './styles';
import {
  saveUserToken,
  setUser,
  setRecentSearch,
  setOverview,
} from '../../actions/user';
import { showLoading } from '../../actions/common';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.backHandler = null;
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

  onLogout = () => {
    const { t } = this.props;
    Alert.alert(
      t('logout'),
      t('alert.logoutTxt'),
      [
        {
          text: t('alert.cancel'),
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: t('alert.ok'),
          onPress: async () => {
            const { dispatch, navigation } = this.props;

            await dispatch(showLoading(true));
            await deleteFCMToken();
            await dispatch(showLoading(false));

            navigation.navigate('LoginScreen');
            dispatch(setUser(null));
            dispatch(saveUserToken(null));
            dispatch(setRecentSearch([]));
            dispatch(setOverview(null));
            setToken(null);
          },
        },
      ],
      { cancelable: false },
    );
  };

  onDelete = () => {
    const { t } = this.props;
    Alert.alert(
      '',
      'Bạn có chắc chắn muốn xoá tài khoản Ikun',
      [
        {
          text: t('alert.cancel'),
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: t('alert.ok'),
          onPress: async () => {
            const { dispatch, navigation } = this.props;
            if (this.props.user?.info?.user_id) {
              const response = await NewClient.deleteAccount({
                user_id: this.props.user,
              });
              console.log('response', response);
              if (response?.success) {
                await dispatch(showLoading(true));
                await deleteFCMToken();
                await dispatch(showLoading(false));

                navigation.navigate('LoginScreen');
                dispatch(setUser(null));
                dispatch(saveUserToken(null));
                dispatch(setRecentSearch([]));
                dispatch(setOverview(null));
                setToken(null);
              }
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  render() {
    const { t, navigation, user } = this.props;
    return (
      <View style={styles.container}>
        {/* <Image source={Images.bannerMyCourse} style={styles.imgBanner} /> */}

        <View style={styles.header}>
          <View style={styles.header1}>
            <TouchableOpacity
              onPress={this.goBack}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Image source={Images.iconBack} style={styles.iconBack} />
            </TouchableOpacity>
            <Text style={styles.title}>{t('profile.title')}</Text>
            <View
              style={{
                width: 40,
                height: 40,
              }}
            />
          </View>
        </View>
        {user?.token ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={{ flexDirection: 'row' }}>
              <Image
                source={{
                  uri:
                    user?.info?.avatar ||
                    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMjCj43UJiVu-3Qp9b5yj-SwLGR-kndCzqLaiMv5SMkITd4CcbQQ7vX_CEZd-xxqka8ZM&usqp=CAU',
                }}
                style={styles.avatar}
              />
              <View style={{ marginLeft: 15, flex: 1 }}>
                <Text style={styles.fullName}>{user?.info?.full_name}</Text>
                {user?.info?.description !== '' && (
                  <Text style={styles.txtContent}>
                    {user?.info?.bio || 'Tiểu sử'}
                  </Text>
                )}
                {user?.info?.email && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <IconF name="mail" size={18} color="#F8C719" />
                    <Text style={styles.txtPhone}>{user?.info?.email}</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.border} />
            <View style={{ alignSelf: 'center' }}>
              <View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('SettingsScreen')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 15,
                  }}
                >
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 12,
                      backgroundColor: '#1180C3',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconF name="settings" size={20} color="#fff" />
                  </View>
                  <Text style={styles.txt1}>{t('settings.title')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('YourOrderScreen')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 15,
                  }}
                >
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 12,
                      backgroundColor: '#25C2E8',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconF name="shopping-bag" size={20} color="#fff" />
                  </View>
                  <Text style={styles.txt1}>{t('myOrders.title')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 15,
                  }}
                  onPress={this.onLogout}
                >
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 12,
                      backgroundColor: '#F19D3A',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconF name="log-out" size={20} color="#fff" />
                  </View>
                  <Text style={[styles.txt1]}>{t('logout')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 15,
                  }}
                  onPress={this.onDelete}
                >
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 12,
                      backgroundColor: '#C5C5C5',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconI
                      name="person-remove-outline"
                      size={20}
                      color="#fff"
                    />
                  </View>
                  <Text style={[styles.txt1]}>Xoá tài khoản</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
                onPress={() => navigation.navigate('YourCoursesScreen')}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    backgroundColor: '#3DBCF3',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconF name="book" size={20} color="#fff" />
                </View>
                <Text style={styles.txt1}>Your Courses</Text>
              </TouchableOpacity> */}
              </View>
              <View style={[styles.border, { marginBottom: 30 }]} />
            </View>
          </ScrollView>
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 16,
                marginBottom: 20,
                color: '#444',
              }}
            >
              {t('needLogin')}
            </Text>
            <TouchableOpacity
              style={{
                marginTop: 10,
                border: 1,
                backgroundColor: '#000',
                paddingVertical: 10,
                paddingHorizontal: 30,
                borderRadius: 5,
              }}
              onPress={() => navigation.navigate('LoginScreen')}
            >
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 14,
                  color: '#fff',
                }}
              >
                {t('login')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <Text
          style={{
            fontSize: 10,
            position: 'absolute',
            bottom: 100,
            textAlign: 'center',
            left: 0,
            right: 0,
            color: '#666',
          }}
        >
          Version: {DeviceInfo.getVersion()} - Build:{' '}
          {DeviceInfo.getBuildNumber()}
        </Text>
      </View>
    );
  }
}

const mapStateToProps = ({ user }) => ({
  user,
});
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
