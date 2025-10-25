import React, {forwardRef, memo} from 'react';
import {FlatList, Animated} from 'react-native';
import {ReviewHorizontal} from '../../component/item-list';

const FlatListAnimated = Animated.createAnimatedComponent(FlatList);
const Review = memo(
  forwardRef((props, ref) => {
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

    const renderItem = ({item}) => (
      <ReviewHorizontal item={item} onNavigateDetails={onNavigateDetails} />
    );

    const onNavigateDetails = item => {
      navigation.navigate(
        item?.type === 'ebook' ? 'EbooksDetailsScreen' : 'CoursesDetailsScreen',
        {id: item?.type === 'ebook' ? item.ebookId : item.course_id, tab: 2},
      );
    };

    const keyExtractor = item => String(item.id);

    const onEndReached = () => {
      // if (!onEndReachedCalledDuringMomentum) {
      //   if (!data) return;
      //   if (data.length === 0) return;
      //   if (nextPage) nextPage();
      //   onEndReachedCalledDuringMomentum = true;
      // }
    };

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
        onEndReached={onEndReached}
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
