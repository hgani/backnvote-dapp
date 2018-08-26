<template lang="pug">
  .card.mb-3
    confirm-vote(:confirm="confirm.vote" :fund="voteFund" @ok="vote" @cancel="confirm.vote = false")
    
    confirm(id="approveConfirm" :confirm="confirm.approve" @ok="approve" @cancel="confirm.approve = false")
      p Approving this Target indicates that you're committed to delivering it. 
      p If you are unable to deliver it, you can <i>cancel</i> the Target in which case the fund will be returned to the voters.
      p Proceed?

    confirm(id="cancelConfirm" :confirm="confirm.cancel" @ok="cancel" @cancel="confirm.cancel = false")
      p This Target will be closed and the fund will be returned to the voters.
      p Proceed?    

    confirm(id="withdrawConfirm" :confirm="confirm.withdraw" @ok="withdraw" @cancel="confirm.withdraw = false")
      p Use <i>withdraw</i> only when the Target has been completed (or almost). You can't <i>cancel</i> a Target once it has been withdrawn.
      p Proceed?

    .card-header
      div.d-flex.justify-content-between
        div
          h4 
            router-link(:to="`/votings/${voting.address}`" class="d-block") {{voting.label}}
          div
            strong= 'Project Admin: '
            a.small(:href="`${store.etherScanRoot}/address/${voting.creator}`") {{voting.creator}} 
            | &nbsp;
            span.badge.badge-info(v-if="voting.currentUserCreator") You
        div.text-right
          router-link(:to="`/votings/${voting.address}/edit`" class="d-block" v-if="voting.currentUserCreator") Edit  
          div.mt-2
            span.badge.badge-success.mr-2(v-if="deployed" style="position: relative; top: -5px" title="Contract has been deployed to blockchain") deployed
            span.badge.badge-warning.mr-2(v-if="!deployed" style="position: relative; top: -5px" title="Contract is being deployed to blockchain") deploying
            small(:class="{dropup: showInfo}")
              a.dropdown-toggle.btn.btn-sm.btn-outline-secondary(href="" @click.prevent="toggleInfo")  
      div(v-if="showInfo")
        strong= 'Contract Address: '
        small
          a(:href="`${store.etherScanRoot}/address/${voting.address}`") {{voting.address}}
        br
        strong= 'Tx Hash: '
        small
          a(:href="`${store.etherScanRoot}/tx/${voting.tx_hash}`") {{voting.tx_hash}}        
    .card-body
      p {{voting.description || 'No Description'}}
    .card-footer.bg-white
        strong Targets
        div.my-3.py-2.px-1(v-for="(option, index) in voting.options")
          .d-flex
            .d-flex.flex-grow-1.align-items-center.justify-content-center
              div.w-100
                .d-block.mb-1
                  span.mr-2 {{option}}                 
                  span.badge.badge-success(v-if='voting.optionApproves[index] === 1') Approved
                  span.badge.badge-warning(v-if='voting.optionApproves[index] === -1') Canceled
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
                button.btn.btn-primary.mr-1(
                  v-if="!voting.currentUserCreator && voting.optionApproves[index] !== -1"
                  @click="showConfirm('vote', index)"
                  :disabled="submitting"
                ) Vote
                button.btn.btn-primary.mr-1(
                  v-if="voting.currentUserCreator && voting.optionApproves[index] !== 1"
                  @click="showConfirm('approve', index)"
                  :disabled="submitting"
                ) Approve
                button.btn.btn-primary.mr-1(
                  v-if="voting.currentUserCreator && voting.optionApproves[index] === 1"
                  @click="showConfirm('withdraw', index)"
                  :disabled="submitting"
                ) Withdraw
                .dropdown.d-inline-block(v-if="voting.currentUserCreator")
                  button.btn.btn-secondary.dropdown-toggle.hide-after.font-sans-serif(data-toggle="dropdown")
                    span ⚙
                  .dropdown-menu
                    button.btn.btn-primary.dropdown-item(
                      @click="showConfirm('cancel', index)"
                      :disabled="submitting || voting.optionApproves[index] === -1"
                    ) Cancel
                </div>                
          .mt-1(v-if="voting.optionVotes[index] && !voting.optionVotes[index].currentUserCancel && voting.optionVotes[index].currentUserFund")
            small You voted with {{voting.optionVotes[index].currentUserFund / 1e18}} ETH
            strong(v-if="voting.optionApproves[index] === -1") &nbsp; Option canceled. Please unvote to refund
            button.btn.btn-primary.btn-sm.ml-2(v-if="voting.optionApproves[index] !== 1" @click='unvote(index)' :disabled="submitting") Unvote
</template>

<script>
import votingContract from "../voting-contract";
import store from "../store";
import Utils from "../utils";

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
      submitting: false,
      voteFund: 0,
      confirm: {
        vote: false,
        approve: false,
        cancel: false,
        withdraw: false
      },
      option: -1
    };
  },
  computed: {
    deployed() {
      const self = this;
      return self.voting.address && self.voting.address !== Utils.emptyAddress;
    }
  },
  methods: {
    toggleInfo() {
      const self = this;

      self.showInfo = !self.showInfo;
    },
    showConfirm(name, option) {
      const self = this;

      self.confirm[name] = true;
      self.option = option;
      self.voteFund = (self.voting.minimumFund / 1e18).toFixed(3);
    },
    vote(fund) {
      const self = this;
      const voting = self.voting;

      const Contract = web3.eth.contract(votingContract.ABI);
      const contract = Contract.at(voting.address);

      Utils.ensureLogin(err => {
        if (err) {
          throw err;
        }

        if (isNaN(fund) || fund * 1e18 < voting.minimumFund) {
          return ttr.error("Please enter valid fund");
        }

        self.submitting = true;
        Utils.submitTx(
          contract,
          "vote",
          [self.option],
          { value: fund * 1e18 },
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
      Utils.submitTx(contract, "unvote", [option], null, (err, data) => {
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
      });
    },
    approve() {
      const self = this;

      const voting = self.voting;
      const Contract = web3.eth.contract(votingContract.ABI);
      const contract = Contract.at(voting.address);

      self.submitting = true;
      Utils.submitTx(contract, "approve", [self.option], null, (err, data) => {
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
      });
    },
    cancel() {
      const self = this;

      const voting = self.voting;
      const Contract = web3.eth.contract(votingContract.ABI);
      const contract = Contract.at(voting.address);

      self.submitting = true;
      Utils.submitTx(contract, "cancel", [self.option], null, (err, data) => {
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
      });
    },
    withdraw() {
      const self = this;

      const voting = self.voting;
      const Contract = web3.eth.contract(votingContract.ABI);
      const contract = Contract.at(voting.address);

      self.submitting = true;
      Utils.submitTx(contract, "withdraw", [self.option], null, (err, data) => {
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
      });
    }
  }
};
</script>
