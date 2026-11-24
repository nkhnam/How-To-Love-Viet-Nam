import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image, FlatList } from 'react-native';

const lessons = [
  { id: '1', img: require("../../../assets/lesson/GDĐP-10.png") },
  { id: '2', img: require("../../../assets/lesson/GDĐP-11.png") },
  { id: '3', img: require("../../../assets/lesson/GDĐP-12.png") },
  { id: '4', img: require("../../../assets/lesson/History-10.png") },
  { id: '5', img: require("../../../assets/lesson/History-11.png") },
  { id: '6', img: require("../../../assets/lesson/History-12.png") },
  { id: '7', img: require("../../../assets/lesson/AI.png") },
];

const Quiz = ({ navigation }) => {
  const handleLessonsPress = (item) => {
    if (item.id == '7') {
      navigation.navigate('CreateQuiz');
    } else {
      navigation.navigate('ELearningDoExercise', { lessonsId: item.id });
    }
  };
  const renderLessons = ({ item }) => (
    <View style={styles.lessons}>
      <TouchableOpacity onPress={() => handleLessonsPress(item)}>
        <Image style={styles.imgLessons} source={item.img} />
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
      <Text style={styles.textMain}>Bài tập thực hành</Text>
      <FlatList
        data={lessons}
        renderItem={renderLessons}
        keyExtractor={(item) => item.id}
        ListFooterComponent={<View style={{ height: 20 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  goBack: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 10,
    width: 45,
    height: 45,
    backgroundColor: '#A5A5A5',
    borderRadius: 1000,
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
    marginBottom: 20,
  },
  lessons: {
    marginVertical: 10,
    alignItems: 'center',
  },
  imgLessons: {
    height: 180,
    width: 340,
    borderRadius: 20,
  },
});

export default Quiz;
