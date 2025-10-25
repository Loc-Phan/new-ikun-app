import React, { useCallback } from 'react';
import { DeviceEventEmitter, StyleSheet, TouchableOpacity, View } from 'react-native';
import RenderDataHTML from '../RenderDataHTML';

interface LearnTodayVerticalProps {
  navigation: any;
  item: {
    id: number;
    slug?: string;
    title: string;
  };
}

const LearnTodayVertical: React.FC<LearnTodayVerticalProps> = ({ navigation, item }) => {
  const handleNavigateDetail = useCallback(() => {
    if (item?.slug === 'ebook') {
      navigation.navigate('Ebook');
    } else {
      navigation.navigate('Courses');
      DeviceEventEmitter.emit('refresh_with_category', item.id);
    }
  }, [item, navigation]);

  return (
    <TouchableOpacity onPress={handleNavigateDetail} style={styles.container}>
      <View style={styles.inner}>
        <RenderDataHTML html={item.title} style={styles.title} />
      </View>
    </TouchableOpacity>
  );
};

export default LearnTodayVertical;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EFFCFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  inner: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    
    fontSize: 14,
    color: '#0B2337',
    lineHeight: 20,
  },
});
