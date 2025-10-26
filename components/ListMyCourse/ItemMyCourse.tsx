import { useNavigation } from 'expo-router';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ItemMyCourseProps {
  item: any;
}

export default function ItemMyCourse({ item }: ItemMyCourseProps) {
  const navigation = useNavigation<any>();

  const onNavigateDetail = (item: any) => {
    // navigation.navigate('CoursesDetailsScreen', { id: item.id });
  };

  return (
    <TouchableOpacity
      onPress={() => onNavigateDetail(item)}
      style={styles.container}
    >
      <Image source={{ uri: item?.image }} style={styles.image} />
      <View style={styles.viewContent}>
        {item?.category && (
          <Text numberOfLines={1} style={styles.content}>
            {item.category}
          </Text>
        )}
        <Text style={styles.txt1} numberOfLines={1}>
          {item?.title}
        </Text>
        <View
          style={{
            height: 5,
            backgroundColor: '#F3F3F3',
            justifyContent: 'center',
            marginBottom: 10,
          }}
        >
          <View
            style={{
              zIndex: 100,
              position: 'absolute',
              height: 9,
              width: 1,
              backgroundColor: '#0B2337',
              left: `${item?.progress}%`,
            }}
          />
          <View
            style={[
              {
                height: 5,
                backgroundColor: item?.progress === 100 ? '#56C943' : '#1180C3',
              },
              { width: `${String(item?.progress)}%` as any },
            ]}
          />
        </View>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {item?.progress === 100 ? (
              <Text style={styles.txtPass}>Đã hoàn thành</Text>
            ) : (
              <Text style={[styles.txtProgress, { color: '#1180C3' }]}>
                Đang học
              </Text>
            )}
            <Text style={[styles.txtProgress]}>{item?.duration} phút</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 120,
    height: 90,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: '#e5e5e5',
  },
  viewContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  content: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#939393',
    marginBottom: 5,
  },
  txt1: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#000',
    fontWeight: '500',
    marginBottom: 10,
  },
  txtPass: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#56C943',
  },
  txtProgress: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#1180C3',
  },
});