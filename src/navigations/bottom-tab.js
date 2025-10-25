import * as React from 'react';
import { View, Image, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Images } from '../assets';
import Home from '../screens/home';
import Courses from '../screens/courses';
import MyCourse from '../screens/my-course';
import Ebook from '../screens/ebook';

const Tab = createBottomTabNavigator();

const TAB_SCREENS = [
  {
    name: 'HomeScreen',
    component: Home,
    icon: Images.iconTabHome,
    activeIcon: Images.activeIconTabHome,
    label: 'Trang chủ',
  },
  {
    name: 'Ebook',
    component: Ebook,
    icon: Images.iconEbook,
    activeIcon: Images.activeIconEbook,
    label: 'EBOOK',
  },
  {
    name: 'Courses',
    component: Courses,
    icon: Images.iconTabCoures,
    activeIcon: Images.activeIconTabCoures,
    label: 'Khóa học',
  },
  {
    name: 'MyCourse',
    component: MyCourse,
    icon: Images.iconTabMyCourse,
    activeIcon: Images.activeIconTabMyCourse,
    label: 'KH của tôi',
  },
];

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        lazy: false,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#1180C3',
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: '#fff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderColor: 'transparent',
          position: 'absolute',
          shadowColor: '#000',
          height: Platform.OS === 'ios' ? 100 : 80,
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.4,
          shadowRadius: 6,
          elevation: 10,
        },
      }}
    >
      {TAB_SCREENS.map((item, index) => (
        <Tab.Screen
          key={index}
          name={item.name}
          component={item.component}
          options={{
            tabBarLabel: ({ focused, color, position }) => (
              <TabBarLabel
                focused={focused}
                color={color}
                label={item.label}
                position={position}
              />
            ),
            tabBarIcon: ({ focused, color }) => (
              <TabBarIcon
                focused={focused}
                icon={item.icon}
                activeIcon={item.activeIcon}
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

function TabBarLabel({ focused, color, label, position }) {
  return (
    <Text
      style={{
        fontSize: 12,
        lineHeight: 20,
        textAlign: 'center',
        color: color || '#7F8E9D',
        fontWeight: focused ? 600 : 300,
        fontFamily: focused ? 'Inter-SemiBold' : 'Inter-Regular',
        zIndex: 100,
        marginLeft: position === 'beside-icon' ? 15 : 0,
        marginBottom: Platform.OS === 'ios' ? 0 : 8,
      }}
    >
      {label}
    </Text>
  );
}

function TabBarIcon({ focused, icon, activeIcon }) {
  return (
    <View>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 8,
        }}
      >
        <Image
          source={focused ? activeIcon : icon}
          style={{
            width: 36,
            height: 36,
            resizeMode: 'contain',
            position: 'relative',
          }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}
