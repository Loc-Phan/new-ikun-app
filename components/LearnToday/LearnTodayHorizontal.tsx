import React, { useCallback } from 'react';
import { DeviceEventEmitter, StyleSheet, TouchableOpacity } from 'react-native';
import RenderDataHTML from '../RenderDataHTML';

interface LearnTodayHorizontalProps {
  navigation: any;
  item: {
    id: number;
    slug?: string;
    title: string;
  };
}

const LearnTodayHorizontal: React.FC<LearnTodayHorizontalProps> = ({
  navigation,
  item,
}) => {
  const handleNavigateDetail = useCallback(() => {
    if (item?.slug === 'ebook') {
      navigation.navigate('Ebook');
    } else {
      navigation.navigate('Courses');
      DeviceEventEmitter.emit('refresh_with_category', item.id);
    }
  }, [item, navigation]);

  return (
    <TouchableOpacity
      onPress={handleNavigateDetail}
      style={[styles.container, { backgroundColor: '#EFFCFF' }]}
    >
      <RenderDataHTML html={item.title} style={styles.title} />
    </TouchableOpacity>
  );
};

export default LearnTodayHorizontal;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginVertical: 4,
    backgroundColor: '#fff',
    marginRight: 16,
    borderRadius: 24,
  },
  title: {
    
    fontSize: 14,
    color: '#0B2337',
    lineHeight: 20,
  },
});
