import { Images } from '@/assets';
import LearnToday from '@/components/LearnToday';
import PopularCourses from '@/components/PopularCourses';
import PopularEbook from '@/components/PopularEbook';
import RenderDataHTML from '@/components/RenderDataHTML';
import Review from '@/components/Review';
import SkeletonCategory from '@/components/SkeletonCategory';
import SkeletonFlatList from '@/components/SkeletonFlatList';
import { WEB_URL } from '@/constants';
import Services from '@/services';
import { RootState } from '@/store';
import { getStatusBarHeight } from '@/utils';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  Dimensions,
  Image,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [advertising, setAdvertising] = useState<any>([]);
  const [topCourseWithStudent, setTopCourseWithStudent] = useState<any>([]);
  const [dataNewCourse, setDataNewCourse] = useState<any>([]);
  const [dataCate, setDataCate] = useState<any>([]);
  const [newEbook, setNewEbook] = useState<any>([]);
  const [popularEbook, setPopularEbook] = useState<any>([]);
  const [reviews, setReviews] = useState<any>([]);

  const [loadingAdvertising, setLoadingAdvertising] = useState(true);
  const [loadingTopCourses, setLoadingTopCourses] = useState(true);
  const [loadingNewCourses, setLoadingNewCourses] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingEbooks, setLoadingEbooks] = useState(true);
  const [loadingFeaturedEbooks, setLoadingFeaturedEbooks] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const onGetData = useCallback(async () => {
    setLoadingAdvertising(true);
    setLoadingTopCourses(true);
    setLoadingNewCourses(true);
    setLoadingCategories(true);
    setLoadingEbooks(true);
    setLoadingFeaturedEbooks(true);
    setLoadingReviews(true);

    try {
      const safeFetch = async (
        fn: () => Promise<any>,
        defaultValue: any = [],
      ) => {
        try {
          const res = await fn();
          return res?.data?.data || defaultValue;
        } catch (error) {
          console.log('Fetch error:', fn.name, error);
          return defaultValue;
        }
      };

      const [
        advertisingData,
        topCourseData,
        newCourseData,
        cateData,
        newEbookData,
        featuredEbookData,
        reviewsData,
      ] = await Promise.all([
        safeFetch(Services.getAdvertising),
        safeFetch(() => Services.topCoursesWithStudent({ limit: 4 })),
        safeFetch(() => Services.course({ sort: 'newest', limit: 4 })),
        safeFetch(Services.getCategory),
        safeFetch(() => Services.getEbooks({ sort: 'newest', limit: 4 })),
        safeFetch(() => Services.getFeaturedEbooks({ limit: 4 })),
        safeFetch(() => Services.getReviews({ limit: 5 })),
      ]);

      setAdvertising(advertisingData?.advertising_banners || []);
      setTopCourseWithStudent(topCourseData || []);
      setDataNewCourse(newCourseData || []);
      setDataCate(cateData?.categories || []);
      setNewEbook(newEbookData?.products || []);
      setPopularEbook(featuredEbookData?.products || []);
      setReviews(reviewsData?.reviews || []);
    } catch (error) {
      console.log('Unexpected error in onGetData:', error);
    } finally {
      setLoadingAdvertising(false);
      setLoadingTopCourses(false);
      setLoadingNewCourses(false);
      setLoadingCategories(false);
      setLoadingEbooks(false);
      setLoadingFeaturedEbooks(false);
      setLoadingReviews(false);
      setRefreshing(false);
    }
  }, []);

  // ⚙️ Component did mount
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(
      'refresh_overview',
      onGetData,
    );
    onGetData();
    return () => listener.remove();
  }, [onGetData]);

  // 🔁 Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await onGetData();
  };

  // 🌐 Open advertising link
  const openAdvertising = (url: string) => {
    const fullUrl = `${WEB_URL}${url}`;
    Linking.canOpenURL(fullUrl).then(() => Linking.openURL(fullUrl));
  };

  // 📚 Navigate
  const navigateTotal = (type: 'course' | 'ebook') => {
    // navigation.navigate(type === 'course' ? 'Courses' : 'Ebook');
  };

  // 🧱 Render UI
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { flexDirection: 'row', justifyContent: 'flex-end' },
            ]}
          >
            {!user?.token && (
              <View style={styles.loginRegister}>
                <TouchableOpacity
                // onPress={() => navigation.navigate('LoginScreen')}
                >
                  <Text style={styles.loginRegisterText}>Đăng nhập</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* User Info */}
          {user?.token && (
            <View
              style={{
                paddingHorizontal: 16,
                marginTop: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  style={styles.avatar}
                  source={{
                    uri:
                      user?.info?.avatar ||
                      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMjCj43UJiVu-3Qp9b5yj-SwLGR-kndCzqLaiMv5SMkITd4CcbQQ7vX_CEZd-xxqka8ZM&usqp=CAU',
                  }}
                />
                <View style={{ marginLeft: 15 }}>
                  <Text style={styles.fullname}>{user?.info?.full_name}</Text>
                  <Text style={styles.email}>{user?.info?.email}</Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 16,
                  alignItems: 'flex-end',
                }}
              >
                <TouchableOpacity
                // onPress={() => navigation.navigate('ProfileScreen')}
                >
                  <Image
                    source={Images.iconProfile}
                    style={styles.iconHeader}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                // onPress={() => navigation.navigate('NotificationsScreen')}
                >
                  <Image
                    source={Images.iconNotification}
                    style={styles.iconHeader}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Category & Banner */}
          <View style={styles.viewList}>
            <RenderDataHTML
              html="<p>Xin chào, hôm nay bạn <br /><span style='color:#F1673A'>sẽ học</span> gì?</p>"
              style={styles.titleCate}
            />
            {advertising?.length > 0 && (
              <TouchableOpacity
                onPress={() => openAdvertising(advertising[0]?.link)}
              >
                <Image
                  source={{ uri: advertising[0]?.image }}
                  style={styles.bannerImage}
                />
              </TouchableOpacity>
            )}
            {dataCate.length > 0 && (
              <LearnToday
                data={dataCate}
                horizontal
                contentContainerStyle={{ paddingHorizontal: 16 }}
              />
            )}
            {loadingCategories && <SkeletonCategory />}
          </View>

          {/* Courses */}
          {topCourseWithStudent.length > 0 && (
            <View style={[styles.viewList, { marginTop: 8 }]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.titleList}>Khoá học nổi bật</Text>
                <TouchableOpacity
                  style={styles.seeMore}
                  onPress={() => navigateTotal('course')}
                >
                  <Text>Tất cả</Text>
                  <MaterialIcons name="arrow-right" size={24} color="black" />
                </TouchableOpacity>
              </View>
              <PopularCourses
                data={topCourseWithStudent}
                horizontal
                contentContainerStyle={{ paddingHorizontal: 16 }}
              />
            </View>
          )}
          {loadingTopCourses && <SkeletonFlatList />}

          {dataNewCourse.length > 0 && (
            <View style={[styles.viewList, { marginTop: 16 }]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.titleList}>Khoá học mới</Text>
                <TouchableOpacity
                  style={styles.seeMore}
                  onPress={() => navigateTotal('course')}
                >
                  <Text>Tất cả</Text>
                  <MaterialIcons name="arrow-right" size={24} color="black" />
                </TouchableOpacity>
              </View>
              <PopularCourses
                data={dataNewCourse}
                horizontal
                contentContainerStyle={{ paddingHorizontal: 16 }}
              />
            </View>
          )}
          {loadingNewCourses && <SkeletonFlatList />}

          {/* Ebooks */}
          {popularEbook.length > 0 && (
            <View style={[styles.viewList, { marginTop: 16 }]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.titleList}>Ebook nổi bật</Text>
                <TouchableOpacity
                  style={styles.seeMore}
                  onPress={() => navigation.navigate('ebook')}
                >
                  <Text>Tất cả</Text>
                  <MaterialIcons name="arrow-right" size={24} color="black" />
                </TouchableOpacity>
              </View>
              <PopularEbook
                data={popularEbook}
                horizontal
                contentContainerStyle={{ paddingHorizontal: 16 }}
              />
            </View>
          )}
          {loadingFeaturedEbooks && <SkeletonFlatList />}

          {newEbook.length > 0 && (
            <View style={[styles.viewList, { marginTop: 16 }]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.titleList}>Ebook mới</Text>
                <TouchableOpacity
                  style={styles.seeMore}
                  onPress={() => navigation.navigate('ebook')}
                >
                  <Text>Tất cả</Text>
                  <MaterialIcons name="arrow-right" size={24} color="black" />
                </TouchableOpacity>
              </View>
              <PopularEbook
                data={newEbook}
                horizontal
                contentContainerStyle={{ paddingHorizontal: 16 }}
              />
            </View>
          )}
          {loadingEbooks && <SkeletonFlatList />}

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={[styles.viewList, { margin: 16 }]}>
              <Text style={styles.titleList}>Đánh giá</Text>
              <Review data={reviews} horizontal />
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: Platform.OS !== 'ios' ? getStatusBarHeight() : 0,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? getStatusBarHeight() : 0,
    marginTop: Platform.OS === 'ios' ? 0 : 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imgBanner: {
    width: deviceWidth,
    height: (198 / 375) * deviceWidth,
    resizeMode: 'contain',
    position: 'absolute',
    top: -20,
    zIndex: -1,
  },
  iconHome: {
    width: 110,
    height: 72,
    resizeMode: 'contain',
  },
  iconHeader: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    // marginLeft: 10,
  },
  imgBottom: {
    width: deviceWidth,
    height: (440 / 1500) * deviceWidth,
    resizeMode: 'contain',
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  textBottom: {
    marginTop: 40,
    fontSize: 14,
    color: '#fff',
  },
  logo: {
    height: (98 / 375) * deviceWidth,
    width: (73 / 375) * deviceWidth,
    resizeMode: 'contain',
    // position: "absolute",
  },
  viewLogo: {
    alignSelf: 'center',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
  },
  containerImg: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  text: {
    fontSize: 15,
    color: '#000',
  },
  textInput: {
    flex: 1,
    color: '#000',
    backgroundColor: '#F3F3F3',
    height: 45,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 15,
    fontSize: 14,
  },
  button: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 1,
    top: deviceHeight / 2 - 20,
  },
  nextButton: {
    height: (264 / 375) * deviceWidth,
    width: (264 / 375) * deviceWidth,
    resizeMode: 'contain',
  },
  iconBack: {
    height: 22,
    width: 22,
    resizeMode: 'contain',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  fullname: {
    fontSize: 16,
    color: '#0B2337',
    lineHeight: 24,
  },
  email: {
    fontSize: 12,
    color: '#0B2337',
    lineHeight: 20,
  },
  overview: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 24,
    backgroundColor: '#fff',
    marginTop: 25,
    marginHorizontal: 16,
    // width: deviceWidth - 32,
    // height: isIos ? (260 / 375) * deviceWidth : (260 / 375) * deviceWidth + 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  overTitle: {
    fontSize: 14,
    color: '#000',
    lineHeight: 21,
  },
  viewItem: {
    flexDirection: 'row',
    marginBottom: 22,
    alignItems: 'center',
  },
  iconItem: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 13,
  },
  txtItem: {
    fontWeight: '500',
    fontSize: 10,
  },
  line: {
    marginTop: 4,
    width: (150 / 375) * deviceWidth,
    height: 6,
    borderColor: '#000',
    borderWidth: 1,
  },
  progress: {
    height: 4,
  },
  bannerImage: {
    width: deviceWidth,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  txt1: {
    fontSize: 12,
    lineHeight: 18,
    color: '#929292',
  },
  viewList: {
    // paddingHorizontal: 16,
  },
  titleCate: {
    fontSize: 24,
    lineHeight: 32,
    color: '#040303',
    fontWeight: '500',
    marginLeft: 16,
    marginTop: 16,
  },
  titleList: {
    fontSize: 18,
    lineHeight: 28,
    color: '#040303',
    fontWeight: '500',
    // borderLeftColor: '#EF4F5A',
    // borderLeftWidth: 3,
    flex: 1,
  },
  txtAllSource: {
    fontSize: 13,
    lineHeight: 19,
    color: '#929292',
    fontWeight: '300',
    textDecorationLine: 'underline',
  },
  loginRegister: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  loginRegisterText: {
    fontSize: 14,
  },
  loginRegisterIcon: {
    color: '#000',
    fontWeight: '500',
    marginHorizontal: 5,
  },
  sectionHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  seeMore: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
