

<template>
    <FindLocation  @updateLocation="handleLocation"/>
</template>

<script setup>
import { ref } from 'vue'
import FindLocation from './FindLocation.vue';

const lat = ref('')
const lng = ref('')
const address = ref('')
const distance = ref('')

const handleLocation = (info) => {
  lat.value = info.lat
  lng.value = info.lng
  address.value = info.address
  distance.value = info.distance
}


</script>

<style scoped>

</style>