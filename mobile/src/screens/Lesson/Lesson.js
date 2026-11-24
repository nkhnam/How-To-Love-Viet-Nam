import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TabBar from '../TabBar';

export default function Lesson() {
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
  const cardsData = [
    {
      id: '1',
      title: 'Thẻ flashcard',
      description: 'Gồm thẻ lịch sử và danh lam thắng cảnh trải dài 63 tỉnh thành',
      image: require('../../assets/icon/1.png'),
      backgroundColor: '#FEF3E7',
      route: 'Flashcards'
    },
    {
      id: '2',
      title: 'Bài giảng E-learning',
      description: 'Gồm bài giảng Lịch sử và GDĐP, tích hợp công nghệ vào giảng dạy',
      image: require('../../assets/icon/2.png'),
      backgroundColor: '#53A06E',
      textColor: '#FFFFFF',
      route: 'ELearning'
    },
    {
      id: '3',
      title: 'Câu hỏi',
      description: 'Câu hỏi trắc nghiệm giúp bạn kiểm tra kiến thức.',
      image: require('../../assets/icon/3.png'),
      backgroundColor: '#BCC3FF',
      route: 'Quiz'
    },
    {
      id: '4',
      title: 'Sơ đồ tư duy',
      description: 'Xây dựng sơ đồ tư duy để hệ thống hóa thông tin',
      image: require('../../assets/icon/1.png'),
      backgroundColor: '#FEF3E7',
      route: ''
    },
    {
      id: '5',
      title: 'Các tỉnh thành',
      description: 'Khám phá lịch sử và văn hóa của từng tỉnh thành tại Việt Nam.',
      image: require('../../assets/icon/2.png'),
      backgroundColor: '#53A06E',
      textColor: '#FFFFFF',
      route: 'Provinces'
    },
  ];

  const renderCard = ({ item }) => (
    <View style={[styles.card, { backgroundColor: item.backgroundColor }]}>
      <Text style={[styles.cardTitle, item.textColor && { color: item.textColor }]}>{item.title}</Text>
      <Text style={[styles.cardDescription, item.textColor && { color: item.textColor }]}>{item.description}</Text>
      <Image style={styles.cardImage} source={item.image}></Image>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate(item.route)}>
        <Text style={styles.buttonText}>Xem ngay</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cardsData}
        renderItem={renderCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.flatListContainer}
      />
      <TabBar onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  flatListContainer: {
    paddingBottom: 100,
  },
  accountContainer: {
    alignSelf: 'flex-end',
    right: 30,
    bottom: 20,
  },
  account: {
    width: 40,
    height: 40,
    borderRadius: 100,
  },
  textMain: {
    color: 'black',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  VN: {
    color: 'orange',
  },
  card: {
    marginTop: 20,
    height: 150,
    width: 370,
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#573926',
  },
  cardDescription: {
    fontSize: 12,
    color: '#573926',
    marginTop: 10,
    marginRight: 130,
  },
  cardImage: {
    width: 200,
    height: 200,
    position: 'absolute',
    left: 180,
  },
  button: {
    backgroundColor: "#176FF2",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});
