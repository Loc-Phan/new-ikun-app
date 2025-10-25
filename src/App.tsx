import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import SplashScreen from 'react-native-splash-screen';
import NetInfo from '@react-native-community/netinfo';
import { setToken } from './api/newConfig';
import { saveStatusNetwork } from './actions/network';
import { navigationRef } from './navigations/navigations';
// import { enableSecureView } from 'react-native-prevent-screenshot-ios-android';
import RootScreen from './screens';
import configStore from './store';

const { store, persistor } = configStore();

export { store };

const MyApp = () => {
  useEffect(() => {
    // if (Platform.OS === 'ios') {
    //   enableSecureView(); //This function blocks the Screen share/Recording and taking screenshot for iOS devices.
    // }
    async function setup() {
      try {
        setTimeout(() => {
          SplashScreen.hide();
        }, 1000);
      } catch (e) {
        console.log(e);
      }
    }

    setup();
  }, []);

  const onBeforeLift = async () => {
    NetInfo.addEventListener(async state => {
      try {
        await store.dispatch(saveStatusNetwork(state.isConnected));
      } catch (e) {
        console.log(e);
      }
    });

    const { user } = store.getState();

    if (user?.token) {
      setToken(user?.token);
    }
  };

  return (
    <Provider store={store}>
      <PersistGate
        onBeforeLift={onBeforeLift}
        loading={null}
        persistor={persistor}
      >
        <NavigationContainer ref={navigationRef}>
          <StatusBar
            translucent
            backgroundColor="rgba(255,255,255,0.1)"
            barStyle="dark-content"
          />
          <RootScreen />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

export default MyApp;
