const RONIN_CHAIN_ID = "0x7e4"; // Ronin Mainnet

async function checkRoninAuth() {
  const walletAddressEl = document.getElementById("walletAddress");
  const disconnectBtn = document.getElementById("disconnectBtn");

  // Check if Ronin Wallet is installed
  if (typeof window.ronin === "undefined" || !window.ronin.provider) {
    // Not connected
    redirectToConnect();
    return false;
  }

  const provider = window.ronin.provider;
  let savedWallet = localStorage.getItem("roninWallet");

  try {
    // Get current accounts
    const accounts = await provider.request({ method: "eth_accounts" });
    
    if (!accounts || accounts.length === 0) {
      // No account connected in wallet
      clearAuth();
      return false;
    }

    const currentWallet = accounts[0];

    // Check if it matches saved wallet
    if (savedWallet && savedWallet.toLowerCase() !== currentWallet.toLowerCase()) {
      console.warn("Wallet address changed");
      localStorage.setItem("roninWallet", currentWallet); // Update it
    }

    // Check chain
    const chainId = await provider.request({ method: 'eth_chainId' });

    if (chainId !== RONIN_CHAIN_ID) {
      alert("Please switch to Ronin Mainnet to continue.");
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: RONIN_CHAIN_ID }]
        });
      } catch (e) {
        console.error(e);
      }
      return false;
    }

    // ✅ User is properly signed in
    const truncated = currentWallet.substring(0, 6) + "..." + currentWallet.substring(currentWallet.length - 4);
    
    walletAddressEl.innerHTML = `
      ✅ Connected<br>
      <strong>${truncated}</strong><br>
      <small style="color:#4ade80;">Ronin Mainnet</small>
    `;
    walletAddressEl.style.display = "block";
    disconnectBtn.style.display = "inline-block";

    return true;

  } catch (error) {
    console.error("Auth check failed:", error);
    clearAuth();
    return false;
  }
}

function clearAuth() {
  localStorage.removeItem("roninWallet");
  redirectToConnect();
}

function redirectToConnect() {
  alert("Please connect your Ronin Wallet first.");
  window.location.href = "index.html"; // or wherever your connect page is
}

// Run on page load
window.addEventListener("load", () => {
  checkRoninAuth();
});
