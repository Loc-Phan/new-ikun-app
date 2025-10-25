import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  BackHandler,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Images } from '../../assets';
import { connect } from 'react-redux';
import Pdf from 'react-native-pdf';
import { getStatusBarHeight } from '../../common';

class PDF extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uri: '',
      title: '',
    };

    this.backHandler = null;
  }

  async componentDidMount() {
    const { route } = this.props;
    const uri = route.params?.uri;
    const title = route.params?.title;
    this.setState({ uri: uri, title: title });
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
  }

  componentWillUnmount() {
    if (this.backHandler) {
      this.backHandler.remove();
    }
  }

  handleBackPress = () => {
    const { navigation } = this.props;
    navigation.goBack(null);
    return true;
  };

  goBack = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  render() {
    const uri = this.state.uri;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.header1}>
            <TouchableOpacity
              onPress={this.goBack}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Image source={Images.iconBack} style={styles.iconBack} />
            </TouchableOpacity>
            <Text style={styles.title}>{this.state.title}</Text>
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
    );
  }
}
const mapStateToProps = ({ user }) => ({
  user,
});
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(PDF);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'flex-start',
    // alignItems: 'center',
    marginTop: 25,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? getStatusBarHeight() : 0,
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  header1: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    gap: 8,
    width: '100%',
    // paddingHorizontal: 16,
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
