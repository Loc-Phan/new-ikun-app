import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { connect } from 'react-redux';
import styles from './styles/review-horizontal';
import {Images} from '../../assets';
import { Rating } from 'react-native-ratings';

class ReviewHorizontal extends PureComponent {
  onNavigateDetail = () => {
    const { item, onNavigateDetails } = this.props;
    onNavigateDetails(item);
  };

  render() {
    const { item } = this.props;

    return (
      <View
        style={{
          width: 230,
          backgroundColor: '#F4F6F8',
          padding: 12,
          borderRadius: 12,
          marginRight: 8,
          overflow: 'hidden',
        }}
      >
        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
          <Image
            source={item?.avatar ? { uri: item.avatar } : Images.fakeUser1}
            style={styles.avatarReview}
          />
          <Text style={styles.reviewName}>{item?.name}</Text>
        </View>
        <Text numberOfLines={5} style={styles.reviewText}>
          {item?.description}
        </Text>
        <TouchableOpacity onPress={() => this.onNavigateDetail()}>
          <Text style={[styles.reviewText, { color: '#1180C3' }]}>
            Xem thêm
          </Text>
        </TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            marginTop: 16,
            width: '80%',
          }}
        >
          <Image source={Images.iconBook} style={{ width: 20, height: 20 }} />
          <Text
            style={styles.reviewSubText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item?.course_title}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 8,
            marginTop: 16,
          }}
        >
          <Rating
            ratingCount={5}
            imageSize={20}
            readonly
            tintColor="#ebf7ff"
            ratingColor="#ffc600"
            startingValue={item?.rate}
          />
          <Text style={styles.rate}>{Number(item?.rate).toFixed(1)}</Text>
        </View>
      </View>
    );
  }
}
const mapStateToProps = () => ({});
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(ReviewHorizontal);
