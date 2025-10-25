import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import IconI from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import styles from './styles/popular-course-horizontal';
import { currencyFormat } from '../../common';
import {Images} from '../../assets';

class PopularCoursesHorizontal extends PureComponent {
  onNavigateDetail = () => {
    const { item, onNavigateDetails } = this.props;
    onNavigateDetails(item);
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
  //     // this.forceUpdate();
  //   } else {
  //     Alert.alert(response.message);
  //   }
  // };

  render() {
    const { t, item } = this.props;

    return (
      <TouchableOpacity
        onPress={this.onNavigateDetail}
        style={styles.container}
      >
        {item.on_sale ? (
          <View
            style={{
              backgroundColor: '#FBC815',
              top: 10,
              left: 15,
              width: 49,
              height: 21,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              zIndex: 100,
            }}
          >
            <Text style={styles.txtSale}>{t('sale')}</Text>
          </View>
        ) : null}
        <View>
          <FastImage style={styles.image} source={{ uri: item.image }} />
          {/* <TouchableOpacity
            style={{position: 'absolute', top: 10, right: 15}}
            onPress={() => this.onToggleWishlish()}>
            {!wishlist.data.find(x => x.id === item.id) ? (
              <IconI name="heart-outline" color="#fff" size={22} />
            ) : (
              <IconI name="heart" color="#FBC815" size={22} />
            )}
          </TouchableOpacity> */}
          <View
            style={{
              width: 220,
              justifyContent: 'space-between',
              position: 'absolute',
              flexDirection: 'row',
              paddingHorizontal: 15,
              bottom: 15,
              alignItems: 'center',
            }}
          >
            <View />
            {/* {item.on_sale ? (
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#fff',
                  borderRadius: 4,

                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 2,
                }}>
                {item?.sale_price_rendered ? (
                  <Text style={styles.price}>{item.sale_price_rendered}</Text>
                ) : (
                  <Text style={styles.price}>{item.sale_price} đ</Text>
                )}
                {item?.origin_price_rendered ? (
                  <Text style={styles.oldPrice}>
                    {item.origin_price_rendered}
                  </Text>
                ) : (
                  <Text style={styles.oldPrice}>{item.origin_price} đ</Text>
                )}
              </View>
            ) : item?.price > 0 ? (
              <View
                style={{
                  backgroundColor: '#fff',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}>
                {item?.price_rendered ? (
                  <Text style={styles.price}>{item?.price_rendered}</Text>
                ) : (
                  <Text style={styles.price}>{item?.price} đ</Text>
                )}
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: '#fff',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}>
                <Text style={styles.price}>{t('free')}</Text>
              </View>
            )} */}
            {item.rate > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IconI name="star" color="#FBC815" size={15} />
                <Text style={styles.rate}>{String(item.rate)}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={{ paddingHorizontal: 12 }}>
          <Text numberOfLines={2} style={styles.title}>
            {item?.title}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 12,
          }}
        >
          <Image
            source={Images.iconDuration}
            style={{ width: 16, height: 16 }}
          />
          <Text numberOfLines={2} style={styles.duration}>
            {item.access_days ? `${item.access_days} ngày` : 'Không giới hạn'}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 12,
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Image source={Images.iconDollar} style={styles.icon} />
            {item?.best_ticket_price ? (
              <Text style={[styles.txt3, { paddingLeft: 2, paddingRight: 6 }]}>
                {currencyFormat(item?.best_ticket_price)}
              </Text>
            ) : (
              <Text style={[styles.txt3, { paddingRight: 12 }]}>Miễn phí</Text>
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
        </View>
      </TouchableOpacity>
    );
  }
}
const mapStateToProps = ({ wishlist }) => ({
  wishlist,
});
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PopularCoursesHorizontal);
