import React from 'react';
import {ImageBackground, StyleSheet, Text, View} from 'react-native';

export default function SplashScreen({navigation}) {
    setTimeout(() => {
      navigation.navigate('Introduce');
    }, 2000);
  return (
    <View style={styles.container}>
      <ImageBackground
      source={require('../../assets/logo.png')}
      resizeMode="cover" 
      style={styles.image}>
        <Text style={styles.text}>How to love VN</Text>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    color: 'black',
    fontSize: 22,
    lineHeight: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    top: 150,
    width: 300,
  },
});
