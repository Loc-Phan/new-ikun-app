import { Images } from '@/assets';
import React, { useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Rating } from 'react-native-ratings';

interface ReviewHorizontalProps {
  item: {
    user?: {
      avatar?: string;
      full_name?: string;
    };
    description?: string;
    product_title?: string;
    rate?: number;
  };
  onNavigateDetails: (item: any) => void;
}

const ReviewEbookHorizontal: React.FC<ReviewHorizontalProps> = ({
  item,
  onNavigateDetails,
}) => {
  const handleNavigateDetail = useCallback(() => {
    onNavigateDetails(item);
  }, [item, onNavigateDetails]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image
          source={item?.user?.avatar ? { uri: item.user.avatar } : Images.fakeUser1}
          style={styles.avatarReview}
        />
        <Text style={styles.reviewName}>{item?.user?.full_name}</Text>
      </View>

      <Text numberOfLines={5} style={styles.reviewText}>
        {item?.description}
      </Text>

      <TouchableOpacity onPress={handleNavigateDetail}>
        <Text style={[styles.reviewText, { color: '#1180C3' }]}>Xem thêm</Text>
      </TouchableOpacity>

      <View style={styles.courseInfo}>
        <Image source={Images.iconBook} style={styles.iconBook} />
        <Text
          style={styles.reviewSubText}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item?.product_title}
        </Text>
      </View>

      <View style={styles.ratingContainer}>
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
};

export default React.memo(ReviewEbookHorizontal);

const styles = StyleSheet.create({
  card: {
    width: 230,
    backgroundColor: '#F4F6F8',
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatarReview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: 'contain',
  },
  reviewName: {
    marginVertical: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2337',
  },
  reviewText: {
    
    fontSize: 14,
  },
  reviewSubText: {
    
    fontSize: 12,
    color: '#707172',
    fontWeight: '400',
  },
  rate: {
    backgroundColor: '#1180C3',
    borderRadius: 4,
    padding: 4,
    fontSize: 12,
    color: '#fff',
  },
  courseInfo: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    width: '80%',
  },
  iconBook: {
    width: 20,
    height: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
});
