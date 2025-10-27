import { Images } from '@/assets';
import ListMyCourse from '@/components/ListMyCourse';
import Services from '@/services';
import { RootState } from '@/store';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  DeviceEventEmitter,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const hitSlop = {
  top: 5,
  bottom: 5,
  left: 5,
  right: 5,
};

export default function MyCourseScreen() {
  const navigation = useNavigation<any>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [isShowFilter, setIsShowFilter] = useState(false);
  const [showAnimatedSearch, setShowAnimatedSearch] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isLoadMore, setIsLoadMore] = useState(true);
  const [filter, setFilter] = useState('');
  const [keySearch, setKeySearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFooter, setShowFooter] = useState(false);

  const inputSearchRef = useRef<TextInput>(null);
  const isFetchData = useRef(true);

  // 📊 Get data
  const getData = useCallback(async (isLoadMoreData = false) => {
    try {
      const response = (await Services.myCourse()).data;
      console.log("response",response);
      if (response?.data?.webinars) {
        const newData = response.data.webinars;
        setData(isLoadMoreData ? prev => [...prev, ...newData] : newData);
        setIsLoadMore(newData.length === 10);
      }
    } catch (error) {
      console.error('Error fetching my courses:', error);
    } finally {
      setLoading(false);
      setShowFooter(false);
      setRefreshing(false);
    }
  }, []);

  // 🔄 Refresh my course
  const refreshMyCourse = useCallback(async () => {
    await getData();
  }, [getData]);

  // 🔙 Handle back press
  const handleBackPress = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  // 🔄 Effects
  useEffect(() => {
    const focusListener = navigation.addListener('focus', async () => {
      if (isFetchData.current) {
        await getData();
      }
      setRefreshing(false);
      isFetchData.current = false;
    });

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    const eventListener = DeviceEventEmitter.addListener(
      'loadMyCourse',
      refreshMyCourse,
    );

    return () => {
      focusListener();
      backHandler.remove();
      eventListener.remove();
    };
  }, [navigation, getData, handleBackPress, refreshMyCourse]);

  // 🔍 Show filter
  const showFilter = () => {
    if (refreshing || loading) return;
    setIsShowFilter(!isShowFilter);
  };

  // 🔍 Animated search
  const onAnimatedSearch = () => {
    setShowAnimatedSearch(true);
    setTimeout(() => {
      inputSearchRef.current?.focus();
    }, 200);
  };

  // 📄 Load more
  const handleLoadMore = async () => {
    if (!isLoadMore) return;

    setPage(prev => prev + 1);
    setShowFooter(true);
    setRefreshing(false);
    setLoading(false);
    await getData(true);
  };

  // 🔄 Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    setData([]);
    setPage(1);
    setShowFooter(false);
    setLoading(false);
    await getData();
  };

  // 🔄 Refresh control
  const refreshScreen = () => (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      progressViewOffset={30}
    />
  );

  // 🔍 Filter
  const onFilter = async (value: string) => {
    setIsShowFilter(false);
    setFilter(value === 'all' ? '' : value);
    setData([]);
    setPage(1);
    setShowFooter(false);
    setLoading(true);
    await getData();
  };

  // 🔍 Search
  const onSearch = async () => {
    if (loading || refreshing) return;

    setIsShowFilter(false);
    setData([]);
    setPage(1);
    setShowFooter(false);
    setLoading(true);
    await getData();
  };

  // ❌ Close search
  const onCloseSearch = async () => {
    if (loading || refreshing) return;

    setShowAnimatedSearch(false);
    setKeySearch('');
    setIsShowFilter(false);
    setData([]);
    setPage(1);
    setShowFooter(false);
    setLoading(true);
    await getData();
  };

  // 🧱 Render UI
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
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
              disabled={loading || refreshing}
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

      {accessToken ? (
        <>
          <View
            style={{
              marginTop: 26,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginHorizontal: 16,
            }}
          >
            <View />
          </View>

          {loading && (
            <View style={styles.viewLoading}>
              <ActivityIndicator size="small" />
            </View>
          )}

          {!loading && !refreshing && data.length === 0 && (
            <Text
              style={[
                styles.txtFilterItem,
                { alignSelf: 'center', marginTop: 50 },
              ]}
            >
              Không có dữ liệu
            </Text>
          )}

          <ListMyCourse
            data={data}
            style={{ marginTop: 20 }}
            contentContainerStyle={{ paddingBottom: 80 }}
            refreshScreen={refreshScreen()}
            nextPage={handleLoadMore}
            refreshing={refreshing}
            showFooter={showFooter}
          />
        </>
      ) : (
        <View style={styles.loginContainer}>
          <Text style={styles.needLoginText}>
            Bạn cần đăng nhập để xem khóa học của mình
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('auth/login')}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  header1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 36,
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  viewInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  inputSearch: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginHorizontal: 10,
  },
  viewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtFilterItem: {
    fontSize: 16,
    color: '#666',
  },
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  needLoginText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#444',
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 10,
    backgroundColor: '#1180C3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  loginButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
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
});
