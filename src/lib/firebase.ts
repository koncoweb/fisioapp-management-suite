
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Get config from localStorage if available, otherwise use environment variables or default values
const storedConfig = localStorage.getItem('firebaseConfig');
const firebaseConfig = storedConfig ? JSON.parse(storedConfig) : {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCarY_vnsN-_IDOftyWhJgfZv9ITNPXTHI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tutorialappklinik.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tutorialappklinik",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tutorialappklinik.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "348839854014",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:348839854014:web:39dfc2935a7d7655d783ef",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-R67R3Y42M4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
