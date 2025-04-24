
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Get config from localStorage if available, otherwise use default
const storedConfig = localStorage.getItem('firebaseConfig');
const firebaseConfig = storedConfig ? JSON.parse(storedConfig) : {
  apiKey: "AIzaSyCarY_vnsN-_IDOftyWhJgfZv9ITNPXTHI",
  authDomain: "tutorialappklinik.firebaseapp.com",
  projectId: "tutorialappklinik",
  storageBucket: "tutorialappklinik.appspot.com",
  messagingSenderId: "348839854014",
  appId: "1:348839854014:web:39dfc2935a7d7655d783ef",
  measurementId: "G-R67R3Y42M4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
