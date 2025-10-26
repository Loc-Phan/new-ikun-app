import { Images } from '@/assets';
import { currencyFormat } from '@/utils';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useNavigation } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const deviceWidth = Dimensions.get('window').width;

export default function ItemCourse({ item }: { item: any }) {
  const navigation = useNavigation<any>();

  const onNavigateDetail = (item: any) => {
    navigation.navigate('coursedetails', { id: item.id });
  };
  return (
    <TouchableOpacity
      onPress={() => onNavigateDetail(item)}
      style={styles.container}
    >
      <ImageBackground
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
            <Text style={styles.txtSale}>Sale</Text>
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
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}>
                <Fontisto name="star" size={20} color="#FBC815" />
                <Text style={[styles.rate, { color: '#fff', marginLeft: 4 }]}>{item.rate}</Text>
              </View>
            )}
          </View>
        </View>
      </ImageBackground>
      <View style={{ padding: 15, backgroundColor: '#F4F6F8' }}>
        {item?.categories && item?.categories.length > 0 && (
          <Text style={styles.content} numberOfLines={1}>
            {item?.categories.map((x:any) => x.name).join(', ')}
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
            <Text style={styles.txt1}>{`Thời gian: `}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    // height: 290,
    // padding: 20,
    marginBottom: 25,
    borderRadius: 12,
    overflow: 'hidden',

    // marginVertical: 8,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.2,
    // shadowRadius: 6,
    // elevation: 10,
  },
  item: {marginHorizontal: 12, flex: 1},
  smallContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    // borderRadius: 6,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
    backgroundColor: '#e5e5e5',
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
    fontWeight: '500',
    marginTop: 6,
  },
  fullName: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#fff',
    marginLeft: 13,
  },
  price: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 21,
    color: '#000',
    fontWeight: '500',
  },
  oldPrice: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#B0B0B0',
    textDecorationLine: 'line-through',
    marginLeft: 13,
  },
  avatar: {
    width: 51,
    height: 51,
    borderRadius: 51 / 2,
  },
  txtSale: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    lineHeight: 18,
    color: '#fff',
    fontWeight: '600',
  },
  viewAvatar: {
    width: deviceWidth - 32 - 40,
    position: 'absolute',
    left: 20,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    width: 17,
    height: 17,
    resizeMode: 'contain',
    // tintColor: '#FBC815',
  },
  icon1: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: '#FBC815',
    marginLeft: 15,
  },
  viewContent: {
    marginLeft: 20,
    flex: 1,
  },
  content: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#939393',
  },
  txt1: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 6,
  },
  txt3: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 6,
    color: '#314753',
  },
  txt2: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#F11616',
  },
  txtPass: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#56C943',
  },
  txtFail: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#FF6161',
  },
  txtProgress: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#58C3FF',
  },
  rate: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    lineHeight: 18,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
    marginTop: 2,
  },
});