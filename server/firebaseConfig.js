import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBhVmQajJPFczIIfClfQm979JTsQZdPXYs",
    authDomain: "brainswap-bd812.firebaseapp.com",
    projectId: "brainswap-bd812",
    storageBucket: "brainswap-bd812.firebasestorage.app",
    messagingSenderId: "718122247608",
    appId: "1:718122247608:web:731edae239d996c4ff9b4d",
    measurementId: "G-KWW941M9DD",
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage), // Use AsyncStorage for persistence
});
const firestore = getFirestore(app);

export { auth, firestore };
