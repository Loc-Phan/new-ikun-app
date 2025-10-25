import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import {Images} from '../../assets';
import IconI from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import styles from './styles/item-ebook';
import { currencyFormat } from '../../common';

class ItemEbook extends PureComponent {
  onNavigateDetail = item => {
    const { navigation } = this.props;
    navigation.navigate('EbooksDetailsScreen', { id: item.id });
  };

  render() {
    const { item } = this.props;
    return (
      <TouchableOpacity
        onPress={() => this.onNavigateDetail(item)}
        style={styles.container}
      >
        <FastImage
          style={styles.image}
          source={{
            uri: item?.thumbnail,
          }}
        >
          <View style={styles.viewAvatar}>
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Image source={Images.iconDollar} style={styles.icon} />
              {item?.price ? (
                <Text
                  style={[styles.txt3, { paddingLeft: 2, paddingRight: 8 }]}
                >
                  {currencyFormat(item?.price_with_discount)}
                </Text>
              ) : (
                <Text style={[styles.txt3, { paddingRight: 12 }]}>
                  Miễn phí
                </Text>
              )}
              {item?.price !== item?.price_with_discount ? (
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

export default connect(mapStateToProps, mapDispatchToProps)(ItemEbook);
