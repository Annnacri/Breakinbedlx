import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase integrada diretamente
const firebaseConfig = {
  apiKey: "AIzaSyA4Q...", // O Firebase aceita a inicialização direta
  authDomain: "breakfast-in-bed-lx.firebaseapp.com",
  projectId: "breakfast-in-bed-lx",
  storageBucket: "breakfast-in-bed-lx.appspot.com",
  messagingSenderId: "103948573920",
  appId: "1:103948573920:web:a1b2c3d4e5f6"
};

// Inicializa o Firebase com tratamento de erro nativo
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app); 
export const auth = getAuth(app);
