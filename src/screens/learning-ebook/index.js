import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  BackHandler,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import IconA from 'react-native-vector-icons/AntDesign';
import {Images} from '../../assets';
import {useNavigation} from '@react-navigation/native';
import styles from './styles';
import {getIDfromURL, detectNameFromURL} from '../../common';
import VideoPlayer from '../../component/common/video-player';
import {WEB_URL} from '../../config';
import Audio from '../../component/common/audio';

const deviceWidth = Dimensions.get('window').width;

const LearningEbook = ({route}) => {
  const dataSession = route?.params?.item;
  const ref = useRef(null);
  const [data, setData] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const navigation = useNavigation();
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

  const handleOpenFile = path => {
    if (path) {
      Linking.canOpenURL(`${WEB_URL}${path}`).then(supported => {
        if (supported) {
          Linking.openURL(`${WEB_URL}${path}`);
        } else {
          Alert.alert("Don't know how to open URI: " + `${WEB_URL}${path}`);
        }
      });
    } else {
      Alert.alert('Bạn không thể tải ebook này');
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.header1}>
          <Text style={styles.title}>Bài học</Text>
          <TouchableOpacity
            onPress={goBack}
            hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
            <Image source={Images.iconClose} style={styles.iconBack} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{marginTop: 50, paddingHorizontal: 16}}>
        <Text style={styles.subTitle}>{dataSession?.title}</Text>
        {dataSession?.path?.includes('.mp4') ? (
          <VideoPlayer
            ref={ref}
            source={{uri: `${WEB_URL}${dataSession?.path}`}}
            disableBack
            changeFullscreen={changeFullscreen}
            // style={styles.video}
          />
        ) : dataSession?.path?.includes('.mp3') ? (
          <View style={{marginTop: 8}}>
            <Audio url={`${WEB_URL}${dataSession?.path}`} />
          </View>
        ) : (
          <View>
            <TouchableOpacity
              style={{
                marginTop: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
              onPress={() => handleOpenFile(dataSession?.path)}>
              <IconA name="file1" style={styles.iconFile} />
              <Text style={styles.textFile}>
                {detectNameFromURL(dataSession?.path)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {dataSession?.description && (
          <View>
            <Text style={styles.contentTitle}>Nội dung bài học:</Text>
            <Text style={styles.description}>{dataSession?.description}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default LearningEbook;
