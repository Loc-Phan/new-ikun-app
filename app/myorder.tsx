import { Images } from '@/assets';
import Services from '@/services';
import { useNavigation } from 'expo-router';
import moment from 'moment';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

export default function MyOrderScreen() {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<any>([]);
  const goBack = () => {
    navigation.goBack();
  };
  const handleProductDetails = (item: any) => {
    if (item.type === 'ebook') {
      navigation.navigate('ebookdetails', { id: item.id });
    } else if (item.type === 'course') {
      navigation.navigate('coursedetails', { id: item.id });
    }
  };

  const renderHeader = () => {
    return (
      <View
        style={{ flexDirection: 'row', height: 30, backgroundColor: '#1180C3' }}
      >
        <View style={styles.colId}>
          <Text style={styles.txtTitleCol}>Tên sản phẩm</Text>
        </View>
        <View style={styles.colDate}>
          <Text style={styles.txtTitleCol}>Ngày</Text>
        </View>
        <View style={styles.colStatus}>
          <Text style={styles.txtTitleCol}>Trạng thái</Text>
        </View>
      </View>
    );
  };

  const renderItem = ({ item, index }: any) => {
    console.log('item', item);
    return (
      <TouchableOpacity
        onPress={() => handleProductDetails(item)}
        style={{
          flexDirection: 'row',
          height: 36,
          backgroundColor: index % 2 === 0 ? '#F3F3F3' : '#fff',
        }}
      >
        <View style={styles.colId}>
          <Text style={styles.txtCol}>{item.Title}</Text>
        </View>

        <View style={styles.colDate}>
          <Text style={styles.txtCol}>
            {moment(item.Date * 1000).format('HH:mm DD-MM-YYYY')}
          </Text>
        </View>
        <View style={styles.colStatus}>
          <Text style={styles.txtCol}>{item.Status.toUpperCase()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getData = async () => {
    const ebookResponses = (await Services.getPurchaseEbook()).data;
    const courseEesponses = (await Services.myCourse()).data;
    const res = ebookResponses?.orders
      ? ebookResponses?.orders
          ?.filter(order => order.product_id)
          .map(order => ({
            Title: order?.title || '',
            type: 'ebook',
            id: order?.product_id,
            Date: order?.created_st,
            Status: order?.status,
            Total: order?.total_amount,
          }))
      : [];
    const courseRes = courseEesponses?.data?.webinars
      ? courseEesponses?.data?.webinars?.map(webinars => ({
          Title: webinars?.title || '',
          id: webinars?.id,
          type: 'course',
          Date: webinars?.purchased_at,
          Status: 'Success',
          Total: webinars?.best_ticket,
        }))
      : [];
    setData(res.concat(courseRes));
  };

  useEffect(() => {
    getData();
  }, []);
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <View style={styles.container}>
          <StatusBar backgroundColor="transparent" />
          {/* <Image source={Images.bannerMyCourse} style={styles.imgBanner} /> */}
          <View style={styles.header}>
            <View style={styles.header1}>
              <TouchableOpacity
                style={{ marginLeft: 16 }}
                onPress={goBack}
                hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
              >
                <Image source={Images.iconBack} style={styles.iconBack} />
              </TouchableOpacity>
              <Text style={styles.title}>Sản phẩm của bạn</Text>
              <View
                style={{
                  width: 40,
                  height: 40,
                }}
              />
            </View>
          </View>
          <View style={styles.content}>
            <View>
              <FlatList
                bounces={false}
                ListHeaderComponent={renderHeader}
                data={data}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                keyExtractor={item => String(item.Title)} // Performance purpose
                removeClippedSubviews={false}
                onEndReachedThreshold={0.5}
                scrollEventThrottle={1}
                style={{ borderBottomWidth: 1, borderColor: '#E3E3E3' }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
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
  },
  header1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewInput: {
    borderRadius: 12,
    // width: deviceWidth - 32,
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    marginRight: 8,
  },
  inputSearch: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    lineHeight: 15,
    color: '#000',
  },
  txtPhone: {
    marginLeft: 14,
    fontFamily: 'Inter-Regular',
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
  icon: {
    height: 15,
    width: 15,
    resizeMode: 'contain',
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
  },
  btn: {
    width: 112,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FBC815',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtBtn: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 18,
  },
  txt1: {
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
  },
  txtContent: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#8D8D8D',
    marginTop: 6,
  },
  viewSearch: {
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
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

  iconSearch: {
    height: 14,
    width: 14,
    resizeMode: 'contain',
    tintColor: '#000',
  },
  viewFilter: {
    backgroundColor: '#fff',
    width: 64,
    height: 24,
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
  childTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    marginTop: 26,
    marginBottom: 14,
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
    width: 107,
    height: 131,
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
    marginBottom: 10,
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    lineHeight: 15,
    color: '#A9A9A9',
  },
  content: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  border: {
    width: deviceWidth * 0.7,
    height: 1,
    backgroundColor: '#F0F0F0',
    alignSelf: 'center',
    marginTop: 35,
    marginBottom: 40,
  },
  colId: {
    flex: 3,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E3E3E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colDate: {
    flex: 2,
    borderRightWidth: 1,
    borderColor: '#E3E3E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colStatus: {
    flex: 1.2,
    borderRightWidth: 1,
    borderColor: '#E3E3E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colTotal: {
    flex: 2,
    borderRightWidth: 1,
    borderColor: '#E3E3E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colAction: {
    flex: 2,
    borderRightWidth: 1,
    borderColor: '#E3E3E3',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  txtCol: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    lineHeight: 15,
    color: '#000',
    fontWeight: '300',
  },
  txtTitleCol: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    lineHeight: 32,
    color: '#fff',
    fontWeight: '500',
  },
});
