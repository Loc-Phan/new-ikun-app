import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  BackHandler,
  Alert,
  ActivityIndicator,
  ScrollView,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import IconI from 'react-native-vector-icons/Ionicons';
import IconA from 'react-native-vector-icons/AntDesign';
import IconF from 'react-native-vector-icons/Feather';
import IconM from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFO from 'react-native-vector-icons/Fontisto';
import Accordion from 'react-native-collapsible/Accordion';
import {Images} from '../../assets';
import {useNavigation} from '@react-navigation/native';
import styles from './styles';
import {NewClient} from '../../api';
import {getIDfromURL, detectNameFromURL} from '../../common';
import VideoPlayer from '../../component/common/video-player';
import {WEB_URL} from '../../config';
import RenderDataHTML from '../../component/common/render-data-html';
import {showLoading} from '../../actions/common';
import {useDispatch, useSelector} from 'react-redux';
import {saveCourse} from '../../actions/course';
import Audio from '../../component/common/audio';
import WebView from 'react-native-webview';
import itemMyCourse from '../../component/item-list/item-my-course';
import Video from 'react-native-video';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const Learning = ({route}) => {
  const [dataSession, setDataSession] = useState(undefined);
  const [purchase, setPurchase] = useState(false);
  const idCourse = route.params?.idCourse;
  const id = route.params?.id;
  const ref = useRef(null);
  const [loadingFinish, setLoadingFinish] = useState(false);
  const [activeSections, setActiveSections] = useState([0]);
  const [showMenu, setShowMenu] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [refreshData, setRefreshData] = useState(new Date().getTime());
  const [data, setData] = useState([]);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const course = useSelector(state => state.course);
  const handleBackPress = () => {
    navigation.goBack(null);
    return true;
  };

  const goBack = () => {
    navigation.goBack();
  };

  const changeFullscreen = item => {
    setIsFullScreen(item);
  };

  const handleFinish = async () => {
    setLoadingFinish(true);
    const params = {
      item: dataSession?.type === 'text_lesson' ? 'text_lesson_id' : 'file_id',
      item_id: dataSession?.id,
      status: true,
    };
    const res = await NewClient.finishCourseDetails(idCourse, params);
    if (res && res.success) {
      Alert.alert('Chúc mừng bạn đã vượt qua bài học này.');
      setRefreshData(new Date().getTime());
    } else {
      Alert.alert('Vui lòng thử lại');
    }
    setLoadingFinish(false);
  };

  const openMenu = () => {
    setShowMenu(true);
  };

  const handleChooseSession = idSession => {
    for (const chapter of data) {
      for (const session of chapter.items) {
        if (session.id === idSession && idSession !== dataSession.id) {
          setDataSession(session);
          setShowMenu(false);
        }
      }
    }
  };

  const handleOpenFile = path => {
    if (path) {
      if (Platform.OS === 'ios') {
        Linking.canOpenURL(path).then(supported => {
          if (supported) {
            Linking.openURL(path);
          } else {
            Alert.alert("Don't know how to open URI: " + path);
          }
        });
      } else {
        Linking.openURL(path);
      }
    } else {
      Alert.alert('Bạn không thể tải file này');
    }
  };

  const renderHeaderSession = (section, index, isActive) => {
    return (
      <View key={String(index)}>
        <View
          style={[styles.subSectionTitle, {marginTop: 8, marginBottom: 11}]}>
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

  const renderContent = (section, index) => {
    const {items} = section;
    const getAccessibility = item => {
      if (item?.accessibility === 'free') return false;
      if (purchase) return false;
      return true;
    };
    return (
      <View>
        {items?.map((ite, i) => {
          if (ite?.type === 'text_lesson' || ite?.type === 'file')
            return (
              <TouchableOpacity
                key={String(i)}
                onPress={() => handleChooseSession(ite?.id)}
                style={[
                  styles.subSectionTitle,
                  {
                    marginBottom: 6,
                    paddingBottom: 6,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f0f2f5',
                  },
                ]}
                disabled={getAccessibility(itemMyCourse)}>
                <View style={styles.subSectionTitle}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      backgroundColor: '#f5f6f7',
                      borderRadius: 4,
                    }}>
                    {ite?.file_type === 'video' ? (
                      <IconF name="video" color="#1180C3" size={28} />
                    ) : ite?.file_type === 'sound' ? (
                      <IconF name="volume-2" color="#1180C3" size={28} />
                    ) : (
                      <IconF name="file" color="#25C2E8" size={28} />
                    )}
                  </View>
                  <Text numberOfLines={1} style={styles.txtItemLession}>
                    {ite?.title}
                  </Text>
                </View>

                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {getAccessibility(ite) ? (
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
    (async () => {
      dispatch(showLoading(true));
      try {
        const responseContent = await NewClient.contentCourseDetails(idCourse);
        const purchaseRes = await NewClient.myCourse();
        if (responseContent && responseContent?.data) {
          for (const chapter of responseContent?.data) {
            for (const session of chapter.items) {
              if (session.id === id) {
                setDataSession(session);
                setData(responseContent.data);
                dispatch(
                  saveCourse({
                    ...course.data,
                    content: responseContent?.data,
                  }),
                );
                dispatch(showLoading(false));
              }
            }
          }
        }
        if (purchaseRes && purchaseRes?.data?.webinars) {
          const res = purchaseRes?.data?.webinars?.find(
            item => item.id === idCourse,
          );
          if (res) {
            setPurchase(true);
          }
        }
      } catch (e) {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshData]);

  return (
    <View style={[styles.container, !isFullScreen && styles.statusBarHeight]}>
      {(!isFullScreen || Platform.OS === 'ios') && (
        <View style={styles.header}>
          <View style={styles.header1}>
            <TouchableOpacity
              onPress={openMenu}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Image source={Images.iconMenu} style={styles.iconMenu} />
            </TouchableOpacity>
            <Text style={styles.title}>Bài học</Text>
            <TouchableOpacity
              onPress={goBack}
              hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
              <Image source={Images.iconClose} style={styles.iconBack} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          (!isFullScreen || Platform.OS === 'ios') && {paddingBottom: 150}
        }>
        <View
          style={
            (!isFullScreen || Platform.OS === 'ios') && {
              marginTop: 50,
              paddingHorizontal: 16,
            }
          }>
          {(!isFullScreen || Platform.OS === 'ios') && (
            <Text style={styles.subTitle}>{dataSession?.title}</Text>
          )}
          {dataSession?.path && dataSession?.storage === 'youtube' && (
            <RenderDataHTML
              html={`
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/${getIDfromURL(
                dataSession?.path,
              )}"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              />
              `}
            />
          )}
          {dataSession?.storage === 'google_drive' &&
            dataSession?.file_type === 'video' && (
              // <Video
              // source={{ uri: 'https://drive.google.com/uc?export=download&id=1xk-0gelGy0klT5KfjoD-tEeytlUfpjB6' }}

              //   style={styles.video}
              //   controls={true}
              //   resizeMode="contain"
              //   useTextureView={false}
              //   player="exo"
              // />
              <VideoPlayer
                ref={ref}
                source={{
                  uri: `https://drive.google.com/uc?export=download&id=${dataSession?.path}`,
                }}
                disableBack
                changeFullscreen={changeFullscreen}
                // style={styles.video}
              />
            )}
          {dataSession?.storage === 'upload' &&
            dataSession?.file_type === 'video' && (
              // <Video
              // source={{ uri: 'https://drive.google.com/uc?export=download&id=1xk-0gelGy0klT5KfjoD-tEeytlUfpjB6' }}

              //   style={styles.video}
              //   controls={true}
              //   resizeMode="contain"
              //   useTextureView={false}
              //   player="exo"
              // />
              <VideoPlayer
                ref={ref}
                source={{uri: `${WEB_URL}${dataSession?.path}`}}
                disableBack
                changeFullscreen={changeFullscreen}
                // style={styles.video}
              />
            )}
          {dataSession?.storage === 'upload' &&
            dataSession?.file_type === 'sound' && (
              <View style={{marginTop: 8}}>
                <Audio url={`${WEB_URL}${dataSession?.path}`} />
              </View>
            )}
          {dataSession?.storage === 'upload' &&
            dataSession?.type === 'file' &&
            dataSession?.file_type !== 'sound' &&
            dataSession?.file_type !== 'pdf' &&
            dataSession?.file_type !== 'video' && (
              <View>
                <Text style={styles.contentTitle}>Tệp đính kèm:</Text>
                <TouchableOpacity
                  style={{
                    marginTop: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onPress={() =>
                    handleOpenFile(`${WEB_URL}${dataSession?.path}`)
                  }>
                  <IconA name="file1" style={styles.iconFile} />
                  <Text style={styles.textFile}>
                    {detectNameFromURL(dataSession?.path)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          {dataSession?.summary && dataSession?.type === 'text_lesson' && (
            <Text style={styles.description}>{dataSession?.summary}</Text>
          )}
          {dataSession?.description && dataSession?.type === 'text_lesson' && (
            <View>
              <Text style={styles.contentTitle}>Nội dung bài học:</Text>
              <RenderDataHTML html={dataSession?.description} />
            </View>
          )}
          {dataSession?.description && dataSession?.type === 'file' && (
            <View>
              <Text style={styles.contentTitle}>Nội dung bài học:</Text>
              <Text style={styles.description}>{dataSession?.description}</Text>
            </View>
          )}
          {dataSession?.path && dataSession?.file_type === 'pdf' && (
            <View>
              <TouchableOpacity
                style={{
                  marginTop: 16,
                  backgroundColor: '#32c3d9',
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => {
                  navigation.navigate('PdfScreen', {
                    title: dataSession?.title,
                    uri: `https://drive.google.com/uc?export=download&id=${dataSession?.path}`,
                  });
                }}>
                <IconA name="file1" style={[styles.iconFile, { color: '#fff', marginRight: 8 }]} />
                <Text style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: '600',
                }}>Xem tài liệu PDF</Text>
              </TouchableOpacity>
            </View>
          )}
          {dataSession?.path &&
            dataSession?.storage === 'google_drive' &&
            dataSession?.file_type !== 'video' &&
            dataSession?.file_type !== 'pdf' && (
              <View>
                <Text style={styles.contentTitle}>Tệp đính kèm:</Text>
                <TouchableOpacity
                  style={{
                    marginTop: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onPress={() => handleOpenFile(dataSession?.path)}>
                  <IconA name="file1" style={styles.iconFile} />
                  <Text style={styles.textFile}>{dataSession?.path}</Text>
                </TouchableOpacity>
              </View>
            )}
          {(!isFullScreen || Platform.OS === 'ios') && (
            <TouchableOpacity
              disabled={dataSession?.auth_has_read ? true : false}
              style={[
                styles.btnSubmit,
                {
                  backgroundColor: dataSession?.auth_has_read
                    ? '#C4C4C4'
                    : '#1180C3',
                },
              ]}
              onPress={handleFinish}>
              {loadingFinish ? (
                <View>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              ) : (
                <Text style={styles.txtSubmit}>
                  {dataSession?.auth_has_read
                    ? 'Đã hoàn thành'
                    : 'Hoàn thành bài học'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        <Modal
          isVisible={showMenu}
          backdropOpacity={0.3}
          // deviceWidth={width}
          // deviceHeight={height}
          style={styles.modal}
          animationIn="slideInLeft"
          animationOut="slideOutLeft"
          useNativeDriver
          coverScreen
          onBackButtonPress={() => {
            setShowMenu(false);
          }}
          onBackdropPress={() => {
            setShowMenu(false);
          }}>
          <View style={styles.viewModalMenu}>
            <View style={styles.viewHeaderModalMenu}>
              <Text
                style={[styles.title, {flex: 1, marginRight: 10}]}
                numberOfLines={1}>
                {dataSession?.title || ''}
              </Text>
            </View>
            <View style={styles.line} />
            <ScrollView
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={false}>
              <View style={styles.contentMenu}>
                {data && (
                  <Accordion
                    sections={data}
                    underlayColor="transpation"
                    activeSections={activeSections}
                    renderHeader={renderHeaderSession}
                    renderContent={renderContent}
                    onChange={value => {
                      setActiveSections(value);
                    }}
                  />
                )}
              </View>
            </ScrollView>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

export default Learning;
