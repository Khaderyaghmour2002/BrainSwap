import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Initialize Firebase
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
const firebaseApp = initializeApp(firebaseConfig);

// Export the initialized services
export const FirebaseAuth = getAuth(firebaseApp);
export const FirestoreDB = getFirestore(firebaseApp);

