
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCarY_vnsN-_IDOftyWhJgfZv9ITNPXTHI",
  authDomain: "tutorialappklinik.firebaseapp.com",
  projectId: "tutorialappklinik",
  storageBucket: "tutorialappklinik.appspot.com", // Fixed storage bucket
  messagingSenderId: "348839854014",
  appId: "1:348839854014:web:39dfc2935a7d7655d783ef",
  measurementId: "G-R67R3Y42M4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Use this for local development if needed
// if (process.env.NODE_ENV === 'development') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

export default app;
