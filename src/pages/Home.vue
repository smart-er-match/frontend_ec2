<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import { Navigation, Pagination } from 'swiper/modules'
import MainLayout from '../layouts/MainLayout.vue'
const modules = [Navigation, Pagination]

</script>


<template>
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-30 w-auto dark:hidden" src="../assets/main_logo.png" alt="Your Company" />
      <img class="mx-auto h-30 w-auto not-dark:hidden" src="../assets/main_logo.png" alt="Your Company" />
    </div>
     <div class="mt-5 text-center">
     <h1 class="mb-4">응급실 추천 시스템에 오신걸 환영합니다.</h1>

        <Swiper
        :modules="modules"
        navigation
        pagination
        class="w-full max-w-xl mx-auto"
        >
        <SwiperSlide>
            <img src="../assets/guide/image1.png" alt="설명서1" class="w-full rounded-md" />
        </SwiperSlide>

        <SwiperSlide>
            <img src="../assets/guide/image2.png" alt="설명서2" class="w-full rounded-md" />
        </SwiperSlide>

        <SwiperSlide>
            <img src="../assets/guide/image3.png" alt="설명서3" class="w-full rounded-md" />
        </SwiperSlide>
        </Swiper>
    </div>
    <div class="text-blue-500 text-center"> 지금 바로 시작하세요 </div>
    <a href="/login">
    <button
      class="mt-5 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      시작하기
    </button>
    </a>
</template>

<style scoped>

</style>