import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TabBar = ({ selectedTab, setSelectedTab, onTabPress }) => {
  const handleTabPress = (tab) => {
    onTabPress(tab);
  };

  return (
    <View style={styles.tabBarContainer}>
      <TouchableOpacity onPress={() => handleTabPress('Home')} style={styles.tabButton}>
        <Ionicons name="home-outline" size={24} color={selectedTab === 'Home' ? '#6C63FF' : '#8e8e93'} />
        <Text style={[styles.tabLabel, { color: selectedTab === 'Home' ? '#6C63FF' : '#8e8e93' }]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleTabPress('Lesson')} style={styles.tabButton}>
        <Ionicons name="book-outline" size={24} color={selectedTab === 'Lesson' ? '#6C63FF' : '#8e8e93'} />
        <Text style={[styles.tabLabel, { color: selectedTab === 'Lesson' ? '#6C63FF' : '#8e8e93' }]}>Lesson</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleTabPress('Cameras')} style={styles.scanButton}>
        <Ionicons name="camera-outline" size={32} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleTabPress('Chatbot')} style={styles.tabButton}>
        <Ionicons name="chatbubbles-outline" size={24} color={selectedTab === 'Tools' ? '#6C63FF' : '#8e8e93'} />
        <Text style={[styles.tabLabel, { color: selectedTab === 'Tools' ? '#6C63FF' : '#8e8e93' }]}>Chatbot</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleTabPress('Account')} style={styles.tabButton}>
        <Ionicons name="person-outline" size={24} color={selectedTab === 'Account' ? '#6C63FF' : '#8e8e93'} />
        <Text style={[styles.tabLabel, { color: selectedTab === 'Account' ? '#6C63FF' : '#8e8e93' }]}>Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
    width: '100%', 
    position: 'absolute', 
    bottom: 0,
  },
  tabButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    width: 70,
    height: 70,
    backgroundColor: '#6C63FF',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 5,
  },
});

export default TabBar;
