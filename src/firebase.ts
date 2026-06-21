import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "breakfastinbed-lx",
  appId: "1:513307013726:web:4a75dc0edd9a94f20bbacf",
  apiKey: "AIzaSyCJ3eH-Sncdo9HGZeO9gkGck9woAUseWJE",
  authDomain: "breakfastinbed-lx.firebaseapp.com",
  storageBucket: "breakfastinbed-lx.firebasestorage.app",
  messagingSenderId: "513307013726"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
