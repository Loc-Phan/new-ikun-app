import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  BackHandler,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { connect } from 'react-redux';
import { NewClient } from '../../api';
import moment from 'moment';
import { Images } from '../../assets';

import styles from './styles';

class YourOrder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
    };
    this.backHandler = null;
  }

  async componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
    this.getData();
  }

  componentWillUnmount() {
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

  keyExtractor = item => String(item.Title);

  handleProductDetails = item => {
    const { navigation } = this.props;
    if (item.type === 'ebook') {
      navigation.navigate('EbooksDetailsScreen', { id: item.id });
    } else if (item.type === 'course') {
      navigation.navigate('CoursesDetailsScreen', { id: item.id });
    }
  };

  renderHeader = () => {
    const { t } = this.props;
    return (
      <View
        style={{ flexDirection: 'row', height: 30, backgroundColor: '#1180C3' }}
      >
        <View style={styles.colId}>
          <Text style={styles.txtTitleCol}>{t('myOrders.name')}</Text>
        </View>
        <View style={styles.colDate}>
          <Text style={styles.txtTitleCol}>{t('myOrders.date')}</Text>
        </View>
        <View style={styles.colStatus}>
          <Text style={styles.txtTitleCol}>{t('myOrders.status')}</Text>
        </View>
        {/* <View style={styles.colTotal}>
          <Text style={styles.txtTitleCol}>{t('myOrders.total')}</Text>
        </View> */}
      </View>
    );
  };

  renderItem = ({ item, index }) => {
    console.log('item', item);
    return (
      <TouchableOpacity
        onPress={() => this.handleProductDetails(item)}
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
        {/* <View style={styles.colTotal}>
          <Text style={styles.txtCol}>
            {item.Total ? `${item.Total}đ` : 'Miễn phí'}
          </Text>
        </View> */}
      </TouchableOpacity>
    );
  };

  getData = async () => {
    const ebookResponses = await NewClient.getPurchaseEbook();
    const courseEesponses = await NewClient.myCourse();
    const res = ebookResponses?.data?.orders
      ? ebookResponses?.data?.orders
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
    this.setState({ data: res.concat(courseRes) });
  };

  render() {
    const { t } = this.props;
    const { data } = this.state;
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="transparent" />
        {/* <Image source={Images.bannerMyCourse} style={styles.imgBanner} /> */}
        <View style={styles.header}>
          <View style={styles.header1}>
            <TouchableOpacity
              style={{ marginLeft: 16 }}
              onPress={this.goBack}
              hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
            >
              <Image source={Images.iconBack} style={styles.iconBack} />
            </TouchableOpacity>
            <Text style={styles.title}>{t('myOrders.title')}</Text>
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
              ListHeaderComponent={this.renderHeader}
              data={data}
              showsVerticalScrollIndicator={false}
              renderItem={this.renderItem}
              keyExtractor={this.keyExtractor} // Performance purpose
              removeClippedSubviews={false}
              onEndReachedThreshold={0.5}
              scrollEventThrottle={1}
              style={{ borderBottomWidth: 1, borderColor: '#E3E3E3' }}
            />
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = ({ user }) => ({
  user,
});
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(YourOrder);
