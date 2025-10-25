import { useNavigation } from 'expo-router';
import React, { forwardRef, memo } from 'react';
import { Animated, FlatList } from 'react-native';
import PopularEbookHorizontal from './PopularEbookHorizontal';
const FlatListAnimated = Animated.createAnimatedComponent(FlatList);
const PopularCourses = memo(
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
    const navigate = useNavigation<any>();

    const renderItem = ({ item }: any) => {
      return (
        <PopularEbookHorizontal
          item={item}
          onNavigateDetails={onNavigateDetails}
        />
      );
    };

    const onNavigateDetails = (item: any) => {
      navigate.navigate('ebookdetails', { id: item.id });
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
        ListEmptyComponent={ListEmptyComponent}
        scrollEventThrottle={1}
      />
    );
  }),
  () => false,
);
export default PopularCourses;
