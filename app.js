const connectBtn = document.getElementById('connectBtn');

connectBtn.addEventListener('click', async () => {
  if (window.ronin) {
    try {
      const accounts = await window.ronin.request({
        method: 'eth_requestAccounts'
      });

      connectBtn.innerText = accounts[0].slice(0, 6) + '...';

      alert('Ronin Wallet Connected');

    } catch (err) {
      console.log(err);
    }
  } else {
    alert('Ronin Wallet not installed');
  }
});
