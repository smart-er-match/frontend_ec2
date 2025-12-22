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

<!-- 빠른 액션 -->
<div class="mt-10 space-y-4">
  <!-- AI 챗봇 서비스 -->
<button
  type="button"
  @click="openChatBot"
  class="group w-full relative overflow-hidden
         rounded-2xl border border-gray-200 bg-white
         p-5 text-left shadow-sm
         transition-all duration-200
         hover:shadow-md hover:border-indigo-200
         active:scale-[0.99]
         focus:outline-none focus:ring-2 focus:ring-indigo-500"
>
  <!-- 배경 효과 -->
  <div class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
    <div class="absolute -top-24 -right-24 h-52 w-52 rounded-full bg-indigo-100 blur-2xl"></div>
  </div>

  <div class="relative flex items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <!-- 챗봇 아이콘 -->
        <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5h-2" />
          <path d="M9 10h6m-3-3v6" />
        </svg>
      </div>

      <div>
        <p class="text-base font-bold text-gray-900">AI 챗봇 서비스</p>
        <p class="text-sm text-gray-500">
          AI 챗봇과 대화를 통해 빠르게 도움을 받으세요.
        </p>
      </div>
    </div>

    <span class="text-sm font-semibold text-indigo-600">
      열기 →
    </span>
  </div>
</button>
 <Teleport to="body">
  <!-- overlay -->
  <div
    v-if="isChatOpen"
    class="fixed inset-0 z-[999] bg-black/40 backdrop-blur-[2px]"
    @click="closeChatBot"
  />

  <!-- modal (center) -->
  <div
    v-if="isChatOpen"
    class="fixed inset-0 z-[1000]
           flex items-center justify-center
           p-4"
    @click.stop
  >
    <div
      class="w-full max-w-3xl
             h-[80vh] max-h-[900px]
             rounded-2xl bg-white
             shadow-2xl border border-gray-200
             overflow-hidden"
    >
      <AIChatBot @close="closeChatBot" />
    </div>
  </div>
</Teleport>
  <!-- 응급실 목록 보기 -->
  <button
    type="button"
    @click="erListClick"
    class="group w-full relative overflow-hidden
           rounded-2xl border border-gray-200 bg-white
           p-5 text-left shadow-sm
           transition-all duration-200
           hover:shadow-md hover:border-indigo-200
           active:scale-[0.99]
           focus:outline-none focus:ring-2 focus:ring-indigo-500"
  >
    <!-- 배경 효과 -->
    <div class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      <div class="absolute -top-24 -right-24 h-52 w-52 rounded-full bg-indigo-100 blur-2xl"></div>
    </div>

    <div class="relative flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <!-- list icon -->
          <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/>
            <path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>
          </svg>
        </div>

        <div>
          <p class="text-base font-bold text-gray-900">응급실 목록 보기</p>
          <p class="text-sm text-gray-500">
            주변 응급실을 리스트로 확인합니다.
          </p>
        </div>
      </div>

      <span class="text-sm font-semibold text-indigo-600">
        열기 →
      </span>
    </div>
  </button>


  <!-- 119 바로 연결 -->
  <button
    type="button"
    @click="call119"
    class="group w-full relative overflow-hidden
           rounded-2xl border border-gray-200 bg-white
           p-5 text-left shadow-sm
           transition-all duration-200
           hover:shadow-md hover:border-rose-200
           active:scale-[0.99]
           focus:outline-none focus:ring-2 focus:ring-rose-500"
  >
    <!-- 배경 효과 -->
    <div class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      <div class="absolute -top-24 -left-24 h-52 w-52 rounded-full bg-rose-100 blur-2xl"></div>
    </div>

    <div class="relative flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <!-- phone icon -->
          <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2
                     19.8 19.8 0 0 1-8.63-3.07
                     19.5 19.5 0 0 1-6.04-6.04
                     19.8 19.8 0 0 1-3.07-8.63
                     A2 2 0 0 1 2.06 0h3
                     a2 2 0 0 1 2 1.72
                     c.12.86.3 1.7.54 2.5
                     a2 2 0 0 1-.45 2.11
                     L5.91 8.09a16 16 0 0 0 6 6
                     l1.76-1.24a2 2 0 0 1 2.11-.45
                     c.8.24 1.64.42 2.5.54
                     A2 2 0 0 1 22 16.92z"/>
          </svg>
        </div>

        <div>
          <p class="text-base font-bold text-gray-900">119 바로 연결하기</p>
          <p class="text-sm text-gray-500">
            긴급 상황 시 즉시 전화 연결
          </p>
            <p class="text-xs text-gray-500 text-center">
          ※ 119 연결은 모바일 환경에서 전화 앱이 실행됩니다.
        </p>
        </div>
      </div>

      <span class="text-sm font-semibold text-rose-600">
        전화 →
      </span>
    </div>
  </button>


</div>


    <!-- 하단 링크 -->
    <div 
      v-if="user.role === false"
    class="mt-10 text-center">
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
    <div v-else class="mt-10">

    </div>

  </div>
</template>


<script setup>
import { computed, onMounted, ref  } from "vue";
import { useRouter } from "vue-router";
import { useLocationStore } from "@/stores/location"
import api from "@/components/api"
import AIChatBot from "../AI/AIChatBot.vue";

const router = useRouter();
const locationStore = useLocationStore();

const erListClick = () => {
  // ✅ 너 프로젝트 라우트 이름에 맞게 바꿔줘
  // 예: { name: "mainEr" } / { name: "mainerlist" } / { path: "/main/er" }
  router.push({ name: "erlist" });
};

const call119 = () => {
  // ✅ 모바일: 바로 전화 앱 열림
  window.location.href = "tel:119";
};

const isChatOpen = ref(false)
const openChatBot = () => {
  isChatOpen.value = true
}

const closeChatBot = () => {
  isChatOpen.value = false
}
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
