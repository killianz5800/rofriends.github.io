const RONIN_CHAIN_ID = "0x7e4"; // Ronin Mainnet

    async function connectWallet() {
      if (typeof window.ronin === "undefined" || !window.ronin?.provider) {
        alert("Ronin Wallet is not installed!");
        return;
      }

      try {
        const provider = window.ronin.provider;
        const accounts = await provider.request({ method: "eth_requestAccounts" });
        
        if (accounts.length > 0) {
          localStorage.setItem("roninWallet", accounts[0]);
          checkRoninAuth();
        }
      } catch (error) {
        console.error(error);
        alert("Failed to connect wallet.");
      }
    }

    async function disconnectWallet() {
      localStorage.removeItem("roninWallet");
      document.getElementById("wallet-info").style.display = "none";
      document.getElementById("disconnectBtn").style.display = "none";
    }

    async function checkRoninAuth() {
      const walletInfo = document.getElementById("wallet-info");
      const disconnectBtn = document.getElementById("disconnectBtn");

      if (typeof window.ronin === "undefined" || !window.ronin?.provider) return;

      const provider = window.ronin.provider;

      try {
        const accounts = await provider.request({ method: "eth_accounts" });
        if (!accounts || accounts.length === 0) return;

        const address = accounts[0];
        const truncated = address.substring(0, 6) + "..." + address.substring(address.length - 4);

        walletInfo.innerHTML = `
          ✅ Connected<br>
          <strong>${truncated}</strong><br>
          <small style="color:#4ade80;">Ronin Mainnet</small>
        `;
        walletInfo.style.display = "block";
        disconnectBtn.style.display = "inline-block";

      } catch (err) {
        console.error(err);
      }
    }

    // Event Listeners
    document.getElementById("connectBtn").addEventListener("click", connectWallet);
    document.getElementById("disconnectBtn").addEventListener("click", disconnectWallet);

    // Initialize on load
    window.addEventListener("load", () => {
      if (window.ronin?.provider) {
        checkRoninAuth();

        const provider = window.ronin.provider;
        provider.on("accountsChanged", () => checkRoninAuth());
        provider.on("chainChanged", () => checkRoninAuth());
      }
    });
