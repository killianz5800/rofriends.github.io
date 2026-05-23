const RONIN_CHAIN_ID = "0x7e4";

const RONIN_CHAIN_PARAMS = {
  chainId: RONIN_CHAIN_ID,
  chainName: "Ronin",
  nativeCurrency: { name: "RON", symbol: "RON", decimals: 18 },
  rpcUrls: ["https://api.roninchain.com/rpc"],
  blockExplorerUrls: ["https://app.roninchain.com"]
};

// ==================== CONNECT WALLET ====================
async function connectRoninWallet() {
  if (typeof window.ronin === "undefined" || !window.ronin.provider) {
    alert("Ronin Wallet not detected! Redirecting...");
    window.open("https://wallet.roninchain.com/", "_blank");
    return null;
  }

  try {
    const provider = window.ronin.provider;
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const address = accounts[0];

    const chainId = await provider.request({ method: "eth_chainId" });
    if (chainId.toLowerCase() !== RONIN_CHAIN_ID.toLowerCase()) {
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: RONIN_CHAIN_ID }]
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [RONIN_CHAIN_PARAMS]
          });
        } else {
          throw switchError;
        }
      }
    }

    localStorage.setItem("roninWallet", address);
    console.log("✅ Connected:", address);
    return address;

  } catch (error) {
    console.error("Connection error:", error);
    alert("Failed to connect to Ronin Wallet.");
    return null;
  }
}

// ==================== SIGNING FUNCTIONS ====================

/**
 * Simple message signing (personal_sign)
 */
async function signMessage(message) {
  const provider = window.ronin?.provider;
  if (!provider) throw new Error("Ronin Wallet not connected");

  const address = getConnectedWallet();
  if (!address) throw new Error("No wallet connected");

  try {
    const signature = await provider.request({
      method: "personal_sign",
      params: [message, address]
    });

    console.log("Message signed successfully");
    return { signature, address };
  } catch (error) {
    console.error("Signing failed:", error);
    alert("Message signing rejected.");
    throw error;
  }
}

/**
 * EIP-712 Typed Data Signing (Recommended for auth)
 */
async function signTypedData(domain, types, value) {
  const provider = window.ronin?.provider;
  if (!provider) throw new Error("Ronin Wallet not connected");

  const address = getConnectedWallet();
  if (!address) throw new Error("No wallet connected");

  try {
    const signature = await provider.request({
      method: "eth_signTypedData_v4",
      params: [address, JSON.stringify({ domain, types, primaryType: Object.keys(types)[0], message: value })]
    });

    console.log("Typed data signed successfully");
    return { signature, address };
  } catch (error) {
    console.error("Typed data signing failed:", error);
    alert("Signing rejected.");
    throw error;
  }
}

// ==================== UTILITY FUNCTIONS ====================

function getConnectedWallet() {
  return localStorage.getItem("roninWallet");
}

function disconnectWallet() {
  localStorage.removeItem("roninWallet");
  window.location.href = "login.html";
}

function checkAuth() {
  const wallet = getConnectedWallet();
  if (!wallet && !window.location.pathname.endsWith("login.html")) {
    window.location.href = "login.html";
  }
  return wallet;
}
