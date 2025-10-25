import React, {Component} from 'react';
import {Text, View, Image, BackHandler, TouchableOpacity} from 'react-native';
import {Images} from '../../assets';
import styles from './styles';
import WebView from 'react-native-webview';

class WebViewScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textSearch: '',
      title: '',
      url: '',
    };

    this.backHandler = null;
  }

  async componentDidMount() {
    const {route} = this.props;
    this.setState({
      title: route.params?.title || '',
      url: route.params?.url || '',
    });
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
    const {navigation} = this.props;
    navigation.goBack(null);
    return true;
  };

  goBack = () => {
    const {navigation} = this.props;
    navigation.goBack();
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.header1}>
            <TouchableOpacity
              onPress={this.goBack}
              hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
              <Image source={Images.iconBack} style={styles.iconBack} />
            </TouchableOpacity>
            <Text style={styles.title}>{this.state.title}</Text>
          </View>
        </View>
        <WebView
          source={{
            uri: `${this.state.url}`,
          }}
        />
      </View>
    );
  }
}

export default WebViewScreen;
