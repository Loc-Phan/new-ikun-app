import React, { forwardRef, memo, useRef } from 'react';
import {
  // ActivityIndicator,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
} from 'react-native';
import ItemEbook from './ItemEbook';

const { width } = Dimensions.get('window');

const ListEbook = memo(
  forwardRef((props: any, ref) => {
    const flatList = useRef(null);

    const {
      data,
      style,
      horizontal,
      // showFooter,
      refreshing,
      refreshScreen,
      contentContainerStyle,
      scrollEnabled,
      nextPage,
      extraData,
    } = props;

    const ListEmptyComponent = () => {
      return (
        <Text
          style={{
            alignSelf: 'center',
            marginTop: 50,
            paddingBottom: 10,
            fontSize: 12,
            lineHeight: 18,
            color: '#A9A9A9',
          }}
        >
          Không có dữ liệu
        </Text>
      );
    };

    const renderItem = ({ item }: { item: any }) => {
      return <ItemEbook item={item} />;
    };

    const keyExtractor = (item: any) => String(item.id);

    const onEndReached = () => {
      if (!data) {
        return;
      }
      if (data.length === 0) {
        return;
      }
      if (nextPage) {
        nextPage();
      }
    };

    const ListFooter = () => {
      if (horizontal) {
        return (
          <TouchableOpacity
            style={{
              width: 100,
              height: 134,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter-Medium',
                fontWeight: '500',
                fontSize: 12,
                lineHeight: 18,
              }}
            >
              All source
            </Text>
          </TouchableOpacity>
        );
      }
      // if (showFooter) {
      //   return <ActivityIndicator size="small" />;
      // }
      return null;
    };

    return (
      <FlatList
        ref={flatList}
        scrollEnabled={scrollEnabled}
        contentContainerStyle={contentContainerStyle}
        style={style}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshScreen}
        refreshing={refreshing}
        data={data}
        extraData={extraData}
        renderItem={renderItem}
        onEndReached={onEndReached}
        keyExtractor={keyExtractor} // Performance purpose
        removeClippedSubviews
        onEndReachedThreshold={0.5}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmptyComponent}
        scrollEventThrottle={1}
        numColumns={width > 600 ? 2 : 1}
      />
    );
  }),
  () => false,
);
export default ListEbook;
