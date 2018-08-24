<template lang="pug">
  .card.mb-3
    .card-header
      div.d-flex.justify-content-between
        h4
          router-link(:to="`/votings/${voting.address}`" class="d-block") {{voting.label}}
        router-link(:to="`/votings/${voting.address}/edit`" class="d-block" v-if="voting.currentUserCreator") Edit     
      div(v-if="showInfo")
        strong= 'Address: '
        i
          a(:href="`${store.etherScanRoot}/address/${voting.address}`") {{voting.address}}
        br
        strong= 'Creator: '
        i
          a(:href="`${store.etherScanRoot}/address/${voting.creator}`") {{voting.creator}}
        = ' '
        span.badge.badge-info {{voting.currentUserCreator ? 'you' : ''}}
        br
        strong= 'Tx (deployed): '
        i
          a(:href="`${store.etherScanRoot}/tx/${voting.tx_hash}`") {{voting.tx_hash}}
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
      p
        strong Description:
        | &nbsp; {{voting.description || 'no description'}}
    .card-footer.bg-white
        strong Options
        div.my-3.py-2.px-1(
          v-for="(option, index) in voting.options"
        )
          .d-flex
            .d-flex.flex-grow-1.align-items-center.justify-content-center
              div.w-100
                .d-block
                  | {{option}}
                .d-flex
                  .progress.flex-grow-1.w-100(style="height: 20px")
                    .progress-bar.bg-success(:style="{width: `${voting.optionFunds[index] ? ((voting.optionFunds[index] / voting.balance) * 100) : 1}%`}")
                  small.px-2(style="width: 200px") 
                    // Don't forget to init optionFunds[index] with default value.
                    // Because optionFunds[index] may be undefined.  
                    | {{voting.optionFunds[index] / 1e18}} ETH 
                    | {{(voting.optionVotes[index] && voting.optionVotes[index].validCount) ? `(${voting.optionVotes[index].validCount} backers)` : ''}}                    
            .d-flex.align-items-center.justify-content-end
              div.text-right.pl-2.mt-2
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
            small You've voted {{voting.optionVotes[index].currentUserFund / 1e18}} ETH
            strong(v-if="voting.optionApproves[index] === -1") &nbsp; Option canceled. Please unvote to refund
            button.btn.btn-primary.btn-sm.ml-2(v-if="voting.optionApproves[index] !== 1" @click='unvote(index)' :disabled="submitting") Unvote
</template>

<script>
import votingContract from "../voting-contract";
import store from "../store";

const ttrOption = {
  closeButton: true,
  positionClass: "toast-bottom-full-width",
  timeOut: 0,
  extendedTimeOut: 0,
  tapToDismiss: false
};

export default {
  props: ["voting"],
  data() {
    return {
      store,
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
                self.store.etherScanRoot
              }/tx/${data}" target="_blank">
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
              self.store.etherScanRoot
            }/tx/${data}" target="_blank">
        View Transaction on Etherscan</a>`;
            ttr.success(`Transaction Success. ${link}`, null, ttrOption);
          }
        );
      });
    },
    approve(option) {
      const self = this;

      const voting = self.voting;
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
              self.store.etherScanRoot
            }/tx/${data}" target="_blank">
        View Transaction on Etherscan</a>`;
            ttr.success(`Transaction Success. ${link}`, null, ttrOption);
          }
        );
      });
    },
    cancel(option) {
      const self = this;

      const voting = self.voting;
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
              self.store.etherScanRoot
            }/tx/${data}" target="_blank">
        View Transaction on Etherscan</a>`;
            ttr.success(`Transaction Success. ${link}`, null, ttrOption);
          }
        );
      });
    },
    withdraw(option) {
      const self = this;

      const voting = self.voting;
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
              self.store.etherScanRoot
            }/tx/${data}" target="_blank">
        View Transaction on Etherscan</a>`;
            ttr.success(`Transaction Success. ${link}`, null, ttrOption);
          }
        );
      });
    }
  }
};
</script>

