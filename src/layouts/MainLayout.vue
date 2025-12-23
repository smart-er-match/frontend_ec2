<template>
  <div class="min-h-screen bg-slate-100">
    <Navbar />

    <!-- Navbar 아래부터 시작 -->
    <main
      class="max-w-6xl mx-auto
             px-0 py-4           
             sm:px-4 sm:py-8"    
    >
      <div
        class="bg-white rounded-xl shadow-md
               p-4 sm:p-8"      
      >
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import Navbar from "../components/Navbar.vue";
</script>
