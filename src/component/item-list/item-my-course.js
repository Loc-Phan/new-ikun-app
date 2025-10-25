import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import styles from './styles/item-my-course';

class ItemMyCourse extends PureComponent {
  onNavigateDetail = item => {
    const { navigation } = this.props;
    navigation.navigate('CoursesDetailsScreen', { id: item.id });
  };

  render() {
    const { t, item } = this.props;
    console.log(item);
    const target = item?.meta_data?._lp_passing_condition;

    return (
      <TouchableOpacity
        onPress={() => this.onNavigateDetail(item)}
        style={styles.container}
      >
        <FastImage source={{ uri: item?.image }} style={styles.image} />
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
              style={{
                width: `${String(item?.progress)}%`,
                height: 5,
                backgroundColor: item?.progress === 100 ? '#56C943' : '#1180C3',
              }}
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
                <Text style={styles.txtPass}>
                  {t('myCourse.filters.passed')}
                </Text>
              ) : (
                <Text style={[styles.txtProgress, { color: '#1180C3' }]}>
                  {t('myCourse.filters.inProgress')}
                </Text>
              )}
              <Text style={[styles.txtProgress]}>{item?.duration} phút</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}
export default ItemMyCourse;
