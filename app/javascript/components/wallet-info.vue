<template lang='pug'>
  .div
    .alert.alert-warning.mt-4(v-if="!address" href="javascript:void(0)") 
      | Please log in to Metamask to use this dApp
    div(v-if="address")
      div
        small Address: 
        a.small(:title="address" :href="`${store.etherScanRoot}/address/${address}`") {{address.substring(0, 25)}}...
      div 
        small Balance: {{(balance / 1e18).toFixed(3)}} ETH        
</template>

<script>
import store from "../store";

export default {
  data() {
    return {
      store,
      address: null,
      balance: 0
    };
  },
  created() {
    const self = this;

    self.address = web3.eth.defaultAccount;

    if (self.address) {
      web3.eth.getBalance(self.address, (err, data) => {
        if (err) throw err;

        self.balance = parseInt(data);
      });
    }

    setInterval(() => {
      const address = "" + web3.eth.defaultAccount; // convert to string
      if (localStorage.getItem("Metamask:account") != address) {
        localStorage.setItem("Metamask:account", address);
        document.location.reload();
      }
    }, 1000);
  }
};
</script>