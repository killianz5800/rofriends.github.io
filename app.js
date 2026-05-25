// ====================== RONIN WALLET CONNECT ======================

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
  appId: "1:309137703504:web:ee535debe2c015630ec755"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const RONIN_CHAIN_ID = "0x7e4"; // Ronin Mainnet

// Helper: Shorten wallet address
function truncateAddress(address) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

// Main Connect Function
async function connectRoninWallet() {
  const btn = document.getElementById("connectBtn");
  const walletEl = document.getElementById("walletAddress");
  const disconnectBtn = document.getElementById("disconnectBtn");

  // Check if Ronin Wallet is installed
  if (!window.ronin?.provider) {
    alert("Ronin Wallet not detected!\nPlease install the Ronin Wallet extension.");
    window.open("https://wallet.roninchain.com/", "_blank");
    return;
  }

  try {
    btn.innerHTML = "Connecting...";
    btn.disabled = true;

    const provider = window.ronin.provider;

    // Request wallet connection
    const accounts = await provider.request({
      method: "eth_requestAccounts"
    });

    const wallet = accounts[0];

    // Check current network
    let chainId = await provider.request({ method: "eth_chainId" });

    if (chainId.toLowerCase() !== RONIN_CHAIN_ID.toLowerCase()) {
      const switchOk = confirm("You are not on Ronin Mainnet.\n\nSwitch now?");
      if (!switchOk) return;

      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: RONIN_CHAIN_ID }]
      });
    }

    // Save to Firestore
    await setDoc(doc(db, "users", wallet.toLowerCase()), {
      wallet: wallet,
      network: "Ronin Mainnet",
      lastLogin: serverTimestamp(),
      createdAt: serverTimestamp()
    }, { merge: true });

    // Save locally
    localStorage.setItem("roninWallet", wallet);

    // Update UI
    updateWalletUI(wallet);

    disconnectBtn.style.display = "inline-block";

    console.log("✅ Successfully connected:", wallet);

  } catch (error) {
    console.error(error);

    if (error.code === 4001) {
      alert("Connection rejected by user.");
    } else if (error.code === 4902) {
      alert("Ronin Network not added. Please add it manually in Ronin Wallet.");
    } else {
      alert("Failed to connect wallet. Please try again.");
    }
  } finally {
    btn.innerHTML = "Sign in using Ronin Wallet";
    btn.disabled = false;
  }
}

// Update UI
function updateWalletUI(wallet) {
  const walletEl = document.getElementById("walletAddress");
  const short = truncateAddress(wallet);

  walletEl.innerHTML = `
    ✅ Connected Successfully!<br>
    <strong>${short}</strong><br>
    <small style="color:#4ade80;">Ronin Mainnet</small>
  `;
  walletEl.style.display = "block";
  walletEl.style.color = "#4ade80";
}

// Disconnect
function disconnectWallet() {
  localStorage.removeItem("roninWallet");
  document.getElementById("walletAddress").style.display = "none";
  document.getElementById("disconnectBtn").style.display = "none";
  alert("Wallet disconnected.");
}

// Auto-connect on page load
window.addEventListener("load", async () => {
  const savedWallet = localStorage.getItem("roninWallet");
  if (!savedWallet) return;

  try {
    if (window.ronin?.provider) {
      const accounts = await window.ronin.provider.request({ method: "eth_accounts" });
      if (accounts[0]?.toLowerCase() === savedWallet.toLowerCase()) {
        updateWalletUI(savedWallet);
        document.getElementById("disconnectBtn").style.display = "inline-block";
      }
    }
  } catch (err) {
    console.warn("Auto connect failed", err);
  }
});

// Event Listeners
document.getElementById("connectBtn").addEventListener("click", connectRoninWallet);
document.getElementById("disconnectBtn").addEventListener("click", disconnectWallet);
