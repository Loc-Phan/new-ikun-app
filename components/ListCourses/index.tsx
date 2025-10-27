import React, { forwardRef, memo, useRef } from 'react';
import { Dimensions, FlatList, Text } from 'react-native';
import ItemCourse from './ItemCourse';

const { width } = Dimensions.get('window');

const ListCourses = memo(
  forwardRef((props: any) => {
    const flatList = useRef(null);
    const {
      data,
      style,
      horizontal,
      refreshing,
      refreshScreen,
      contentContainerStyle,
      scrollEnabled,
      // nextPage,
      extraData,
    } = props;
    const renderItem = ({ item }: { item: any }) => {
      return <ItemCourse item={item} />;
    };

    const keyExtractor = (item: any) => String(item.id);

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

    // const onEndReached = () => {
    //   if (!data) {
    //     return;
    //   }
    //   if (data.length === 0) {
    //     return;
    //   }
    //   if (nextPage) {
    //     nextPage();
    //   }
    // };

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
        // onEndReached={onEndReached}
        keyExtractor={keyExtractor} // Performance purpose
        removeClippedSubviews
        onEndReachedThreshold={0.5}
        ListEmptyComponent={ListEmptyComponent}
        scrollEventThrottle={1}
        numColumns={width > 600 ? 2 : 1}
      />
    );
  }),
  () => false,
);
export default ListCourses;
