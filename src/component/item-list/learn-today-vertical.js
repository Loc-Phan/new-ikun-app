import React, {memo, forwardRef} from 'react';
import {TouchableOpacity} from 'react-native';
import styles from './styles/learn-today-vertical';

const LearnTodayVertical = memo(
  forwardRef((props, ref) => {
    const onNavigateDetail = () => {
      onPress(productId);
    };

    return (
      <TouchableOpacity onPress={onNavigateDetail} style={styles.container} />
    );
  }),
  () => true,
);
export default LearnTodayVertical;
