import { Images } from '@/assets';
import { currencyFormat } from '@/utils';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useNavigation } from 'expo-router';
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

const ItemEbook = ({ item }: { item: any }) => {
  const navigation = useNavigation();

  const onNavigateDetail = (item: any) => {
    navigation.navigate('EbooksDetailsScreen', { id: item.id });
  };

  return (
    <TouchableOpacity
      onPress={() => onNavigateDetail(item)}
      style={styles.container}
    >
      <ImageBackground
        style={styles.image}
        source={{ uri: item?.thumbnail }}
        imageStyle={{
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          resizeMode: 'cover',
        }}
      >
        <View style={styles.viewAvatar}>
          {item.rate > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Fontisto name="star" size={24} color="#FBC815" />
              <Text style={styles.rate}>{item.rate}</Text>
            </View>
          )}
        </View>
      </ImageBackground>
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
              <Text style={[styles.txt3, { paddingLeft: 2, paddingRight: 8 }]}>
                {currencyFormat(item?.price_with_discount)}
              </Text>
            ) : (
              <Text style={[styles.txt3, { paddingRight: 12 }]}>Miễn phí</Text>
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
};

export default ItemEbook;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    // height: 290,
    // padding: 20,
    marginBottom: 25,

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
  item: { marginHorizontal: 12, flex: 1 },
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
    fontSize: 16,
    lineHeight: 24,
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
    justifyContent: 'flex-end',
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
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    marginLeft: 7,
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
