



<template>
  <!-- 🔥 히어로 섹션 -->
  <section
  class="relative h-full w-full
         flex items-center justify-center
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
           items-center justify-center
           gap-12
           lg:gap-40
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
         min-w-[380px]
         shrink-0
         bg-white/80 text-slate-800
         rounded-xl shadow-xl p-8"
>
    <div 
    v-if="auth.isLoggedIn"
    class="text-center"
    >
     <h1 class="text-3xl font-bold">
      {{ auth.user.name }}님 <br>로그인 하신것을 환영합니다
    </h1>

    <!-- <button
      @click="movetoMain"
      class="mt-5 mx-auto flex w-[300px] justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >응급실 조회하기</button> -->
    </div>

    <div v-else>
      <Login />
    </div>


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
