import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../../../Data/Firebase';
import { collection, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome5';

const MyQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchQuizzes = async (uid) => {
      try {
        const querySnapshot = await getDocs(collection(db, 'quizzes'));
        const quizzesList = querySnapshot.docs
          .filter((doc) => doc.data().author.uid === uid)
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        setQuizzes(quizzesList);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch quizzes');
        console.error('Error fetching quizzes:', error);
      }
    };

    const fetchUserData = async (user) => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
          fetchQuizzes(user.uid);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch user data');
        console.error('Error fetching user data:', error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user);
      } else {
        navigation.replace('Login');
      }
    });

    return unsubscribe;
  }, [navigation]);

  const coverImages = {
    ls10: require("../../../../assets/lesson/History-10.png"),
    ls11: require("../../../../assets/lesson/History-11.png"),
    ls12: require("../../../../assets/lesson/History-12.png"),
    dp10: require("../../../../assets/lesson/GDĐP-10.png"),
    dp11: require("../../../../assets/lesson/GDĐP-11.png"),
    // default: require('../assets/images/default.png'),
  };

  const getCoverImage = (type) => {
    try {
      return coverImages[type] || coverImages.default;
    } catch (error) {
      return coverImages.default;
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa quiz này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'quizzes', id));
              setQuizzes(quizzes.filter((quiz) => quiz.id !== id));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete quiz');
              console.error('Error deleting quiz:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderQuizItem = ({ item }) => (
    <View style={styles.quizBox}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ListQuiz', { quizId: item.id })}
        activeOpacity={0.7}
      >
        <Image
          source={getCoverImage(item.type)}
          style={styles.quizImage}
          resizeMode="cover"
          defaultSource={coverImages.default}
        />
        <Text style={styles.quizTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.authorContainer}>
          <Image
            source={{ uri: item.author.photo }}
            style={styles.authorPhoto}
            defaultSource={require('../../../../assets/icon/account.jpg')}
          />
          <Text style={styles.authorName}>{item.author.name}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => navigation.navigate('EditQuiz', { quizId: item.id })}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={() => handleDelete(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  const HeaderComponent = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Icon name="chevron-left" size={20} color="#000" />
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>
      
      <View style={styles.userContainer}>
        {userDetails ? (
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: userDetails.photo }}
              style={styles.userAvatar}
              defaultSource={require('../../../../assets/icon/account.jpg')}
            />
            <Text style={styles.userName}>{userDetails.firstName}</Text>
          </View>
        ) : (
          <Text style={styles.loginText}>Chưa Đăng nhập</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateQuiz')}
        activeOpacity={0.7}
      >
        <Text style={styles.createButtonText}>Tạo bài quiz</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent />
      <FlatList
        data={quizzes}
        renderItem={renderQuizItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.quizList}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  userContainer: {
    marginBottom: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#292929',
  },
  loginText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#292929',
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quizList: {
    padding: 16,
  },
  quizBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quizImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#292929',
    marginTop: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  authorPhoto: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  authorName: {
    fontSize: 14,
    color: '#292929',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MyQuiz;