<script setup>

import { ref, computed } from 'vue'
import LogOut from '../../components/LogOut.vue'
import { useRouter } from 'vue-router'


const user = JSON.parse(localStorage.getItem("user") || "{}")
const roleMessage = computed(() => user.role ? '의료진' : '일반인')


const router = useRouter()

const generalClick = () => {
  router.push('/generalFindMap')

}

</script>

<template>
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
    <img class="mx-auto h-30 w-auto dark:hidden" src="../../assets/main_logo.png" alt="Your Company" />
    <img class="mx-auto h-30 w-auto not-dark:hidden" src="../../assets/main_logo.png" alt="Your Company" />
    <h1 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white">환영합니다! {{ user.name }} 님</h1>
    <p class="text-center">({{ roleMessage }})</p>
    <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white">당신의 용도는?</h2>
  </div>

  <div class="flex gap-6 mb-8 mt-12">
    <!-- 의료진으로 시작 -->
    <button
      v-if="user.role === true"
      class="w-50 h-56 bg-gray-200 flex items-center justify-center text-center font-semibold text-gray-900 hover:bg-gray-300 transition"
    >
      <span class="leading-tight">
        의료진이에요
      </span>
    </button>

    <!-- 일반 회원으로 시작 -->
    <button
      :class="{
        'w-full': user.role !== true,
        'w-50': user.role === true
      }"
      @click="generalClick"
      class="h-56 bg-gray-200 flex items-center justify-center text-center font-semibold text-gray-900 hover:bg-gray-300 transition"
    >
      <span class="leading-tight">
        응급실 찾기
      </span>
    </button>

  </div>
  <div>
      <a href="/license" class="block text-center text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500">응급 요원 자격 받기</a>
  </div>

  <div class="mt-3">
    <LogOut/>
  </div>


</template>


<style>

</style>