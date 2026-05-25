// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBS_KFq-QLD89xyq1kTE3FJ62E8HFP09BI",
  authDomain: "rofriends-ab0b8.firebaseapp.com",
  projectId: "rofriends-ab0b8",
  storageBucket: "rofriends-ab0b8.firebasestorage.app",
  messagingSenderId: "309137703504",
  appId: "1:309137703504:web:ee535debe2c015630ec755",
  measurementId: "G-XQVQGYBL0X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics };
