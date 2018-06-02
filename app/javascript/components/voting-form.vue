<template lang="pug">
  div
    .form-group(v-if="!editMode")
      label Minimum Vote Amount (ETH)
      input.form-control(type="number" step="0.01" v-model.number="voting.minimumFund")
    //.form-group
      label End Block
      input.form-control(type="number" v-model.number="voting.endBlock")
    .form-group
      label Title
      input.form-control(type="text" v-model="voting.label")
    .form-group
      label Description
      textarea.form-control(v-model="voting.description")
    .form-group(v-for="(item, index) in voting.options")
      label Option {{index + 1}}
      input.form-control(v-model="voting.options[index]")
    .form-group.text-center(v-if="!editMode")
      button.btn.btn-secondary(@click='addOption') Add Option
      | &nbsp;
      button.btn.btn-secondary(
        :disabled="voting.options.length === voting.minimumOptionsLength"
        @click='removeOption'
        ) Remove Option
    .form-group
      button.btn.btn-primary(@click="submit" :disabled="submitting") 
        | {{ editMode ? 'Submit' : 'Create New Voting' }}
</template>

<script>
export default {
  props: [
    "csrfToken",
    "readOnlyVoting",
    "submitting",
    "editMode"
  ],
  data() {
    return {
      voting: {}
    };
  },
  watch: {
    readOnlyVoting(value) {
      const self = this;

      self.voting = _.cloneDeep(self.readOnlyVoting);
    }
  },
  created() {
    const self = this;

    self.voting = _.cloneDeep(self.readOnlyVoting);
  },
  methods: {
    addOption() {
      const self = this;

      self.voting.options.push(self.voting.options.length + 1);
    },
    removeOption() {
      const self = this;

      if (self.voting.options.length > self.voting.minimumOptionsLength) {
        self.voting.options.pop();
      }
    },
    submit() {
      const self = this;

      self.$emit("submit", _.cloneDeep(self.voting));
    }
  }
};
</script>
