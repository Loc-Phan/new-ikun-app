import React, {Component} from 'react';
import {TouchableOpacity, DeviceEventEmitter} from 'react-native';
import RenderDataHTML from '../../component/common/render-data-html';

import styles from './styles/learn-today-horizontal';

export default class LearnTodayHorizontal extends Component {
  onNavigateDetail = () => {
    const {navigation, item} = this.props;
    if (item?.slug === 'ebook') {
      navigation.navigate('Ebook');
      return;
    }
    navigation.navigate('Courses');
    DeviceEventEmitter.emit('refresh_with_category', item.id);
  };
  render() {
    const {item} = this.props;

    return (
      <TouchableOpacity
        onPress={this.onNavigateDetail}
        style={[styles.container, {backgroundColor: '#EFFCFF'}]}>
        <RenderDataHTML html={item.title} style={styles.title} />
      </TouchableOpacity>
    );
  }
}
