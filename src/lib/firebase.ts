import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyApnsiVQ-teGpEXVFLX2LpNpOsTgkrkccA",
  authDomain: "sistemagestaoligacao.firebaseapp.com",
  projectId: "sistemagestaoligacao",
  storageBucket: "sistemagestaoligacao.firebasestorage.app",
  messagingSenderId: "775503419525",
  appId: "1:775503419525:web:cec6ad2767f624e049b1ec",
  measurementId: "G-689FERYP7J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
