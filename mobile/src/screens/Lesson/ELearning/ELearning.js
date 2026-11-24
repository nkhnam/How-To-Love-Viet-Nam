/* eslint-disable prettier/prettier */
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Linking, Text, Image } from 'react-native';


export default function ELearning({navigation}) {
  return (
    <View style={styles.container}>
      <View style={styles.goBack}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>&lt;</Text>
        </TouchableOpacity>
      </View>
      <View>
          <Text style={styles.textMain}>Bài giảng E-learning</Text>
        </View>
      <View style={styles.flashcard}>
          <Text style={styles.flashcardsText}>Bài giảng E-learning</Text>
          <Text style={styles.flashcardsText1}>Gồm bài giảng Lịch sử và GDĐP, tích hợp cộng nghệ vào giảng dạy</Text>
          <Image style={styles.flashcardsImage} source={require('../../../assets/icon/1.png')}></Image>
          <TouchableOpacity
          style={styles.button}
          onPress={() => Linking.openURL('https://howtolovevietnamreactjs.netlify.app/elearningsection/home')}>
          <Text style={styles.buttonText}>Xem ngay</Text>
        </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    top: 30,
    alignItems: 'center',
  },
  goBack:{
    right: 170,
    width: 45,
    height: 45,
    backgroundColor: '#A5A5A5',
    borderRadius: 1000,
  },
  goBackText: {
    color: 'white',
    textAlign: 'center',
    justifyContent: 'center',
    fontSize: 30,
  },
  textMain: {
    color: 'black',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  flashcard: {
    top: 20,
    height: 150,
    width: 370,
    backgroundColor: '#FEF3E7',
    borderRadius: 20,
  },
  flashcardsText: {
    color: '#573926',
    fontSize: 20,
    fontWeight: 'bold',
    top: 20,
    left: 30,
  },
  flashcardsText1: {
    color: '#573926',
    fontSize: 12,
    top: 30,
    left: 30,
    marginRight: 170,
  },
  flashcardsImage: {
    width: 200,
    height: 200,
    left: 200,
    bottom: 80,
  },
  button: {
    backgroundColor: "#176FF2",
    borderRadius: 20,
    paddingVertical: 10,
    width: 110,
    alignSelf: 'center',
    bottom: 160,
    right: 100,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  ELearning: {
    top: 50,
    height: 150,
    width: 370,
    backgroundColor: '#53A06E',
    borderRadius: 20,
  },
  ELearningText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    top: 20,
    left: 30,
  },
  ELearningText1: {
    color: 'white',
    fontSize: 12,
    top: 30,
    left: 30,
    marginRight: 170,
  },
  ELearningImage: {
    width: 200,
    height: 200,
    left: 200,
    bottom: 80,
  },
});

