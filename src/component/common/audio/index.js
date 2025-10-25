import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import styles from './styles';
import SoundPlayer from 'react-native-sound';
import IconI from 'react-native-vector-icons/Ionicons';
import IconM from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import {useAudioHelper} from './helper';

const playSpeeds = [
  {value: 0.5, text: '0.5x'},
  {value: 0.75, text: '0.75x'},
  {value: 1, text: '1x'},
  {value: 1.5, text: '1.5x'},
  {value: 2, text: '2x'},
];

const Audio = ({url}) => {
  const [isShowVolume, setIsShowVolume] = useState(false);
  const [isShowSpeed, setIsShowSpeed] = useState(false);
  const player = useAudioHelper({
    listSounds: [
      {
        type: 'app-bundle',
        path: url,
        name: 'Blue Dream - Cheel',
        basePath: SoundPlayer.MAIN_BUNDLE,
      },
    ],
    timeRate: 15,
    isLogStatus: true,
  });

  const handleOpenVolume = () => {
    if (isShowSpeed) {
      setIsShowSpeed(false);
    }
    setIsShowVolume(!isShowVolume);
  };

  const handleOpenSpeed = () => {
    if (isShowVolume) {
      setIsShowVolume(false);
    }
    setIsShowSpeed(!isShowSpeed);
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Audio ai là người thương em</Text> */}
      <View style={styles.progressBar}>
        <Text style={styles.progressBarText}>{player.currentTimeString}</Text>
        <Slider
          style={{width: '60%', height: 40}}
          minimumValue={0}
          maximumValue={player.duration}
          value={player.currentTime}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="gray"
          thumbTintColor="#FFFFFF"
          onTouchStart={player.pause}
          onTouchEnd={player.play}
          onSlidingComplete={seconds => player.seekToTime(seconds)}
        />
        <Text style={styles.progressBarText}>{player.durationString}</Text>
      </View>
      <View style={styles.actionWrapper}>
        {player.status === 'play' ? (
          <TouchableOpacity style={styles.playWrapper} onPress={player.pause}>
            <IconI name="pause" style={styles.iconAction} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.playWrapper} onPress={player.play}>
            <IconI name="play" style={styles.iconAction} />
          </TouchableOpacity>
        )}
        <View style={styles.actionWrapperInner}>
          <View style={styles.volumeContainer}>
            <TouchableOpacity onPress={handleOpenVolume}>
              <IconI name="volume-low" style={styles.iconAction} />
            </TouchableOpacity>
            {isShowVolume && (
              <Slider
                style={{width: 120, height: 24}}
                minimumValue={0}
                maximumValue={100}
                value={player.volume}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="gray"
                thumbTintColor="#FFFFFF"
                onSlidingComplete={volume => player.setVolume(volume)}
              />
            )}
          </View>
          <TouchableOpacity onPress={handleOpenSpeed}>
            <IconM name="play-speed" style={{fontSize: 24, color: '#fff'}} />
          </TouchableOpacity>
          {isShowSpeed && (
            <View style={styles.speedWrapper}>
              {playSpeeds.map(item => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => player.setSpeed(item.value)}>
                  <Text
                    style={[
                      styles.speedText,
                      {color: player.speed === item.value ? '#F1673A' : '#fff'},
                    ]}>
                    {item.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default Audio;
