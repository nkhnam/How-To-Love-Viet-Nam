/* eslint-disable prettier/prettier */
/* eslint-disable quotes */
import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';

const provinces = [
  {
    id: '1',
    text: 'An Giang',
    images: [
      require("../../../assets/provide/AnGiang/OcEoBaThe.png"),
      require("../../../assets/provide/AnGiang/TDT.png"),
    ],
  },
  {
    id: '2',
    text: 'Bắc Giang',
    images: [
      require("../../../assets/provide/BacGiang/ChùaVĩnhNghiêm.png"),
    ],
  },
  {
    id: '3',
    text: 'Bắc Kan',
    images: [
      require("../../../assets/provide/BacKan/HồBaBể.png"),
    ],
  },
  {
    id: '4',
    text: 'Bạc Liêu',
    images: [
      require("../../../assets/provide/BacLieu/cáichanh.png"),
    ],
  },
  {
    id: '5',
    text: 'Bắc Ninh',
    images: [
      require("../../../assets/provide/BacNinh/ChùaBútTháp.png"),
    ],
  },
  {
    id: '6',
    text: 'Bến Tre',
    images: [
      require("../../../assets/provide/BenTre/ĐồngKhởi.png"),
    ],
  },
  {
    id: '7',
    text: 'Bình Định',
    images: [
      require("../../../assets/provide/BinhDinh/ThápDươngLong.png"),
    ],
  },
];

const FlashcardDetail = ({ route, navigation }) => {
  const { provinceId } = route.params;
  const selectedProvince = provinces.find(item => item.id === provinceId);

  const renderImage = ({ item }) => (
    <Image style={styles.image} source={item} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.goBack}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>&lt;</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.textMain}>
        Flashcard danh lam di tích tỉnh 
        <Text style={styles.VN}>{selectedProvince.text}</Text>
      </Text>
      <FlatList
        data={selectedProvince.images}
        renderItem={renderImage}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  goBack: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 45,
    height: 45,
    backgroundColor: '#A5A5A5',
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goBackText: {
    color: 'white',
    fontSize: 30,
  },
  textMain: {
    color: 'black',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 370,
    marginTop: 30,
  },
  VN: {
    color: 'orange',
  },
  image: {
    height: 500,
    width: 330,
    marginHorizontal: 15,
    borderRadius: 20,
    marginTop: 20,
  },
});

export default FlashcardDetail;
