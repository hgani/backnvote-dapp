<template lang='pug'>
  nav.navbar.navbar-expand-lg.navbar-light.bg-light
    .container
      a.navbar-brand(href='/')  Back and Vote
      button.navbar-toggler(aria-controls='navbarSupportedContent', aria-expanded='false', aria-label='Toggle navigation', data-target='#navbarSupportedContent', data-toggle='collapse', type='button')
        span.navbar-toggler-icon
      #navbarSupportedContent.collapse.navbar-collapse
        ul.navbar-nav.ml-auto
          //- li.nav-item
            a.nav-link(href='#') Link
          li.nav-item
           span Network: {{store.network || 'loading...'}}
</template>

<script>
import store from "../store";

export default {
  data() {
    return {
      store
    };
  }
};
</script>