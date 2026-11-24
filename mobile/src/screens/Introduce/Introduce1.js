import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import province from '../Data/Province';

const { width } = Dimensions.get('window');

const renderProvince = ({ item }) => (
  <View style={styles.province}>
    <Image style={styles.imgProvince} source={item.img} />
    <View style={styles.containerTextProvince}></View>
    <Text style={styles.textProvince}>{item.text}</Text>
  </View>
);

const introduce = [
  { id: '1', text: 'Hệ thống bài giảng E-Learning cùng Flashcards trực quan, dễ hiểu', img: require("../../assets/emoji/love.png") },
  { id: '2', text: 'Tích hợp website và ứng dụng, giúp truy cập ở mọi nền tảng kể cả khi không có mạng', img: require("../../assets/emoji/heart.png") },
  { id: '3', text: 'Giúp tìm hiểu vẻ đẹp về văn hóa, con người Việt Nam trực tuyến, mở rộng kiến thức về lịch sử và GDĐP', img: require("../../assets/emoji/fun.png") },
];

const renderIntroduce = ({ item }) => (
  <View style={styles.introduce}>
    <Image style={styles.imgIntroduce} source={item.img} />
    <Text style={styles.textIntroduce}>{item.text}</Text>
  </View>
);

export default function Introduce1({ navigation }) {
  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.container}>
          <View>
            <Text style={styles.textMain}>Nhìn ngắm nét đặc trưng về</Text>
            <Text style={styles.textMain}>văn hoá kiến trúc của</Text>
            <Text style={styles.textMain}>đất nước <Text style={styles.VN}>Việt Nam</Text></Text>
          </View>
          <View style={{ top: 10 }}>
            <FlatList
              data={province}
              renderItem={renderProvince}
              keyExtractor={(item) => item.id}
              horizontal={true}
            />
          </View>
          <View style={{ top: 20 }}>
            <Text style={styles.textMain}>Tại sao lại là</Text>
            <Text style={[styles.textMain, styles.VN]}>How to love VietNam</Text>
          </View>
        </View>
      }
      data={introduce}
      renderItem={renderIntroduce}
      keyExtractor={(item) => item.id}
      ListFooterComponent={
        <View style={{ top: 0 }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonText}>Khám phá ngay</Text>
          </TouchableOpacity>
        </View>
      }
      contentContainerStyle={styles.scrollViewContainer}
    />
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    paddingBottom: 70,
  },
  container: {
    padding: 10,
    top: 20,
    fontFamily: 'Montserrat-Regular',
  },
  textMain: {
    color: 'black',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
    
  },
  VN: {
    color: 'orange',
  },
  province: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    height: 300,
    width: width * 0.5,
    borderRadius: 20,
  },
  containerTextProvince: {
    backgroundColor: 'gray',
    height: 20,
    width: 80,
    borderRadius: 10,
    bottom: 20,
  },
  textProvince: {
    bottom: 40,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
  },
  imgProvince: {
    top: 20,
    height: '100%',
    width: '100%',
    borderRadius: 20,
  },
  introduce: {
    backgroundColor: 'pink',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    top: 30,
    marginLeft: 20,
    height: 80,
    width: width * 0.9,
    borderRadius: 20,
    flexDirection: 'row',
  },
  imgIntroduce: {
    flex: 1,
    height: 70,
    width: 50,
    resizeMode: 'contain',
  },
  textIntroduce: {
    flex: 3,
    marginRight: 30,
    fontFamily: 'Montserrat-Regular',
  },
  button: {
    top: 40,
    backgroundColor: "#2196F3",
    borderRadius: 20,
    paddingVertical: 10,
    width: width * 0.8,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
    fontSize: 20,
  },
});
