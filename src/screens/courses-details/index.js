import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  BackHandler,
  TouchableOpacity,
  Alert,
  DeviceEventEmitter,
  Linking,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { Client } from '../../api';
import { NewClient } from '../../api';
import { Images } from '../../assets';
import IconI from 'react-native-vector-icons/Ionicons';
import IconF from 'react-native-vector-icons/Feather';
import IconM from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFO from 'react-native-vector-icons/Fontisto';
import { Rating } from 'react-native-ratings';
import Accordion from 'react-native-collapsible/Accordion';
import { connect } from 'react-redux';
import RenderDataHTML from '../../component/common/render-data-html';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as RNIap from 'react-native-iap';
import styles from './styles';
import { showLoading } from '../../actions/common';
import { saveCourse } from '../../actions/course';
import moment from 'moment';
import { currencyFormat, getIDfromURL } from '../../common';
import { WEB_URL } from '../../config';
import {
  pushProductTransactionIAP,
  saveProductTransactionIAP,
} from '../../actions/product-iap';
import { last } from 'lodash';

// PRODUCTS_IAP moved to src/config/index.js

class CoursesDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSections: [0],
      reviewMessage: '',
      isWishlist: false,
      purchase: false,
      titleRating: '',
      contentRating: '',
      starRating: 5,
      hiddenBottom: false,
      description: '',
      contentQuality: 5,
      instructorQuality: 5,
      purchaseQuality: 5,
      supportQuantity: 5,
      loadingReview: false,
      activeTab: 0,
      // view more https://appstoreconnect.apple.com/apps/6474820356/distribution/iaps
      productId: '',
      iosRNIapState: true,
    };
    this.id = null;

    this.eventListener = null;
    this.backHandler = null;
  }

  purchaseUpdateSubscription = null;
  purchaseErrorSubscription = null;

  async componentDidMount() {
    const { route } = this.props;
    const { tab } = route?.params || 0;
    if (tab) this.setState({ activeTab: tab });
    await this.getData();

    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
    this.eventListener = DeviceEventEmitter.addListener(
      'loadCourseDetail',
      this.refreshData,
    );

    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide,
    );
  }

  _keyboardDidShow = () => {
    this.setState({
      hiddenBottom: true,
    });
  };

  _keyboardDidHide = () => {
    this.setState({
      hiddenBottom: false,
    });
  };

  refreshData = async () => {
    this.setState({
      refreshing: true,
    });
    await this.getData();
    this.setState({ refreshing: false });
  };

  async getData() {
    const { route, dispatch, productIAP, user } = this.props;
    const { transaction } = productIAP;
    try {
      await dispatch(showLoading(true));

      this.id = route.params?.id;

      const response = await NewClient.courseDetails(this.id);
      const responseContent = await NewClient.contentCourseDetails(this.id);
      const purchase = await NewClient.myCourse();

      this.setState({
        productId: last(response?.data?.link?.split('/') || []),
      });
      if (purchase && purchase?.data?.webinars) {
        const res = purchase?.data?.webinars?.find(item => item.id === this.id);
        if (res) {
          this.setState({ purchase: true });
        } else {
          if (Platform.OS === 'ios') {
            if (transaction[user.info.email]?.includes(this.state.productId)) {
              await this.handleUpdatePurchaseBackend();
            } else {
              RNIap.initConnection()
                .then(async () => {
                  console.log('connection react-native-iap');
                })
                .catch(error => {
                  console.log(
                    error.message || 'Error when connection react-native-iap',
                  );
                });
              // clear transactionIos to show purchase by username
              await RNIap.clearTransactionIOS();
              // get list products for function RNIap.requestPurchase
              await RNIap.getProducts({
                skus: [this.state.productId],
              })
                .then(res => {
                  if (!res?.length) this.setState({ iosRNIapState: false });
                })
                .catch(() => {
                  this.setState({ iosRNIapState: false });
                });
            }
          }
        }
      }
      if (response?.data && responseContent?.data) {
        const newData = responseContent?.data?.map(itemContent => {
          for (const item of response?.data?.files_chapters) {
            if (itemContent?.id === item?.id) {
              const check = itemContent?.items?.filter(ite => {
                for (const i of item?.files) {
                  if (ite?.id === i?.id) {
                    return ite;
                  }
                }
              });
              return { ...itemContent, items: check };
            }
          }
        });
        dispatch(saveCourse({ ...response.data, content: newData }));
      }
      await dispatch(showLoading(false));

      // dispatch(setOverview(this.id));
    } catch (e) {
      dispatch(showLoading(false));
      console.log(e.message || 'Error when get product data');
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;

    dispatch(saveCourse(null));

    RNIap.endConnection().then(() => {
      console.log('end connection react-native-iap');
    });

    if (this.backHandler) {
      this.backHandler.remove();
    }

    if (this.eventListener) {
      this.eventListener.remove();
    }

    if (this.keyboardDidShowListener) {
      this.keyboardDidShowListener.remove();
    }

    if (this.keyboardDidHideListener) {
      this.keyboardDidHideListener.remove();
    }

    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }
  }

  handleBackPress = () => {
    const { navigation } = this.props;
    // DeviceEventEmitter.emit('refresh_overview');
    navigation.goBack(null);
    return true;
  };

  goBack = () => {
    const { navigation } = this.props;
    // DeviceEventEmitter.emit('refresh_overview');
    navigation.goBack();
  };

  onNavigateLearning = (item, index) => {
    const { navigation } = this.props;

    navigation.navigate('LearningScreen', {
      id: item.id,
      idCourse: this.id,
    });
  };

  handleLeaveReview = async () => {
    const { t } = this.props;
    const {
      description,
      contentQuality,
      instructorQuality,
      purchaseQuality,
      supportQuantity,
    } = this.state;
    if (!this.state.description) {
      Alert.alert(t('ebook.descriptionValidate'));
      return;
    }
    const params = {
      id: this.id,
      item: 'webinar',
      content_quality: contentQuality,
      purchase_worth: purchaseQuality,
      instructor_skills: instructorQuality,
      support_quality: supportQuantity,
      description,
    };
    this.setState({ loadingReview: true });
    const response = await NewClient.leaveCourseReview(params);
    if (response.success === true) {
      Alert.alert(t('ebook.leaveSuccess'));
      this.setState({ description: '' });
    } else {
      Alert.alert(response?.message || t('ebook.leaveFailed'));
    }
    this.setState({ loadingReview: false });
  };

  renderItemFilter = ({ item }) => {
    return (
      <TouchableOpacity
        style={{
          height: 30,
          paddingHorizontal: 19,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          borderRadius: 60,
          borderWidth: 1,
          borderColor: '#EBEBEB',
          marginRight: 10,
        }}
      >
        <Text style={styles.txtItemFilter}>{item.Name}</Text>
      </TouchableOpacity>
    );
  };

  renderItemRating = () => {
    const { course } = this.props;
    const data = course?.data;

    if (!data?.reviews || data?.reviews?.length === 0) {
      return null;
    }
    const reviews = Object.values(data?.reviews);

    return (
      <View style={{ marginTop: 16 }}>
        {reviews?.map((item, i) => (
          <View style={styles.reviewWrapper} key={item.id}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 32,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '50%',
                }}
              >
                <Image
                  source={{
                    uri:
                      item?.user?.avatar ||
                      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMjCj43UJiVu-3Qp9b5yj-SwLGR-kndCzqLaiMv5SMkITd4CcbQQ7vX_CEZd-xxqka8ZM&usqp=CAU',
                  }}
                  style={styles.avatar}
                />
                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    marginLeft: 8,
                    gap: 4,
                  }}
                >
                  <Text>{item?.user?.full_name}</Text>
                  <Text>
                    {moment(item.created_at * 1000).format('HH:mm DD/MM/YYYY')}
                  </Text>
                  <Rating
                    ratingCount={5}
                    imageSize={16}
                    readonly
                    // tintColor="#ebf7ff"
                    ratingColor="#ffc600"
                    startingValue={Number(item.rate)}
                  />
                </View>
              </View>
            </View>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        ))}
      </View>
    );
  };

  renderHeaderSession = (section, index, isActive) => {
    return (
      <View key={String(index)}>
        <View
          style={[styles.subSectionTitle, { marginTop: 8, marginBottom: 11 }]}
        >
          <View style={styles.subSectionTitle}>
            <IconI name={isActive ? 'caret-up' : 'caret-down'} size={15} />
            <Text numberOfLines={1} style={styles.txtSubSection}>
              {section?.title}
            </Text>
          </View>
          <Text style={styles.txtLength}>{section?.items?.length}</Text>
        </View>
      </View>
    );
  };

  renderContent = (section, index) => {
    const { purchase } = this.state;
    const { items } = section;
    const getAccessibility = item => {
      if (item?.accessibility === 'free') return false;
      if (purchase) return false;
      return true;
    };
    return (
      <View>
        {items?.map((item, i) => {
          if (item?.type === 'text_lesson' || item?.type === 'file')
            return (
              <TouchableOpacity
                key={String(i)}
                onPress={() => this.onNavigateLearning(item, index)}
                style={[
                  styles.subSectionTitle,
                  {
                    marginBottom: 8,
                    paddingBottom: 8,
                    // marginLeft: 24,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f0f2f5',
                  },
                ]}
                disabled={getAccessibility(item)}
              >
                <View style={styles.subSectionTitle}>
                  {item?.thumbnail ? (
                    <FastImage
                      style={styles.imageThumbnail}
                      source={{
                        uri: `${WEB_URL}${item?.thumbnail}`,
                      }}
                    />
                  ) : (
                    <View style={styles.noImageThumbnail} />
                  )}
                  <Text numberOfLines={1} style={styles.txtItemLession}>
                    {item?.title}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {getAccessibility(item) ? (
                    <IconFO name="locked" style={styles.iconPreview} />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          return null;
        })}
      </View>
    );
  };

  onStart = async () => {
    const { course } = this.props;
    const data = course?.data;

    if (data.sections?.length > 0 && data.sections[0].items.length > 0) {
      let itemRedirect = null;

      data.sections.forEach(section => {
        if (!itemRedirect) {
          itemRedirect = section.items.find(
            item => item.status !== 'completed',
          );
        }
      });

      this.onNavigateLearning(itemRedirect || data.sections[0].items[0], 0);
    }
  };

  onEnroll = async () => {
    const { dispatch, user } = this.props;

    if (!user?.token) {
      return this.notLoggedIn();
    }

    dispatch(showLoading());
    const param = {
      id: this.id,
    };

    const response = await Client.enroll(param);
    dispatch(showLoading(false));
    if (response.status === 'success') {
      // Alert.alert('Enroll success');
      DeviceEventEmitter.emit('loadMyCourse');
      this.getData();
      this.onStart();
    } else {
      Alert.alert('', response.message);
    }
  };

  notLoggedIn = () => {
    const { t, navigation } = this.props;

    return Alert.alert(t('alert.notLoggedIn'), t('alert.loggedIn'), [
      {
        text: t('alert.cancel'),
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: t('alert.btnLogin'),
        onPress: () =>
          navigation.navigate('LoginScreen', {
            screen: 'CoursesDetailsScreen',
            id: this.id,
          }),
      },
    ]);
  };

  handleUpdatePurchaseBackend = async () => {
    const { dispatch, productIAP, user } = this.props;
    const { transaction } = productIAP;
    //change state purchase to true;
    this.setState({ purchase: true });

    // call api backend
    await NewClient.iOSBuyCourse({
      webinar_id: this.id,
    })
      .then(async res => {
        await dispatch(
          saveProductTransactionIAP({
            username: user.info?.email, //change to username
            productIds: (transaction[user.info?.email || ''] || []).filter(
              f => f !== this.state.productId,
            ),
          }),
        );
      })
      .catch(async () => {
        //when save failed transaction to redux and update when open this screen again
        await dispatch(
          pushProductTransactionIAP({
            username: user.info?.email, //change to username
            productId: this.state.productId,
          }),
        );
      });
    // call api backend
  };

  handleContact = async id => {
    const { navigation, course, t, dispatch, user } = this.props;
    if (!user.info) {
      this.notLoggedIn();
      return;
    }
    const data = course?.data;
    const { productId } = this.state;
    if (Platform.OS === 'android') {
      navigation.navigate('AssistantScreen', {
        id: id,
        name: data?.title,
        type: 'course',
      });
    } else {
      try {
        await dispatch(showLoading(true));
        RNIap.requestPurchase({
          sku: productId,
        })
          .then(async res => {
            // call api to backend update purchase todo
            await this.handleUpdatePurchaseBackend();
            // call api to backend update purchase todo
          })
          .catch(err => {
            console.log(err);
          })
          .finally(async () => {
            await dispatch(showLoading(false));
          });
      } catch (error) {
        Alert.alert(t('notification.title'), t('notification.error'));
        await dispatch(showLoading(false));
      }
    }
  };

  submitRating = async () => {
    const { t, dispatch } = this.props;
    const { titleRating, contentRating, starRating } = this.state;
    if (titleRating.trim() === '') {
      Alert.alert(t('singleCourse.review'), t('singleCourse.reviewTitleEmpty'));
      return;
    }
    if (contentRating.trim() === '') {
      Alert.alert(
        t('singleCourse.review'),
        t('singleCourse.reviewContentEmpty'),
      );
      return;
    }
    const param = {
      id: this.id,
      title: titleRating,
      rate: starRating,
      content: contentRating,
    };
    dispatch(showLoading(true));
    const response = await Client.createReview(param);
    dispatch(showLoading(false));
    if (response.status === 'success') {
      this.getRating();
      Alert.alert(response.message);
    } else {
      Alert.alert(response.message);
    }
  };

  render() {
    const { course, user, t } = this.props;
    const data = course?.data;
    const {
      refreshing,
      activeSections,
      hiddenBottom,
      purchase,
      activeTab,
      iosRNIapState,
    } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.header1}>
            <TouchableOpacity
              onPress={this.goBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Image source={Images.iconBack} style={styles.iconBack} />
            </TouchableOpacity>
            <Text style={styles.title}>{t('singleCourse.title')}</Text>
            <View style={styles.iconBack} />
          </View>
        </View>

        <KeyboardAwareScrollView
          removeClippedSubviews={false}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this.refreshData}
            />
          }
        >
          <FastImage
            style={styles.imageBanner}
            source={{
              uri: data?.image,
            }}
          />
          <View style={styles.content2}>
            <View style={styles.infoWrapper}>
              <Text style={styles.infoCate}>{data?.category}</Text>
              <Text style={styles.infoTitle}>{data?.title}</Text>
              <View
                style={{
                  marginTop: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image source={Images.iconClock} style={styles.icon} />
                  <Text style={styles.txt3}>
                    {data?.access_days
                      ? `${data?.access_days} ngày`
                      : 'Không giới hạn'}
                  </Text>
                </View>
                {data &&
                  data?.students_count !== '' &&
                  data?.students_count > 0 && (
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Image source={Images.iconStudent} style={styles.icon1} />
                      <Text style={styles.txt3}>
                        Số học viên: {data?.students_count}
                      </Text>
                    </View>
                  )}
              </View>
              <View
                style={{
                  marginTop: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {data?.best_ticket_price ? (
                    <Text
                      style={[
                        styles.price,
                        { paddingLeft: 2, paddingRight: 8 },
                      ]}
                    >
                      {currencyFormat(data?.best_ticket_price)}
                    </Text>
                  ) : (
                    <Text style={[styles.price, { paddingRight: 12 }]}>
                      Miễn phí
                    </Text>
                  )}
                  {data?.price !== data?.best_ticket_price ? (
                    <Text
                      style={[
                        styles.salePrice,
                        {
                          textDecorationLine: 'line-through',
                          color: '#314753',
                        },
                      ]}
                    >
                      {currencyFormat(data?.price)}
                    </Text>
                  ) : null}
                </View>
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  {data?.discount_percent && data?.discount_percent !== 0 ? (
                    <Text
                      style={styles.discount}
                    >{`Giảm ${data?.discount_percent}% so với giá gốc`}</Text>
                  ) : null}
                </View>
              </View>
            </View>
            <View style={{ marginTop: 32, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity
                  style={activeTab === 0 && styles.activeTab}
                  onPress={() => this.setState({ activeTab: 0 })}
                >
                  <Text style={[styles.tab]}>Mô tả</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={activeTab === 1 && styles.activeTab}
                  onPress={() => this.setState({ activeTab: 1 })}
                >
                  <Text style={[styles.tab]}>Nội dung</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={activeTab === 2 && styles.activeTab}
                  onPress={() => this.setState({ activeTab: 2 })}
                >
                  <Text style={[styles.tab]}>Đánh giá</Text>
                </TouchableOpacity>
              </View>
            </View>
            {activeTab === 0 && (
              <View>
                {data?.description ? (
                  <RenderDataHTML html={data?.description} />
                ) : null}
                {data?.video_demo && data?.video_demo_source === 'youtube' && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={[styles.txtTitle, { marginBottom: 8 }]}>
                      Demo khóa học
                    </Text>
                    <RenderDataHTML
                      html={`
                        <iframe
                          width="560"
                          height="315"
                          src="https://www.youtube.com/embed/${getIDfromURL(
                            data?.video_demo,
                          )}"
                          title="YouTube video player"
                          frameborder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowfullscreen
                        />
                      `}
                    />
                  </View>
                )}
              </View>
            )}
            {activeTab === 1 && (
              <View>
                {data?.content && data?.content?.length > 0 ? (
                  <Accordion
                    sections={data?.content}
                    underlayColor="transpation"
                    activeSections={activeSections}
                    renderHeader={this.renderHeaderSession}
                    renderContent={this.renderContent}
                    onChange={value => {
                      this.setState({ activeSections: value });
                    }}
                  />
                ) : (
                  <Text style={{ fontFamily: 'Inter-Regular' }}>
                    {t('singleCourse.curriculumEmpty')}
                  </Text>
                )}
              </View>
            )}

            {activeTab === 2 && (
              <View>
                {data?.reviews && (
                  <View>
                    <View style={styles.viewReview}>
                      <Text style={styles.txtRating}>
                        {Number(data?.rate).toFixed(1)}
                      </Text>
                      <Rating
                        ratingCount={5}
                        imageSize={15}
                        readonly
                        ratingColor="#FBC815"
                        startingValue={Number(data?.rate).toFixed(1)}
                      />
                      <Text style={[styles.txtOverview, { marginTop: 5 }]}>
                        {t('singleCourse.rating', {
                          total: data?.reviews?.length,
                        })}
                      </Text>
                      {/* <Text
                      style={[
                        styles.txtOverview,
                        {marginTop: 10, textAlign: 'center'},
                      ]}>
                      {reviewMessage}
                    </Text> */}
                    </View>
                    {this.renderItemRating()}
                  </View>
                )}
                {user?.token && (
                  <View>
                    <View
                      style={{
                        marginTop: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Text style={styles.reviewTitle}>Đánh giá</Text>
                      <View
                        style={{
                          width: '100%',
                          height: 2,
                          backgroundColor: '#f1f1f1',
                        }}
                      />
                    </View>
                    <TextInput
                      style={{
                        marginTop: 8,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: '#F3F3F3',
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        minHeight: 80,
                        fontFamily: 'Inter-Regular',
                        color: '#000',
                      }}
                      multiline
                      numberOfLines={5}
                      textAlignVertical="top"
                      placeholder="Nhập mô tả"
                      value={this.state.description}
                      onChangeText={value =>
                        this.setState({ description: value })
                      }
                    />
                    <View
                      style={{
                        marginTop: 8,
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                      }}
                    >
                      <View>
                        <View
                          style={{ paddingHorizontal: 16, marginBottom: 8 }}
                        >
                          <Text style={styles.quality}>Nội dung</Text>
                          <Rating
                            ratingCount={5}
                            imageSize={20}
                            jumpValue={0}
                            startingValue={5}
                            ratingColor="#FBC815"
                            onFinishRating={value =>
                              this.setState({ contentQuality: value })
                            }
                          />
                        </View>
                        <View style={{ paddingHorizontal: 16 }}>
                          <Text style={styles.quality}>Giáo viên</Text>
                          <Rating
                            ratingCount={5}
                            imageSize={20}
                            jumpValue={0}
                            startingValue={5}
                            ratingColor="#FBC815"
                            onFinishRating={value =>
                              this.setState({ instructorQuality: value })
                            }
                          />
                        </View>
                      </View>
                      <View
                        style={{
                          width: 1,
                          height: '100%',
                          backgroundColor: '#ececec',
                        }}
                      />
                      <View>
                        <View
                          style={{ paddingHorizontal: 16, marginBottom: 8 }}
                        >
                          <Text style={styles.quality}>Giá trị</Text>
                          <Rating
                            ratingCount={5}
                            imageSize={20}
                            jumpValue={0}
                            startingValue={5}
                            ratingColor="#FBC815"
                            onFinishRating={value =>
                              this.setState({ purchaseQuality: value })
                            }
                          />
                        </View>
                        <View style={{ paddingHorizontal: 16 }}>
                          <Text style={styles.quality}>Hỗ trợ</Text>
                          <Rating
                            ratingCount={5}
                            imageSize={20}
                            jumpValue={0}
                            startingValue={5}
                            ratingColor="#FBC815"
                            onFinishRating={value =>
                              this.setState({ supportQuantity: value })
                            }
                          />
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.btnReview}
                      onPress={() => this.handleLeaveReview()}
                    >
                      {this.loadingReview ? (
                        <View>
                          <ActivityIndicator size="small" color="#fff" />
                        </View>
                      ) : (
                        <Text style={styles.txtReview}>
                          {t('ebook.leaveReview')}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </KeyboardAwareScrollView>
        {!hiddenBottom ? (
          <View>
            {!iosRNIapState && data?.price ? (
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 20,
                  textAlign: 'center',
                  color: '#25C2E8',
                  fontWeight: 'bold',
                }}
              >
                Khoá học sắp xuất bản
              </Text>
            ) : (
              !purchase &&
              data?.price && (
                <View style={styles.bottom}>
                  <View
                    style={{
                      flexDirection: 'column',
                      gap: 8,
                      width: '50%',
                    }}
                  >
                    {!data?.price ? (
                      <Text style={[styles.priceBottom, { paddingRight: 12 }]}>
                        Miễn phí
                      </Text>
                    ) : (
                      <Text style={[styles.priceBottom]}>
                        {currencyFormat(data?.best_ticket_price)}
                      </Text>
                    )}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      {data?.price !== data?.best_ticket_price ? (
                        <Text
                          style={[
                            styles.priceBottom,
                            {
                              textDecorationLine: 'line-through',
                              fontSize: 17,
                            },
                          ]}
                        >
                          {currencyFormat(data?.price)}
                        </Text>
                      ) : null}
                      {data?.discount_percent &&
                      data?.discount_percent !== 0 ? (
                        <Text style={[styles.discount]}>
                          {data?.discount_percent}%
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.btnAddToCart}
                    onPress={() => this.handleContact(String(data?.id))}
                  >
                    <Text style={styles.txtAddToCart}>
                      {Platform.OS === 'android'
                        ? 'Liên hệ ngay'
                        : 'Mua khoá học'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>
        ) : null}
      </View>
    );
  }
}
const mapStateToProps = ({ course, wishlist, user, productIAP }) => ({
  course,
  user,
  productIAP,
});
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(CoursesDetails);
