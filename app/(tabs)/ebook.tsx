import { Images } from '@/assets';
import ListEbook from '@/components/ListEbook';
import SkeletonCategory from '@/components/SkeletonCategory';
import SkeletonFlatList from '@/components/SkeletonFlatList';
import Services from '@/services';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGlobalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
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

const hitSlop = { top: 5, bottom: 5, left: 5, right: 5 };
const deviceWidth = Dimensions.get('window').width;

export default function EbookScreen() {
  const navigation = useNavigation();
  const { idCategory }: { idCategory: string } = useGlobalSearchParams();

  const [page, setPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const inputSearchRef = useRef<TextInput>(null);
  const [showAnimatedSearch, setShowAnimatedSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataFilter, setDataFilter] = useState([]);
  const [categorySelect, setCategorySelect] = useState<string[]>([]);
  const [keySearch, setKeySearch] = useState<string | undefined>();
  const [isLoadMore, setIsLoadMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // =============== Fetch categories when mount ===============
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      const categories = await Services.getEbooksCategories();
      setDataFilter(categories.data?.data?.categories || []);
      if (idCategory) setCategorySelect([idCategory]);
      if (page !== 1) {
        setPage(1);
      }
      setIsLoading(false);
    };
    fetchCategories();
  }, [idCategory, page]);

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
  // useEffect(() => {
  //   const keywordListener = DeviceEventEmitter.addListener(
  //     'keywordSearch',
  //     value => {
  //       setKeySearch(value);
  //       onRefresh();
  //     },
  //   );
  //   return () => {
  //     keywordListener.remove();
  //   };
  // }, [onRefresh]);

  // =============== Handle Category Events when focused ===============
  // useFocusEffect(
  //   useCallback(() => {
  //     const cateListener = DeviceEventEmitter.addListener(
  //       'refresh_with_category',
  //       idCate => {
  //         refreshWithCate(idCate);
  //       },
  //     );
  //     return () => {
  //       cateListener.remove();
  //     };
  //   }, [refreshWithCate]),
  // );

  // =============== Fetch when screen is focused ===============
  // useFocusEffect(
  //   useCallback(() => {
  //     if (isFetchData) {
  //       getData();
  //       setIsFetchData(false);
  //     }
  //   }, [isFetchData, getData]),
  // );

  // =============== Fetch Data ===============
  const getData = useCallback(
    async (isLoadMore = false) => {
      try {
        if (!isLoadMore) {
          setIsProductLoading(true);
          setIsInitialLoading(true);
        }
        const params: any = { page };

        if (keySearch) {
          if (keySearch.length < 3) {
            Alert.alert('Từ khóa có ít nhất 3 kí tự');
            return;
          }
          params.title = keySearch;
        }
        console.log('categorySelect', categorySelect);
        if (categorySelect.length > 0) {
          params.category_id = categorySelect.join(',');
        }
        const response = await Services.getEbooks(params);
        const products = response.data?.data?.products || [];

        setIsProductLoading(false);
        if (isLoadMore && page > 1) {
          setData(prev => [...prev, ...products]);
        } else {
          setData(products);
          setIsInitialLoading(false);
        }
        setIsLoadMore(products.length === 10);
      } catch (e) {
        console.log('Fetch Ebook Error:', e);
        setData([]);
        setIsInitialLoading(false);
        setRefreshing(false);
      }
    },
    [page, categorySelect, keySearch],
  );

  useEffect(() => {
    if (page === 1) {
      getData(false);
    } else {
      getData(true);
    }
  }, [page, categorySelect]);

  const handleSelectCate = async (item: any) => {
    const selected = categorySelect?.includes(item.id)
      ? categorySelect.filter(x => x !== item.id)
      : [...(categorySelect || []), item.id];

    setCategorySelect(selected);
    setPage(1);
    setIsLoadMore(true); // Reset load more state
    setIsInitialLoading(true);
  };

  const handleLoadMore = async () => {
    if (!isLoadMore || isProductLoading) return;
    setShowFooter(true);
    setPage(prev => prev + 1);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setData([]);
    setIsInitialLoading(true); // Show loading cho refresh
    await getData();
  }, [getData]);

  const onAnimatedSearch = () => {
    setShowAnimatedSearch(true);
    setTimeout(() => {
      inputSearchRef.current?.focus();
    }, 200);
  };

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
                placeholder="Tìm kiếm ebook..."
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
            <View style={[styles.header1]}>
              <Text style={styles.title}>Ebook</Text>
              <TouchableOpacity
                style={styles.viewSearch}
                onPress={onAnimatedSearch}
              >
                <Image source={Images.iconSearch} style={styles.iconSearch} />
              </TouchableOpacity>
            </View>
          )}
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
        {isInitialLoading ? (
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
    height: 48,
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
