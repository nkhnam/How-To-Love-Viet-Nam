import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { auth } from '../Data/Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import TabBar from '../TabBar';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../../config';

const Chatbot = () => {
  const [uid, setUid] = useState(null);
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        fetchChatHistory(user.uid);
      } else {
        Alert.alert(
          'Yêu cầu đăng nhập',
          'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.',
          [{ text: 'OK' }]
        );
      }
    });
    return unsubscribe;
  }, []);

  const askQuestion = async () => {
    if (!uid) {
      Alert.alert('Lỗi', 'Bạn chưa đăng nhập.');
      return;
    }
    if (!question.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập câu hỏi.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, user_id: uid }),
      });
      const data = await res.json();
      if (res.ok) {
        setHistory((prevHistory) => [
          { sender: 'user', text: question },
          { sender: 'bot', text: data.reply },
          ...prevHistory,
        ]);
        setQuestion('');
      } else {
        Alert.alert('Lỗi', data.error || 'Không thể xử lý yêu cầu.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể kết nối đến server.');
    }
  };

  const fetchChatHistory = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/history/${userId}`);
      const data = await res.json();
      if (res.ok) {
        const formattedHistory = data.history
          .map((item) => [
            { sender: 'user', text: item.question },
            { sender: 'bot', text: item.reply },
          ])
          .flat()
          .reverse();
        setHistory(formattedHistory);
      } else {
        Alert.alert('Lỗi', data.error || 'Không thể lấy lịch sử.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể kết nối đến server.');
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.botBubble,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.chatContainer}
        inverted
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập câu hỏi..."
          value={question}
          onChangeText={setQuestion}
        />
        <TouchableOpacity style={styles.sendButton} onPress={askQuestion}>
          <Text style={styles.sendButtonText}>Gửi</Text>
        </TouchableOpacity>
      </View>
      <TabBar style={styles.tabbar} onTabPress={(tab) => navigation.navigate(tab)} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4', paddingBottom: 80 },
  chatContainer: { padding: 20, flexGrow: 1, justifyContent: 'flex-end' },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
    marginVertical: 5,
    maxWidth: '75%',
  },
  userBubble: {
    backgroundColor: '#0078fe',
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: 'gray',
    alignSelf: 'flex-start',
  },
  messageText: { color: '#fff', fontSize: 16 },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#0078fe',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonText: { color: '#fff', fontSize: 16 },
  tabbar: { height: 50 },
});

export default Chatbot;
