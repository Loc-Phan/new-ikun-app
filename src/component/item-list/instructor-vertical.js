import React, { memo, forwardRef } from 'react';
import { TouchableOpacity } from 'react-native';
import styles from './styles/instructor-vertical';

const InstructorVertical = memo(
  forwardRef((props, ref) => {
    const onNavigateDetail = () => {
      onPress(productId);
    };

    return (
      <TouchableOpacity onPress={onNavigateDetail} style={styles.container}>

      </TouchableOpacity>
    );
  }),
  () => true
);
export default InstructorVertical;
