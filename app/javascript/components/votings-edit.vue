<template lang='pug'>
  div
    .card
      .card-header.d-flex.justify-content-between
        div
          h4 
            router-link(:to="`/votings/${voting.address}`" class="d-block") {{voting.label}}         
        div.text-right
          span.badge.badge-success.mr-2 deployed      
      .card-body
        p
          strong= 'Project Admin: '
            a.small(:href="`${store.etherScanRoot}/address/${voting.creator}`") {{voting.creator}} 
            | &nbsp;
            span.badge.badge-info(v-if="voting.currentUserCreator") You    
          br
          strong= 'Contract Address: '
          small
            a(:href="`${store.etherScanRoot}/address/${voting.address}`") {{voting.address}}
          br
          strong= 'Tx Hash: '
          small
            a(:href="`${store.etherScanRoot}/tx/${voting.tx_hash}`") {{voting.tx_hash}}    
        voting-form(      
          :csrf-token="csrfToken"
          :read-only-voting="voting"
          :submitting="submitting"
          :edit-mode="true"
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
      voting: { options: [] },
      submitting: false
    };
  },
  created() {
    const self = this;

    const Contract = web3.eth.contract(votingContract.ABI);
    const route = self.$router.currentRoute;

    const address = route.params.address;

    web3Helper.getNetwork((err, net) => {
      if (err) throw err;

      $.ajax({
        url: `votings/${address}.json`,
        data: { network: net },
        success(data) {
          const voting = data.voting;

          if (!voting) {
            return self.$router.push("/not-found");
          }

          voting.options = JSON.parse(voting.options);
          voting.addressUrl = `${self.store.etherScanRoot}/address/${
            voting.address
          }`;
          voting.creatorUrl = `${self.store.etherScanRoot}/address/${
            voting.creator
          }`;
          voting.txUrl = `${self.store.etherScanRoot}/tx/${voting.tx_hash}`;
          voting.currentUserCreator =
            web3.eth.defaultAccount &&
            web3.eth.defaultAccount.toLowerCase() ===
              voting.creator.toLowerCase();

          self.voting = voting;
        },
        error() {}
      });
    });
  },
  methods: {
    submit(voting) {
      const self = this;

      const { csrfToken } = self;
      const creator = web3.eth.defaultAccount;

      Utils.validateVotingForm(voting, () => {
        self.submitting = true;

        web3Helper.getNetwork((err, net) => {
          if (err) throw err;

          $.ajax({
            url: `/votings/${voting.address}.json`,
            method: "post",
            data: {
              _method: "patch",
              network: net,
              label: voting.label,
              description: voting.description,
              options: JSON.stringify(voting.options),
              authenticity_token: csrfToken
            },
            success() {
              self.submitting = false;
              ttr.success("Your contract has been saved", null, ttrOption);
            },
            error() {
              self.submitting = false;
              ttr.error("Error when saving contract", null, ttrOption);
            }
          });
        });
      });
    }
  }
};
</script>
