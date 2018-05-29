<template lang='pug'>
  ul.list-group
    li.list-group-item
      router-link(to='/votings', class='d-block') Votings
    li.list-group-item
      router-link(to='/votings/new', class='d-block') New
</template>

<script>
export default {};
</script>