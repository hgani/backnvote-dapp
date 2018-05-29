<template lang="pug">
  .card.mb-3
    .card-header
      div.d-flex.flex-row.justify-content-between
        h4
          router-link(:to="`/votings/${voting.address}`" class="d-block") {{voting.label}}
        router-link(:to="`/votings/${voting.address}/edit`" class="d-block" v-if="voting.currentUserCreator") Edit     
      div(v-if="showInfo")
        strong= 'Address: '
        i
          a(:href='voting.addressUrl') {{voting.address}}
        br
        strong= 'Creator: '
        i
          a(:href='voting.creatorUrl') {{voting.creator}}
        = ' '
        span.badge.badge-info {{voting.currentUserCreator ? 'you' : ''}}
        br
        strong= 'Tx (deployed): '
        i
          a(:href='voting.txUrl') {{voting.tx_hash}}
      div.text-right
        small
          a(href="" @click.prevent="toggleInfo") {{ showInfo ? 'Hide Info' : 'Show Info' }}           
    .card-body
      p(v-if="voting.currentUserCreator")
        strong Balance: &nbsp;
        | {{voting.balance / 1e18}} ETH
        br
        strong Minimum Fund: &nbsp;
        | {{voting.minimumFund / 1e18}} ETH
        //br
        //strong End Block: &nbsp;
        //| {{voting.endBlock}}
      p
        strong Description:
        | &nbsp; {{voting.description || 'no description'}}
    .card-footer.bg-white
        strong Options
        div.my-5.py-2.px-1.bg-light(
          v-for='(option, index) in voting.options'
        )
          .d-flex.flex-row.justify-content-between
            .d-inline-block {{option}} ({{voting.optionFunds[index] / 1e18}} ETH)
            .d-inline-block
              span.badge.badge-info.mr-1(v-if='voting.optionApproves[index] === 1') Approved
              span.badge.badge-warning.mr-1(v-if='voting.optionApproves[index] === -1') Canceled
              button.btn.btn-primary.mr-1(
                v-if="!voting.currentUserCreator && voting.optionApproves[index] !== -1"
                @click='vote(index)'
                :disabled="submitting"
              ) Vote
              button.btn.btn-primary.mr-1(
                v-if="voting.currentUserCreator"
                @click='approve(index)'
                :disabled="submitting || voting.optionApproves[index] === 1"
              ) Approve
              button.btn.btn-primary.mr-1(
                v-if="voting.currentUserCreator"
                @click='withdraw(index)'
                :disabled="submitting || voting.optionApproves[index] !== 1"
              ) Withdraw
              button.btn.btn-primary(
                v-if="voting.currentUserCreator"
                @click='cancel(index)'
                :disabled="submitting || voting.optionApproves[index] === -1"
              ) Cancel
          .mt-1(v-if="voting.optionVotes[index] && !voting.optionVotes[index].currentUserCancel && voting.optionVotes[index].currentUserFund")
            | You've voted {{voting.optionVotes[index].currentUserFund / 1e18}} ETH
            strong(v-if="voting.optionApproves[index] === -1") &nbsp; Option canceled. Please unvote to refund
            button.btn.btn-primary.btn-sm.ml-2(v-if="voting.optionApproves[index] !== 1" @click='unvote(index)' :disabled="submitting") Unvote
</template>

<script>
const ttrOption = {
  closeButton: true,
  positionClass: "toast-bottom-full-width",
  timeOut: 0,
  extendedTimeOut: 0,
  tapToDismiss: false
};

export default {
  props: ["web3", "web3Helper", "votingContract", "voting"],
  data() {
    return {
      showInfo: false,
      submitting: false
    };
  },
  methods: {
    toggleInfo() {
      const self = this;

      self.showInfo = !self.showInfo;
    },
    vote(option) {
      const self = this;
      const voting = self.voting;

      const { web3, web3Helper, votingContract } = self;
      const Contract = web3.eth.contract(votingContract.ABI);
      const contract = Contract.at(voting.address);

      let fund = prompt(
        `Please enter amount of ETH (minimum ${voting.minimumFund / 1e18} ETH)`
      );
      if (fund === null) {
        return;
      } else {
        fund = parseFloat(fund);
      }

      if (isNaN(fund) || fund * 1e18 < voting.minimumFund) {
        return ttr.error("Please enter valid fund");
      }

      self.submitting = true;

      contract.vote.estimateGas(
        option,
        { value: voting.minimumFund },
        (err, data) => {
          if (err) {
            self.submitting = false;
            throw err;
          }

          contract.vote.sendTransaction(
            option,
            { value: fund * 1e18, gas: data, gasPrice: 30 * 1e9 },
            (err, data) => {
              if (err) {
                self.submitting = false;
                throw err;
              }

              self.submitting = false;

              const link = `<a class="btn btn-primary" href="${
                web3Helper.viewTxPath
              }/${data}" target="_blank">
        View Transaction on Etherscan</a>`;
              ttr.success(`Transaction Success. ${link}`, null, ttrOption);
            }
          );
        }
      );
    },
    unvote(option) {
      const self = this;
      const voting = self.voting;

      const { web3, web3Helper, votingContract } = self;
      const Contract = web3.eth.contract(votingContract.ABI);
      const contract = Contract.at(voting.address);

      const vote = voting.optionVotes[option];

      const accept = confirm(
        `This is will cancel your vote and your ${vote.currentUserFund /
          1e18} ETH will be refunded. Is this okay?`
      );

      if (!accept) {
        return;
      }

      self.submitting = true;
      contract.unvote.estimateGas(option, (err, data) => {
        if (err) {
          self.submitting = false;
          throw err;
        }

        contract.unvote.sendTransaction(
          option,
          { gas: data, gasPrice: 30 * 1e9 },
          (err, data) => {
            if (err) {
              self.submitting = false;
              throw err;
            }

            self.submitting = false;

            const link = `<a class="btn btn-primary" href="${
              web3Helper.viewTxPath
            }/${data}" target="_blank">
        View Transaction on Etherscan</a>`;
            ttr.success(`Transaction Success. ${link}`, null, ttrOption);
          }
        );
      });
    },
    approve(option) {
      const self = this;
      const voting = self.voting;

      const { web3, web3Helper, votingContract } = self;
      const Contract = web3.eth.contract(votingContract.ABI);
      const contract = Contract.at(voting.address);

      self.submitting = true;
      contract.approve.estimateGas(option, (err, data) => {
        if (err) {
          self.submitting = false;
          throw err;
        }

        contract.approve.sendTransaction(
          option,
          { gas: data, gasPrice: 30 * 1e9 },
          (err, data) => {
            if (err) {
              self.submitting = false;
              throw err;
            }

            self.submitting = false;

            const link = `<a class="btn btn-primary" href="${
              web3Helper.viewTxPath
            }/${data}" target="_blank">
        View Transaction on Etherscan</a>`;
            ttr.success(`Transaction Success. ${link}`, null, ttrOption);
          }
        );
      });
    },
    cancel(option) {
      const self = this;
      const voting = self.voting;

      const { web3, web3Helper, votingContract } = self;
      const Contract = web3.eth.contract(votingContract.ABI);
      const contract = Contract.at(voting.address);

      self.submitting = true;
      contract.cancel.estimateGas(option, (err, data) => {
        if (err) {
          self.submitting = false;
          throw err;
        }

        contract.cancel.sendTransaction(
          option,
          { gas: data, gasPrice: 30 * 1e9 },
          (err, data) => {
            if (err) {
              self.submitting = false;
              throw err;
            }

            self.submitting = false;

            const link = `<a class="btn btn-primary" href="${
              web3Helper.viewTxPath
            }/${data}" target="_blank">
        View Transaction on Etherscan</a>`;
            ttr.success(`Transaction Success. ${link}`, null, ttrOption);
          }
        );
      });
    },
    withdraw(option) {
      const self = this;
      const voting = self.voting;

      const { web3, web3Helper, votingContract } = self;
      const Contract = web3.eth.contract(votingContract.ABI);
      const contract = Contract.at(voting.address);

      self.submitting = true;
      contract.withdraw.estimateGas(option, (err, data) => {
        if (err) {
          self.submitting = false;
          throw err;
        }

        contract.withdraw.sendTransaction(
          option,
          { gas: data, gasPrice: 30 * 1e9 },
          (err, data) => {
            if (err) {
              self.submitting = false;
              throw err;
            }

            self.submitting = false;

            const link = `<a class="btn btn-primary" href="${
              web3Helper.viewTxPath
            }/${data}" target="_blank">
        View Transaction on Etherscan</a>`;
            ttr.success(`Transaction Success. ${link}`, null, ttrOption);
          }
        );
      });
    }
  }
};
</script>

