<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useLocationStore } from "@/stores/location"
import api from "@/components/api"

const router = useRouter();
const locationStore = useLocationStore();


// ✅ 안전하게 computed로 감싸기 (초기 null 방지)
const user = computed(() => JSON.parse(localStorage.getItem("user") || "{}"));
const roleMessage = computed(() => (user.value.role ? "의료진" : "일반인"));

const generalClick = () => {
  router.push({ name: "generalsymptoms" });
};

const staffClick = () => {
  // router.push({ name: "staffHome" })
};

onMounted(async () => {
  if (!locationStore.lat || !locationStore.lng) return

  try {
    await api.post('/hospitals/user/location/', {
      latitude: locationStore.lat,
      longitude: locationStore.lng,
      locationstext: locationStore.address,
    })
    
  } catch (error) {
    console.error('[location] failed to send', error)
  }
})
</script>

<template>
  <div class="mx-auto w-full max-w-3xl">
    <!-- 헤더 -->
    <div class="mt-10 text-center">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">
        환영합니다, <span class="text-indigo-600">{{ user.name || "사용자" }}</span> 님
      </h1>
      <p class="mt-2 text-sm text-gray-500">
        당신의 용도를 선택해주세요 (현재: {{ roleMessage }})
      </p>
    </div>

    <!-- 선택 카드 -->
    <div
      class="mt-10 grid gap-6"
      :class="user.role === true ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'"
    >
      <!-- 의료진 -->
      <button
        v-if="user.role === true"
        @click="staffClick"
        class="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white
               p-6 sm:p-8 text-left shadow-sm
               min-h-[320px] flex flex-col justify-between
               transition-all duration-200
               hover:-translate-y-1 hover:shadow-lg hover:border-indigo-200
               active:translate-y-0 active:shadow-md
               focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <!-- 배경 그라데이션 -->
        <div class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div class="absolute -top-24 -right-24 h-52 w-52 rounded-full bg-indigo-100 blur-2xl"></div>
          <div class="absolute -bottom-24 -left-24 h-52 w-52 rounded-full bg-purple-100 blur-2xl"></div>
        </div>

        <!-- 상단 -->
        <div class="relative">
          <div class="flex items-start justify-between">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 3v7a4 4 0 0 0 8 0V3"/>
                <path d="M12 10a6 6 0 0 0 12 0"/>
                <path d="M20 10v2a8 8 0 0 1-16 0v-2"/>
                <circle cx="18" cy="10" r="2"/>
              </svg>
            </div>

            <span
              class="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700
                     border border-gray-100"
            >
              의료진 전용
              <svg
                class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              >
                <path d="M5 12h14"/><path d="M13 5l7 7-7 7"/>
              </svg>
            </span>
          </div>

          <div class="mt-5">
            <h2 class="text-lg font-bold text-gray-900">의료진이에요</h2>
            <p class="mt-1 text-sm text-gray-500">
              의료진 전용 기능으로 빠르게 접근합니다.
            </p>
          </div>
        </div>

        <!-- 하단 -->
        <div class="relative">
          <div class="mt-6 h-px w-full bg-gray-100"></div>
          <p class="mt-4 text-sm font-semibold text-gray-900">
            시작하기 <span class="text-indigo-600">→</span>
          </p>
        </div>
      </button>

      <!-- 일반 회원 -->
      <button
        @click="generalClick"
        class="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white
               p-6 sm:p-8 text-left shadow-sm
               min-h-[320px] flex flex-col justify-between
               transition-all duration-200
               hover:-translate-y-1 hover:shadow-lg hover:border-emerald-200
               active:translate-y-0 active:shadow-md
               focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <!-- 배경 그라데이션 -->
        <div class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div class="absolute -top-24 -left-24 h-52 w-52 rounded-full bg-emerald-100 blur-2xl"></div>
          <div class="absolute -bottom-24 -right-24 h-52 w-52 rounded-full bg-sky-100 blur-2xl"></div>
        </div>

        <!-- 상단 -->
        <div class="relative">
          <div class="flex items-start justify-between">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z"/>
                <circle cx="12" cy="10" r="2.5"/>
              </svg>
            </div>

            <span
              class="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700
                     border border-gray-100"
            >
              추천 + 거리
              <svg
                class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              >
                <path d="M5 12h14"/><path d="M13 5l7 7-7 7"/>
              </svg>
            </span>
          </div>

          <div class="mt-5">
            <h2 class="text-lg font-bold text-gray-900">응급실 찾기</h2>
            <p class="mt-1 text-sm text-gray-500">
              내 위치 기준으로 가까운 응급실을 빠르게 찾아드립니다.
            </p>
          </div>
        </div>

        <!-- 하단 -->
        <div class="relative">
          <div class="mt-6 h-px w-full bg-gray-100"></div>
          <p class="mt-4 text-sm font-semibold text-gray-900">
            시작하기 <span class="text-emerald-600">→</span>
          </p>
        </div>
      </button>
    </div>

    <!-- 하단 링크 -->
    <div class="mt-10 text-center">
      <router-link
        :to="{ name: 'license' }"
        class="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-200 bg-white px-5 py-2
               text-sm font-semibold text-indigo-600 shadow-sm transition
               hover:bg-indigo-50 hover:border-indigo-300
               active:scale-[0.99]
               focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        응급 요원 자격 받기
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </router-link>
    </div>
  </div>
</template>
