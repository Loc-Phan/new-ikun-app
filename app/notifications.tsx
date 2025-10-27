import { Images } from '@/assets';
import ListNotifications from '@/components/ListNotifications';
import Services from '@/services';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNavigation } from 'expo-router';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

export default function Notifications() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showFooter, setShowFooter] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState(1);
  const [filteringData, setFilteringData] = useState([]);
  const [isShowFilter, setIsShowFilter] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation<any>();
  useEffect(() => {
    getNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshScreen = () => {
    setRefreshing(true);
    setPage(1);

    getNotifications();

    setRefreshing(false);
  };

  const getNotifications = async () => {
    try {
      const response = await Services.getNotifications();
      if (response.data.success) {
        const { notifications, count } = response.data?.data;
        notifications.sort((a: any, b: any) => b.created_at - a.created_at);
        const total = Math.round(count / 10);
        if (page === 1) {
          setData(notifications);
        } else {
          setData(data.concat(notifications));
        }
        setTotalPages(total);
      } else {
        setData([]);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (page >= totalPages) {
      return;
    }

    setShowFooter(true);
    setPage(page + 1);

    getNotifications();

    setShowFooter(false);
  };

  const showFilter = () => {
    setIsShowFilter(!isShowFilter);
  };

  const handleItemDetails = async (item: any) => {
    try {
      await Services.readNotification(item.id, { status: 'unread' });
    } catch (err) {
      console.log(err);
    }
    if (item?.type === 'Course' && item?.item_id) {
      navigation.navigate('coursedetails', { id: item.item_id });
      return;
    }
    if (item?.type === 'Ebook' && item?.item_id) {
      navigation.navigate('ebookdetails', { id: item.item_id });
      return;
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          { opacity: item?.status === 'read' ? 0.7 : 1 },
        ]}
        onPress={() => handleItemDetails(item)}
      >
        <View style={styles.itemContentContainer}>
          {item.title ? (
            <View style={{ position: 'relative' }}>
              {item?.status === 'unread' && <View style={styles.itemUnread} />}
              <Text numberOfLines={2} style={styles.itemTitle}>
                {item.title}
              </Text>
            </View>
          ) : null}
          <Text style={styles.itemContent}>{item.message}</Text>
          <Text style={styles.itemTime}>
            {moment(item.created_at * 1000).format('HH:mm:ss DD/MM/YYYY')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleFilter = (item: any) => {
    setFilter(item);
    setIsShowFilter(false);
  };

  useEffect(() => {
    if (filter === 2) {
      const dataNoti = data.filter((item: any) => item.status === 'unread');
      setFilteringData(dataNoti);
      return;
    }
    if (filter === 3) {
      const dataNoti = data.filter((item: any) => item.status === 'read');
      setFilteringData(dataNoti);
      return;
    }
    setFilteringData(data);
  }, [filter, data]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.header1}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Image source={Images.iconBack} style={styles.iconBack} />
          </TouchableOpacity>
          <Text style={styles.title}>Thông báo</Text>
        </View>
      </View>

      {error ? (
        <Text
          style={[styles.dataNotFound, { alignSelf: 'center', marginTop: 50 }]}
        >
          {error}
        </Text>
      ) : (
        <>
          {!refreshing && data.length === 0 ? (
            <Text
              style={[
                styles.dataNotFound,
                { alignSelf: 'center', marginTop: 50 },
              ]}
            >
              Không có thông báo
            </Text>
          ) : (
            <View style={styles.listContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  marginTop: 12,
                  paddingHorizontal: 12,
                }}
              >
                <TouchableOpacity
                  onPress={showFilter}
                  style={styles.viewFilter}
                >
                  {filter === 1 && <Text style={styles.txtFilter}>Tất cả</Text>}
                  {filter === 2 && (
                    <Text style={styles.txtFilter}>Chưa đọc</Text>
                  )}
                  {filter === 3 && <Text style={styles.txtFilter}>Đã đọc</Text>}
                  <FontAwesome name="filter" size={8} color="#C5C5C5" />
                </TouchableOpacity>
              </View>
              <ListNotifications
                data={filteringData}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 150 }}
                refreshScreen={refreshScreen}
                refreshing={refreshing}
                nextPage={loadMore}
                showFooter={showFooter}
                scrollEnabled
              />
            </View>
          )}
        </>
      )}
      {isShowFilter && (
        <TouchableWithoutFeedback
          onPress={() => {
            setIsShowFilter(false);
          }}
        >
          <View style={[styles.viewUpdateRole, {}]}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.viewModalFilter,
                  { right: -deviceWidth + 127 + 12, top: 165 },
                ]}
              >
                <TouchableOpacity onPress={() => handleFilter(1)}>
                  <Text
                    style={[
                      styles.txtFilterItem,
                      filter === 1 && { color: '#000' },
                    ]}
                  >
                    Tất cả
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleFilter(2)}>
                  <Text
                    style={[
                      styles.txtFilterItem,
                      filter === 2 && { color: '#000' },
                    ]}
                  >
                    Chưa đọc
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleFilter(3)}>
                  <Text
                    style={[
                      styles.txtFilterItem,
                      filter === 3 && { color: '#000' },
                    ]}
                  >
                    Đã đọc
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    zIndex: 1,
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
  header: {
  },
  header1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBack: {
    height: 14,
    width: 14,
    resizeMode: 'contain',
    tintColor: '#000',
    marginLeft: 16,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    lineHeight: 36,
    textAlign: 'center',
    flex: 1,
  },
  dataNotFound: {
    marginTop: 50,
    alignSelf: 'center',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 15,
    color: '#64748b',
  },
  listContainer: {
    flex: 1,
    marginTop: 10,
    paddingBottom: 10,
    backgroundColor: '#f3f4f6',
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 12,
    marginTop: 12,
  },
  itemImage: {
    marginVertical: 4,
    marginHorizontal: 4,
    height: (180 / 375) * deviceWidth,
    resizeMode: 'cover',
    borderRadius: 4,
  },
  itemContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  itemTitle: {
    marginBottom: 8,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
  },
  itemContent: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#334155',
  },
  itemTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#64748b',
    marginTop: 8,
  },
  viewFilter: {
    backgroundColor: '#fff',
    // width: 64,
    height: 32,
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
    fontSize: 12,
    lineHeight: 18,
    marginRight: 6,
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
  itemUnread: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'red',
  },
});
