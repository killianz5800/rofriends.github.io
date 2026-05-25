// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// Firebase Config
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
const db = getFirestore(app);

// HTML Elements
const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const walletAddress = document.getElementById("walletAddress");

// Connect Ronin Wallet
connectBtn.onclick = async () => {
  try {

    // Check if Ronin Wallet exists
    if (!window.ronin) {
      alert("Ronin Wallet not installed!");
      return;
    }

    // Request wallet connection
    const accounts = await window.ronin.request({
      method: "eth_requestAccounts",
    });

    const wallet = accounts[0];

    // Show wallet on screen
    walletAddress.style.display = "block";
    walletAddress.innerText = wallet;

    disconnectBtn.style.display = "inline-block";

    // Save user to Firestore
    await setDoc(doc(db, "users", wallet), {
      wallet: wallet,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });

    console.log("User saved!");

  } catch (error) {
    console.error(error);
    alert("Connection failed!");
  }
};

// Disconnect Button
disconnectBtn.onclick = () => {
  walletAddress.style.display = "none";
  disconnectBtn.style.display = "none";
  walletAddress.innerText = "";
};
