// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBr7elpLUPNDsqZ0Lt4bxoLaMkWKHO5Q0M",
  authDomain: "splitmate-a3b1a.firebaseapp.com",
  projectId: "splitmate-a3b1a",
  storageBucket: "splitmate-a3b1a.firebasestorage.app",
  messagingSenderId: "447208334914",
  appId: "1:447208334914:web:1d2beba7149790f00cefdb",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
