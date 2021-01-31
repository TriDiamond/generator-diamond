<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" height="200" width="200" />
    <Diamond :msg="`Welcome to Your ${name}.`" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import defaultSettings from '@/settings'
import Diamond from '@/components/Diamond.vue' // @ is an alias to /src

export default defineComponent({
  name: 'Home',
  components: {
    Diamond
  },
  setup() {
    const name = ref(defaultSettings.title)
    return { name }
  }
})
</script>
