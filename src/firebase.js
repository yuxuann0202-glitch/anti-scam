import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDz83JkTr67LEOIVnFkoZsBDXz9kbAJ9ec",
  authDomain: "anti-scam-bbfda.firebaseapp.com",
  projectId: "anti-scam-bbfda",
  storageBucket: "anti-scam-bbfda.firebasestorage.app",
  messagingSenderId: "8492728244",
  appId: "1:8492728244:web:193ef3e31f917bd4f1fce1",
  measurementId: "G-KCG4H3NV0Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
