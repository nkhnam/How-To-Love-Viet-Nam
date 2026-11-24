import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../../Data/Firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CreateQuiz = () => {
  const [user, setUser] = useState(null);
  const [authorDetails, setAuthorDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    type: 'multipleChoice',
    answerText: '',
    options: ['', '', '', ''],
    correctAnswerIndex: null,
    blankAnswer: '',
  });
  const [selectedValue, setSelectedValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();

  const resetCurrentQuestion = () => ({
    questionText: '',
    type: 'multipleChoice',
    answerText: '',
    options: ['', '', '', ''],
    correctAnswerIndex: null,
    blankAnswer: '',
  });

  const isFormValid = () => {
    const { questionText, options, correctAnswerIndex, type, blankAnswer } = currentQuestion;
    if (type === 'multipleChoice') {
      return (
        selectedValue &&
        title &&
        description &&
        questionText &&
        options.every((option) => option.trim()) &&
        correctAnswerIndex !== null
      );
    } else if (type === 'fillInTheBlank') {
      return selectedValue && title && description && questionText && blankAnswer.trim();
    }
    return false;
  };

  const handleAddQuestion = () => {
    if (isFormValid()) {
      setQuestions([...questions, currentQuestion]);
      setCurrentQuestion(resetCurrentQuestion());
    } else {
      Alert.alert('Validation Error', 'Please fill in all required fields');
    }
  };

  const handleDeleteQuestion = (index) => {
    Alert.alert(
      'Delete Question',
      'Are you sure you want to delete this question?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newQuestions = questions.filter((_, i) => i !== index);
            setQuestions(newQuestions);
          },
        },
      ]
    );
  };

  const handleEditQuestion = (index) => {
    setCurrentQuestion(questions[index]);
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const fetchAuthorDetails = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAuthorDetails(docSnap.data());
      } else {
        throw new Error('User document not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user details');
      console.error(error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchAuthorDetails(user.uid);
      } else {
        navigation.replace('Login');
      }
    });
    return unsubscribe;
  }, [navigation]);

  const handleSubmit = async () => {
    if (questions.length === 0) {
      Alert.alert('Error', 'Please add at least one question');
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !authorDetails) {
        throw new Error('User details are missing');
      }

      await addDoc(collection(db, 'quizzes'), {
        title,
        description,
        type: selectedValue,
        questions: questions.map((question) => ({
          question: question.questionText,
          explain: question.answerText,
          ...(question.type === 'multipleChoice'
            ? {
                options: question.options,
                correctOptionIndex: question.correctAnswerIndex,
                type: 'multipleChoice',
              }
            : {
                blankAnswer: question.blankAnswer,
                type: 'fillInTheBlank',
              }),
          aiGenerated: question.aiGenerated || false,
        })),
        author: {
          uid: currentUser.uid,
          name: authorDetails.firstName,
          photo: authorDetails.photo,
        },
      });

      Alert.alert('Success', 'Quiz created successfully', [
        { text: 'OK', onPress: () => navigation.navigate('MyQuiz') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create quiz');
      console.error(error);
    }
  };

  const renderQuestionInput = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Question</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your question"
        value={currentQuestion.questionText}
        onChangeText={(text) =>
          setCurrentQuestion({ ...currentQuestion, questionText: text })
        }
        multiline
      />
    </View>
  );

  const renderMultipleChoiceOptions = () => (
    <View style={styles.optionsContainer}>
      <Text style={styles.label}>Options (Select correct answer)</Text>
      {currentQuestion.options.map((option, index) => (
        <View key={index} style={styles.optionRow}>
          <TextInput
            style={styles.optionInput}
            placeholder={`Option ${index + 1}`}
            value={option}
            onChangeText={(text) => {
              const newOptions = [...currentQuestion.options];
              newOptions[index] = text;
              setCurrentQuestion({ ...currentQuestion, options: newOptions });
            }}
          />
          <TouchableOpacity
            style={[
              styles.radioButton,
              currentQuestion.correctAnswerIndex === index && styles.radioButtonSelected,
            ]}
            onPress={() =>
              setCurrentQuestion({ ...currentQuestion, correctAnswerIndex: index })
            }
          >
            <View style={currentQuestion.correctAnswerIndex === index ? styles.radioInner : null} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#000" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create Quiz 📚</Text>

      <TextInput
        style={styles.titleInput}
        placeholder="Quiz Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.descriptionInput}
        placeholder="Quiz Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={setSelectedValue}
          style={styles.picker}
        >
          <Picker.Item label="--Select Subject--" value="" />
          <Picker.Item label="Sử 10" value="ls10" />
          <Picker.Item label="Sử 11" value="ls11" />
          <Picker.Item label="Sử 12" value="ls12" />
          <Picker.Item label="Giáo dục địa phương 10" value="dp10" />
          <Picker.Item label="Giáo dục địa phương 11" value="dp11" />
        </Picker>
      </View>

      <View style={styles.questionSection}>
        <Text style={styles.sectionTitle}>Questions ✨</Text>
        
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={currentQuestion.type}
            onValueChange={(value) =>
              setCurrentQuestion({ ...currentQuestion, type: value })
            }
            style={styles.picker}
          >
            <Picker.Item label="Multiple Choice" value="multipleChoice" />
            <Picker.Item label="Fill in the Blank" value="fillInTheBlank" />
          </Picker>
        </View>

        {renderQuestionInput()}

        {currentQuestion.type === 'multipleChoice' ? (
          renderMultipleChoiceOptions()
        ) : (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Answer for blank</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter the correct answer"
              value={currentQuestion.blankAnswer}
              onChangeText={(text) =>
                setCurrentQuestion({ ...currentQuestion, blankAnswer: text })
              }
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Answer Explanation</Text>
          <TextInput
            style={[styles.input, styles.explanationInput]}
            placeholder="Explain the answer"
            value={currentQuestion.answerText}
            onChangeText={(text) =>
              setCurrentQuestion({ ...currentQuestion, answerText: text })
            }
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, !isFormValid() && styles.disabledButton]}
          onPress={handleAddQuestion}
          disabled={!isFormValid()}
        >
          <Text style={styles.buttonText}>Add Question</Text>
        </TouchableOpacity>

        {questions.map((question, index) => (
          <View key={index} style={styles.questionItem}>
            <Text style={styles.questionText}>{question.questionText}</Text>
            
            {question.type === 'multipleChoice' ? (
              question.options.map((option, i) => (
                <View
                  key={i}
                  style={[
                    styles.optionItem,
                    question.correctAnswerIndex === i && styles.correctOption,
                  ]}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </View>
              ))
            ) : (
              <View style={[styles.optionItem, styles.correctOption]}>
                <Text style={styles.optionText}>{question.blankAnswer}</Text>
              </View>
            )}

            <Text style={styles.explanationTitle}>Explanation:</Text>
            <Text style={styles.explanationText}>{question.answerText}</Text>

            <View style={styles.questionActions}>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => handleEditQuestion(index)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={() => handleDeleteQuestion(index)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitButton, questions.length === 0 && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={questions.length === 0}
        >
          <Text style={styles.submitButtonText}>Submit Quiz</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  questionSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  explanationInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#007AFF',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  questionItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
},
questionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
},
optionItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
},
correctOption: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
},
optionText: {
    fontSize: 16,
},
explanationTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 8,
},
explanationText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
},
questionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
},
editButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#2196F3',
},
deleteButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#F44336',
},
submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
},
submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
},
errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
},
});

export default CreateQuiz;