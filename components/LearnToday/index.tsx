import React, { forwardRef, memo, useRef } from 'react';
import { ActivityIndicator, Animated, FlatList } from 'react-native';
import LearnTodayHorizontal from './LearnTodayHorizontal';
import LearnTodayVertical from './LearnTodayVertical';

const FlatListAnimated = Animated.createAnimatedComponent(FlatList);
const LearnToday = memo(
  forwardRef((props: any, ref: any) => {
    const flatList = useRef(null);
    const {
      data,
      style,
      horizontal,
      showFooter,
      refreshing,
      refreshScreen,
      contentContainerStyle,
      scrollEnabled,
      ListEmptyComponent,
      navigation,
    } = props;

    const renderItem = ({ item }: any) => {
      if (horizontal) {
        return <LearnTodayHorizontal item={item} navigation={navigation} />;
      }

      return <LearnTodayVertical item={item} navigation={navigation} />;
    };

    const keyExtractor = (item: any) => String(item.id);

    return (
      <FlatListAnimated
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
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        removeClippedSubviews={false}
        onEndReachedThreshold={0.5}
        ListFooterComponent={showFooter && <ActivityIndicator size="large" />}
        ListEmptyComponent={ListEmptyComponent}
        scrollEventThrottle={1}
      />
    );
  }),
  () => false,
);
export default LearnToday;
