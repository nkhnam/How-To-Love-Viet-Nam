// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Import getStorage
import { getDatabase } from 'firebase/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyATzDeDQo55_0zYQ5y3PMXhitUWbSC6XIQ',
    authDomain: 'htlvn-829e7.firebaseapp.com',
    databaseURL: 'https://htlvn-829e7-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'htlvn-829e7',
    storageBucket: 'htlvn-829e7.appspot.com',
    messagingSenderId: '48459386307',
    appId: '1:48459386307:web:419dc7f4c655763f1d8176',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Initialize and export storage
export const realtimeDb = getDatabase(app); // Initialize and export Realtime Database
export default app;
