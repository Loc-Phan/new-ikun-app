import React, { forwardRef, memo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList
} from 'react-native';
import ItemMyCourse from './ItemMyCourse';

interface ListMyCourseProps {
  data: any[];
  style?: any;
  contentContainerStyle?: any;
  scrollEnabled?: boolean;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  nextPage?: () => void;
  extraData?: any;
  refreshScreen: any;
  refreshing?: boolean;
  showFooter?: boolean;
  horizontal?: boolean;
}

const FlatListAnimated = Animated.createAnimatedComponent(FlatList);

const ListMyCourse = forwardRef<FlatList, ListMyCourseProps>((props, ref) => {
  const flatListRef = useRef<FlatList>(null);
  
  const {
    data,
    style,
    contentContainerStyle,
    scrollEnabled,
    ListEmptyComponent,
    nextPage,
    extraData,
    refreshScreen,
    refreshing,
    showFooter,
    horizontal,
  } = props;

  const renderItem = ({ item }: { item: any }) => {
    return <ItemMyCourse item={item} />;
  };

  const keyExtractor = (item: any) => String(item.id);

  const onEndReached = () => {
    if (!data || data.length === 0) return;
    if (nextPage) {
      nextPage();
    }
  };

  const ListFooter = () => {
    if (showFooter) {
      return <ActivityIndicator size="small" style={{ marginVertical: 20 }} />;
    }
    return null;
  };

  return (
    <FlatListAnimated
      ref={ref || flatListRef}
      style={style}
      contentContainerStyle={contentContainerStyle}
      scrollEnabled={scrollEnabled}
      horizontal={horizontal}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      data={data}
      extraData={extraData}
      refreshing={refreshing}
      renderItem={renderItem}
      onEndReached={onEndReached}
      keyExtractor={keyExtractor}
      removeClippedSubviews
      onEndReachedThreshold={0.5}
      ListFooterComponent={ListFooter}
      ListEmptyComponent={ListEmptyComponent}
      scrollEventThrottle={1}
      refreshControl={refreshScreen}
    />
  );
});

ListMyCourse.displayName = 'ListMyCourse';

export default memo(ListMyCourse);