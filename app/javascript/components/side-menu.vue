<template lang='pug'>
  div
    ul.list-group
      router-link(to='/votings' class="list-group-item list-group-item-action") Find Projects
      router-link(to='/votings/new' class="list-group-item list-group-item-action") Create Project    

    ul.list-group.my-3(v-if="address")
      router-link(:to="`/users/${address}/projects`" class="list-group-item list-group-item-action") My Projects
      router-link(:to="`/users/${address}/backed_projects`" class="list-group-item list-group-item-action") Backed Projects        

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