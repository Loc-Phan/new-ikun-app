import { useNavigation } from 'expo-router';
import React, { forwardRef, memo } from 'react';
import { Animated, FlatList } from 'react-native';
import ReviewEbookHorizontal from './ReviewEbookHorizontal';

const FlatListAnimated = Animated.createAnimatedComponent(FlatList);
const ReviewEbook = memo(
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
    } = props;
    const navigation = useNavigation<any>();
    const renderItem = ({ item }: { item: any }) => (
      <ReviewEbookHorizontal item={item} onNavigateDetails={onNavigateDetails} />
    );

    const onNavigateDetails = (item: any) => {
      navigation.navigate('ebookdetails', { id: item.product_id });
    };

    const keyExtractor = (item: any) => String(item.product_id);

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
export default ReviewEbook;
