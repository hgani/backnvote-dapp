<template lang='pug'>
  .modal#voteModal.fade
    .modal-dialog
      .modal-content
        .modal-body
          p
            | If this Target gets approved by the Project admin, the admin will withdraw your ETH to fund the project. Please do your due dilligence to make sure the admin can be trusted. 
          .form-group
            input.form-control(type="number" step="0.001" v-model="voteLocal.fund")
          p
            | You can cancel your vote and get your ETH back prior to approval.           
        .modal-footer
          button.btn.btn-primary(@click="submit()") OK
          button.btn.btn-secondary(data-dismiss="modal" @click="cancel()")  Cancel
</template>

<script>
export default {
  props: ["currentVote"],
  data() {
    return {
      voteLocal: {},
      submitting: true
    };
  },
  created() {
    const self = this;

    // Why use document? See this: https://github.com/twbs/bootstrap/issues/26817
    $(document).on("hidden.bs.modal", "#voteModal", e => self.$emit("cancel"));
  },
  watch: {
    currentVote(value) {
      const self = this;

      if (value) {
        self.voteLocal = _.cloneDeep(value);
        $("#voteModal").modal("show");
      }
    }
  },
  methods: {
    submit() {
      const self = this;

      $("#voteModal").modal("hide");
      self.$emit("ok", self.voteLocal);
    },
    cancel() {
      const self = this;

      self.$emit("cancel");
    }
  }
};
</script>

