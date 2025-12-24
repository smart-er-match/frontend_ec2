<template>
  <Navbar />

  <!-- ✅ 모바일: 상단부터 자연스럽게 / 데스크탑: 가운데 정렬 -->
  <div class="min-h-[calc(100vh-64px)] bg-slate-100 px-4 py-6 sm:py-10">
    <div class="mx-auto w-full max-w-xl">
      <div
        class="
          bg-white shadow-sm border border-slate-200
          p-5 sm:p-8
          rounded-2xl sm:rounded-3xl
        "
      >
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
</script>

<style scoped></style>
