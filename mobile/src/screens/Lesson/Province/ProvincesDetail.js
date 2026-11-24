import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

// Move data to a separate file for better organization
const PROVINCES = [
  {
    id: '1',
    img: require("../../../assets/provide/AnGiang/AnGiang.jpg"),
    text: 'An Giang',
    imgCharacteristic: require("../../../assets/provide/AnGiang/AnGiang.jpg"),
    imgCharacteristic1: require("../../../assets/provide/AnGiang/AnGiang.jpg"),
    imgCharacteristic2: require("../../../assets/provide/AnGiang/AnGiang.jpg"),
    imgCharacteristic3: require("../../../assets/provide/AnGiang/AnGiang.jpg"),
    textCharacteristic: 'An Giang sở hữu diện tích khá lớn ở miền Tây Nam Bộ, trong đó có nhiều cảnh quan thiên nhiên tươi đẹp, có sông nước mênh mông, có núi non kỳ vĩ, có rừng tràm, có đồng ruộng bát ngát.',
    imgLocation: require("../../../assets/provide/AnGiang/AnGiang.jpg"),
    textLocation: 'Tỉnh An Giang nằm về phía Tây Nam đồng bằng sông Cửu Long, cách Thành phố Hồ Chí Minh 187 km, phía Đông giáp tỉnh Đồng Tháp dài 107 km, phía Tây giáp tỉnh Kiên Giang, phía Nam giáp thành phố Cần Thơ dài 44 km, phía Bắc giáp tỉnh Kandal và tỉnh Takéo, Campuchia với đường biên giới dài gần 104 km, tổng diện tích 3500 km2.',
    imgCulture: require("../../../assets/provide/AnGiang/AnGiang.jpg"),
    textCulture: 'An Giang là tỉnh giàu truyền thống lịch sử và văn hóa, đa dân tộc, đa tôn giáo. Từ đó, đã hình thành những giá trị văn hóa phong phú, với nhiều lễ hội dân gian, các làng nghề truyền thống và nhiều công trình kiến trúc độc đáo.',
  },
];

const SectionTitle = ({ children }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const SectionText = ({ children }) => (
  <Text style={styles.sectionText}>{children}</Text>
);

export default function FlashcardsDetail({ route, navigation }) {
  const { provinceId } = route.params;
  const selectedProvince = PROVINCES.find(item => item.id === provinceId);

  if (!selectedProvince) {
    return (
      <View style={styles.errorContainer}>
        <Text>Không tìm thấy thông tin tỉnh</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image 
        style={styles.img}
        source={selectedProvince.img}
        resizeMethod="resize"
      />
      <TouchableOpacity 
        style={styles.goBack}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={styles.goBackText}>{'<'}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{selectedProvince.text}</Text>
        
        <View style={styles.section}>
          <SectionTitle>Đặc Điểm</SectionTitle>
          <SectionText>{selectedProvince.textCharacteristic}</SectionText>
        </View>

        <View style={styles.section}>
          <SectionTitle>Vị trí</SectionTitle>
          <SectionText>{selectedProvince.textLocation}</SectionText>
          <View style={styles.imageContainer}>
            <Image 
              style={styles.sectionImage}
              source={selectedProvince.imgLocation}
              resizeMethod="resize"
            />
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <SectionTitle>Văn hoá</SectionTitle>
          <SectionText>{selectedProvince.textCulture}</SectionText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 30,
  },
  goBack: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 45,
    height: 45,
    backgroundColor: 'rgba(165, 165, 165, 0.8)',
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  goBackText: {
    color: 'white',
    fontSize: 30,
  },
  img: {
    width: '100%',
    height: 500,
    resizeMode: 'cover',
  },
  title: {
    color: 'orange',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionTitle: {
    color: 'black',
    fontSize: 20,
    marginBottom: 10,
  },
  sectionText: {
    color: 'black',
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
  },
  sectionImage: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
});