<template lang='pug'>
  div
    ul.list-group
      router-link(to='/votings' class="list-group-item list-group-item-action") Find Projects
      router-link(to='/votings/new' class="list-group-item list-group-item-action") Create Project    

    ul.list-group.my-3(v-if="address")
      router-link(:to="`/users/${address}/projects`" class="list-group-item list-group-item-action") My Projects
      router-link(:to="`/users/${address}/backed_projects`" class="list-group-item list-group-item-action") Backed Projects        

    wallet-info.my-3 

    div(v-if="!isMetamask")
      label Select Node
      select.custom-select(v-model="node")
        option(v-for="(node, key) in nodes" :value="key") {{key}}       
</template>

<script>
import utils from "../utils";

export default {
  data() {
    return {
      address: null,
      nodes: utils.infuraNodes,
      node: null,
      isMetamask: !!web3.currentProvider.isMetaMask
    };
  },
  watch: {
    node(value) {
      if (value !== localStorage.getItem("voting:node")) {
        localStorage.setItem("voting:node", value);
        document.location.reload();
      }
    }
  },
  created() {
    const self = this;

    self.address = web3.eth.defaultAccount;
    self.node = localStorage.getItem("voting:node");
  }
};
</script>