<template lang='pug'>
  .modal(:id="id").fade
    .modal-dialog
      .modal-content
        .modal-body
          slot
        .modal-footer
          button.btn.btn-primary(@click="submit()") OK
          button.btn.btn-secondary(data-dismiss="modal" @click="cancel()")  Cancel
</template>

<script>
export default {
  props: ["id", "confirm"],
  created() {
    const self = this;

    // Why use document? See this: https://github.com/twbs/bootstrap/issues/26817
    $(document).on("hidden.bs.modal", `#${self.id}`, e => self.$emit("cancel"));
  },
  watch: {
    confirm(value) {
      const self = this;

      if (value) {
        $(`#${self.id}`).modal("show");
      }
    }
  },
  methods: {
    submit() {
      const self = this;

      $(`#${self.id}`).modal("hide");
      self.$emit("ok");
    },
    cancel() {
      const self = this;

      self.$emit("cancel");
    }
  }
};
</script>
