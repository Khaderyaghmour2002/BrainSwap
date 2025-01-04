import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

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

export const app = initializeApp(firebaseConfig);
export const FirebaseAuth = getAuth(app);
export const FirebaseDB = getFirestore(app);



// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
