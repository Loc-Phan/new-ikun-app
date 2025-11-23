import { useNavigation } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import RenderDataHTML from '../RenderDataHTML';

interface LearnTodayHorizontalProps {
  item: {
    id: number;
    slug?: string;
    title: string;
  };
}

const LearnTodayHorizontal: React.FC<LearnTodayHorizontalProps> = ({
  item,
}) => {
  const navigation = useNavigation<any>();
  const handleNavigateDetail = useCallback(() => {
    if (item?.slug === 'ebook') {
      navigation.navigate('ebooks');
    } else {
      navigation.navigate('courses', { idCategory: item.id });
    }
  }, [item]);

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
