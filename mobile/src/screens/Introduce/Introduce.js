import React from 'react';
import { ImageBackground, StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function Introduce({ navigation }) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/bg.jpg')}
        resizeMode="cover" 
        style={styles.image}
      >
        <Image
          source={require('../../assets/travel.png')}
          style={styles.img}
        />
        <View style={styles.textContainer}>
          <Text style={styles.text}>Khám phá</Text>
          <Text style={[styles.text, styles.VN]}>Việt Nam</Text>
          <Text style={styles.text}>theo cách riêng</Text>
          <Text style={styles.text}>của bạn</Text>
        </View>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Introduce1')}
        >
          <Text style={styles.buttonText}>Khám phá ngay</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    width: width * 0.8, 
    marginLeft: 20, 
  },
  text: {
    fontFamily: 'Montserrat-Regular',
    color: 'white',
    fontSize: 40,
    lineHeight: 50,
    fontWeight: '500',
    textAlign: 'left',
  },
  img: {
    width: width * 0.9, 
    height: width * 0.9, 
    marginBottom: 20,
  },
  VN: {
    color: 'yellow',
  },
  button: {
    marginTop: 20,
    backgroundColor: "#2196F3",
    borderRadius: 20,
    paddingVertical: 10,
    width: width * 0.8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
  },
});
