// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
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

// Ronin Mainnet
const RONIN_CHAIN_ID = "0x7e4";

// Connect Wallet Function
async function connectRoninWallet() {

  const btn = document.getElementById("connectBtn");
  const walletAddressEl = document.getElementById("walletAddress");
  const disconnectBtn = document.getElementById("disconnectBtn");

  // Check Ronin Wallet
  if (typeof window.ronin === "undefined" || !window.ronin.provider) {

    alert("Ronin Wallet not detected. Please install the Ronin Wallet extension.");

    window.open("https://wallet.roninchain.com/", "_blank");

    return;
  }

  try {

    btn.innerHTML = "Connecting...";
    btn.disabled = true;

    const provider = window.ronin.provider;

    // Request Account
    const accounts = await provider.request({
      method: "eth_requestAccounts"
    });

    const wallet = accounts[0];

    // Validate Chain
    let chainId = await provider.request({
      method: "eth_chainId"
    });

    if (chainId !== RONIN_CHAIN_ID) {

      const switchConfirmed = confirm(
        "You are not on the Ronin Network.\n\nWould you like to switch now?"
      );

      if (switchConfirmed) {

        try {

          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: RONIN_CHAIN_ID }]
          });

        } catch (switchError) {

          if (switchError.code === 4902) {

            alert("Ronin Network is not added in your wallet.");

          } else {

            alert("Failed to switch network.");

          }

          return;
        }

      } else {

        alert("Please switch to Ronin Network to continue.");
        return;
      }
    }

    // Save Wallet to Firestore
    await setDoc(doc(db, "users", wallet), {
      wallet: wallet,
      network: "Ronin Mainnet",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });

    console.log("User saved to Firestore!");

    // Save LocalStorage
    localStorage.setItem("roninWallet", wallet);

    // Display Wallet
    const truncated =
      wallet.substring(0, 6) +
      "..." +
      wallet.substring(wallet.length - 4);

    walletAddressEl.innerHTML = `
      ✅ Connected Successfully!<br>
      <strong>${truncated}</strong><br>
      <small style="color:#4ade80;">Ronin Mainnet</small>
    `;

    walletAddressEl.style.color = "#4ade80";
    walletAddressEl.style.display = "block";

    disconnectBtn.style.display = "inline-block";

  } catch (error) {

    console.error(error);

    if (error.code === 4001) {

      alert("Connection rejected by user.");

    } else {

      alert("Failed to connect to Ronin Wallet.");

    }

  } finally {

    btn.innerHTML = "Sign in using Ronin Wallet";
    btn.disabled = false;

  }
}

// Disconnect Wallet
function disconnectWallet() {

  localStorage.removeItem("roninWallet");

  document.getElementById("walletAddress").style.display = "none";

  document.getElementById("disconnectBtn").style.display = "none";

  alert("Wallet disconnected.");
}

// Auto Connect
window.addEventListener("load", () => {

  const savedWallet = localStorage.getItem("roninWallet");

  if (savedWallet) {

    const walletAddressEl = document.getElementById("walletAddress");

    const disconnectBtn = document.getElementById("disconnectBtn");

    const truncated =
      savedWallet.substring(0, 6) +
      "..." +
      savedWallet.substring(savedWallet.length - 4);

    walletAddressEl.innerHTML = `
      ✅ Connected!<br>
      <strong>${truncated}</strong><br>
      <small style="color:#4ade80;">Ronin Mainnet</small>
    `;

    walletAddressEl.style.color = "#4ade80";

    walletAddressEl.style.display = "block";

    disconnectBtn.style.display = "inline-block";
  }
});

// Button Events
document
  .getElementById("connectBtn")
  .addEventListener("click", connectRoninWallet);

document
  .getElementById("disconnectBtn")
  .addEventListener("click", disconnectWallet);
