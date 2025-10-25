import React, { forwardRef, memo } from 'react';
import { Animated, FlatList } from 'react-native';
import ReviewHorizontal from './ReviewHorizontal';

const FlatListAnimated = Animated.createAnimatedComponent(FlatList);
const Review = memo(
  forwardRef((props: any, ref: any) => {
    const {
      data,
      style,
      horizontal,
      refreshing,
      refreshScreen,
      contentContainerStyle,
      scrollEnabled,
      ListEmptyComponent,
      navigation,
    } = props;

    const renderItem = ({ item }: { item: any }) => (
      <ReviewHorizontal item={item} onNavigateDetails={onNavigateDetails} />
    );

    const onNavigateDetails = (item: any) => {
      navigation.navigate(
        item?.type === 'ebook' ? 'EbooksDetailsScreen' : 'CoursesDetailsScreen',
        { id: item?.type === 'ebook' ? item.ebookId : item.course_id, tab: 2 },
      );
    };

    const keyExtractor = (item: any) => String(item.id);

    return (
      <FlatListAnimated
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
        keyExtractor={keyExtractor} // Performance purpose
        removeClippedSubviews={false}
        onEndReachedThreshold={0.5}
        // ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmptyComponent}
        scrollEventThrottle={1}
      />
    );
  }),
  () => false,
);
export default Review;
