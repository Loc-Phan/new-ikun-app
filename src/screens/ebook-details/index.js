import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  ScrollView,
  TextInput,
  Alert,
  BackHandler,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { NewClient } from '../../api';
import FastImage from 'react-native-fast-image';
import { Rating } from 'react-native-ratings';
import RenderDataHTML from '../../component/common/render-data-html';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Images } from '../../assets';
import {currencyFormat} from '../../common';
import styles from './styles';
import { WEB_URL } from '../../config';
import IconF from 'react-native-vector-icons/Feather';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { showLoading } from '../../actions/common';
import * as RNIap from 'react-native-iap';
import {
  pushProductTransactionIAP,
  saveProductTransactionIAP,
} from '../../actions/product-iap';
import { last } from 'lodash';

const EbookDetails = ({ route }) => {
  const id = route.params?.id;
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [ebookDetails, setEbookDetails] = useState();
  const [productId, setProductId] = useState('');
  const [activeThumbnail, setActiveThumbnail] = useState();
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
  // const [comment, setComment] = useState('');
  const user = useSelector(state => state.user);
  const transaction = useSelector(state => state.productIAP?.transaction || {});
  const navigation = useNavigation();
  console.log('price', ebookDetails?.price);
  console.log('file', file);
  const handleBackPress = () => {
    navigation.goBack(null);
    return true;
  };

  const goBack = () => {
    navigation.goBack();
  };

  const handleLeaveReview = async () => {
    if (!description) {
      Alert.alert('Vui lòng nhập mô tả');
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
    const response = await NewClient.leaveEbookReview(params);
    if (response.success === true) {
      Alert.alert('Đánh giá thành công');
      setDescription('');
    } else {
      Alert.alert(response?.message || 'Đánh giá thất bại');
    }
    setLoadingReview(false);
  };

  // const handlePostComment = async () => {
  //   if (!comment) {
  //     Alert.alert('Vui lòng nhập bình luận');
  //     return;
  //   }
  //   const params = {
  //     item_id: id,
  //     item_name: 'product',
  //     comment,
  //   };
  //   const response = await NewClient.postEbookComment(params);

  //   if (response.success === true) {
  //     Alert.alert('Bình luận thành công');
  //     setComment('');
  //   } else {
  //     Alert.alert(response?.message || 'Bình luận thất bại');
  //   }
  // };

  const handleContactAssistant = async name => {
    if (!user.token) {
      notLoggedIn();
      return;
    }
    if (Platform.OS === 'android') {
      navigation.navigate('AssistantScreen', { id: id, name, type: 'ebook' });
    } else {
      try {
        await dispatch(showLoading(true));
        RNIap.requestPurchase({
          sku: productId,
        })
          .then(async res => {
            // call api to backend update purchase todo
            await handleUpdatePurchaseBackend();
            // call api to backend update purchase todo
          })
          .catch(err => {
            console.log(err);
          })
          .finally(async () => {
            await dispatch(showLoading(false));
          });
      } catch (error) {
        Alert.alert('Thông báo', 'Đã xảy ra lỗi, vui lòng thử lại');
      }
    }
  };

  const handleUpdatePurchaseBackend = async () => {
    //change state purchase to true;
    setIsCheck(true);

    // call api backend
    await NewClient.iOSBuyCourse({
      product_id: id,
    })
      .then(async () => {
        handleGetInformationEbook();
        await dispatch(
          saveProductTransactionIAP({
            username: user.info?.email, //change to username
            productIds: (transaction[user.info?.email || ''] || []).filter(
              f => f !== productId,
            ),
          }),
        );
      })
      .catch(async () => {
        //when save failed transaction to redux and update when open this screen again
        await dispatch(
          pushProductTransactionIAP({
            username: user.info?.email, //change to username
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
        await dispatch(showLoading(true));
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
            await dispatch(showLoading(false));
            ReactNativeBlobUtil.ios.openDocument(filePath);
          })
          .catch(async e => {
            Alert.alert('Có lỗi xảy ra trong quá trình tải, vui lòng thử lại');
            await dispatch(showLoading(false));
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
      const response = await NewClient.getEbookDetails(id);
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
            console.log(
              'response?.data?.product?.files',
              response?.data?.product?.files,
            );
            setFile(response?.data?.product?.files[0]?.path);
          }
        }
        if (user?.token && response?.data?.product?.price !== 0) {
          const res = await NewClient.getPurchaseEbook();
          const filePath = res?.data?.orders?.filter(
            item => item.product_id === id,
          );
          console.log('filePath', filePath);
          if (filePath.length > 0) {
            setIsCheck(true);
            if (filePath[0]?.file?.length > 0) {
              setFile(filePath[0]?.file[0]?.path);
            }
          } else {
            if (Platform.OS === 'ios') {
              if (transaction[user.info.email]?.includes(productIdTemp)) {
                await handleUpdatePurchaseBackend();
              } else {
                // clear transactionIos to show purchase by username
                await RNIap.clearTransactionIOS();
                // get list products for function RNIap.requestPurchase
                await RNIap.getProducts({
                  skus: [productIdTemp],
                })
                  .then(res => {
                    if (!res?.length) {
                      setIosRNIapState(false);
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
    return Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để tiếp tục.', [
      {
        text: 'Hủy',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Đăng nhập',
        onPress: () =>
          navigation.navigate('LoginScreen', {
            screen: 'CoursesDetailsScreen',
            id: this.id,
          }),
      },
    ]);
  };

  return (
    <View style={styles.container}>
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
          <View style={{ marginTop: 50 }}>
            <ActivityIndicator size="small" />
          </View>
        ) : (
          <View style={{ marginTop: 50 }}>
            <FastImage
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
            </FastImage>
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
                    fontSize: 20,
                    textAlign: 'center',
                    color: '#25C2E8',
                    fontWeight: 'bold',
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
                    navigation.navigate('PdfScreen', {
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
                  <Text style={[styles.tab, activeTab === 0]}>
                    Mô tả
                  </Text>
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
                    <Text style={[styles.tab, activeTab === 1]}>Nội dung</Text>
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
                        <IconF name="book" color="#4E4E4E" size={14} />
                        <Text numberOfLines={1} style={styles.contentText}>
                          {item?.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={{ fontFamily: 'Inter-Regular' }}>
                    Không có chương trình giảng dạy
                  </Text>
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
                        <Text style={styles.txtReview}>
                          Gửi đánh giá
                        </Text>
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
    </View>
  );
};

export default EbookDetails;
