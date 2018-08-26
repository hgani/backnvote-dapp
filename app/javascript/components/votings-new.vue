<template lang="pug">
  div
    .card
      .card-body
        voting-form(      
          :csrf-token="csrfToken"
          :read-only-voting="voting"
          :submitting="submitting"
          @submit="submit"
        )
</template>

<script>
import votingContract from "../voting-contract";
import Utils from "../utils";
import store from "../store";

const ttrOption = {
  closeButton: true,
  positionClass: "toast-bottom-full-width",
  timeOut: 0,
  extendedTimeOut: 0,
  tapToDismiss: false
};

export default {
  props: ["csrfToken"],
  data() {
    return {
      store,
      voting: {
        minimumFund: 0.01,
        endBlock: 0,
        options: [null, null],
        minimumOptionsLength: 2
      },
      submitting: false
    };
  },
  methods: {
    submit(voting) {
      const self = this;

      const { csrfToken } = self;
      const creator = web3.eth.defaultAccount;
      const minimumFund = voting.minimumFund * 1e18;
      const endBlock = voting.endBlock;
      const Contract = web3.eth.contract(votingContract.ABI);

      Utils.validateVotingForm(voting, err => {
        if (err) {
          throw err;
        }

        self.submitting = true;

        Utils.deployContract(
          Contract,
          votingContract.byteCode,
          [creator, minimumFund, endBlock],
          { from: creator },
          (err, data) => {
            if (err) {
              self.submitting = false;
              throw err;
            }

            const link = `<a class="btn btn-primary" href="${
              self.store.etherScanRoot
            }/tx/${
              data.transactionHash
            }" target="_blank">View Transaction on Etherscan</a>`;

            if (!data.address) {
              ttr.success(`Transaction Success. ${link}`, null, ttrOption);

              web3Helper.getNetwork((err, net) => {
                if (err) throw err;

                $.ajax({
                  url: "/votings.json",
                  method: "post",
                  data: {
                    network: net,
                    tx_hash: data.transactionHash,
                    creator,
                    label: voting.label,
                    description: voting.description,
                    options: JSON.stringify(voting.options),
                    authenticity_token: csrfToken
                  },
                  success() {
                    self.submitting = false;
                    self.resetVoting();

                    ttr.success(
                      "Your contract has been saved",
                      null,
                      ttrOption
                    );

                    self.$router.push(`/users/${creator}/projects`);
                  },
                  error() {
                    self.submitting = false;
                    ttr.error("Error when saving contract", null, ttrOption);
                  }
                });
              });
            }
          }
        );
      });
    },
    resetVoting() {
      const self = this;

      self.voting = {
        minimumFund: 0.01,
        endBlock: 0,
        options: [null, null],
        minimumOptionsLength: 2
      };
    }
  }
};
</script>
