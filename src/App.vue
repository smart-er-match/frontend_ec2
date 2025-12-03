<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import MainLayout from './layouts/MainLayout.vue'

const route = useRoute()

const layout = computed(() => {
  // 페이지에서 meta.layout 없으면 기본(MainLayout) 자동적용
  const name = route.meta.layout || 'MainLayout'

  return {
    MainLayout,
  }[name]
})

</script>

<template>
  <component :is="layout">
    <router-view/>
  </component>
</template>

<style scoped>


</style>