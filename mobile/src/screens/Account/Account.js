import React, { useState, useEffect, useCallback } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import TabBar from '../TabBar';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../Data/Firebase';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';

export default function Account() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);

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

  // Fetch user data from Firebase
  const fetchUserData = useCallback(async (userId) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setUserDetails(docSnap.data());
      } else {
        const currentUser = auth.currentUser;
        const newUserDetails = {
          firstName: currentUser.displayName || 'User',
          email: currentUser.email,
          photo: currentUser.photoURL || 'https://example.com/default-avatar.png',
          createdAt: new Date().toISOString(),
        };
        await setDoc(docRef, newUserDetails);
        setUserDetails(newUserDetails);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        setUserDetails(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchUserData]);

  // Handle edit profile
  const handleEditProfile = useCallback(async () => {
    if (!userDetails) return;
    
    navigation.navigate('EditProfile', {
      currentDetails: userDetails,
      onSave: async (newDetails) => {
        try {
          const userId = auth.currentUser.uid;
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, newDetails);
          setUserDetails(prev => ({ ...prev, ...newDetails }));
          Alert.alert('Success', 'Profile updated successfully!');
        } catch (error) {
          console.error('Error updating profile:', error);
          Alert.alert('Error', 'Failed to update profile. Please try again.');
        }
      }
    });
  }, [userDetails, navigation]);

  // Handle edit name
  const handleEditName = () => {
    navigation.navigate('EditProfile', {
      currentDetails: userDetails,
      initialTab: 'name',
      onSave: async (newDetails) => {
        try {
          const userId = auth.currentUser.uid;
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, newDetails);
          setUserDetails(prev => ({ ...prev, ...newDetails }));
          Alert.alert('Success', 'Name updated successfully!');
        } catch (error) {
          console.error('Error updating name:', error);
          Alert.alert('Error', 'Failed to update name. Please try again.');
        }
      }
    });
  };

  const menuItems = [
    { id: 1, title: 'Trang Cá Nhân', icon: 'person', color: '#68A0CF', onPress: () => navigation.navigate('EditProfile') },
    { id: 2, title: 'Blog Của Tôi', icon: 'newspaper-outline', color: '#53C28B', onPress: () => navigation.navigate('ForumPost') },
    { id: 3, title: 'Quiz Của Tôi', icon: 'book-outline', color: '#8C67EF', onPress: () => navigation.navigate('MyQuiz') },
    { id: 4, title: 'Đổi Mật Khẩu', icon: 'lock-closed-outline', color: '#F57C63', onPress: () => navigation.navigate('ChangePassword') },
    { id: 5, title: 'Đăng Xuất', icon: 'log-out-outline', color: '#F7A65A', onPress: async () => {
      try {
        await auth.signOut();
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to sign out. Please try again.');
      }
    }},
  ];

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.menuItem}
      onPress={item.onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Icon name={item.icon} size={24} color="#fff" />
      </View>
      <Text style={styles.menuText}>{item.title}</Text>
      <Icon name="chevron-forward-outline" size={24} color="#C4C4C4" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#68A0CF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/bg-profile.jpg')}
        resizeMode="cover" 
        style={styles.image}
      >
        <Text style={styles.title}>Profile</Text>
        <View style={styles.containerImage}> 
          {userDetails ? (
            <View style={styles.userProfile}>
              <Image
                source={{ uri: userDetails.photo }}
                style={styles.userAvatar}
              />
              <TouchableOpacity 
                style={styles.editAvatarButton}
                onPress={handleEditProfile}
              >
                <Icon name="camera" size={14} color="#fff" />
              </TouchableOpacity>
              <View style={styles.nameContainer}>
                <Text style={styles.displayName}>{userDetails.firstName}</Text>
                <TouchableOpacity 
                  style={styles.editNameButton}
                  onPress={handleEditName}
                >
                  <Icon name="pencil" size={14} color="#68A0CF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.email}>{userDetails.email}</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Image
                source={require('../../assets/icon/account.jpg')}
                style={styles.defaultAvatar}
              />
              <Text style={styles.loginPrompt}>Tap to login</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.rec}>
          <View style={styles.Overview}>
            <Text style={styles.sectionTitle}>Account Overview</Text>
            <FlatList
              data={menuItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderMenuItem}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </ImageBackground>
      <TabBar onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2B2B2B',
    marginVertical: 20,
    textAlign: 'center',
  },
  rec: {
    marginTop: '10%',
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  Overview: {
    paddingHorizontal: 20,
  },
  userProfile: {
    alignItems: 'center',
    position: 'relative',
  },
  userAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
  },
  defaultAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  editAvatarButton: {
    position: 'absolute',
    right: -5,
    bottom: 40,
    backgroundColor: '#68A0CF',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  editNameButton: {
    marginLeft: 8,
    padding: 4,
  },
  containerImage: {
    alignItems: 'center',
    marginBottom: 20,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2B2B2B',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#2B2B2B',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2B2B2B',
  },
  loginPrompt: {
    fontSize: 16,
    color: '#68A0CF',
    marginTop: 10,
    textAlign: 'center',
  },
});