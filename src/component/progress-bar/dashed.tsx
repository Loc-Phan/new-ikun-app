import React from 'react';
import { View } from 'react-native';
import styles from './styles/dashed';
import { Colors } from '../../assets/colors';

const { background } = Colors;
export default ({ progress, total, style, itemStyle }: any) => {
  const views = [];
  for (let i = 1; i <= total; i += 1)
    views.push(
      <View
        key={i}
        style={[
          styles.item,
          itemStyle,
          {
            backgroundColor:
              i <= progress ? background.bluePrimary : background.greyLight,
          },
        ]}
      />,
    );

  return <View style={[styles.container, style]}>{views}</View>;
};
