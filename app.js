import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { 
  getAuth, 
  signInWithCustomToken 
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = { /* your config */ };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const RONIN_CHAIN_ID = "0x7e4";

// Helper
function truncateAddress(addr) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

// Main Connect + Auth Function
async function connectRoninWallet() {
  const btn = document.getElementById("connectBtn");

  if (!window.ronin?.provider) {
    alert("Ronin Wallet not detected!");
    window.open("https://wallet.roninchain.com/", "_blank");
    return;
  }

  try {
    btn.innerHTML = "Connecting...";
    btn.disabled = true;

    const provider = window.ronin.provider;

    // 1. Connect Wallet
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const wallet = accounts[0];

    // 2. Switch Network if needed
    let chainId = await provider.request({ method: "eth_chainId" });
    if (chainId.toLowerCase() !== RONIN_CHAIN_ID.toLowerCase()) {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: RONIN_CHAIN_ID }]
      });
    }

    // 3. Sign Message (Proof of Ownership) - VERY IMPORTANT
    const message = `Sign in to ROFriends SocialHub\nWallet: ${wallet}\nTimestamp: ${Date.now()}`;
    const signature = await provider.request({
      method: "personal_sign",
      params: [message, wallet]
    });

    // 4. Send to your backend to get Custom Token
    const response = await fetch("https://your-cloud-function-url.cloudfunctions.net/createCustomToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet, signature, message })
    });

    const { customToken } = await response.json();

    // 5. Sign in to Firebase Auth
    const userCredential = await signInWithCustomToken(auth, customToken);
    console.log("✅ Firebase Auth successful!", userCredential.user.uid);

    // Save additional data to Firestore
    await setDoc(doc(db, "users", wallet.toLowerCase()), {
      wallet: wallet,
      uid: userCredential.user.uid,
      lastLogin: serverTimestamp(),
      network: "Ronin Mainnet"
    }, { merge: true });

    localStorage.setItem("roninWallet", wallet);
    updateWalletUI(wallet);

  } catch (error) {
    console.error(error);
    alert("Authentication failed: " + error.message);
  } finally {
    btn.innerHTML = "Sign in using Ronin Wallet";
    btn.disabled = false;
  }
}

// Update UI
function updateWalletUI(wallet) {
  const el = document.getElementById("walletAddress");
  el.innerHTML = `
    ✅ Connected & Authenticated!<br>
    <strong>${truncateAddress(wallet)}</strong><br>
    <small style="color:#4ade80;">Ronin Mainnet • Firebase Auth</small>
  `;
  el.style.display = "block";
}

// Disconnect
function disconnectWallet() {
  localStorage.removeItem("roninWallet");
  // Optional: auth.signOut();
  document.getElementById("walletAddress").style.display = "none";
  document.getElementById("disconnectBtn").style.display = "none";
}

// Event Listeners
document.getElementById("connectBtn").addEventListener("click", connectRoninWallet);
document.getElementById("disconnectBtn").addEventListener("click", disconnectWallet);
