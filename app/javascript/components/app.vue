<template lang='pug'>
  div
    vue-progress-bar

    top-menu

    .container.my-3
      .row
        .col-md-3
          side-menu
        .col-md-9
          router-view
</template>

<script>
export default {
  data() {
    return {};
  },
  created: function() {
    const self = this;

    if (!web3.currentProvider.isMetaMask) {
      alert("Please install MetaMask");
    }

    if (web3.currentProvider.isMetaMask && !web3.eth.defaultAccount) {
      alert("Please login to Metamask");
    }

    $(document).ajaxStart(() => self.$Progress.start());
    $(document).ajaxStop(() => self.$Progress.finish());
  }
};
</script>

