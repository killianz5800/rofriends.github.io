const RONIN_CHAIN_ID = "0x7e4";

async function connectRoninWallet() {
  if (typeof window.ronin === "undefined" || !window.ronin.provider) {
    alert("Ronin Wallet not detected!");
    window.open("https://wallet.roninchain.com/", "_blank");
    return null;
  }

  try {
    const provider = window.ronin.provider;
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const address = accounts[0];

    // Chain check
    const chainId = await provider.request({ method: "eth_chainId" });
    if (chainId !== RONIN_CHAIN_ID) {
      if (confirm("Switch to Ronin Network?")) {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: RONIN_CHAIN_ID }]
        });
      } else {
        return null;
      }
    }

    localStorage.setItem("roninWallet", address);
    return address;
  } catch (error) {
    console.error(error);
    alert("Connection failed.");
    return null;
  }
}

function getConnectedWallet() {
  return localStorage.getItem("roninWallet");
}

function disconnectWallet() {
  localStorage.removeItem("roninWallet");
  window.location.href = "login.html";
}

// Check login on every page
function checkAuth() {
  const wallet = getConnectedWallet();
  if (!wallet && !window.location.pathname.endsWith("login.html")) {
    window.location.href = "login.html";
  }
  return wallet;
}
