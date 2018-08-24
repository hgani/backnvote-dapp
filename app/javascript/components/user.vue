<template lang="pug">
  div
    h1.mb-3 User Stats
    p User Address: {{address}}
    ul.nav.nav-tabs
      li.nav-item
        a.nav-link.active(data-toggle="tab" href="#votings") Votings
      li.nav-item
        a.nav-link(data-toggle='tab' href='#votes') Votes
    .tab-content.pt-3
      #votings.tab-pane.fade.show.active
        table.table
          thead
            tr
              th Voting label 
              th Voting address
            template(v-for="voting in votings")
              tr(v-if="voting.userCreator")
                td {{voting.label}}
                td 
                  small 
                    router-link(:to="`/votings/${voting.address}`") {{voting.address}}   
        ajax-status(:loading="loadingVotings" :no-data="noVotingCreated")
          | There is no voting created by this user                           
      #votes.tab-pane.fade 
        table.table
          thead
            tr
              th Voting label 
              th Voting address
              th Option label
              th Fund
            template(v-for="voting in votings")
              template(v-for="option in voting.options")
                tr(v-if="option.selected && !option.cancel")
                  td {{option.votingLabel}}
                  td 
                    small 
                      router-link(:to="`/votings/${option.votingAddress}`") {{option.votingAddress}}
                  td {{option.label}}
                  td {{option.fund / 1e18}} ETH
        ajax-status(:loading="loadingVotings" :no-data="noActiveVotes")
          | There is no active votes                   
</template>

<script>
import votingContract from "../voting-contract";

export default {
  data() {
    return {
      votings: [],
      noVotingCreated: true,
      noActiveVotes: true,
      loadingVotings: true
    };
  },
  created() {
    const self = this;

    const Contract = web3.eth.contract(votingContract.ABI);
    const route = self.$router.currentRoute;

    self.address = route.params.address;

    web3Helper.getNetwork((err, net) => {
      if (err) throw err;

      $.ajax({
        url: "votings.json",
        data: { network: net },
        success(data) {
          const votings = [];

          for (const voting of data.votings) {
            voting.userCreator =
              voting.creator.toLowerCase() === self.address.toLowerCase();
            voting.options = JSON.parse(voting.options);

            if (voting.userCreator) {
              self.noVotingCreated = false;
            }

            if (voting.options && voting.options.length) {
              voting.options = _.map(voting.options, (value, index) => ({
                votingLabel: voting.label,
                votingAddress: voting.address,
                key: index,
                label: value
              }));
              const contract = Contract.at(voting.address);

              for (let option of voting.options) {
                (option => {
                  contract.allVotes.call(
                    option.key,
                    self.address,
                    (err, data) => {
                      if (err) throw err;

                      option.voter = self.address;
                      option.selected = data[0];
                      option.fund = parseInt(data[1]);
                      option.cancel = data[2];

                      if (option.selected && !option.cancel) {
                        self.noActiveVotes = false;
                      }

                      self.$forceUpdate();
                    }
                  );
                })(option);
              }
            }

            votings.push(voting);
          }

          self.votings = votings;
          self.loadingVotings = false;
        }
      });
    });
  }
};
</script>

