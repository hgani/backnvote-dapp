<template lang="pug">
  div(v-if="!noActiveVotes")
    .card.mb-3(v-for="voting in votings" v-if="voting.currentUserVotes")
      .card-body
        h4 
          router-link(:to="`/votings/${voting.address}`" class="d-block") {{voting.label}}
        p 
          strong {{ currentUser ? 'Your Vote(s):' : 'Vote(s):' }}
        template(v-for="option in voting.options")      
          p.ml-3(v-if="option.fund") {{option.label}} ({{option.fund / 1e18}} ETH)        

    ajax-status(:loading="loadingVotings" :no-data="noActiveVotes")
      p(v-if="currentUser") You haven't backed any project. To back a project, click "Vote" on any of the <i>targets</i> listed on the project.
      p(v-if="!currentUser") This user hasn't backed any project.
</template>

<script>
import votingContract from "../voting-contract";

export default {
  data() {
    return {
      address: null,
      votings: [],
      noActiveVotes: true,
      loadingVotings: true
    };
  },
  computed: {
    currentUser() {
      return this.address === web3.eth.defaultAccount;
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
                        self.noActiveVotes = false;
                      }

                      self.$forceUpdate();
                    }
                  );
                })(option);
              }
            }

            self.votings.push(voting);
          }

          self.loadingVotings = false;
        }
      });
    });
  }
};
</script>
