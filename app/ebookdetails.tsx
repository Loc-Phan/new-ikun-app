import { Images } from '@/assets';
import RenderDataHTML from '@/components/RenderDataHTML';
import { WEB_URL } from '@/constants';
import Services from '@/services';
import { currencyFormat } from '@/utils';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { last } from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  Image,
  ImageBackground,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import * as RNIap from 'react-native-iap';
import { Rating } from 'react-native-ratings';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  pushProductTransactionIAP,
  saveProductTransactionIAP,
} from '../store/productiap/productiapSlice';

const deviceWidth = Dimensions.get('window').width;

const EbookDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  // Redux selectors with proper typing
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const transaction = useSelector(
    (state: RootState) => state.productIAP?.transaction || {},
  );

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [ebookDetails, setEbookDetails] = useState<any>();
  const [productId, setProductId] = useState('');
  const [activeThumbnail, setActiveThumbnail] = useState<string>();
  const [activeTab, setActiveTab] = useState(0);
  const [description, setDescription] = useState('');
  const [productQuality, setProductQuality] = useState(5);
  const [purchaseQuality, setPurchaseQuality] = useState(5);
  const [deliveryQuality, setDeliveryQuality] = useState(5);
  const [sellerQuantity, setSellerQuantity] = useState(5);
  const [loadingReview, setLoadingReview] = useState(false);
  const [isCheck, setIsCheck] = useState(false);
  const [iosRNIapState, setIosRNIapState] = useState(true);
  const [file, setFile] = useState('');
    const [loadingPurchase, setLoadingPurchase] = useState(false);

  const handleBackPress = () => {
    navigation.goBack(null);
    return true;
  };

  const goBack = () => {
    navigation.goBack();
  };

  const handleLeaveReview = async () => {
    if (!description) {
      Alert.alert('Vui lòng nhập đánh giá');
      return;
    }
    const params = {
      product_id: id,
      product_quality: productQuality,
      purchase_worth: purchaseQuality,
      delivery_quality: deliveryQuality,
      seller_quality: sellerQuantity,
      description,
    };
    setLoadingReview(true);
    const response = (await Services.leaveEbookReview(params)).data;
    if (response.data?.success === true) {
      Alert.alert('Đánh giá thành công');
      setDescription('');
    } else {
      Alert.alert(response?.data?.message || 'Đánh giá thất bại');
    }
    setLoadingReview(false);
  };

  // const handlePostComment = async () => {
  //   if (!comment) {
  //     Alert.alert(t('ebook.commentValidate'));
  //     return;
  //   }
  //   const params = {
  //     item_id: id,
  //     item_name: 'product',
  //     comment,
  //   };
  //   setLoadingComment(true);
  //   const response = await Services.postEbookComment(params);

  //   if (response.success === true) {
  //     Alert.alert(t('ebook.commentSuccess'));
  //     setComment('');
  //   } else {
  //     Alert.alert(response?.message || t('ebook.leaveFailed'));
  //   }
  //   setLoadingComment(false);
  // };

  const handleContactAssistant = async (name: string) => {
    if (!accessToken) {
      notLoggedIn();
      return;
    }
    // navigation.navigate('assistant', { id: id, name, type: 'ebook' });
    if (Platform.OS === 'android') {
      navigation.navigate('assistant', { id: id, name, type: 'ebook' });
    } else {
      try {
        if (!productId) {
          Alert.alert('Lỗi', 'Mã sản phẩm không hợp lệ');
          return;
        }
        setLoadingPurchase(true);
        RNIap.requestPurchase({
          request: {
            ios: {
              sku: productId,
            },
          },
          type: 'in-app',
        })
          .then(async res => {
            // call api to backend update purchase todo
            // await handleUpdatePurchaseBackend();
            // call api to backend update purchase todo
          })
          .catch(err => {
            console.log(err);
          })
          .finally(async () => {
            setLoadingPurchase(false);
          });
      } catch (error) {
        Alert.alert('Có lỗi xảy ra trong quá trình mua, vui lòng thử lại');
      }
    }
  };

  const handleUpdatePurchaseBackend = async () => {
    //change state purchase to true;
    setIsCheck(true);

    // call api backend
    await Services.iOSBuyCourse({
      product_id: id,
    })
      .then(async () => {
        handleGetInformationEbook();
        await dispatch(
          saveProductTransactionIAP({
            username: user?.email, //change to username
            productIds: (transaction[user?.email || ''] || []).filter(
              f => f !== productId,
            ),
          }),
        );
      })
      .catch(async () => {
        //when save failed transaction to redux and update when open this screen again
        await dispatch(
          pushProductTransactionIAP({
            username: user?.email, //change to username
            productId: productId,
          }),
        );
        setIosRNIapState(false);
      });
    // call api backend
  };

  const handleDownFile = async () => {
    let downloadable = 0;
    if (ebookDetails?.files?.length > 0) {
      downloadable = ebookDetails?.files[0]?.downloadable;
    }
    if (file && downloadable) {
      if (Platform.OS === 'android') {
        Linking.canOpenURL(`${WEB_URL}${file}`).then(supported => {
          Linking.openURL(`${WEB_URL}${file}`);
        });
      } else {
        const { dirs } = ReactNativeBlobUtil.fs;
        const downloadDir = dirs.DocumentDir;
        const filePath = `${downloadDir}/${ebookDetails?.title || ''}.pdf`;
        ReactNativeBlobUtil.config({
          // add this option that makes response data to be stored as a file,
          // this is much more performant.
          fileCache: true,
          path: filePath,
        })
          .fetch('GET', encodeURI(`${WEB_URL}${file}`), {
            //some headers ..
          })
          .then(async res => {
            // the temp file path
            console.log('The file saved to ', res.path());
            ReactNativeBlobUtil.ios.openDocument(filePath);
          })
          .catch(async e => {
            Alert.alert('Có lỗi xảy ra trong quá trình tải, vui lòng thử lại');
          });
      }
    } else {
      Alert.alert('Bạn không thể tải ebook này');
    }
  };

  const handleShareFile = async () => {
    let downloadable = 0;
    if (ebookDetails?.files?.length > 0) {
      downloadable = ebookDetails?.files[0]?.downloadable;
    }
    if (!file) {
      Alert.alert('Bạn không thể chia sẻ ebook này');
      return;
    }
    if (file && downloadable) {
      try {
        const result = await Share.share({
          message: `${WEB_URL}${file}`,
        });
        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // shared with activity type of result.activityType
          } else {
            // shared
          }
        } else if (result.action === Share.dismissedAction) {
          // dismissed
        }
      } catch (error) {
        Alert.alert(error.message);
      }
    } else {
      Alert.alert('Bạn không thể chia sẻ ebook này');
      return;
    }
  };

  const handleContentDetails = item => {
    navigation.navigate('LearningEbookScreen', {
      item,
    });
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => {
      backHandler.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleGetInformationEbook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  const handleGetInformationEbook = () => {
    (async () => {
      const response = (await Services.getEbookDetails(id)).data as any;
      if (response?.data?.product) {
        setEbookDetails(response?.data?.product);
        setActiveThumbnail(response?.data?.product?.thumbnail);
        const productIdTemp = last(
          response?.data?.product?.url?.split('/') || [],
        );
        setProductId(productIdTemp);
        if (
          response?.data?.product?.price === 0 &&
          response?.data?.product?.files
        ) {
          if (response?.data?.product?.files?.length > 0) {
            setFile(response?.data?.product?.files[0]?.path);
          }
        }
        if (accessToken && response?.data?.product?.price !== 0) {
          const res = (await Services.getPurchaseEbook()).data;
          console.log('res', res?.data?.orders);
          console.log('id', id);
          const filePath = res?.data?.orders?.filter(
            item => String(item.product_id) === String(id),
          );
          console.log('filePath', filePath);
          if (filePath.length > 0) {
            setIsCheck(true);
            if (filePath[0]?.file?.length > 0) {
              setFile(filePath[0]?.file[0]?.path);
            }
          } else {
            if (Platform.OS === 'ios') {
              if (transaction[user?.email]?.includes(productIdTemp)) {
                await handleUpdatePurchaseBackend();
              } else {
                await RNIap.initConnection();
                // clear transactionIos to show purchase by username
                await RNIap.clearTransactionIOS();
                // get list products for function RNIap.requestPurchase
                console.log("productIdTemp",productIdTemp)
                await RNIap.fetchProducts({
                  skus: [productIdTemp],
                })
                  .then(res => {
                    if (!res?.length) {
                      setIosRNIapState(false);
                    } else {
                      setIosRNIapState(true);
                    }
                  })
                  .catch(() => {
                    setIosRNIapState(false);
                  });
              }
            }
          }
        }
        setIsLoading(false);
      }
    })();
  };

  const notLoggedIn = () => {
    return Alert.alert('Bạn chưa đăng nhập', 'Bạn cần đăng nhập để mua ebook', [
      {
        text: 'Hủy',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Đăng nhập',
        onPress: () =>
          navigation.navigate('auth/login', {
            screen: 'EbooksDetailsScreen',
            id,
          }),
      },
    ]);
  };

  useEffect(() => {
    const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      async purchase => {
        console.log('purchase updated:', purchase);

        if (purchase.transactionId) {
          await handleUpdatePurchaseBackend();

          if (Platform.OS === 'ios') {
            await RNIap.finishTransaction(purchase, false);
          }
        }
      },
    );

    const purchaseErrorSubscription = RNIap.purchaseErrorListener(error => {
      console.log('purchase error:', error);
      Alert.alert('Lỗi', 'Thanh toán thất bại hoặc bị hủy');
    });

    return () => {
      purchaseUpdateSubscription.remove();
      purchaseErrorSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 }}
      edges={['top']}
    >
      <View style={styles.header}>
        <View style={[styles.header1]}>
          <TouchableOpacity
            onPress={goBack}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Image source={Images.iconBack} style={styles.iconBack} />
          </TouchableOpacity>
          <Text style={styles.title}>Chi tiết Ebook</Text>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {isLoading ? (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator size="small" />
          </View>
        ) : (
          <View>
            <ImageBackground
              source={{ uri: activeThumbnail }}
              style={styles.thumbnail}
            >
              <View
                style={{
                  height: '100%',
                  padding: 16,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}
              >
                <View style={styles.expireWrapper}>
                  {/* <Text style={styles.expireText}>
                    Thời hạn:
                    <Text
                      style={{color: '#0B2337', fontFamily: 'Inter-Medium'}}>
                      {` 12/12/2023`}
                    </Text>
                  </Text> */}
                </View>
                <TouchableOpacity
                  style={[
                    styles.expireWrapper,
                    { flexDirection: 'row', alignItems: 'center', gap: 4 },
                  ]}
                  onPress={() => handleShareFile()}
                >
                  <Image source={Images.iconShare} style={styles.iconShare} />
                  <Text style={styles.share}>Share</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
            <View style={styles.infoWrapper}>
              <Text style={styles.infoCate}>
                {ebookDetails?.category_title}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={styles.infoTitle}>{ebookDetails?.title}</Text>
                <TouchableOpacity onPress={() => handleDownFile()}>
                  <Image
                    source={file ? Images.iconDown : Images.iconUndown}
                    style={styles.iconDown}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 8,
                }}
              >
                {ebookDetails?.rate ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Rating
                      ratingCount={5}
                      imageSize={20}
                      readonly
                      tintColor="#ebf7ff"
                      ratingColor="#ffc600"
                      startingValue={Number(ebookDetails.rate)}
                    />
                    <Text style={styles.rate}>{String(ebookDetails.rate)}</Text>
                  </View>
                ) : null}
                {ebookDetails?.reviews && (
                  <Text
                    style={styles.reviews}
                  >{`(${ebookDetails.reviews.length} lượt đánh giá)`}</Text>
                )}
              </View>
              {ebookDetails?.availability > 0 ? (
                <Text
                  style={styles.availability}
                >{`Còn hàng: ${ebookDetails?.availability}`}</Text>
              ) : ebookDetails?.availability === 'Unlimited' ? (
                <Text style={styles.unlimited}>Không giới hạn</Text>
              ) : (
                <Text style={styles.stock}>Hết hàng</Text>
              )}
              <View
                style={{
                  marginTop: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                >
                  <Image source={Images.iconDollar} style={styles.icon} />
                  {ebookDetails?.price ? (
                    <Text
                      style={[styles.txt3, { paddingLeft: 2, paddingRight: 8 }]}
                    >
                      {currencyFormat(ebookDetails?.price_with_discount)}
                    </Text>
                  ) : (
                    <Text style={[styles.txt3, { paddingRight: 12 }]}>
                      Miễn phí
                    </Text>
                  )}
                  {ebookDetails?.price !== ebookDetails?.price_with_discount ? (
                    <Text
                      style={[
                        styles.content,
                        {
                          textDecorationLine: 'line-through',
                          color: '#314753',
                        },
                      ]}
                    >
                      {currencyFormat(ebookDetails?.price)}
                    </Text>
                  ) : null}
                </View>
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  {ebookDetails?.discount_percent !== 0 ? (
                    <Text
                      style={styles.txt2}
                    >{`Giảm ${ebookDetails?.discount_percent}% so với giá gốc`}</Text>
                  ) : null}
                </View>
              </View>
              {(isCheck && file && iosRNIapState) ||
              (isCheck && file && Platform.OS === 'android') ||
              (file && ebookDetails?.price === 0) ? (
                <TouchableOpacity
                  style={[styles.btnSubmit, { backgroundColor: '#1180C3' }]}
                  onPress={() => {
                    navigation.navigate('pdf', {
                      title: ebookDetails?.title,
                      uri: `${WEB_URL}${file}`,
                    });
                  }}
                >
                  <Text style={styles.txtSubmit}>Xem ebook</Text>
                </TouchableOpacity>
              ) : isCheck || !iosRNIapState ? (
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 20,
                    textAlign: 'center',
                    color: '#25C2E8',
                    fontWeight: 'bold',
                  }}
                >
                  Ebook sắp xuất bản
                </Text>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.btnSubmit,
                    { backgroundColor: file ? '#C4C4C4' : '#1180C3' },
                  ]}
                  onPress={() => handleContactAssistant(ebookDetails?.title)}
                >
                  <Text style={styles.txtSubmit}>
                    {' '}
                    {Platform.OS === 'android' ? 'Liên hệ ngay' : 'Mua ebook'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={{ marginTop: 32, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity onPress={() => setActiveTab(0)}>
                  <Text style={[styles.tab]}>Mô tả</Text>
                  {activeTab === 0 && (
                    <View
                      style={{
                        marginTop: 4,
                        height: 2,
                        backgroundColor: '#1180C3',
                      }}
                    ></View>
                  )}
                </TouchableOpacity>
                {(ebookDetails?.price === 0 || file) && (
                  <TouchableOpacity onPress={() => setActiveTab(1)}>
                    <Text style={[styles.tab]}>Nội dung</Text>
                    {activeTab === 1 && (
                      <View
                        style={{
                          marginTop: 4,
                          height: 2,
                          backgroundColor: '#1180C3',
                        }}
                      ></View>
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setActiveTab(2)}>
                  <Text style={[styles.tab]}>Đánh giá</Text>
                  {activeTab === 2 && (
                    <View
                      style={{
                        marginTop: 4,
                        height: 2,
                        backgroundColor: '#1180C3',
                      }}
                    ></View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            {activeTab === 0 && (
              <View>
                <RenderDataHTML html={ebookDetails.description} />
                {/* {user?.token ? (
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 8,
                      }}>
                      <Text style={styles.reviewTitle}>
                        {t('ebook.comment')}
                      </Text>
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
                      placeholder={t('ebook.enterComment')}
                      value={comment}
                      onChangeText={value => setComment(value)}
                    />
                    <TouchableOpacity
                      style={styles.btnReview}
                      onPress={handlePostComment}>
                      {loadingComment ? (
                        <View>
                          <ActivityIndicator size="small" color="#fff" />
                        </View>
                      ) : (
                        <Text style={styles.txtReview}>
                          {t('ebook.sendComment')}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : null} */}
              </View>
            )}
            {activeTab === 1 && (
              <View>
                {ebookDetails?.files && ebookDetails?.files?.length >= 2 ? (
                  <View>
                    {ebookDetails?.files?.slice(1).map(item => (
                      <TouchableOpacity
                        key={item?.id}
                        style={styles.contentWrapper}
                        onPress={() => handleContentDetails(item)}
                      >
                        <FontAwesome name="book" size={14} color="#4E4E4E" />
                        <Text numberOfLines={1} style={styles.contentText}>
                          {item?.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text>Không có chương trình giảng dạy</Text>
                )}
              </View>
            )}
            {activeTab === 2 && (
              <View>
                {user?.token && (
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {/* <Text
                        style={
                          styles.reviewTitle
                        }>{`Đánh giá (${ebookDetails?.reviews?.length})`}</Text> */}
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
                      value={description}
                      onChangeText={value => setDescription(value)}
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
                          <Text style={styles.quality}>Sản phẩm</Text>
                          <Rating
                            ratingCount={5}
                            imageSize={20}
                            jumpValue={0}
                            startingValue={5}
                            ratingColor="#FBC815"
                            onFinishRating={value => setProductQuality(value)}
                          />
                        </View>
                        <View style={{ paddingHorizontal: 16 }}>
                          <Text style={styles.quality}>Giao hàng</Text>
                          <Rating
                            ratingCount={5}
                            imageSize={20}
                            jumpValue={0}
                            startingValue={5}
                            ratingColor="#FBC815"
                            onFinishRating={value => setDeliveryQuality(value)}
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
                            onFinishRating={value => setPurchaseQuality(value)}
                          />
                        </View>
                        <View style={{ paddingHorizontal: 16 }}>
                          <Text style={styles.quality}>Bán hàng</Text>
                          <Rating
                            ratingCount={5}
                            imageSize={20}
                            jumpValue={0}
                            startingValue={5}
                            ratingColor="#FBC815"
                            onFinishRating={value => setSellerQuantity(value)}
                          />
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.btnReview}
                      onPress={handleLeaveReview}
                    >
                      {loadingReview ? (
                        <View>
                          <ActivityIndicator size="small" color="#fff" />
                        </View>
                      ) : (
                        <Text style={styles.txtReview}>Đánh giá</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
                {ebookDetails?.reviews?.map(item => (
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
                            {moment(item.created_at * 1000).format(
                              'HH:mm DD/MM/YYYY',
                            )}
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
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  header1: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBack: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
    tintColor: '#000',
  },
  title: {
    flex: 1,
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '500',
    textAlign: 'center',
    color: '#000',
  },
  thumbnail: {
    width: '100%',
    height: deviceWidth * 0.8,
    resizeMode: 'contain',
    borderRadius: 16,
    overflow: 'hidden',
  },
  expireWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  iconShare: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  share: {
    fontSize: 12,
    color: '#000',
  },
  infoWrapper: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#ebf7ff',
    borderRadius: 12,
  },
  infoCate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  iconDown: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  rate: {
    fontSize: 14,
    color: '#000',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    color: '#666',
  },
  availability: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 8,
  },
  unlimited: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 8,
  },
  stock: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 8,
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  txt3: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#25C2E8',
  },
  content: {
    fontSize: 14,
    color: '#666',
  },
  txt2: {
    fontSize: 12,
    color: '#666',
  },
  btnSubmit: {
    backgroundColor: '#1180C3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  txtSubmit: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tab: {
    fontSize: 16,
    color: '#0B2337',
    fontWeight: 500,
    paddingVertical: 8,
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contentText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 8,
    flex: 1,
  },
  btnReview: {
    backgroundColor: '#1180C3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  txtReview: {
    color: '#fff',
    fontSize: 14,
  },
  quality: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  reviewWrapper: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  description: {
    fontSize: 14,
    color: '#000',
    marginTop: 8,
  },
});

export default EbookDetails;
