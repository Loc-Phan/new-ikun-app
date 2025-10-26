import { Images } from '@/assets';
import RenderDataHTML from '@/components/RenderDataHTML';
import { WEB_URL } from '@/constants';
import Services from '@/services';
import { currencyFormat, getIDfromURL } from '@/utils';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { last } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  DeviceEventEmitter,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import * as RNIap from 'react-native-iap';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Rating } from 'react-native-ratings';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const deviceWidth = Dimensions.get('window').width;

const CourseDetails = () => {
  const navigation = useNavigation<any>();
  const { id, tab } = useLocalSearchParams<{ id?: string; tab?: string }>();

  // Redux selectors
  const user = useSelector((state: RootState) => state.auth?.user);

  const productIAP = useSelector((state: RootState) => state.productIAP);

  // State management - separated for better control
  const [course, setCourse] = useState<any>(null);

  // UI States
  const [activeSections, setActiveSections] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [hiddenBottom, setHiddenBottom] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Purchase & Product States
  const [purchase, setPurchase] = useState(false);
  const [productId, setProductId] = useState('');
  const [iosRNIapState, setIosRNIapState] = useState(true);

  // Review States
  const [description, setDescription] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);
  const [contentQuality, setContentQuality] = useState(5);
  const [instructorQuality, setInstructorQuality] = useState(5);
  const [purchaseQuality, setPurchaseQuality] = useState(5);
  const [supportQuantity, setSupportQuantity] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  // Legacy states - removed unused ones

  // Back handler
  const handleBackPress = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Keyboard handlers
  const keyboardDidShow = useCallback(() => {
    setHiddenBottom(true);
  }, []);

  const keyboardDidHide = useCallback(() => {
    setHiddenBottom(false);
  }, []);

  const handleUpdatePurchaseBackend = useCallback(async () => {
    const { transaction } = productIAP;
    //change state purchase to true;
    setPurchase(true);

    // call api backend
    await Services.iOSBuyCourse({
      webinar_id: id,
    })
      .then(async res => {
        // await dispatch(
        //   saveProductTransactionIAP({
        //     username: user.info?.email, //change to username
        //     productIds: (transaction[user.info?.email || ''] || []).filter(
        //       f => f !== productId,
        //     ),
        //   }),
        // );
      })
      .catch(async () => {
        //when save failed transaction to redux and update when open this screen again
        // await dispatch(
        //   pushProductTransactionIAP({
        //     username: user.info?.email, //change to username
        //     productId: productId,
        //   }),
        // );
      });
    // call api backend
  }, [id, productIAP, productId]);

  // Tách logic xử lý purchase để tái sử dụng
  const handlePurchaseLogic = useCallback(
    async (transaction: any) => {
      if (Platform.OS === 'ios') {
        if (transaction[user?.info?.email]?.includes(productId)) {
          await handleUpdatePurchaseBackend();
        } else {
          try {
            await RNIap.initConnection();
            console.log('connection react-native-iap');

            // clear transactionIos to show purchase by username
            await RNIap.clearTransactionIOS();

            // get list products for function RNIap.requestPurchase
            const products = await RNIap.fetchProducts({ skus: [productId] });
            if (!products?.length) {
              setIosRNIapState(false);
            }
          } catch (error: any) {
            console.log(
              error.message || 'Error when connection react-native-iap',
            );
            setIosRNIapState(false);
          }
        }
      }
    },
    [user?.info?.email, productId, handleUpdatePurchaseBackend],
  );

  // Data fetching
  const getData = useCallback(async () => {
    const { transaction } = productIAP;
    setIsLoading(true);

    // Gọi từng API riêng biệt để tránh lỗi 401 làm dừng toàn bộ
    let response = null;
    let responseContent = null;
    let purchase = null;

    // API 1: Course Details
    try {
      response = (await Services.courseDetails(id)).data;
      console.log('✅ Course details loaded successfully');
    } catch (error: any) {
      console.log('❌ Course details failed:', error.message);
    }

    // API 2: Course Content
    try {
      responseContent = (await Services.contentCourseDetails(id)).data;
      console.log('✅ Course content loaded successfully');
    } catch (error: any) {
      console.log('❌ Course content failed:', error.message);
    }

    // API 3: My Course (có thể bị 401 nếu chưa login)
    try {
      purchase = (await Services.myCourse()).data;
      console.log('✅ My course loaded successfully');
    } catch (error: any) {
      console.log('❌ My course failed (có thể do chưa login):', error.message);
      // Không set purchase = null vì đã khởi tạo ở trên
    }

    // Xử lý dữ liệu nếu có
    if (response?.data) {
      setProductId(last(response?.data?.link?.split('/') || []));
    }

    // Xử lý purchase status
    if (purchase && purchase?.data?.webinars) {
      const res = purchase?.data?.webinars?.find(item => item.id === id);
      if (res) {
        setPurchase(true);
      } else {
        await handlePurchaseLogic(transaction);
      }
    } else {
      // Nếu không lấy được purchase data, vẫn xử lý iOS logic
      await handlePurchaseLogic(transaction);
    }

    // Merge course data và content
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

      setCourse({ ...response.data, content: newData });
    } else if (response?.data) {
      // Nếu chỉ có course details, vẫn set course
      setCourse(response.data);
    }

    setIsLoading(false);
  }, [id, productIAP, handlePurchaseLogic]);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await getData();
    setRefreshing(false);
  }, [getData]);

  // Effects
  useEffect(() => {
    const tab = tab ? parseInt(tab) : 0;
    if (tab) setActiveTab(tab);
    getData();
  }, [getData]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    const eventListener = DeviceEventEmitter.addListener(
      'loadCourseDetail',
      refreshData,
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
      eventListener.remove();
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [handleBackPress, refreshData, keyboardDidShow, keyboardDidHide]);

  // Navigation methods
  const onNavigateLearning = useCallback(
    (item: any, index: number) => {
      navigation.navigate('LearningScreen', {
        id: item.id,
        idCourse: id,
      });
    },
    [navigation, id],
  );

  // Contact/Purchase handler
  const handleContact = useCallback(
    async (courseId: string) => {
      if (!user?.token) {
        return notLoggedIn();
      }

      if (Platform.OS === 'android') {
        navigation.navigate('assistant', {
          id: courseId,
          name: course?.title,
          type: 'course',
        });
      } else {
        // iOS purchase logic would go here
        Alert.alert(
          'Tính năng mua khóa học',
          'Chức năng này đang được phát triển',
        );
      }
    },
    [user, course, navigation],
  );

  // Login prompt
  const notLoggedIn = useCallback(() => {
    return Alert.alert('Chưa đăng nhập', 'Bạn cần đăng nhập để tiếp tục', [
      {
        text: 'Hủy',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Đăng nhập',
        onPress: () =>
          navigation.navigate('auth/login', {
            screen: 'CourseDetailsScreen',
            id: id,
          }),
      },
    ]);
  }, [navigation, id]);

  // Review submission
  const handleLeaveReview = useCallback(async () => {
    if (!description) {
      Alert.alert('Vui lòng nhập mô tả đánh giá');
      return;
    }

    const params = {
      id: id,
      item: 'webinar',
      content_quality: contentQuality,
      purchase_worth: purchaseQuality,
      instructor_skills: instructorQuality,
      support_quality: supportQuantity,
      description: description,
    };

    setLoadingReview(true);

    try {
      const response = await Services.leaveCourseReview(params);
      if (response?.data) {
        Alert.alert('Đánh giá thành công!');
        setDescription('');
      } else {
        Alert.alert('Đánh giá thất bại');
      }
    } catch (error) {
      Alert.alert('Đánh giá thất bại');
    } finally {
      setLoadingReview(false);
    }
  }, [
    description,
    id,
    contentQuality,
    purchaseQuality,
    instructorQuality,
    supportQuantity,
  ]);

  // Render methods
  const renderItemRating = useCallback(() => {
    if (!course?.reviews || course.reviews.length === 0) {
      return null;
    }

    const reviews = Object.values(course.reviews);

    return (
      <View style={{ marginTop: 16 }}>
        {reviews?.map((item: any) => (
          <View key={item.id} style={styles.reviewWrapper}>
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
  }, [course]);

  const renderContent = (section, index) => {
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
                onPress={() => onNavigateLearning(item, index)}
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
                    <Image
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
                    <Fontisto name="locked" size={16} color="#444" />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          return null;
        })}
      </View>
    );
  };

  const renderHeaderSession = (section, index, isActive) => {
    return (
      <View key={String(index)}>
        <View
          style={[styles.subSectionTitle, { marginTop: 8, marginBottom: 11 }]}
        >
          <View style={styles.subSectionTitle}>
            <FontAwesome
              name={isActive ? 'caret-up' : 'caret-down'}
              size={15}
            />
            <Text numberOfLines={1} style={styles.txtSubSection}>
              {section?.title}
            </Text>
          </View>
          <Text style={styles.txtLength}>{section?.items?.length}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.header1}>
          <TouchableOpacity
            onPress={goBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image source={Images.iconBack} style={styles.iconBack} />
          </TouchableOpacity>
          <Text style={styles.title}>Chi tiết khóa học</Text>
          <View style={styles.iconBack} />
        </View>
      </View>

      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
      >
        {course?.image && (
          <Image style={styles.imageBanner} source={{ uri: course.image }} />
        )}

        {isLoading ? (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator size="small" />
          </View>
        ) : (
          <View style={styles.content2}>
            <View style={styles.infoWrapper}>
              <Text style={styles.infoCate}>{course?.category}</Text>
              <Text style={styles.infoTitle}>{course?.title}</Text>

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
                    {course?.access_days
                      ? `${course.access_days} ngày`
                      : 'Không giới hạn'}
                  </Text>
                </View>
                {course?.students_count > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.txt3}>
                      Số học viên: {course.students_count}
                    </Text>
                  </View>
                )}
              </View>

              <View style={{ marginTop: 16 }}>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                >
                  {course?.best_ticket_price ? (
                    <Text
                      style={[
                        styles.price,
                        { paddingLeft: 2, paddingRight: 8 },
                      ]}
                    >
                      {currencyFormat(course.best_ticket_price)}
                    </Text>
                  ) : (
                    <Text style={[styles.price, { paddingRight: 12 }]}>
                      Miễn phí
                    </Text>
                  )}
                  {course?.price !== course?.best_ticket_price && (
                    <Text
                      style={[
                        styles.salePrice,
                        {
                          textDecorationLine: 'line-through',
                          color: '#314753',
                        },
                      ]}
                    >
                      {currencyFormat(course.price)}
                    </Text>
                  )}
                </View>
                {course?.discount_percent && course.discount_percent !== 0 && (
                  <View style={{ flexDirection: 'row', marginTop: 8 }}>
                    <Text style={styles.discount}>
                      {`Giảm ${course.discount_percent}% so với giá gốc`}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Tab Navigation */}
            <View style={{ marginTop: 32, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity
                  style={activeTab === 0 && styles.activeTab}
                  onPress={() => setActiveTab(0)}
                >
                  <Text style={styles.tab}>Mô tả</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={activeTab === 1 && styles.activeTab}
                  onPress={() => setActiveTab(1)}
                >
                  <Text style={styles.tab}>Nội dung</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={activeTab === 2 && styles.activeTab}
                  onPress={() => setActiveTab(2)}
                >
                  <Text style={styles.tab}>Đánh giá</Text>
                </TouchableOpacity>
              </View>
            </View>

            {activeTab === 0 && (
              <View>
                {course?.description ? (
                  <RenderDataHTML html={course?.description} />
                ) : null}
                {course?.video_demo &&
                  course?.video_demo_source === 'youtube' && (
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
                            course?.video_demo,
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
                {course?.content && course?.content?.length > 0 ? (
                  <Accordion
                    sections={course?.content}
                    underlayColor="transpation"
                    activeSections={activeSections}
                    renderHeader={renderHeaderSession}
                    renderContent={renderContent}
                    onChange={value => {
                      setActiveSections(value);
                    }}
                  />
                ) : (
                  <Text style={{ fontFamily: 'Inter-Regular' }}>
                    Không có chương trình giảng dạy
                  </Text>
                )}
              </View>
            )}

            {activeTab === 2 && (
              <View>
                <View style={styles.viewReview}>
                  <Text style={styles.txtRating}>
                    {Number(course?.rate).toFixed(1)}
                  </Text>
                  <Rating
                    ratingCount={5}
                    imageSize={16}
                    readonly
                    ratingColor="#FBC815"
                    startingValue={Number(course?.rate)}
                  />
                  <Text style={[styles.txtOverview, { marginTop: 5 }]}>
                    {`${Object.values(course.reviews)?.length} đánh giá`}
                  </Text>
                </View>
                {course?.reviews && renderItemRating()}
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
                      style={styles.reviewInput}
                      multiline
                      numberOfLines={5}
                      textAlignVertical="top"
                      placeholder="Nhập mô tả"
                      value={description}
                      onChangeText={value => setDescription(value)}
                    />

                    <TouchableOpacity
                      style={styles.btnReview}
                      onPress={handleLeaveReview}
                    >
                      {loadingReview ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.txtReview}>Gửi đánh giá</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </KeyboardAwareScrollView>

      {/* Bottom Purchase Button */}
      {!hiddenBottom && !purchase && course?.price && (
        <View style={styles.bottom}>
          <View style={{ flexDirection: 'column', gap: 8, width: '50%' }}>
            <Text style={styles.priceBottom}>
              {course?.best_ticket_price
                ? currencyFormat(course.best_ticket_price)
                : 'Miễn phí'}
            </Text>
            {course?.discount_percent && course.discount_percent !== 0 && (
              <Text style={styles.discount}>{course.discount_percent}%</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.btnAddToCart}
            onPress={() => handleContact(String(course?.id))}
          >
            <Text style={styles.txtAddToCart}>
              {Platform.OS === 'android' ? 'Liên hệ ngay' : 'Mua khóa học'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    zIndex: 1,
  },
  header: {
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
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 36,
  },
  content: {
    paddingHorizontal: 16,
  },
  imageBanner: {
    width: '100%',
    height: (250 / 375) * deviceWidth,
    resizeMode: 'contain',
    borderRadius: 16,
  },
  content2: {},
  infoWrapper: {
    backgroundColor: '#ebf7ff',
    borderRadius: 12,
    padding: 16,
  },
  icon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  txt3: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#0B2337',
    marginLeft: 4,
  },
  price: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#25C2E8',
  },
  priceBottom: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#ffffff',
  },
  infoTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#0B2337',
    fontWeight: '500',
  },
  infoCate: {
    marginTop: 8,
    fontSize: 13,
    color: '#0B2337',
  },
  salePrice: {
    fontSize: 20,
    color: '#25C2E8',
  },
  discount: {
    fontSize: 14,
    color: '#F11616',
  },
  tab: {
    fontSize: 16,
    color: '#0B2337',
    paddingHorizontal: 8,
    fontWeight: '500',
  },
  activeTab: {
    borderBottomColor: '#1180C3',
    borderBottomWidth: 2,
    borderRadius: 2,
    paddingBottom: 4,
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: '#314753',
  },
  reviewWrapper: {
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  avatar: {
    width: 40,
    height: 40,
    resizeMode: 'cover',
    borderRadius: 20,
  },
  reviewTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#0B2337',
  },
  reviewInput: {
    marginTop: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F3F3F3',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minHeight: 80,
    fontFamily: 'Inter-Regular',
    color: '#000',
  },
  btnReview: {
    marginTop: 16,
    marginBottom: 16,
    width: 120,
    height: 42,
    backgroundColor: '#1180C3',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  txtReview: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#fff',
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    paddingBottom: 30,
    paddingTop: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    backgroundColor: '#10131C',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f7f7f7',
  },
  btnAddToCart: {
    backgroundColor: '#1180C3',
    marginLeft: 10,
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  },
  txtAddToCart: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 21,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  txtTitle: {
    fontSize: 18,
    lineHeight: 27,
    color: '#000',
    fontWeight: '500',
    marginTop: 17,
  },
  subSectionTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageThumbnail: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    borderRadius: 16,
  },
  noImageThumbnail: {
    width: 100,
    height: 80,
    backgroundColor: '#f5f6f7',
    borderRadius: 16,
  },
  txtItemLession: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    color: '#4E4E4E',
    fontWeight: '400',
    marginLeft: 10,
    textTransform: 'uppercase',
  },
  iconPreview: {
    fontSize: 16,
    color: '#bbbdbf',
    marginLeft: 5,
  },
  txtSubSection: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000',
    fontWeight: '500',
    marginLeft: 10,
    justifyContent: 'flex-start',
    flex: 1,
  },
  txtLength: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000',
    fontWeight: '500',
    marginLeft: 10,
  },
  viewReview: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtRating: {
    fontSize: 36,
    lineHeight: 54,
    color: '#FBC815',
    fontWeight: '500',
    textAlign: 'center',
  },
  txtOverview: {
    marginTop: 13,
    fontFamily: 'Inter-ExtraLight',
    fontSize: 13,
    lineHeight: 20,
    color: '#000',
    fontWeight: '300',
  },
  txtNameRating: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: '#777',
    marginTop: 0,
  },
  titleRating: {
    fontSize: 12,
    lineHeight: 20,
    color: '#000000',
    fontWeight: '500',
  },
});

export default CourseDetails;
