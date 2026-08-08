import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAL4ujJ5c7sGjOYQSSHRUfEJlf3nzIyRJ4",
  authDomain: "bevtrace-db.firebaseapp.com",
  projectId: "bevtrace-db",
  storageBucket: "bevtrace-db.firebasestorage.app",
  messagingSenderId: "663676254398",
  appId: "1:663676254398:web:8d3b1badba140c5b3e86ef",
  measurementId: "G-7HZG8PMZVB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const auth = getAuth(app);