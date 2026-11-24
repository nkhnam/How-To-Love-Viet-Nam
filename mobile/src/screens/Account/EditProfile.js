import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Platform,
  Alert,
  PermissionsAndroid
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { auth, db, storage } from '../Data/Firebase';
import { doc, getDoc, setDoc, updateDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const EditProfile = () => {
  const navigation = useNavigation();
  const [userDetails, setUserDetails] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [userBlogs, setUserBlogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserBlogs = async (uid) => {
    try {
      const q = query(collection(db, 'blogs'), where('author.uid', '==', uid));
      const querySnapshot = await getDocs(q);
      const blogs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUserBlogs(blogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      Alert.alert('Error', 'Failed to fetch user blogs');
    }
  };

  const fetchUserData = async (user) => {
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserDetails(docSnap.data());
      } else {
        const newUserDetails = {
          firstName: user.displayName || 'User',
          email: user.email,
          photo: user.photoURL,
        };
        await setDoc(docRef, newUserDetails);
        setUserDetails(newUserDetails);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to fetch user data');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch users');
    }
  };

  const refreshData = async () => {
    if (auth.currentUser) {
      setRefreshing(true);
      try {
        await Promise.all([
          fetchUserData(auth.currentUser),
          fetchAllUsers(),
          fetchUserBlogs(auth.currentUser.uid),
        ]);
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          refreshData();
        } else {
          navigation.replace('Login');
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const handleEditProfile = () => {
    setEditing(true);
    setNewFirstName(userDetails.firstName);
    setNewPhotoURL(userDetails.photo);
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: "Photo Permission",
            message: "This app needs access to your photos to update your profile picture.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestCameraPermission();
    
    if (!hasPermission) {
      Alert.alert('Permission needed', 'Please grant photo library permissions to change your photo');
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.5,
      maxWidth: 500,
      maxHeight: 500,
    };

    try {
      const result = await launchImageLibrary(options);
      
      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        throw new Error(result.errorMessage);
      }

      if (result.assets && result.assets[0]) {
        setNewPhotoURL(result.assets[0].uri);
        return result.assets[0].uri;
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updatedFirstName = newFirstName.trim() || userDetails.firstName;
      let photoURL = userDetails.photo;

      if (newPhotoURL !== userDetails.photo) {
        const response = await fetch(newPhotoURL);
        const blob = await response.blob();
        const storageRef = ref(storage, `profilePics/${auth.currentUser.uid}`);
        await uploadBytes(storageRef, blob);
        photoURL = await getDownloadURL(storageRef);
      }

      const docRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(docRef, {
        firstName: updatedFirstName,
        photo: photoURL,
      });

      await fetchUserData(auth.currentUser);
      setEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const renderBlogItem = ({ item }) => (
    <TouchableOpacity
      style={styles.blogItem}
      onPress={() => navigation.navigate('BlogDetail', { blogId: item.id })}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.CoverURL }} 
        style={styles.blogImage}
        // defaultSource={require('../assets/placeholder.png')}
      />
      <View style={styles.blogContent}>
        <Text style={styles.blogTitle} numberOfLines={2}>{item.Title}</Text>
        <Text style={styles.blogDescription} numberOfLines={3}>{item.Sapo}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.photo }}
        // defaultSource={require('../assets/default-avatar.png')}
        style={styles.userAvatar}
      />
      <Text style={styles.userName}>{item.firstName}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={refreshData}
            colors={['#007AFF']} 
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleLogout}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="log-out-outline" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileHeader}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={editing ? pickImage : null}
                activeOpacity={editing ? 0.7 : 1}
              >
                <Image
                  source={{ 
                    uri: newPhotoURL || userDetails?.photo,
                    cache: 'reload'
                  }}
                  // defaultSource={require('../assets/default-avatar.png')}
                  style={styles.avatar}
                />
                {editing && (
                  <View style={styles.editOverlay}>
                    <Icon name="camera" size={24} color="white" />
                  </View>
                )}
              </TouchableOpacity>

              {editing ? (
                <View style={styles.editForm}>
                  <TextInput
                    style={styles.input}
                    value={newFirstName}
                    onChangeText={setNewFirstName}
                    placeholder="Enter name"
                    maxLength={20}
                    placeholderTextColor="#999"
                  />
                  <View style={styles.editButtons}>
                    <TouchableOpacity 
                      style={styles.button} 
                      onPress={handleSaveProfile}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => setEditing(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.profileInfo}>
                  <Text style={styles.name}>{userDetails?.firstName}</Text>
                  <Text style={styles.email}>{userDetails?.email}</Text>
                  <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleEditProfile}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>Edit Profile</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholderTextColor="#999"
              />
            </View>
          </>
        }
        
        data={users.filter((user) =>
          (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        )}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No users found</Text>
        }
      />

      <TouchableOpacity
        style={styles.messageButton}
        onPress={() => navigation.navigate('Messages')}
        activeOpacity={0.7}
      >
        <Icon name="mail" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  editForm: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#000',
    backgroundColor: '#fff',
  },
  blogsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  blogItem: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  blogImage: {
    width: '30%',
    height: 100,
    backgroundColor: '#f0f0f0',
  },
  blogContent: {
    flex: 1,
    padding: 12,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  blogDescription: {
    fontSize: 14,
    color: '#666',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
  },
  messageButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default EditProfile;