import React, { PureComponent } from 'react';
import {
  DeviceEventEmitter,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Images } from '../../assets';
import { connect } from 'react-redux';
import {
  PopularCourses,
  LearnToday,
  PopularEbook,
  Review,
} from '../../component';
import { NewClient } from '../../api';
import { WEB_URL } from '../../config';
import styles from './styles';
import SkeletonFlatList from '../../component/common/skeleton/flatlist';
import SkeletonCategory from '../../component/common/skeleton/category';
import RenderDataHTML from '../../component/common';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconM from 'react-native-vector-icons/MaterialIcons';

class Home extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      newEbook: [],
      popularEbook: [],
      dataNewCourse: [],
      dataCate: [],
      topCourseWithStudent: [],
      reviews: [],
      ebookReviews: [],
      loading1: true,
      loading2: true,
      loading3: true,
      loading4: true,
      loading5: true,
      loading6: true,
      loading7: true,
      advertising: [],
    };

    this.eventListener = null;
  }

  async componentDidMount() {
    this.eventListener = DeviceEventEmitter.addListener(
      'refresh_overview',
      this.refreshOverview,
    );
    this.onGetData();
  }

  componentWillUnmount() {
    if (this.eventListener) {
      this.eventListener.remove();
    }
  }

  async onGetData() {
    NewClient.getAdvertising().then(response => {
      this.setState({
        advertising: response?.data?.advertising_banners,
      });
    });
    NewClient.topCoursesWithStudent({ limit: 4 }).then(response => {
      this.setState({
        topCourseWithStudent: response?.data,
        loading2: false,
      });
    });
    NewClient.course({ sort: 'newest', limit: 4 }).then(response => {
      this.setState({
        dataNewCourse: response?.data,
        loading3: false,
      });
    });
    NewClient.getCategory().then(response => {
      // console.log(response?.data?.categories);
      this.setState({
        dataCate: response?.data?.categories,
        loading1: false,
      });
    });
    NewClient.getEbooks({ sort: 'newest', limit: 4 }).then(response => {
      this.setState({
        newEbook: response?.data?.products,
        loading4: false,
      });
    });
    NewClient.getFeaturedEbooks({ limit: 4 }).then(response => {
      this.setState({
        popularEbook: response?.data?.products,
        loading5: false,
      });
    });
    NewClient.getReviews({ limit: 5 }).then(response => {
      this.setState({
        reviews: response?.data?.reviews,
        loading6: false,
      });
    });
    NewClient.getEbookReviews({ limit: 5 }).then(response => {
      console.log(response.data);
      const formatResponse = response?.data?.map(item => ({
        id: item.id,
        ebookId: item.product_id,
        name: item.user.full_name,
        avatar: item.user.avatar,
        description: item?.description,
        content: item.content,
        rate: item.rate,
        course_title: item.product_title,
        created_at: item.created_at,
        user: {
          name: item.user.full_name,
        },
        type: 'ebook',
      }));
      this.setState({
        ebookReviews: formatResponse,
        loading7: false,
      });
    });
  }

  onBack = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  onRefresh = async () => {
    this.setState({
      refreshing: true,
      loading1: true,
      loading2: true,
      loading3: true,
      loading4: true,
      loading5: true,
    });
    await this.onGetData();
    this.setState({ refreshing: false });
  };

  openAdvertising = url => {
    Linking.canOpenURL(`${WEB_URL}${url}`).then(supported => {
      Linking.openURL(`${WEB_URL}${url}`);
    });
  };

  navigateTotal = type => {
    const { navigation } = this.props;
    if (type === 'course') {
      navigation.navigate('Courses');
      return;
    }
    navigation.navigate('Ebook');
  };

  render() {
    const {
      // dataInstructor,
      topCourseWithStudent,
      dataNewCourse,
      dataCate,
      refreshing,
      advertising,
      newEbook,
      popularEbook,
      reviews,
      ebookReviews,
      loading1,
      loading2,
      loading3,
      loading4,
      loading5,
      loading6,
    } = this.state;

    const { t, navigation, user } = this.props;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.container}>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={this.onRefresh}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 150 }}
          >
            <View
              style={[
                styles.header,
                { flexDirection: 'row', justifyContent: 'flex-end' },
              ]}
            >
              {!user?.token && (
                <View style={[styles.loginRegister]}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('LoginScreen')}
                  >
                    <Text style={styles.loginRegisterText}>{t('login')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {user?.token && (
              <View
                style={{
                  paddingHorizontal: 16,
                  marginTop: 16,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
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
                    onPress={() => navigation.navigate('ProfileScreen')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Image
                      source={Images.iconProfile}
                      style={styles.iconHeader}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('NotificationsScreen')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Image
                      source={Images.iconNotification}
                      style={styles.iconHeader}
                    />
                  </TouchableOpacity>
                  {/* <TouchableOpacity
                  onPress={() => navigation.navigate('NotificationsScreen')}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Image source={Images.iconCart} style={styles.iconHeader} />
                </TouchableOpacity> */}
                </View>
              </View>
            )}

            <View style={styles.viewList}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <RenderDataHTML
                  html={t('home.category')}
                  style={styles.titleCate}
                />
              </View>
              {advertising?.length > 0 ? (
                <TouchableOpacity
                  onPress={() => this.openAdvertising(advertising[0]?.link)}
                >
                  <Image
                    source={{ uri: advertising[0]?.image }}
                    style={styles.bannerImage}
                  />
                </TouchableOpacity>
              ) : null}
              {dataCate && dataCate.length > 0 && (
                <LearnToday
                  navigation={navigation}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                  data={dataCate}
                  horizontal
                />
              )}
              {loading1 && <SkeletonCategory />}
            </View>

            {topCourseWithStudent && topCourseWithStudent.length > 0 && (
              <View style={[styles.viewList, { marginTop: 8 }]}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alginItems: 'center',
                    marginHorizontal: 16,
                    marginBottom: 8,
                  }}
                >
                  <Text style={styles.titleList}>{t('home.popular')}</Text>
                  <TouchableOpacity
                    style={{
                      displayd: 'flex',
                      flexDirection: 'row',
                      alginItems: 'center',
                      gap: 4,
                      marginTop: 4,
                    }}
                    onPress={() => this.navigateTotal('course')}
                  >
                    <Text>Tất cả</Text>
                    <IconM
                      name="keyboard-arrow-right"
                      style={{ fontSize: 16 }}
                    />
                  </TouchableOpacity>
                </View>
                <PopularCourses
                  navigation={navigation}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                  data={topCourseWithStudent}
                  horizontal
                />
              </View>
            )}
            {loading2 && (
              <View style={[styles.viewList]}>
                <Text style={styles.titleList}>{t('home.popular')}</Text>
                <SkeletonFlatList />
              </View>
            )}
            {dataNewCourse && dataNewCourse.length > 0 && (
              <View style={[styles.viewList, { marginTop: 16 }]}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alginItems: 'center',
                    marginHorizontal: 16,
                    marginBottom: 8,
                  }}
                >
                  <Text style={styles.titleList}>{t('home.new')}</Text>
                  <TouchableOpacity
                    style={{
                      displayd: 'flex',
                      flexDirection: 'row',
                      alginItems: 'center',
                      gap: 4,
                      marginTop: 4,
                    }}
                    onPress={() => this.navigateTotal('course')}
                  >
                    <Text>Tất cả</Text>
                    <IconM
                      name="keyboard-arrow-right"
                      style={{ fontSize: 16 }}
                    />
                  </TouchableOpacity>
                </View>
                <PopularCourses
                  navigation={navigation}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                  data={dataNewCourse}
                  horizontal
                />
              </View>
            )}
            {loading3 && (
              <View style={styles.viewList}>
                <Text style={styles.titleList}>{t('home.new')}</Text>
                <SkeletonFlatList />
              </View>
            )}
            {popularEbook && popularEbook.length > 0 && (
              <View style={[styles.viewList, { marginTop: 16 }]}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alginItems: 'center',
                    marginHorizontal: 16,
                    marginBottom: 8,
                  }}
                >
                  <Text style={styles.titleList}>Ebook nổi bật</Text>
                  <TouchableOpacity
                    style={{
                      displayd: 'flex',
                      flexDirection: 'row',
                      alginItems: 'center',
                      gap: 4,
                      marginTop: 4,
                    }}
                    onPress={() => this.navigateTotal('ebook')}
                  >
                    <Text>Tất cả</Text>
                    <IconM
                      name="keyboard-arrow-right"
                      style={{ fontSize: 16 }}
                    />
                  </TouchableOpacity>
                </View>
                <PopularEbook
                  navigation={navigation}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                  data={popularEbook}
                  horizontal
                />
              </View>
            )}
            {loading5 && (
              <View style={styles.viewList}>
                <Text style={styles.titleList}>Ebook nổi bật</Text>
                <SkeletonFlatList />
              </View>
            )}
            {newEbook && newEbook.length > 0 && (
              <View style={[styles.viewList, { marginTop: 16 }]}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alginItems: 'center',
                    marginHorizontal: 16,
                    marginBottom: 8,
                  }}
                >
                  <Text style={styles.titleList}>Ebook mới</Text>
                  <TouchableOpacity
                    style={{
                      displayd: 'flex',
                      flexDirection: 'row',
                      alginItems: 'center',
                      gap: 4,
                      marginTop: 4,
                    }}
                    onPress={() => this.navigateTotal('ebook')}
                  >
                    <Text>Tất cả</Text>
                    <IconM
                      name="keyboard-arrow-right"
                      style={{ fontSize: 16 }}
                    />
                  </TouchableOpacity>
                </View>
                <PopularEbook
                  navigation={navigation}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                  data={newEbook}
                  horizontal
                />
              </View>
            )}
            {loading4 && (
              <View style={styles.viewList}>
                <Text style={styles.titleList}>Ebook mới</Text>
                <SkeletonFlatList />
              </View>
            )}
            {reviews && reviews.length > 0 && (
              <View style={[styles.viewList, { margin: 16 }]}>
                <Text style={styles.titleList}>Đánh giá</Text>
                <Review navigation={navigation} data={reviews} horizontal />
              </View>
            )}
            {ebookReviews && ebookReviews.length > 0 && (
              <View style={[styles.viewList, { margin: 16 }]}>
                <Review
                  navigation={navigation}
                  data={ebookReviews}
                  horizontal
                />
              </View>
            )}
            {loading6 && (
              <View style={styles.viewList}>
                <Text style={styles.titleList}>Đánh giá</Text>
                <SkeletonFlatList />
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}
const mapStateToProps = ({ user }) => ({
  user,
});
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(Home);
