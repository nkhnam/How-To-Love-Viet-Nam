import { initializeApp } from 'firebase/app';
import { 
    getAuth, initializeAuth, getReactNativePersistence 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyATzDeDQo55_0zYQ5y3PMXhitUWbSC6XIQ',
  authDomain: 'htlvn-829e7.firebaseapp.com',
  databaseURL: 'https://htlvn-829e7-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'htlvn-829e7',
  storageBucket: 'htlvn-829e7.appspot.com',
  messagingSenderId: '48459386307',
  appId: '1:48459386307:web:419dc7f4c655763f1d8176',
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
let auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
} catch (error) {
    if (error.code === 'auth/already-initialized') {
        auth = getAuth(app); // Use existing instance if already initialized
    } else {
        console.error('Auth initialization failed:', error);
        throw error; // Re-throw if another error occurs
    }
}

// Initialize Firestore, Storage, and Realtime Database
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);
export { auth };
export default app;
