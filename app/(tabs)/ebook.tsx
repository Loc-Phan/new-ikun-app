import { Images } from '@/assets';
import ListEbook from '@/components/ListEbook';
import SkeletonCategory from '@/components/SkeletonCategory';
import SkeletonFlatList from '@/components/SkeletonFlatList';
import Services from '@/services';
import { useFocusEffect } from '@react-navigation/native';
import { useGlobalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const hitSlop = { top: 5, bottom: 5, left: 5, right: 5 };
const deviceWidth = Dimensions.get('window').width;

export default function EbookScreen() {
  const navigation = useNavigation();
  const { idCategory }: { idCategory: string } = useGlobalSearchParams();

  const [isShowFilter, setIsShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dataFilter, setDataFilter] = useState([]);
  const [categorySelect, setCategorySelect] = useState<string[]>([]);
  const [keySearch, setKeySearch] = useState<string | undefined>();
  const [isLoadMore, setIsLoadMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [isFetchData, setIsFetchData] = useState(true);

  // =============== Fetch categories when mount ===============
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      const categories = await Services.getEbooksCategories();
      setDataFilter(categories.data?.data?.categories || []);
      if (idCategory) setCategorySelect([idCategory]);
      setIsLoading(false);
    };
    fetchCategories();
  }, [idCategory]);

  // =============== Handle Android Back button ===============
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      },
    );
    return () => backHandler.remove();
  }, [navigation]);

  // =============== Handle Device Events ===============
  useEffect(() => {
    const keywordListener = DeviceEventEmitter.addListener(
      'keywordSearch',
      value => {
        setKeySearch(value);
        onRefresh();
      },
    );
    const cateListener = DeviceEventEmitter.addListener(
      'refresh_with_category',
      idCate => {
        refreshWithCate(idCate);
      },
    );
    return () => {
      keywordListener.remove();
      cateListener.remove();
    };
  }, []);

  // =============== Fetch when screen is focused ===============
  useFocusEffect(
    useCallback(() => {
      if (isFetchData) {
        getData();
        setIsFetchData(false);
      }
    }, [isFetchData, page, categorySelect, keySearch]),
  );

  // =============== Fetch Data ===============
  const getData = useCallback(async () => {
    try {
      const params: any = { page };
      // switch (filter) {
      //   case 1:
      //     params.sort = 'inexpensive';
      //     break;
      //   case 2:
      //     params.sort = 'expensive';
      //     break;
      //   case 3:
      //     params.sort = 'newest';
      //     break;
      //   case 4:
      //     params.sort = 'bestsellers';
      //     break;
      //   case 5:
      //     params.sort = 'best_rates';
      //     break;
      //   default:
      //     params.sort = '';
      // }

      if (keySearch) {
        if (keySearch.length < 3) {
          Alert.alert('Từ khóa có ít nhất 3 kí tự');
          return;
        }
        params.title = keySearch;
      }

      if (categorySelect.length > 0) {
        params.category_id = categorySelect;
      }
      setIsProductLoading(true);
      const response = await Services.getEbooks(params);
      setIsProductLoading(false);
      const products = response.data?.data?.products || [];

      setData(prev => (page === 1 ? products : [...prev, ...products]));
      setIsLoadMore(products.length === 10);
      setRefreshing(false);
    } catch (e) {
      console.log('Fetch Ebook Error:', e);
      setRefreshing(false);
    }
  }, [page, categorySelect, keySearch]);

  // =============== Filter & Category ===============
  const refreshWithCate = async (idCate: string) => {
    const selected = idCate ? [idCate] : [];
    setCategorySelect(selected);
    setRefreshing(true);
    setData([]);
    setPage(1);
    setIsProductLoading(true);
    // Gọi API với state mới ngay lập tức
    try {
      const params: any = { page: 1 };

      if (keySearch) {
        if (keySearch.length < 3) {
          Alert.alert('Từ khóa có ít nhất 3 kí tự');
          return;
        }
        params.title = keySearch;
      }

      if (selected.length > 0) {
        params.category_id = selected;
      }

      const response = await Services.getEbooks(params);
      const products = response.data?.data?.products || [];

      setData(products);
      setIsLoadMore(products.length === 10);
      setRefreshing(false);
      setIsProductLoading(false);
    } catch (e) {
      console.log('Fetch Ebook Error in refreshWithCate:', e);
      setRefreshing(false);
    }
  };

  const handleSelectCate = async (item: any) => {
    const selected = categorySelect?.includes(item.id)
      ? categorySelect.filter(x => x !== item.id)
      : [...(categorySelect || []), item.id];

    setCategorySelect(selected);
    setData([]);
    setPage(1);
    setRefreshing(true);

    // Gọi API với state mới ngay lập tức thay vì chờ state update
    try {
      const params: any = { page: 1 };

      if (keySearch) {
        if (keySearch.length < 3) {
          Alert.alert('Từ khóa có ít nhất 3 kí tự');
          return;
        }
        params.title = keySearch;
      }

      if (selected.length > 0) {
        params.category_id = selected;
      }
      setIsProductLoading(true);
      const response = await Services.getEbooks(params);
      setIsProductLoading(false);
      const products = response.data?.data?.products || [];

      setData(products);
      setIsLoadMore(products.length === 10);
      setRefreshing(false);
    } catch (e) {
      console.log('Fetch Ebook Error in handleSelectCate:', e);
      setIsProductLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (!isLoadMore) return;
    setShowFooter(true);
    setPage(prev => prev + 1);
    await getData();
    setShowFooter(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setData([]);
    await getData();
    setRefreshing(false);
  };

  const handleFilter = async (value: number) => {
    setIsShowFilter(false);
    setFilter(value);
    setData([]);
    onRefresh();
  };

  const onCloseKeywordSearch = async () => {
    setData([]);
    setKeySearch(undefined);
    onRefresh();
  };

  // =============== Render Items ===============
  const renderItemFilter = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => handleSelectCate(item)}
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

  // =============== Render ===============
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.header1]}>
            <Text style={styles.title}>Ebook</Text>
            <TouchableOpacity
              style={styles.viewSearch}
              onPress={() => {
                // navigation.navigate('EbookSearchScreen', { keySearch })
              }}
            >
              <Image source={Images.iconSearch} style={styles.iconSearch} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter header */}
        <View
          style={{
            marginTop: 20,
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
                  {`Tìm kiếm ${keySearch}`}
                </Text>
                <TouchableOpacity
                  style={{ marginLeft: 6 }}
                  hitSlop={hitSlop}
                  onPress={onCloseKeywordSearch}
                >
                  {/* <IconI name="close" size={20} /> */}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* <TouchableOpacity
            onPress={() => setIsShowFilter(!isShowFilter)}
            style={styles.viewFilter}
          >
            {filter === 3 && <Text style={styles.txtFilter}>Mới nhất</Text>}
            {filter === 4 && <Text style={styles.txtFilter}>Bán chạy</Text>}
            {filter === 5 && <Text style={styles.txtFilter}>Đánh giá</Text>}
            {filter === 0 && <Text style={styles.txtFilter}>Lọc</Text>}
            {/* <IconI name="ios-caret-down" color="#C5C5C5" size={8} />
          </TouchableOpacity> */}
        </View>

        {/* Categories */}
        {!isLoading && (
          <View style={{ marginTop: 20, marginHorizontal: 16 }}>
            <FlatList
              showsHorizontalScrollIndicator={false}
              horizontal
              data={dataFilter}
              keyExtractor={item => String(Math.random())}
              renderItem={renderItemFilter}
            />
          </View>
        )}

        {!isProductLoading && !refreshing && data.length === 0 && (
          <Text
            style={[
              styles.txtFilterItem,
              { alignSelf: 'center', marginTop: 50 },
            ]}
          >
            Không có dữ liệu
          </Text>
        )}
        {isLoading && <SkeletonCategory />}
        {isProductLoading ? (
          <SkeletonFlatList layout="column" items={5} />
        ) : (
          <ListEbook
            data={data}
            extraData={{ data, refreshing }}
            style={{ marginTop: 20 }}
            contentContainerStyle={{ paddingBottom: 80 }}
            refreshScreen={refreshScreen()}
            nextPage={handleLoadMore}
            refreshing={refreshing}
            showFooter={showFooter}
          />
        )}

        {/* {isShowFilter && (
          <TouchableWithoutFeedback onPress={() => setIsShowFilter(false)}>
            <View style={styles.viewUpdateRole}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.viewModalFilter,
                    { right: -deviceWidth + 127 + 16, top: 150 },
                  ]}
                >
                  <TouchableOpacity onPress={() => handleFilter(0)}>
                    <Text
                      style={[
                        styles.txtFilterItem,
                        filter === 0 && { color: '#000' },
                      ]}
                    >
                      Mặc định
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleFilter(3)}>
                    <Text
                      style={[
                        styles.txtFilterItem,
                        filter === 3 && { color: '#000' },
                      ]}
                    >
                      Mới nhất
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleFilter(4)}>
                    <Text
                      style={[
                        styles.txtFilterItem,
                        filter === 4 && { color: '#000' },
                      ]}
                    >
                      Nổi bật
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleFilter(5)}>
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
        )} */}
      </View>
    </SafeAreaView>
  );
}

const deviceHeight = Dimensions.get('window').height;

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
  },
  viewInput: {
    borderRadius: 12,
    width: deviceWidth - 32,
    height: 40,
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
    lineHeight: 21,
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

    fontSize: 12,
    lineHeight: 18,
    color: '#A9A9A9',
  },
  txtSearch: {
    fontSize: 12,
    lineHeight: 18,
    color: '#939393',
    flex: 1,
  },
  txtItemFilter: {
    fontSize: 12,
    lineHeight: 18,
    color: '#858585',
  },
});
