import React, {forwardRef, memo} from 'react';
import {FlatList, Animated} from 'react-native';
import {PopularEbookHorizontal} from '../../component/item-list';

const FlatListAnimated = Animated.createAnimatedComponent(FlatList);
const PopularEbook = memo(
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
      <PopularEbookHorizontal
        item={item}
        onNavigateDetails={onNavigateDetails}
      />
    );

    const onNavigateDetails = item => {
      navigation.navigate('EbooksDetailsScreen', {id: item.id});
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
export default PopularEbook;
