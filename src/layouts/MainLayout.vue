



<template>
  <div>
    <Navbar/>
    <div class="min-h-screen flex justify-center items-center bg-slate-100">
    <div class="w-full max-w-xl px-4 w-full">
      <div class="bg-white rounded-xl shadow-md p-8">
        <router-view />
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'

</script>

<style scoped></style>
