





<template>
  <div class="min-h-screen grid grid-cols-1 md:grid-cols-2">
    <!-- 왼쪽 영역 -->
    <div class="flex flex-col justify-center px-8 lg:px-24 bg-slate-100">
      <!-- 메인 타이틀 -->
      <div class="text-center mb-10">
        <p class="text-2xl lg:text-3xl font-semibold text-slate-800">
          Smart 응급실 추천 서비스
        </p>
        <p class="mt-2 text-lg lg:text-xl text-slate-600">
          실시간 응급실 정보를 간편하게 조회하세요!
        </p>
      </div>

      <Login/>

      <!-- 설명서 다운로드 -->
      <!-- <div class="mt-6 text-center text-sm text-slate-500">
        내 손안의 응급실 사용설명서
        <button class="ml-1 font-semibold underline underline-offset-4">
          다운로드
        </button>
      </div> -->

      <!-- 구분선 -->
      <!-- <div class="mt-6 flex items-center justify-center">
        <div class="h-px w-24 bg-slate-200"></div>
      </div> -->

      <!-- 서브 버튼 -->
      <!-- <button
        class="mt-8 w-full max-w-xl mx-auto flex items-center justify-between
               rounded-xl border border-slate-200 bg-white px-6 py-4
               shadow-sm hover:shadow-md transition"
      >
        <div class="flex items-center gap-3">
          <span class="text-xl">➕</span>
          <span class="text-sm lg:text-base text-slate-800">
            실시간 응급의료 자원정보 상세조회
            <span class="ml-1 text-xs text-slate-500">
              (PC 환경 사용 권장)
            </span>
          </span>
        </div>
        <span class="text-slate-400 text-xl">
          →
        </span>
      </button> -->
    </div>

    <!-- 오른쪽 영역 (이미지 자리, 지금은 비워둠) -->
     <div
    class="hidden md:block relative w-full h-full overflow-hidden"
  >
    <!-- 이미지 -->
    <transition name="fade" mode="out-in">
      <div
        :key="currentImage"
        class="absolute inset-0 bg-cover bg-center duration-700"
        :style="`background-image: url(${images[currentImage]})`"
      ></div>
    </transition>

    <div class="absolute inset-0 bg-black/60"></div>

    <div class="absolute inset-0 flex flex-col justify-center items-center text-white px-6">
    <div class="w-80 h-px bg-white/40 mb-6"></div>
    <h1 class="text-3xl font-bold mb-3">응급 상황에서 가장 빠르게</h1>
    <p class="text-lg opacity-90">Smart 응급실 추천 서비스가 도와드립니다.</p>
    <div class="w-80 h-px bg-white/40 mt-6"></div>
  </div>
  </div>
  </div>
</template>

<script setup>
import Login from '../pages/Auth/Login.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'

import img1 from '../assets/guide/응급실.jpg'
import img2 from '../assets/guide/응급실-구급차.jpg'
import img3 from '../assets/guide/구급차.webp'

const images = [img1, img2, img3]
const currentImage = ref(0)
let intervalId = null

onMounted(() => {
  intervalId = setInterval(() => {
    currentImage.value = (currentImage.value + 1) % images.length
  }, 10000) // 4초마다 변경
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
})

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>
