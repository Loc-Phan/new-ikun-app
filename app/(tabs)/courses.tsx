import { Images } from '@/assets';
import ListCourses from '@/components/ListCourses';
import SkeletonCategory from '@/components/SkeletonCategory';
import SkeletonFlatList from '@/components/SkeletonFlatList';
import Services from '@/services';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useGlobalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const hitSlop = {
  top: 5,
  bottom: 5,
  left: 5,
  right: 5,
};
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

export default function CourseScreen() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const inputSearchRef = useRef<TextInput>(null);
  const [showAnimatedSearch, setShowAnimatedSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataFilter, setDataFilter] = useState<any[]>([]);
  const [categorySelect, setCategorySelect] = useState<any[]>([]);
  const [keySearch, setKeySearch] = useState<any>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const navigation = useNavigation();

  const { idCategory }: { idCategory: string } = useGlobalSearchParams();
  const [isFetchData, setIsFetchData] = useState(true);

  // --- Fetch Categories ---
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      const categories = await Services.getCategory();
      setIsLoading(false);
      setDataFilter(categories.data?.data?.categories || []);
      setCategorySelect(idCategory ? [idCategory] : []);
    };
    fetchCategories();
  }, [idCategory]);

  // --- Fetch Courses ---
  const getData = useCallback(async () => {
    const param: any = { page };

    // if (filter === 1) param.sort = 'inexpensive';
    // if (filter === 2) param.sort = 'expensive';
    // if (filter === 3) param.sort = 'newest';
    // if (filter === 4) param.sort = 'bestsellers';
    // if (filter === 5) param.sort = 'best_rates';
    // if (filter === 0) param.sort = '';

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
    console.log('param', param);
    try {
      setIsProductLoading(true);
      const responses = await Services.course(param);
      if (responses?.data) {
        const response = responses.data?.data;
        setData(response);
      }

      setRefreshing(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsProductLoading(false);
    }
  }, [page, categorySelect, keySearch]);

  // --- Focus Listener ---
  useFocusEffect(
    useCallback(() => {
      if (isFetchData) {
        getData();
        setIsFetchData(false);
      }
    }, [getData, isFetchData]),
  );

  // --- Event Listeners ---
  useEffect(() => {
    const searchListener = DeviceEventEmitter.addListener(
      'keywordSearch',
      value => {
        setKeySearch(value);
        onRefresh();
      },
    );

    const refreshWithCateListener = DeviceEventEmitter.addListener(
      'refresh_with_category',
      async idCate => {
        setIsFetchData(false);
        setCategorySelect([idCate]);
        setRefreshing(true);
        setData([]);
        setPage(1);
        await getData();
      },
    );

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      },
    );

    return () => {
      searchListener.remove();
      refreshWithCateListener.remove();
      backHandler.remove();
    };
  }, [getData]);

  // --- Refresh ---
  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setData([]);
    await getData();
  };

  // --- Load More ---
  // const handleLoadMore = async () => {
  //   setShowFooter(true);
  //   setPage(prev => prev + 1);
  //   await getData();
  //   setShowFooter(false);
  // };

  // --- Filter Handling ---
  // const handleSetFilter = async (value: any) => {
  //   setIsShowFilter(false);
  //   setFilter(value);
  //   setData([]);
  //   onRefresh();
  // };

  const onSelectCate = async (item: any) => {
    setData([]);
    const newCategorySelect = categorySelect.includes(item.id)
      ? categorySelect.filter(x => x !== item.id)
      : [...categorySelect, item.id];

    setCategorySelect(newCategorySelect);

    // Gọi getData với giá trị mới ngay lập tức
    const param: any = { page: 1 };

    if (keySearch) {
      if (keySearch.length < 3) {
        Alert.alert('Từ khóa có ít nhất 3 kí tự');
        return;
      }
      param.title = keySearch;
    }

    if (newCategorySelect.length > 0) {
      param.categories = newCategorySelect.join(',');
    }

    console.log('param onSelectCate', param);

    try {
      setIsProductLoading(true);
      setRefreshing(true);
      const responses = await Services.course(param);
      if (responses?.data) {
        const response = responses.data?.data;
        setData(response);
      }
      setRefreshing(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsProductLoading(false);
    }
  };

  const onCloseKeywordSearch = async () => {
    setData([]);
    setKeySearch(null);
    onRefresh();
  };

  const onAnimatedSearch = () => {
    setShowAnimatedSearch(true);
    setTimeout(() => {
      inputSearchRef.current?.focus();
    }, 200);
  };

  const renderItemFilter = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => onSelectCate(item)}
      style={{
        height: 30,
        paddingHorizontal: 19,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: categorySelect.includes(item.id) ? '#1180C3' : '#fff',
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

  const refreshScreen = () => (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      progressViewOffset={30}
    />
  );

  const onCloseSearch = async () => {
    if (isLoading || refreshing) return;
    setShowAnimatedSearch(false);
    setKeySearch('');
    setData([]);
    setPage(1);
    await getData();
  };

  const onSearch = async () => {
    if (isLoading || refreshing) return;
    setData([]);
    setPage(1);
    await getData();
  };

  // --- Render ---
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        {showAnimatedSearch ? (
          <View style={styles.viewInput}>
            <TouchableOpacity
              hitSlop={hitSlop}
              style={{ marginRight: 16 }}
              onPress={onCloseSearch}
            >
              <MaterialIcons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <TextInput
              style={styles.inputSearch}
              ref={inputSearchRef}
              value={keySearch}
              onChangeText={setKeySearch}
              onSubmitEditing={onSearch}
              returnKeyType="search"
              placeholder="Tìm kiếm khóa học..."
            />
            <TouchableOpacity
              hitSlop={hitSlop}
              onPress={onSearch}
              disabled={isLoading || refreshing}
            >
              <MaterialIcons name="search" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.header1}>
            <Text style={styles.title}>Khóa học của tôi</Text>
            <TouchableOpacity
              style={styles.viewSearch}
              onPress={onAnimatedSearch}
            >
              <Image source={Images.iconSearch} style={styles.iconSearch} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View
        style={{
          marginTop: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: 16,
          alignItems: 'center',
        }}
      >
        {/* <TouchableOpacity
          onPress={() => setIsShowFilter(!isShowFilter)}
          style={styles.viewFilter}
        >
          {filter === 3 && <Text style={styles.txtFilter}>Mới nhất</Text>}
          {filter === 4 && <Text style={styles.txtFilter}>Nổi bật</Text>}
          {filter === 5 && <Text style={styles.txtFilter}>Đánh giá</Text>}
          {filter === 0 && (
            <Text style={styles.txtFilter}>Lọc</Text>
          )}
          <MaterialIcons name="keyboard-arrow-down" color="#C5C5C5" size={24} />
        </TouchableOpacity> */}
      </View>

      {/* Categories */}
      {!isLoading && (
        <View style={{ marginTop: 20, marginHorizontal: 16 }}>
          <FlatList
            showsHorizontalScrollIndicator={false}
            horizontal
            data={dataFilter}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItemFilter}
          />
        </View>
      )}
      {isLoading && <SkeletonCategory />}
      {isProductLoading ? (
        <SkeletonFlatList layout="column" items={5} />
      ) : (
        <ListCourses
          data={data}
          extraData={{ categorySelect }}
          style={{ marginTop: 20 }}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshScreen={refreshScreen()}
          // nextPage={handleLoadMore}
          refreshing={refreshing}
        />
      )}
      {/* {!isProductLoading && data.length === 0 && (
        <Text
          style={[styles.txtFilterItem, { alignSelf: 'center', marginTop: 50 }]}
        >
          Không có dữ liệu
        </Text>
      )} */}

      {/* {isShowFilter && (
        <TouchableWithoutFeedback onPress={() => setIsShowFilter(false)}>
          <View style={styles.viewUpdateRole}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.viewModalFilter,
                  { right: -deviceWidth + 127 + 16, top: 150 },
                ]}>
                <TouchableOpacity onPress={() => handleSetFilter(0)}>
                  <Text
                    style={[
                      styles.txtFilterItem,
                      filter === 0 && { color: '#000' },
                    ]}>
                    Mặc định
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleSetFilter(3)}>
                  <Text
                    style={[
                      styles.txtFilterItem,
                      filter === 3 && { color: '#000' },
                    ]}>
                    Mới nhất
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleSetFilter(4)}>
                  <Text
                    style={[
                      styles.txtFilterItem,
                      filter === 4 && { color: '#000' },
                    ]}>
                    Nổi bật
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleSetFilter(5)}>
                  <Text
                    style={[
                      styles.txtFilterItem,
                      filter === 5 && { color: '#000' },
                    ]}>
                    Đánh giá
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )} */}
    </SafeAreaView>
  );
}

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
    // justifyContent: 'space-between',
  },
  viewInput: {
    borderRadius: 12,
    width: deviceWidth - 32,
    height: 48,
    paddingVertical: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  inputSearch: {
    flex: 1,
    marginRight: 8,
    fontSize: 14,
    color: '#000',
  },
  iconBack: {
    height: 14,
    width: 14,
    resizeMode: 'contain',
    tintColor: '#000',
  },
  imgBanner: {
    width: (276 / 375) * deviceWidth,
    height: (209 / 375) * deviceWidth,
    resizeMode: 'contain',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: -1,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    lineHeight: 36,
    flex: 1,
    textAlign: 'center',
  },
  viewSearch: {
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 0,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },

  iconSearch: {
    height: 14,
    width: 14,
    resizeMode: 'contain',
    tintColor: '#000',
  },
  viewFilter: {
    backgroundColor: '#fff',
    // width: 64,
    height: 24,
    paddingHorizontal: 16,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  txtFilter: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    lineHeight: 15,
    marginRight: 4,
  },
  viewUpdateRole: {
    zIndex: 1000,
    flex: 1,
    position: 'absolute',
    // backgroundColor: 'rgba(0,0,0,0.5)',
    width: deviceWidth,
    height: deviceHeight,
  },
  viewModalFilter: {
    width: 127,
    // height: 131,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 6,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  txtFilterItem: {
    paddingBottom: 10,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#A9A9A9',
  },
  txtSearch: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#939393',
    flex: 1,
  },
  txtItemFilter: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#858585',
  },
});
