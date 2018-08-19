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

    web3Helper.onCheckInstall(() => {
      if (!web3Helper.metamaskInstalled()) {
        alert("Please install MetaMask");
      }
    });

    web3Helper.onCheckLogin(() => {
      if (!web3Helper.metamaskLogin()) {
        alert("Please login to MetaMask");
      }
    });

    $(document).ajaxStart(() => self.$Progress.start());
    $(document).ajaxStop(() => self.$Progress.finish());
  }
};
</script>

