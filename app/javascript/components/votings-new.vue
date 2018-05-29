<template lang="pug">
  div
    .card
      .card-body
        voting-form(      
          :web3="web3" 
          :web3-helper="web3Helper" 
          :voting-contract="votingContract" 
          :csrf-token="csrfToken"
          :read-only-voting="voting"
          :submitting="submitting"
          @submit="submit"
        )
</template>

<script>
import Vue from "vue/dist/vue.esm";

export default {
  props: ["web3", "web3Helper", "votingContract", "csrfToken"],
  data() {
    return {
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

      const { web3, web3Helper, votingContract, csrfToken } = self;

      const ttrOption = {
        closeButton: true,
        positionClass: "toast-bottom-full-width",
        timeOut: 0,
        extendedTimeOut: 0,
        tapToDismiss: false
      };

      const creator = web3.eth.defaultAccount;
      const minimumFund = voting.minimumFund * 1e18;
      const endBlock = voting.endBlock;
      const Contract = web3.eth.contract(votingContract.ABI);

      if (!self.web3Helper.metamaskLogin()) {
        return alert("Please login to MetaMask");
      }

      if (!voting.label) return ttr.error("Please enter valid label");
      for (const item of voting.options) {
        if (!item) return ttr.error("Please enter valid option");
      }

      const data = Contract.new.getData(creator, minimumFund, endBlock, {
        data: votingContract.byteCode
      });

      self.submitting = true;
      web3.eth.estimateGas({ data }, (err, data) => {
        if (err) {
          self.submitting = false;
          throw err;
        }

        Contract.new(
          creator,
          minimumFund,
          endBlock,
          {
            from: creator,
            gas: data + 1,
            gasPrice: 30 * 1e9,
            data: votingContract.byteCode
          },
          (err, data) => {
            // When creating contract, this callback will be called 2 times.
            // The first time data.address will be undefined
            // The second time data.address will be filled

            if (err) {
              self.submitting = false;
              throw err;
            }

            const link = `<a class="btn btn-primary" href="${
              web3Helper.viewTxPath
            }/${
              data.transactionHash
            }" target="_blank">View Transaction on Etherscan</a>`;

            if (!data.address) {
              ttr.success(`Transaction Success. ${link}`, null, ttrOption);
              $.ajax({
                url: "/votings.json",
                method: "post",
                data: {
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
                  ttr.success("Your contract has been saved", null, ttrOption);
                },
                error() {
                  self.submitting = false;
                  ttr.error("Error when saving contract", null, ttrOption);
                }
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
