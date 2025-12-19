

<template>
  <!-- 🔥 히어로 섹션 -->
 <section
  class="relative h-full w-full
         flex items-start justify-center
         pt-5 sm:pt-24 lg:pt-0
         lg:items-center
         overflow-hidden"
>
  <!-- 배경 이미지 -->
  <transition name="fade" mode="out-in">
    <div
      :key="currentImage"
      class="absolute inset-0 bg-cover bg-center duration-700"
      :style="`background-image: url(${images[currentImage]})`"
    ></div>
  </transition>

  <!-- 오버레이 -->
  <div class="absolute inset-0 bg-black/60"></div>

  <!-- 🔥 중앙 콘텐츠 -->
  <div
  class="relative z-10
         flex flex-col lg:flex-row
         items-center justify-start lg:justify-center
         gap-10 lg:gap-40
         px-6
         w-full max-w-6xl
         text-white"
>
    <!-- 왼쪽 문구 -->
    <div class="flex flex-col items-center lg:items-start text-center lg:text-left">
  <!-- 상단 선 -->
  <div class="w-100 lg:w-150 h-[2px] lg:h-[3px] bg-white mb-8"></div>

  <!-- 타이틀 -->
  <h1 class="text-3xl lg:text-5xl font-extrabold mb-4 tracking-tight">
    Smart 응급실 추천 서비스
  </h1>

  <!-- 서브 타이틀 -->
  <p class="text-lg lg:text-2xl font-medium opacity-90">
    응급 상황에서 빠르고 정확하게 응급실을 찾아보세요
  </p>

  <!-- 하단 선 -->
  <div class="w-100 lg:w-150 h-[2px] lg:h-[3px] bg-white mt-8"></div>

</div>

    <!-- 오른쪽 로그인 -->
    <div
    class="w-full max-w-md
          min-w-0 sm:min-w-[380px]
          shrink-0
          bg-white/85 text-slate-800
          rounded-xl shadow-xl p-6 sm:p-8
          mt-1 lg:mt-0"
  >
    <div 
    v-if="auth.isLoggedIn"
    class="text-center"
    >
    <h1 class="text-2xl sm:text-3xl font-bold text-center">
      <!-- 이름 -->
      <span class="block">
        {{ auth.user.name }}님
      </span>

      <span class="block mt-2 text-lg font-semibold">
        로그인 하신 것을 환영합니다
      </span>

    </h1>

    <!-- <button
      @click="movetoMain"
      class="mt-5 mx-auto flex w-[300px] justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >응급실 조회하기</button> -->
    </div>

    <div v-else>
      <Login />
    </div>

    <button
      v-if="auth.isLoggedIn"
      @click="movetoMain"
      class="mt-6 w-full sm:w-[260px] mx-auto
            flex items-center justify-center gap-2
            rounded-xl bg-indigo-600 px-4 py-3
            text-sm sm:text-base font-semibold text-white
            shadow-md transition
            hover:bg-indigo-500
            active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      응급실 추천 바로가기
      <svg
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M5 12h14" />
        <path d="M13 5l7 7-7 7" />
      </svg>
    </button>

    </div>
  </div>
</section>


  
</template>


<script setup>
import Login from '../../pages/Auth/Login.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'

import img1 from '../../assets/guide/응급실.jpg'
import img2 from '../../assets/guide/응급실-구급차.jpg'
import img3 from '../../assets/guide/구급차.webp'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const images = [img1, img2, img3]
const currentImage = ref(0)
let intervalId = null

const router = useRouter()

const movetoMain = () =>{
  router.push({name: 'main'})
}
onMounted(() => {
  intervalId = setInterval(() => {
    currentImage.value = (currentImage.value + 1) % images.length
  }, 10000) // 4초마다 변경
})

const auth = useAuthStore()
auth.hydrate() // 새로고침/직접진입 대비(필요 없으면 빼도 됨)


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
