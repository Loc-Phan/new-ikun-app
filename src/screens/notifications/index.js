import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { NewClient } from '../../api';
import { Images } from '../../assets';
import styles from './styles';
import ListNotifications from '../../component/list/list-notification';
import IconI from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

const deviceWidth = Dimensions.get('window').width;

export default function Notifications({ navigation }) {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showFooter, setShowFooter] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState(1);
  const [filteringData, setFilteringData] = useState([]);
  const [isShowFilter, setIsShowFilter] = useState(false);
  const [error, setError] = useState('');

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
      const response = await NewClient.getNotifications();
      if (response.success) {
        const { notifications, count } = response?.data;
        notifications.sort((a, b) => b.created_at - a.created_at);
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
    } catch (e) {
      setError(e.message || 'Đã xảy ra lỗi, vui lòng thử lại');
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

  const handleItemDetails = async item => {
    try {
      await NewClient.readNotification(item.id, { status: 'unread' });
    } catch (err) {
      console.log(err);
    }
    if (item?.type === 'Course' && item?.item_id) {
      navigation.navigate('CoursesDetailsScreen', { id: item.item_id });
      return;
    }
    if (item?.type === 'Ebook' && item?.item_id) {
      navigation.navigate('EbooksDetailsScreen', { id: item.item_id });
      return;
    }
  };

  const renderItem = ({ item }) => {
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

  const handleFilter = item => {
    setFilter(item);
    setIsShowFilter(false);
  };

  useEffect(() => {
    if (filter === 2) {
      const dataNoti = data.filter(item => item.status === 'unread');
      setFilteringData(dataNoti);
      return;
    }
    if (filter === 3) {
      const dataNoti = data.filter(item => item.status === 'read');
      setFilteringData(dataNoti);
      return;
    }
    setFilteringData(data);
  }, [filter, data]);

  return (
    <View style={styles.container}>
      {/* <Image source={Images.bannerMyCourse} style={styles.imgBanner} /> */}
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
                  <IconI name="ios-caret-down" color="#C5C5C5" size={8} />
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
    </View>
  );
}
