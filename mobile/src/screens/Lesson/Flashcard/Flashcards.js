/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, Image, TouchableOpacity } from 'react-native';
import province from '../../Data/Province';

const button = [
  { id: '1', text: 'Miền Bắc' },
  { id: '2', text: 'Miền Trung' },
  { id: '3', text: 'Miền Nam' },
];


export default function Flashcards({ navigation }) {
  const numColumns = 2;
  const [searchText, setSearchText] = useState('');          
  const [pressedButton, setPressedButton] = useState(null);

  const filteredProvince = province.filter(item => {
    if (pressedButton === null) {
      return true;
    }
    return item.class === pressedButton;
  }).filter(item => {
    return item.text.toLowerCase().includes(searchText.toLowerCase());
  });

  const handleProvincePress = (item) => {
    navigation.navigate('FlashcardsDetail', { provinceId: item.id });
  };

  const renderProvince = ({ item }) => (
    <TouchableOpacity onPress={() => handleProvincePress(item)}>
      <View style={styles.province}>
        <Image style={styles.imgProvince} source={item.img}/>
        <Text style={styles.textProvince}>{item.text}</Text>
        <Text style={styles.textProvince1}>{item.class}</Text>
      </View>
    </TouchableOpacity>
  );

  const handlePress = (classValue) => {
    setPressedButton(classValue === pressedButton ? null : classValue);
  };

  const renderButton = ({ item }) => (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: item.text === pressedButton ? '#5EDFFF' : '#263238' }]}
        onPress={() => handlePress(item.text)}
      >
        <Text style={styles.buttonText}>{item.text}</Text>
      </TouchableOpacity>
    </View>
  );
  return (
    <View style={styles.container}>
      <View style={styles.goBack}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>&lt;</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.textMain}>
        <Text style={styles.VN}>Flashcard 63 tỉnh thành</Text>
      </Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Nhập từ khóa tìm kiếm..."
          onChangeText={(text) => setSearchText(text)}
          value={searchText}
        />
      </View>
      <View style={{ top: 20, height: 70 }}>
          <FlatList
            data={button}
            renderItem={renderButton}
            keyExtractor={(item) => item.id}
            horizontal={true}
          />
      </View>
      <View>
          <FlatList
            data={filteredProvince}
            renderItem={renderProvince}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            ListFooterComponent={<View style={{height: 300}} />}
          />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  goBack:{
    top: 30,
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
    top: 30,
    color: 'black',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 350,
  },
  VN: {
    color: 'orange',
  },
  searchContainer: {
    marginTop: 40,
    width: '85%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  province: {
    justifyContent: 'center',
    alignItems: 'left',
    margin: 7,
    height: 300,
    width: 180,
    borderRadius: 20,
  },
  textProvince: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    bottom: 40,
    left: 10,
  },
  textProvince1: {
    bottom: 35,
    color: 'white',
    fontSize: 1,
    left: 10,
  },
  imgProvince: {
    top: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
    width: 180,
    borderRadius: 20,
  },
  buttonContainer: {
    width: 120,
  },
  button: {
    backgroundColor: "#2196F3",
    borderRadius: 10,
    paddingVertical: 10,
    width: 100,
    left: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});
