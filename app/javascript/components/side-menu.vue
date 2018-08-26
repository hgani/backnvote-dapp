<template lang='pug'>
  div
    ul.list-group
      li.list-group-item
        router-link(to='/votings', class='d-block') Find Projects
      li.list-group-item
        router-link(to='/votings/new', class='d-block') Create Project    
          
    ul.list-group.my-3(v-if="address")
      li.list-group-item(v-if="address")
        router-link(:to="`/users/${address}/projects`", class='d-block') My Projects
      li.list-group-item(v-if="address")
        router-link(:to="`/users/${address}/backed-projects`", class='d-block') Backed Projects

    wallet-info.mt-3        
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

    self.address = web3.eth.defaultAccount;
  }
};
</script>