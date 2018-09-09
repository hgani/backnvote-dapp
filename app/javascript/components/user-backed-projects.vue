<template lang="pug">
  div
    .card.mb-3(v-for="voting in votings" v-if="hasVote && voting.currentUserVotes")
      .card-body
        h4 
          router-link(:to="`/votings/${voting.address}`" class="d-block") {{voting.label}}
        p 
          strong {{ currentUser ? 'Your Vote(s):' : 'Vote(s):' }}
        template(v-for="option in voting.options")      
          p.ml-3(v-if="option.fund") {{option.label}} ({{option.fund / 1e18}} ETH)            

    ajax-status(:loading="loadingVotes" :has-data="hasVote")
      div(slot="noData")
        p(v-if="currentUser") You haven't backed any project. To back a project, click "Vote" on any of the <i>targets</i> listed on the project.
        p(v-if="!currentUser") This user hasn't backed any project.
</template>

<script>
import votingContract from "../voting-contract";
import utils from "../utils";

export default {
  data() {
    return {
      address: null,
      votings: [],
      loadingVotes: true,
      hasVote: false
    };
  },
  computed: {
    currentUser() {
      return utils.currentUser(this.address);
    }
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
          if (!data.votings.length) {
            self.loadingVotes = false;
          }

          let max = 0;
          for (const voting of data.votings) {
            voting.currentUserVotes = false;
            voting.userCreator =
              voting.creator.toLowerCase() === self.address.toLowerCase();
            voting.options = JSON.parse(voting.options);

            if (voting.options && voting.options.length) {
              voting.options = _.map(voting.options, (value, index) => ({
                votingLabel: voting.label,
                votingAddress: voting.address,
                key: index,
                label: value
              }));
              const contract = Contract.at(voting.address);

              for (let option of voting.options) {
                max++;
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
                        voting.currentUserVotes = true;
                        self.hasVote = true;
                      }

                      if (--max === 0) {
                        self.loadingVotes = false;
                      }
                    }
                  );
                })(option);
              }
            }

            self.votings.push(voting);
          }
        }
      });
    });
  }
};
</script>
