import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import {Images} from '../../assets';
import IconI from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import styles from './styles/item-course';
import { currencyFormat } from '../../common';

class ItemCourse extends PureComponent {
  onNavigateDetail = item => {
    const { navigation } = this.props;
    navigation.navigate('CoursesDetailsScreen', { id: item.id });
  };

  // onToggleWishlish = async () => {
  //   const {dispatch, item} = this.props;
  //   const param = {
  //     id: item.id,
  //   };
  //   dispatch(showLoading());
  //   const response = await Client.addRemoveWishlist(param);
  //   dispatch(showLoading(false));
  //   if (response.status === 'success') {
  //     dispatch(saveDataWishlist(response?.data?.items || []));
  //   } else {
  //     Alert.alert(response.message);
  //   }
  // };
  render() {
    const { t, item, wishlist } = this.props;
    const dataWishlist = wishlist?.data;
    const ids =
      wishlist && dataWishlist.length > 0 ? dataWishlist.map(x => x.id) : [];
    console.log('item', item?.videos);

    return (
      <TouchableOpacity
        onPress={() => this.onNavigateDetail(item)}
        style={styles.container}
      >
        <FastImage
          style={styles.image}
          source={{
            uri: item.image,
          }}
        >
          {item.on_sale ? (
            <View
              style={{
                backgroundColor: '#FBC815',
                top: 20,
                left: 20,
                width: 49,
                borderRadius: 4,
                height: 21,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={styles.txtSale}>{t('sale')}</Text>
            </View>
          ) : null}
          {/* <TouchableOpacity
            onPress={this.onToggleWishlish}
            style={{
              position: 'absolute',
              top: 10,
              right: 15,
              backgroundColor: ids.includes(item.id)
                ? '#FBC815'
                : 'rgba(0,0,0,0.2)',
              borderRadius: 6,
              height: 40,
              width: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <IconI name="heart-outline" color="#fff" size={22} />
          </TouchableOpacity> */}
          <View style={styles.viewAvatar}>
            <View />
            <View>
              {item.rate > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <IconI name="star" color="#FBC815" size={15} />
                  <Text style={styles.rate}>{item.rate}</Text>
                </View>
              )}
            </View>
          </View>
        </FastImage>
        <View style={{ padding: 15, backgroundColor: '#F4F6F8' }}>
          {item?.categories && item?.categories.length > 0 && (
            <Text style={styles.content} numberOfLines={1}>
              {item?.categories.map(x => x.name).join(', ')}
            </Text>
          )}
          <Text numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 9,
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <Image source={Images.iconClock} style={styles.icon} />
              <Text style={styles.txt1}>{`${t('courses.durations')}: `}</Text>
              <Text style={styles.content}>
                {item?.access_days
                  ? `${item?.access_days} ngày`
                  : 'Không giới hạn'}
              </Text>
            </View>
            {item?.videos ? (
              <View style={{ flexDirection: 'row' }}>
                <Image source={Images.iconVideo} style={styles.icon} />
                <Text style={[styles.txt1, { fontFamily: 'Inter-SemiBold' }]}>
                  {`${item?.videos} Videos`}
                </Text>
              </View>
            ) : null}
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 9,
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <Image source={Images.iconDollar} style={styles.icon} />
              {item?.price !== 0 ? (
                <Text style={[styles.txt3, { paddingRight: 12 }]}>
                  {currencyFormat(item?.best_ticket_price)}
                </Text>
              ) : (
                <Text style={[styles.txt3, { paddingRight: 12 }]}>
                  Miễn phí
                </Text>
              )}
              {item?.price !== item?.best_ticket_price ? (
                <Text
                  style={[
                    styles.content,
                    { textDecorationLine: 'line-through', color: '#314753' },
                  ]}
                >
                  {currencyFormat(item?.price)}
                </Text>
              ) : null}
            </View>
            <View style={{ flexDirection: 'row' }}>
              {item?.discount_percent !== 0 ? (
                <Text
                  style={styles.txt2}
                >{`Giảm ${item?.discount_percent}%`}</Text>
              ) : null}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}
const mapStateToProps = ({ wishlist }) => ({
  wishlist,
});
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(ItemCourse);
