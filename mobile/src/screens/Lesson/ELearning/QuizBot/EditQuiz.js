import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { db, auth } from '../../../Data/Firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';

function EditQuiz() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  
  const [user, setUser] = useState(null);
  const [authorDetails, setAuthorDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'multipleChoice',
    explain: '',
    options: ['', '', '', ''],
    correctOptionIndex: null,
    blankAnswer: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
            
            // Fetch quiz data
            const quizRef = doc(db, 'quizzes', id);
            const quizSnap = await getDoc(quizRef);
            
            if (quizSnap.exists()) {
              const quizData = quizSnap.data();
              setTitle(quizData.title || '');
              setDescription(quizData.description || '');
              setSelectedValue(quizData.type || '');
              setQuestions(quizData.questions || []);

              // Fetch author details
              if (quizData.author?.uid) {
                const userRef = doc(db, 'users', quizData.author.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  setAuthorDetails(userSnap.data());
                }
              }
            } else {
              Alert.alert('Error', 'Quiz not found');
              navigation.goBack();
            }
          } else {
            navigation.navigate('Login');
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', error.message);
      }
    };

    loadData();
  }, [id, navigation]);

  const handleQuestionTypeChange = (value) => {
    setCurrentQuestion({ ...currentQuestion, type: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const isFormValid = () => {
    const { question, options, correctOptionIndex, type, blankAnswer } = currentQuestion;
    if (type === 'multipleChoice') {
      return (
        selectedValue &&
        title &&
        description &&
        question &&
        options.every((option) => option) &&
        correctOptionIndex !== null
      );
    } else if (type === 'fillInTheBlank') {
      return selectedValue && title && description && question && blankAnswer;
    }
    return false;
  };

  const addQuestion = () => {
    if (isFormValid()) {
      setQuestions([...questions, currentQuestion]);
      setCurrentQuestion({
        question: '',
        type: 'multipleChoice',
        explain: '',
        options: ['', '', '', ''],
        correctOptionIndex: null,
        blankAnswer: '',
      });
    } else {
      Alert.alert('Validation Error', 'Please fill in all required fields');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!auth.currentUser || !authorDetails) {
        Alert.alert('Error', 'User details are missing');
        return;
      }

      const quizRef = doc(db, 'quizzes', id);
      const updatedData = {
        title,
        description,
        type: selectedValue,
        questions: questions.map(question => {
          const baseQuestion = {
            question: question.question,
            explain: question.explain,
            type: question.type
          };

          if (question.type === 'multipleChoice') {
            return {
              ...baseQuestion,
              options: question.options,
              correctOptionIndex: question.correctOptionIndex
            };
          }

          return {
            ...baseQuestion,
            blankAnswer: question.blankAnswer
          };
        }),
        author: {
          uid: auth.currentUser.uid,
          name: authorDetails.firstName || '',
          photo: authorDetails.photo || ''
        },
        updatedAt: new Date().toISOString()
      };

      await updateDoc(quizRef, updatedData);
      navigation.navigate('MyQuiz');
    } catch (error) {
      console.error('Error updating quiz:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Icon name="chevron-left" size={20} color="#000" />
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Chỉnh sửa bài tập 📚</Text>

      <TextInput
        style={styles.input}
        placeholder="Viết tiêu đề bài tập"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Viết mô tả bài tập"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Chọn một tùy chọn</Text>
        <Picker
          selectedValue={selectedValue}
          onValueChange={setSelectedValue}
          style={styles.picker}
        >
          <Picker.Item label="--Chọn môn học--" value="" />
          <Picker.Item label="Lịch Sử 10" value="ls10" />
          <Picker.Item label="Lịch Sử 11" value="ls11" />
          <Picker.Item label="Lịch Sử 12" value="ls12" />
          <Picker.Item label="Giáo dục địa phương 10" value="dp10" />
          <Picker.Item label="Giáo dục địa phương 11" value="dp11" />
        </Picker>
      </View>

      <Text style={styles.sectionTitle}>Phần đặt câu hỏi ✨</Text>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Chọn loại câu hỏi</Text>
        <Picker
          selectedValue={currentQuestion.type}
          onValueChange={handleQuestionTypeChange}
          style={styles.picker}
        >
          <Picker.Item label="Trắc nghiệm" value="multipleChoice" />
          <Picker.Item label="Điền vào chỗ trống" value="fillInTheBlank" />
        </Picker>
      </View>

      {currentQuestion.type === 'multipleChoice' ? (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Nhập câu hỏi"
            value={currentQuestion.question}
            onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, question: text })}
          />

          <Text style={styles.label}>Các lựa chọn (Chọn câu đúng)</Text>
          {currentQuestion.options.map((option, index) => (
            <View key={index} style={styles.optionContainer}>
              <TextInput
                style={styles.optionInput}
                placeholder={`Lựa chọn ${index + 1}`}
                value={option}
                onChangeText={(text) => handleOptionChange(index, text)}
              />
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  currentQuestion.correctOptionIndex === index && styles.radioButtonSelected
                ]}
                onPress={() => setCurrentQuestion({ ...currentQuestion, correctOptionIndex: index })}
              />
            </View>
          ))}
        </View>
      ) : (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Nhập câu hỏi với khoảng trống"
            value={currentQuestion.question}
            onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, question: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Nhập đáp án cho khoảng trống"
            value={currentQuestion.blankAnswer}
            onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, blankAnswer: text })}
          />
        </View>
      )}

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Hãy viết giải thích cho đáp án"
        value={currentQuestion.explain}
        onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, explain: text })}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.button, !isFormValid() && styles.inactiveButton]}
        onPress={addQuestion}
        disabled={!isFormValid()}
      >
        <Text style={styles.buttonText}>Thêm câu hỏi</Text>
      </TouchableOpacity>

      {questions.map((question, index) => (
        <View key={index} style={styles.questionItem}>
          <Text style={styles.questionText}>{question.question}</Text>
          
          {question.type === 'multipleChoice' &&
            question.options.map((option, i) => (
              <View 
                key={i} 
                style={[
                  styles.optionDisplay,
                  question.correctOptionIndex === i && styles.correctOption
                ]}
              >
                {question.correctOptionIndex === i && (
                  <Icon name="check" size={20} color="#4CAF50" style={styles.checkIcon} />
                )}
                <Text style={styles.optionText}>{option}</Text>
              </View>
            ))}
            
          {question.type === 'fillInTheBlank' && (
            <View style={[styles.optionDisplay, styles.correctOption]}>
              <Icon name="check" size={20} color="#4CAF50" style={styles.checkIcon} />
              <Text style={styles.optionText}>{question.blankAnswer}</Text>
            </View>
          )}

          <Text style={styles.explainLabel}>Giải thích:</Text>
          <Text style={styles.explainText}>{question.explain}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => {
                setCurrentQuestion(question);
                const newQuestions = [...questions];
                newQuestions.splice(index, 1);
                setQuestions(newQuestions);
              }}
            >
              <Text style={styles.buttonText}>Chỉnh sửa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() => {
                const newQuestions = [...questions];
                newQuestions.splice(index, 1);
                setQuestions(newQuestions);
              }}
            >
              <Text style={styles.buttonText}>Xóa câu hỏi</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.submitButton, questions.length === 0 && styles.inactiveButton]}
        onPress={handleSubmit}
        disabled={questions.length === 0}
      >
        <Text style={styles.buttonText}>Cập nhật bài tập</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    marginLeft: 10,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
  },
  radioButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  button: {
    backgroundColor: '#e53935',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  inactiveButton: {
    backgroundColor: '#ccc',
  },
  questionItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  optionDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  correctOption: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  checkIcon: {
    marginRight: 8,
  },
  optionText: {
    fontSize: 16,
  },
  explainLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 8,
  },
  explainText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#666',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  }
});

export default EditQuiz;