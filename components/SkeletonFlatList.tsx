import React, { useEffect, useRef } from 'react';
import { Animated, FlatList, StyleSheet } from 'react-native';

// Skeleton FlatList opacity animation.
const SkeletonFlatList = ({ items = 3, itemStyles, layout = 'row' }: any) => {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  // Return FlatList with animated opacity based on layout.
  const isHorizontal = layout === 'row';
  
  return (
    <FlatList
      horizontal={isHorizontal}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      data={Array(items).fill('')}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item, index }) => (
        <Animated.View
          style={[
            isHorizontal ? styles.itemHorizontal : styles.itemVertical,
            itemStyles,
            { opacity }
          ]}
        />
      )}
      contentContainerStyle={
        isHorizontal 
          ? { paddingHorizontal: 10 }
          : { paddingHorizontal: 16, paddingTop: 20 }
      }
    />
  );
};

const styles = StyleSheet.create({
  itemHorizontal: {
    marginTop: 8,
    width: 220,
    height: 134,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  itemVertical: {
    marginTop: 16,
    width: '100%',
    height: 134,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
});

export default SkeletonFlatList;
