<template>
  <!-- 🔥 히어로 섹션 -->
  <section
    class="relative h-full w-full
           flex items-start sm:items-center justify-center
           overflow-hidden
           pt-3 sm:pt-0"
  >
    <!-- 배경 이미지 -->
    <transition name="fade" mode="out-in">
      <div
        :key="currentImage"
        class="absolute inset-0 bg-cover bg-center"
        :style="`background-image: url(${images[currentImage]})`"
      ></div>
    </transition>

    <!-- 오버레이 -->
    <div class="absolute inset-0 bg-black/60"></div>

    <!-- 🔥 중앙 콘텐츠 -->
    <div
      class="relative z-10
             flex flex-col lg:flex-row
             items-start sm:items-center
             justify-start sm:justify-between
             gap-4 sm:gap-8 lg:gap-16
             px-4 sm:px-6
             w-full max-w-6xl
             text-white"
    >
      <!-- 왼쪽: 제목 (모바일은 제목만, PC는 서브텍스트 포함) -->
      <div class="w-full lg:w-auto">
        <!-- 제목 -->
        <h1
          class="text-xl sm:text-3xl lg:text-5xl
                 font-extrabold
                 tracking-tight
                 mb-1.5 sm:mb-3"
        >
          Smart 응급실 추천 서비스
        </h1>

        <!-- 서브 타이틀: 모바일에서는 숨김 -->
        <p class="hidden sm:block text-lg lg:text-2xl font-medium opacity-90">
          응급 상황에서 빠르고 정확하게 응급실을 찾아보세요
        </p>
      </div>

      <!-- 오른쪽: 로그인 카드 -->
      <div
        class="w-full max-w-sm sm:max-w-md
               min-w-0
               shrink-0
               bg-white/88 text-slate-800
               rounded-xl shadow-xl
               p-3.5 sm:p-5 lg:p-7
               mt-2 sm:mt-0"
      >
        <!-- 로그인 상태 -->
        <div v-if="auth.isLoggedIn" class="text-center">
          <h1 class="text-base sm:text-2xl font-bold">
            <span class="block">
              {{ auth.user.name }}님
            </span>
            <span class="block mt-1.5 text-xs sm:text-base font-semibold">
              로그인 하신 것을 환영합니다
            </span>
          </h1>
        </div>

        <!-- 미로그인: 로그인 폼 -->
        <div v-else>
          <Login />
        </div>

        <!-- CTA 버튼 (로그인 상태일 때만) -->
        <button
          v-if="auth.isLoggedIn"
          @click="movetoMain"
          class="mt-4 sm:mt-5 w-full sm:w-[260px] mx-auto
                 flex items-center justify-center gap-2
                 rounded-xl bg-indigo-600 px-4
                 py-2.5 sm:py-3
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
const movetoMain = () => {
  router.push({ name: 'main' })
}

const auth = useAuthStore()
auth.hydrate()

onMounted(() => {
  intervalId = setInterval(() => {
    currentImage.value = (currentImage.value + 1) % images.length
  }, 10000)
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
