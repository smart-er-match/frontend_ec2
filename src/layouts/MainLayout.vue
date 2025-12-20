<template>
  <div class="min-h-screen bg-slate-100">
    <Navbar />

    <!-- Navbar 아래부터 시작 -->
    <main class="max-w-6xl mx-auto px-4 py-8">
      <div class="bg-white rounded-xl shadow-md p-8">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import Navbar from "../components/Navbar.vue";
</script>
