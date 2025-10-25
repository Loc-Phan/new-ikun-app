import { Images } from '@/assets';
import { currencyFormat } from '@/utils';
import React, { memo, useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PopularEbookHorizontalProps {
  item: {
    id: number;
    title: string;
    thumbnail: string;
    rate?: number;
    price?: number;
    price_with_discount?: number;
    on_sale?: boolean;
  };
  onNavigateDetails?: (item: any) => void;
}

const PopularEbookHorizontal: React.FC<PopularEbookHorizontalProps> = ({
  item,
  onNavigateDetails,
}) => {
  const onNavigateDetail = useCallback(() => {
    onNavigateDetails?.(item);
  }, [item, onNavigateDetails]);

  return (
    <TouchableOpacity onPress={onNavigateDetail} style={styles.container}>
      {item.on_sale && (
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
          <Text style={styles.txtSale}>Sale</Text>
        </View>
      )}

      <View>
        <Image style={styles.image} source={{ uri: item.thumbnail }} />

        {/* Wishlist toggle */}
        {/* 
        <TouchableOpacity
          style={{position: 'absolute', top: 10, right: 15}}
          onPress={onToggleWishlist}>
          <IconI
            name={isInWishlist ? 'heart' : 'heart-outline'}
            color={isInWishlist ? '#FBC815' : '#fff'}
            size={22}
          />
        </TouchableOpacity>
        */}

        {item?.rate && item?.rate > 0 && (
          <View
            style={{
              position: 'absolute',
              bottom: 15,
              right: 15,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {/* <IconI name="star" color="#FBC815" size={15} /> */}
            <Text style={styles.rate}>{String(item.rate)}</Text>
          </View>
        )}
      </View>

      <View style={{ paddingHorizontal: 12, marginBottom: 8 }}>
        <Text numberOfLines={2} style={styles.title}>
          {item?.title}
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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={Images.iconDollar} style={styles.icon} />
          {item?.price_with_discount ? (
            <Text style={[styles.txt3, { paddingLeft: 2, paddingRight: 6 }]}>
              {currencyFormat(item?.price_with_discount)}
            </Text>
          ) : (
            <Text style={[styles.txt3, { paddingRight: 12 }]}>Miễn phí</Text>
          )}
          {item?.price !== item?.price_with_discount && (
            <Text
              style={[
                styles.content,
                { textDecorationLine: 'line-through', color: '#314753' },
              ]}
            >
              {currencyFormat(item?.price || 0)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

PopularEbookHorizontal.displayName = 'PopularEbookHorizontal';

export default memo(PopularEbookHorizontal);

const styles = StyleSheet.create({
  container: {
    width: 220,
    marginRight: 8,
    minHeight: 179,
    backgroundColor: '#F4F6F8',

    // marginVertical: 8,
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
  },
  item: { marginHorizontal: 12, flex: 1 },
  smallContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  image: {
    width: 220,
    height: 134,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    resizeMode: 'cover',
    backgroundColor: '#E5E5E5',
  },
  price: {
    fontSize: 10,
    lineHeight: 15,
    color: '#000',
  },
  oldPrice: {
    
    fontSize: 10,
    lineHeight: 15,
    color: '#B0B0B0',
    textDecorationLine: 'line-through',
    marginLeft: 13,
  },
  rate: {
    fontSize: 10,
    lineHeight: 15,
    color: '#fff',
    marginLeft: 3,
    marginTop: 2,
  },
  title: {
    fontSize: 14,
    height: 40,
    color: '#0B2337',
    fontWeight: '600',
    marginTop: 8,
  },
  duration: {
    
    fontSize: 12,
    lineHeight: 20,
    color: '#707172',
    marginTop: 8,
    marginBottom: 8,
  },
  content: {
    
    fontSize: 13,
    // lineHeight: 15,
    color: '#939393',
    // marginTop: 2,
  },
  txtSale: {
    
    fontSize: 10,
    lineHeight: 15,
    color: '#fff',
  },
  icon: {
    width: 17,
    height: 17,
    resizeMode: 'contain',
    // tintColor: '#FBC815',
  },
  txt3: {
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 6,
    color: '#314753',
  },
  txt2: {
    
    fontSize: 13,
    lineHeight: 18,
    color: '#F11616',
  },
});
