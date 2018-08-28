<template lang='pug'>
  div
    div(v-if="loading")
      p Loading...
    div(v-if="!loading && hasData")
      slot
    div(v-if="!loading && !hasData")
      slot(name="noData")
        p There is no data
</template>

<script>
export default {
  props: ["loading", "hasData", "noData"]
};
</script>
