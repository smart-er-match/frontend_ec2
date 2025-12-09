<template>
  <nav class="bg-gray-800 text-white">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- 왼쪽 로고 + 제목 -->
        <div class="flex items-center gap-2">
          <router-link 
          :to="{ name: 'main'}"
          class="font-semibold tracking-tight">
            Smart ER Match
          
          </router-link>
        </div>

        <!-- 메뉴: 항상 보이게 (hidden md:flex → flex 로 변경) -->
        <div class="flex items-center gap-4">
          <router-link 
            v-for="value in navigation"
            :to="{name: value.name}"
          >
          {{ value.label }}

          </router-link>

        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>


const navigation = [
  { label: 'Main', name: 'main' },
  { label: 'Mypage', name: 'mypage' },
  { label: 'ER List', name: 'erlist' },
]
</script>

<style scoped>
</style>
