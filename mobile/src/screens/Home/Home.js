import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TabBar from '../TabBar';
import Forum from './Forum/Forum';

const Home = () => {
  const navigation = useNavigation();
  const handleTabPress = (tab) => {
    switch (tab) {
      case 'Home':
        navigation.navigate('Home');
        break;
      case 'Lesson':
        navigation.navigate('Lesson');
        break;
      case 'Cameras':
        navigation.navigate('Cameras');
        break;
      case 'Chatbot':
        navigation.navigate('Chatbot');
        break;
      case 'Account':
        navigation.navigate('Account');
        break;
      default:
        navigation.navigate('Home');
        break;
    }
  };
  

  return (
    <View style={styles.container}>
      <Forum />
      <TabBar onTabPress={handleTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;
