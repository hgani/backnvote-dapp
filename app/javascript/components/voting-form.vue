<template lang="pug">
  div
    //.form-group(v-if="!editMode")
      label Minimum Vote Amount (ETH)
      input.form-control(type="number" step="0.01" v-model.number="voting.minimumFund")
    //.form-group
      label End Block
      input.form-control(type="number" v-model.number="voting.endBlock")
    .form-group
      label Question for your backers
      input.form-control(type="text" v-model="voting.label" placeholder="E.g. Which feature should we develop next?")
    .form-group
      label More Details
      textarea.form-control(v-model="voting.description" placeholder="E.g. links to relevant group chat or announcement")
    .form-group(v-for="(item, index) in voting.options")
      label Choice {{index + 1}}
      input.form-control(v-model="voting.options[index]")
    .form-group.text-center(v-if="!editMode")
      button.btn.btn-secondary(@click='addOption') Add Choice
      | &nbsp;
      button.btn.btn-secondary(
        :disabled="voting.options.length === voting.minimumOptionsLength"
        @click='removeOption'
        ) Remove Choice
    .form-group
      button.btn.btn-primary(@click="submit" :disabled="submitting") 
        | {{ editMode ? 'Submit' : 'Create Project' }}
</template>

<script>
export default {
  props: ["csrfToken", "readOnlyVoting", "submitting", "editMode"],
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

      self.voting.options.push(null);
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
