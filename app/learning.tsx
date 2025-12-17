import { Images } from '@/assets';
import Audio from '@/components/Audio';
import RenderDataHTML from '@/components/RenderDataHTML';
import { WEB_URL } from '@/constants';
import Services from '@/services';
import { detectNameFromURL, getIDfromURL } from '@/utils';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video from 'react-native-video';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const Learning = () => {
  console.log("deviceWidth",deviceWidth);
  console.log("deviceHeight",deviceHeight);
  const [dataSession, setDataSession] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { idCourse, id } = useLocalSearchParams<{
    idCourse: string;
    id: string;
  }>();
  const ref = useRef(null);
  const [loadingFinish, setLoadingFinish] = useState(false);
  const [refreshData, setRefreshData] = useState(new Date().getTime());
  const navigation = useNavigation<any>();
  // const course = useSelector(state => state.course);
  const handleBackPress = () => {
    navigation.goBack();
    return true;
  };

  const goBack = () => {
    navigation.goBack();
  };

  const handleFinish = async () => {
    setLoadingFinish(true);
    const params = {
      item: dataSession?.type === 'text_lesson' ? 'text_lesson_id' : 'file_id',
      item_id: dataSession?.id,
      status: true,
    };
    const res = await Services.finishCourseDetails(idCourse, params);
    if (res && res.data?.success) {
      Alert.alert('Chúc mừng bạn đã vượt qua bài học này.');
      setRefreshData(new Date().getTime());
    } else {
      Alert.alert('Vui lòng thử lại');
    }
    setLoadingFinish(false);
  };

  const handleOpenFile = (path: any) => {
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
      try {
        setIsLoading(true);
        const responseContent = (await Services.contentCourseDetails(idCourse))
          .data;
        // const purchaseRes = (await Services.myCourse()).data;
        if (responseContent && responseContent?.data) {
          for (const chapter of responseContent?.data) {
            for (const session of chapter.items) {
              if (String(session.id) === String(id)) {
                setDataSession(session);
                // setData(responseContent.data);
              }
            }
          }
        }
        // if (purchaseRes && purchaseRes?.data?.webinars) {
        //   const res = purchaseRes?.data?.webinars?.find(
        //     (item: any) => item.id === idCourse,
        //   );
        //   if (res) {
        //     setPurchase(true);
        //   }
        // }
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshData]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.header1}>
          <Text style={styles.title}>Bài học</Text>
          <TouchableOpacity
            onPress={goBack}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Image source={Images.iconClose} style={styles.iconBack} />
          </TouchableOpacity>
        </View>
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1180C3" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
        >
          <View
            style={{
              marginTop: 50,
              // paddingHorizontal: 16,
            }}
          >
            <Text style={styles.subTitle}>{dataSession?.title}</Text>
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
                <Video
                  ref={ref}
                  source={{
                    uri: `https://drive.google.com/uc?export=download&id=${dataSession?.path}`,
                  }}
                  style={styles.video}
                  controls={true}
                  resizeMode="contain"
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
                <Video
                  ref={ref}
                  source={{ uri: `${WEB_URL}${dataSession?.path}` }}
                  style={styles.video}
                  controls={true}
                  resizeMode="contain"
                />
              )}
            {dataSession?.storage === 'upload' &&
              dataSession?.file_type === 'sound' && (
                <View style={{ marginTop: 8 }}>
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
                    }
                  >
                    <AntDesign name="file" style={styles.iconFile} />
                    <Text style={styles.textFile}>
                      {detectNameFromURL(dataSession?.path)}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            {dataSession?.summary && dataSession?.type === 'text_lesson' && (
              <Text style={styles.description}>{dataSession?.summary}</Text>
            )}
            {dataSession?.description &&
              dataSession?.type === 'text_lesson' && (
                <View>
                  <Text style={styles.contentTitle}>Nội dung bài học:</Text>
                  <RenderDataHTML html={dataSession?.description} />
                </View>
              )}
            {dataSession?.description && dataSession?.type === 'file' && (
              <View>
                <Text style={styles.contentTitle}>Nội dung bài học:</Text>
                <Text style={styles.description}>
                  {dataSession?.description}
                </Text>
              </View>
            )}
            {dataSession?.path &&
              dataSession?.file_type === 'pdf' &&
              dataSession?.storage === 'google_drive' && (
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
                      marginHorizontal: 16,
                    }}
                    onPress={() => {
                      navigation.navigate('pdf', {
                        title: dataSession?.title,
                        uri: `https://drive.google.com/uc?export=download&id=${dataSession?.path}`,
                      });
                    }}
                  >
                    <AntDesign
                      name="file"
                      style={[
                        styles.iconFile,
                        { color: '#fff', marginRight: 8 },
                      ]}
                    />
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 16,
                        fontWeight: '600',
                      }}
                    >
                      Xem tài liệu PDF
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            {dataSession?.path &&
              dataSession?.storage !== 'google_drive' &&
              dataSession?.file_type === 'pdf' && (
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
                      navigation.navigate('pdf', {
                        title: dataSession?.title,
                        uri: `${WEB_URL}${dataSession?.path}`,
                      })
                    }
                  >
                    <AntDesign name="file" style={styles.iconFile} />
                    <Text style={styles.textFile}>{dataSession?.path}</Text>
                  </TouchableOpacity>
                </View>
              )}
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
              onPress={handleFinish}
            >
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
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Learning;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    height: deviceHeight,
    alignItems: 'center',
  },
  statusBarHeight: {},
  header: {},
  header1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  iconBack: {
    height: 18,
    width: 18,
    resizeMode: 'contain',
    tintColor: '#000',
  },
  iconBackModal: {
    height: 18,
    width: 18,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    lineHeight: 36,
    flex: 1,
    textAlign: 'center',
  },
  btnSubmit: {
    marginTop: 32,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 16,
    // backgroundColor: '#1180C3',
  },
  txtSubmit: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#fff',
  },
  iconMenu: {
    height: 22,
    width: 22,
    resizeMode: 'contain',
    tintColor: '#000',
  },
  subTitle: {
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    paddingHorizontal: 16,
  },
  contentTitle: {
    marginTop: 16,
    fontFamily: 'Inter-Medium',
    fontSize: 18,
  },
  description: {
    marginTop: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  modal: {
    backgroundColor: '#fff',
    margin: 0,
    width: '80%',
  },
  viewModalMenu: {
    width: (333 / 375) * deviceWidth,
    height: deviceHeight,
    backgroundColor: '#fff',
    borderColor: '#1180C3',
    borderRightWidth: 3,
  },
  viewHeaderModalMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 25,
    marginLeft: 16,
  },
  btnCloseMenu: {
    backgroundColor: '#1180C3',
    width: 47,
    height: 39,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 6,
    borderTopLeftRadius: 6,
  },
  line: {
    width: (333 / 375) * deviceWidth - 32,
    marginBottom: 30,
    marginTop: 22,
    backgroundColor: '#F0F0F0',
    height: 1,
    alignSelf: 'center',
  },
  txtSubSection: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 22,
    color: '#000',
    fontWeight: '500',
    marginLeft: 10,
    justifyContent: 'flex-start',
    flex: 1,
  },
  txtItemLession: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#4E4E4E',
    fontWeight: '300',
    marginLeft: 10,
    textTransform: 'uppercase',
  },
  totalHours: {
    fontFamily: 'Inter-ExtraLight',
    fontSize: 10,
    color: '#8F8F8F',
    fontWeight: '300',
    marginLeft: 10,
  },
  iconPreview: {
    fontSize: 16,
    color: '#bbbdbf',
    marginLeft: 5,
  },
  txtLength: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 22,
    color: '#000',
    fontWeight: '500',
    marginLeft: 10,
  },
  contentMenu: {
    marginHorizontal: 16,
  },
  subSectionTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  video: { 
    width: '100%', 
    height: deviceWidth > deviceHeight 
      ? deviceHeight * 0.7 // Landscape: 70% of screen height
      : Math.min(deviceWidth * 0.56, deviceHeight * 0.35), // Portrait: aspect ratio based
  },
  textFile: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  iconFile: {
    fontSize: 18,
    color: '#1180C3',
  },
  containerVideo: {
    width: '100%',
    height: deviceWidth > deviceHeight 
      ? deviceHeight * 0.65 // Landscape: slightly smaller than video
      : Math.min(deviceWidth * 0.56, deviceHeight * 0.3), // Portrait: aspect ratio based
    backgroundColor: 'black',
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
  },
  fullscreenButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    padding: 10,
  },
});
