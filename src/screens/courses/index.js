import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  BackHandler,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import { ListCourses } from '../../component/list';
import { NewClient } from '../../api';
import { Images } from '../../assets';
import IconI from 'react-native-vector-icons/Ionicons';
import styles from './styles';

const hitSlop = {
  top: 5,
  bottom: 5,
  left: 5,
  right: 5,
};
const deviceWidth = Dimensions.get('window').width;

class Courses extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowFilter: false,
      page: 1,
      data: [],
      filter: 0,
      isLoading: true,
      dataFilter: [],
      categorySelect: [],
      keySearch: undefined,
      isLoadMore: true,
    };
    this.isFetchData = true;
    this.eventListener = null;
    this.backHandler = null;
  }

  async componentDidMount() {
    const categories = await NewClient.getCategory();
    const { navigation, route } = this.props;
    const idCategory = route.params?.idCategory;

    await this.setState({
      dataFilter: categories?.data?.categories,
      categorySelect: [idCategory],
    });

    this.focusListener = navigation.addListener('focus', async () => {
      if (this.isFetchData) {
        await this.getData();
      }
      this.isFetchData = false;
    });
    // await this.getData();
    this.eventListener = DeviceEventEmitter.addListener(
      'keywordSearch',
      this.updateKeywordSearch,
    );
    DeviceEventEmitter.addListener(
      'refresh_with_category',
      this.refreshWithCate,
    );
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
  }

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener();
    }
    if (this.eventListener) {
      this.eventListener.remove();
    }
    if (this.backHandler) {
      this.backHandler.remove();
    }
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

  refreshWithCate = async idCate => {
    this.isFetchData = false;
    await this.setState({
      categorySelect: [idCate],
      refreshing: true,
      data: [],
      page: 1,
    });
    await this.getData();
  };

  updateKeywordSearch = async value => {
    await this.setState({ keySearch: value });
    this.onRefresh();
  };

  async getData() {
    const { page, categorySelect, keySearch, filter } = this.state;

    const param = {
      page,
    };
    if (filter === 1) {
      param.sort = 'inexpensive';
    }
    if (filter === 2) {
      param.sort = 'expensive';
    }
    if (filter === 3) {
      param.sort = 'newest';
    }
    if (filter === 4) {
      param.sort = 'bestsellers';
    }
    if (filter === 5) {
      param.sort = 'best_rates';
    }
    if (filter === 0) {
      param.sort = '';
    }
    if (keySearch) {
      if (keySearch.length < 3) {
        Alert.alert('Từ khóa có ít nhất 3 kí tự');
        return;
      }
      param.title = keySearch;
    }
    if (categorySelect.length > 0) {
      param.categories = categorySelect;
    }
    const responses = await NewClient.course(param);
    if (responses?.data) {
      const response = responses.data;
      const newData = [];
      for (let i = 0; i < response.length; i += 1) {
        const element = response[i];

        if (
          this.state.data.length === 0 ||
          this.state.data.find(x => x.id !== element.id)
        ) {
          newData.push(element);
        }
      }
      this.setState({
        data: page === 1 ? newData : this.state.data.concat(newData),
        refreshing: false,
        isLoading: false,
        isLoadMore: response.length === 10,
      });
    } else {
      this.setState({
        refreshing: false,
        isLoading: false,
      });
    }
  }

  showFilter = () => {
    const { isShowFilter } = this.state;
    this.setState({ isShowFilter: !isShowFilter });
  };

  async setFilter(value) {
    await this.setState({
      isShowFilter: false,
      filter: value,
      data: [],
    });

    this.onRefresh();
  }

  onSelectCate = async item => {
    const { categorySelect } = this.state;
    if (categorySelect.includes(item.id)) {
      await this.setState({
        data: [],
        categorySelect: categorySelect.filter(x => x !== item.id),
        isLoading: true,
      });
    } else {
      await this.setState({
        data: [],
        categorySelect: [...categorySelect, item.id],
        isLoading: true,
      });
    }

    await this.onRefresh();
  };

  onAnimatedSearch = () => {
    setTimeout(() => {
      this.inputSearch.focus();
    }, 200);
  };

  renderItemFilter = ({ item }) => {
    const { categorySelect } = this.state;
    return (
      <TouchableOpacity
        onPress={() => this.onSelectCate(item)}
        style={{
          height: 30,
          paddingHorizontal: 19,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: categorySelect.includes(item.id) ? '#000' : '#fff',
          borderRadius: 60,
          borderWidth: 1,
          borderColor: '#EBEBEB',
          marginRight: 10,
        }}
      >
        <Text
          style={[
            styles.txtItemFilter,
            { color: categorySelect.includes(item.id) ? '#fff' : '#858585' },
          ]}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  handleLoadMore = async () => {
    const { page, isLoadMore } = this.state;
    if (!isLoadMore) {
      return;
    }
    await this.setState({
      showFooter: true,
      page: page + 1,
    });
    await this.getData();
    await this.setState({ showFooter: false });
  };

  onRefresh = async () => {
    try {
      await this.setState({
        refreshing: true,
        data: [],
        page: 1,
      });
      await this.getData();
      await this.setState({
        refreshing: false,
      });
    } catch (e) {
      console.log(e);
    }
  };

  refreshScreen() {
    const { refreshing } = this.state;

    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={this.onRefresh}
        progressViewOffset={30}
      />
    );
  }

  onCloseKeywordSearch = async () => {
    await this.setState({
      data: [],
      keySearch: null,
    });

    this.onRefresh();
  };

  render() {
    const {
      refreshing,
      showFooter,
      data,
      filter,
      isShowFilter,
      isLoading,
      dataFilter,
      keySearch,
    } = this.state;
    const { t, navigation } = this.props;
    return (
      <View style={styles.container}>
        {/* <Image source={Images.bannerMyCourse} style={styles.imgBanner} /> */}
        <View style={styles.header}>
          <View style={styles.header1}>
            <Text style={styles.title}>{t('courses.title')}</Text>
            <TouchableOpacity
              style={styles.viewSearch}
              onPress={() =>
                navigation.navigate('CoursesSearchScreen', {
                  keySearch,
                })
              }
            >
              <Image source={Images.iconSearch} style={styles.iconSearch} />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            marginTop: 26,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginHorizontal: 16,
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            {keySearch && (
              <>
                <Text numberOfLines={1} style={styles.txtSearch}>
                  {t('courses.searching', { keySearch })}
                </Text>
                <TouchableOpacity
                  style={{ marginLeft: 6 }}
                  hitSlop={hitSlop}
                  onPress={this.onCloseKeywordSearch}
                >
                  <IconI name="close" size={20} />
                </TouchableOpacity>
              </>
            )}
          </View>
          <View>
            <TouchableOpacity
              onPress={this.showFilter}
              style={styles.viewFilter}
            >
              {/* {filter === 1 && (
                <Text style={styles.txtFilter}>Giá tăng dần</Text>
              )} */}
              {/* {filter === 2 && (
                <Text style={styles.txtFilter}>Giá giảm dần</Text>
              )} */}
              {filter === 3 && <Text style={styles.txtFilter}>Mới nhất</Text>}
              {filter === 4 && <Text style={styles.txtFilter}>Nổi bật</Text>}
              {filter === 5 && <Text style={styles.txtFilter}>Đánh giá</Text>}
              {filter === 0 && (
                <Text style={styles.txtFilter}>
                  {t('courses.filters.filter')}
                </Text>
              )}
              <IconI name="ios-caret-down" color="#C5C5C5" size={8} />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            marginTop: 26,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginHorizontal: 16,
            alignItems: 'center',
          }}
        >
          <FlatList
            showsHorizontalScrollIndicator={false}
            horizontal
            data={dataFilter}
            keyExtractor={item => item.id}
            renderItem={this.renderItemFilter}
          />
        </View>
        {isLoading && (
          <View style={{ marginTop: 50 }}>
            <ActivityIndicator size="small" />
          </View>
        )}
        {!isLoading && !refreshing && data.length === 0 && (
          <Text
            style={[
              styles.txtFilterItem,
              { alignSelf: 'center', marginTop: 50 },
            ]}
          >
            {t('dataNotFound')}
          </Text>
        )}
        <ListCourses
          navigation={navigation}
          data={data}
          extraData={this.state}
          style={{ marginTop: 20 }}
          contentContainerStyle={{ paddingBottom: 150 }}
          refreshScreen={this.refreshScreen()}
          nextPage={this.handleLoadMore}
          refreshing={refreshing}
          showFooter={showFooter}
        />
        {isShowFilter && (
          <TouchableWithoutFeedback
            onPress={() => {
              this.setState({ isShowFilter: false });
            }}
          >
            <View style={[styles.viewUpdateRole, {}]}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.viewModalFilter,
                    { right: -deviceWidth + 127 + 16, top: 150 },
                  ]}
                >
                  <TouchableOpacity onPress={() => this.setFilter(0)}>
                    <Text
                      style={[
                        styles.txtFilterItem,
                        filter === 0 && { color: '#000' },
                      ]}
                    >
                      {t('courses.filters.default')}
                    </Text>
                  </TouchableOpacity>
                  {/* <TouchableOpacity onPress={() => this.setFilter(1)}>
                    <Text
                      style={[
                        styles.txtFilterItem,
                        filter === 1 && {color: '#000'},
                      ]}>
                      Giá tăng dần
                    </Text>
                  </TouchableOpacity> */}
                  {/* <TouchableOpacity onPress={() => this.setFilter(2)}>
                    <Text
                      style={[
                        styles.txtFilterItem,
                        filter === 2 && {color: '#000'},
                      ]}>
                      Giá giảm dần
                    </Text>
                  </TouchableOpacity> */}
                  <TouchableOpacity onPress={() => this.setFilter(3)}>
                    <Text
                      style={[
                        styles.txtFilterItem,
                        filter === 3 && { color: '#000' },
                      ]}
                    >
                      Mới nhất
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.setFilter(4)}>
                    <Text
                      style={[
                        styles.txtFilterItem,
                        filter === 4 && { color: '#000' },
                      ]}
                    >
                      Nổi bật
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.setFilter(5)}>
                    <Text
                      style={[
                        styles.txtFilterItem,
                        filter === 5 && { color: '#000' },
                      ]}
                    >
                      Đánh giá
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    );
  }
}
export default Courses;
