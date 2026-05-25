// app.js
import { auth, db } from "./firebase.js";
import { signInWithCustomToken } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const RONIN_CHAIN_ID = "0x7e4";

function truncateAddress(addr) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

// Main Connect Function
async function connectRoninWallet() {
  const btn = document.getElementById("connectBtn");

  if (!window.ronin?.provider) {
    alert("Ronin Wallet not detected!\nPlease install Ronin Wallet extension.");
    window.open("https://wallet.roninchain.com/", "_blank");
    return;
  }

  try {
    btn.innerHTML = "Connecting & Signing...";
    btn.disabled = true;

    const provider = window.ronin.provider;

    // 1. Request wallet
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const wallet = accounts[0];

    // 2. Switch to Ronin Mainnet
    const chainId = await provider.request({ method: "eth_chainId" });
    if (chainId.toLowerCase() !== RONIN_CHAIN_ID.toLowerCase()) {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: RONIN_CHAIN_ID }]
      });
    }

    // 3. Ask user to sign message (Proof of Ownership)
    const message = `Sign in to ROFriends SocialHub\n\nWallet: ${wallet}\nTime: ${Date.now()}`;
    const signature = await provider.request({
      method: "personal_sign",
      params: [message, wallet]
    });

    console.log("Signature:", signature);

    // TODO: Send wallet + signature to your backend
    // For now, we'll simulate
    alert("✅ Wallet connected and signed!\n\n(Next: Send signature to backend for Firebase Custom Token)");

    // Temporary: Use wallet address as display
    updateWalletUI(wallet);

    // Save to localStorage
    localStorage.setItem("roninWallet", wallet);

  } catch (error) {
    console.error("Error:", error);
    alert("Failed to connect: " + error.message);
  } finally {
    btn.innerHTML = "Sign in using Ronin Wallet";
    btn.disabled = false;
  }
}

function updateWalletUI(wallet) {
  const el = document.getElementById("walletAddress");
  el.innerHTML = `
    ✅ Connected Successfully!<br>
    <strong>${truncateAddress(wallet)}</strong><br>
    <small style="color:#4ade80;">Ronin Mainnet</small>
  `;
  el.style.display = "block";
}

// Disconnect
function disconnectWallet() {
  localStorage.removeItem("roninWallet");
  document.getElementById("walletAddress").style.display = "none";
  document.getElementById("disconnectBtn").style.display = "none";
}

// Event Listeners
document.getElementById("connectBtn").addEventListener("click", connectRoninWallet);
document.getElementById("disconnectBtn").addEventListener("click", disconnectWallet);
