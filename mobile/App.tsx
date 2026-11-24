import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Lesson from './src/screens/Lesson/Lesson';
import Splash from './src/screens/Introduce/splash';
import Introduce from './src/screens/Introduce/Introduce';
import Introduce1 from './src/screens/Introduce/Introduce1';
import Home from './src/screens/Home/Home';
import Flashcards from './src/screens/Lesson/Flashcard/Flashcards';
import FlashcardsDetail from './src/screens/Lesson/Flashcard/FlashcardDetail';
import Provinces from './src/screens/Lesson/Province/Provinces';
import ProvincesDetail from './src/screens/Lesson/Province/ProvincesDetail';
import ELearning from './src/screens/Lesson/ELearning/ELearning';
import Quiz from './src/screens/Lesson/ELearning/Quiz';
import Chatbot from './src/screens/Chatbot/Chatbot';
import ELearningDoExercise from './src/screens/Lesson/ELearning/ELearningDoExercise';
import Forum from './src/screens/Home/Forum/Forum';
import ForumCreatePost from './src/screens/Home/Forum/ForumCreatePost';
import ForumPost from './src/screens/Home/Forum/ForumPost';
// import ForumEdit from './src/screens/Home/Forum/ForumEdit';
import ForumDetail from './src/screens/Home/Forum/ForumDetail';
import Login from './src/screens/Account/Login';
import SignUp from './src/screens/Account/SignUp';
import Account from './src/screens/Account/Account';
import CreateQuiz from './src/screens/Lesson/ELearning/QuizBot/CreateQuiz';
import Cameras from './src/screens/Cameras/Cameras';
import ChatCamera from './src/screens/Cameras/ChatCamera';
import EditProfile from './src/screens/Account/EditProfile';
import MyQuiz from './src/screens/Lesson/ELearning/QuizBot/MyQuiz';
import EditQuiz from './src/screens/Lesson/ELearning/QuizBot/EditQuiz';


const Stack = createNativeStackNavigator();

const App = () => {
  return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
          <Stack.Screen name="Introduce" component={Introduce} options={{ headerShown: false }} />
          <Stack.Screen name="Introduce1" component={Introduce1} options={{ headerShown: false }}/>
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }}/>
          <Stack.Screen name="Flashcards" component={Flashcards} options={{ headerShown: false }}/>
          <Stack.Screen name="FlashcardsDetail" component={FlashcardsDetail} options={{ headerShown: false }}/>
          <Stack.Screen name="ELearning" component={ELearning} options={{ headerShown: false }}/>
          <Stack.Screen name="Provinces" component={Provinces} options={{ headerShown: false }}/>
          <Stack.Screen name="ProvincesDetail" component={ProvincesDetail} options={{ headerShown: false }}/>
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/>
          <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }}/>
          <Stack.Screen name="Quiz" component={Quiz} options={{ headerShown: false }}/>
          <Stack.Screen name="ELearningDoExercise" component={ELearningDoExercise} options={{ headerShown: false }}/>
          <Stack.Screen name="Forum" component={Forum} options={{ headerShown: false }}/>
          <Stack.Screen name="ForumCreatePost" component={ForumCreatePost} options={{ headerShown: false }}/>
          <Stack.Screen name="Account" component={Account} options={{ headerShown: false }}/>
          <Stack.Screen name="ForumPost" component={ForumPost} options={{ headerShown: false }}/>
          {/* <Stack.Screen name="ForumEdit" component={ForumEdit} options={{ headerShown: false }}/> */}
          <Stack.Screen name="ForumDetail" component={ForumDetail} options={{ headerShown: false }}/>
          {/* <Stack.Screen name="Modal" component={AiQuizModal} options={{ headerShown: false }}/> */}
          {/* <Stack.Screen name="QuizBot" component={QuizBot} options={{ headerShown: false }}/> */}
          <Stack.Screen name="Lesson" component={Lesson} options={{ headerShown: false }}/>
          <Stack.Screen name="Chatbot" component={Chatbot} options={{ headerShown: false }}/>
          <Stack.Screen name="CreateQuiz" component={CreateQuiz} options={{ headerShown: false }}/>
          {/* <Stack.Screen name="Form" component={Form} options={{ headerShown: false }}/> */}
          <Stack.Screen name="Cameras" component={Cameras} options={{ headerShown: false }}/>
          <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false }}/>
          <Stack.Screen name="MyQuiz" component={MyQuiz} options={{ headerShown: false }}/>
          <Stack.Screen name="EditQuiz" component={EditQuiz} options={{ headerShown: false }}/>
          {/* <Stack.Screen name="AiQuizModal" component={AiQuizModal} options={{ headerShown: false }} /> */}
          <Stack.Screen name="ChatCamera" component={ChatCamera} options={{ headerShown: false }}/>
        </Stack.Navigator>
      </NavigationContainer>
  );
};

export default App;


