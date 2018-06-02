<template lang='pug'>
  div
    ul.list-group
      li.list-group-item
        router-link(to='/votings', class='d-block') Votings
      li.list-group-item
        router-link(to='/votings/new', class='d-block') New
  
    ul.list-group.my-3
      li.list-group-item(v-if="address")
        router-link(:to="`/users/${address}`", class='d-block') User Stats
</template>

<script>
export default {
  data() {
    return {
      address: null
    };
  },
  created() {
    const self = this;

    const route = self.$router.currentRoute;
    self.address = web3.eth.defaultAccount;
  }
};
</script>