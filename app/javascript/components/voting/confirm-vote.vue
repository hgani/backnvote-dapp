<template lang='pug'>
  .modal(:id="id").fade
    .modal-dialog
      .modal-content
        .modal-body
          p
            | If this Target gets approved by the Project admin, the admin will be able to withdraw your ETH to fund the project. Please do your due diligence to make sure the admin can be trusted. 
          .form-group
            input.form-control(type="number" step="0.01" v-model.number="fundLocal")
          p
            | You can cancel your vote and get your ETH back prior to approval.
        .modal-footer
          button.btn.btn-primary(@click="submit()") OK
          button.btn.btn-secondary(data-dismiss="modal" @click="cancel()")  Cancel
</template>

<script>
const modalId = "voteModal";
export default {
  props: ["confirm", "fund"],
  data() {
    return {
      id: "voteModal",
      fundLocal: 0,
      submitting: true
    };
  },
  created() {
    const self = this;

    // Why use document? See this: https://github.com/twbs/bootstrap/issues/26817
    $(document).on("hidden.bs.modal", `#${self.id}`, e => self.$emit("cancel"));
  },
  watch: {
    confirm(value) {
      const self = this;

      if (value) {
        self.fundLocal = self.fund;
        $(`#${self.id}`).modal("show");
      }
    }
  },
  methods: {
    submit() {
      const self = this;

      $(`#${self.id}`).modal("hide");
      self.$emit("ok", self.fundLocal);
    },
    cancel() {
      const self = this;

      self.$emit("cancel");
    }
  }
};
</script>
