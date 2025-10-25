import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const ProgressCircle = ({
  widthX = 100,
  strokeWidth = 10,
  progress = 0, // từ 0 → 1
  progressColor = '#000',
  backgroundColor = '#eee',
  duration = 1000,
  easing = Easing.linear,
  style,
  textStyle,
}) => {
  const radius = (widthX - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration,
      easing,
      useNativeDriver: false, // vì strokeDashoffset không hỗ trợ native driver
    }).start();
  }, [progress, duration, easing]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const percentage = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  return (
    <View style={[styles.container, style]}>
      <Svg
        width={widthX}
        height={widthX}
        viewBox={`0 0 ${widthX} ${widthX}`}
        style={{ transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={widthX / 2}
          cy={widthX / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Animated.Circle
          cx={widthX / 2}
          cy={widthX / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          fill="transparent"
        />
      </Svg>
      <View style={[styles.textContainer, { width: widthX, height: widthX }]}>
        <Animated.Text
          style={[
            styles.text,
            textStyle,
            {
              transform: [
                {
                  translateY: percentage.interpolate({
                    inputRange: [0, 100],
                    outputRange: [0, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {percentage.__getValue().toFixed(0)}%
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    fontSize: 12,
    color: '#000',
  },
});

export default ProgressCircle;
