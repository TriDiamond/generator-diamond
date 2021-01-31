<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" height="200" width="200" />
    <Diamond :msg="`Welcome to Your ${name}.`" />
  </div>
</template>

<script>
// @ is an alias to /src
import Diamond from '@/components/Diamond.vue'
import { title } from '@/settings'

export default {
  name: 'Home',
  data() {
    return {
      name: title
    }
  },
  components: {
    Diamond
  }
}
</script>
