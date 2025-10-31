import { Images } from '@/assets';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Pdf from 'react-native-pdf';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PdfScreen() {
  const { title, uri } = useLocalSearchParams<{ title: string; uri: string }>();
  console.log("uri",uri);
  const navigation = useNavigation();

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.header1}>
            <TouchableOpacity
              onPress={goBack}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Image source={Images.iconBack} style={styles.iconBack} />
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>
        <Pdf
          trustAllCerts={false}
          source={{
            uri: uri,
            cache: true,
          }}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`Number of pages: ${numberOfPages}`);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`Current page: ${page}`);
          }}
          onError={error => {
            console.log(error);
          }}
          onPressLink={uri => {
            console.log(`Link pressed: ${uri}`);
          }}
          style={styles.pdf}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  header: {
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  header1: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  iconBack: {
    height: 14,
    width: 14,
    resizeMode: 'contain',
    tintColor: '#000',
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    lineHeight: 20,
    textAlign: 'center',
    flex: 1,
  },
});
