<template lang='pug'>
  div
    p(v-if="loading")
      | Loading...
    p(v-if="!loading && noData")
      slot
</template>

<script>
export default {
  props: ['loading', 'noData', 'noDataMessage']
};
</script>
