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

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firestore com a configuração correta aceita pelo compilador
export const db = getFirestore(app, "ai-studio-73b7d5b4-db50-4357-9c79-bcae112b4fd4");
export const auth = getAuth(app);
