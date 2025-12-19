<template>
  <section class="relative w-full overflow-hidden bg-black">
    <!-- ✅ 배경: 모바일은 세로 스택 / md~는 반반 -->
    <div class="absolute inset-0">
      <div class="h-full w-full flex flex-col md:flex-row">
        <img
          :src="img1"
          alt="AI"
          class="h-1/2 w-full object-cover md:h-full md:w-1/2"
        />
        <img
          :src="img2"
          alt="응급실"
          class="h-1/2 w-full object-cover md:h-full md:w-1/2"
        />
      </div>
    </div>

    <!-- 오버레이 -->
    <div class="absolute inset-0 bg-black/55"></div>

    <!-- ✅ 중앙 그라데이션: 모바일은 가로(상하) / md~는 세로(좌우) -->
    <div class="absolute inset-x-0 top-1/2 h-28 -translate-y-1/2 md:inset-y-0 md:left-1/2 md:top-0 md:h-auto md:w-44 md:-translate-x-1/2 md:translate-y-0
                bg-gradient-to-b from-black/75 via-black/20 to-black/75
                md:bg-gradient-to-r md:from-black/70 md:via-black/20 md:to-black/70"></div>

    <!-- 전경 -->
    <div class="relative z-10">
      <!-- ✅ 모바일 높이 안정: dvh + safe area -->
      <div class="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-14 pb-10 sm:pt-20 sm:pb-14 md:py-16">
        <!-- 타이틀 -->
        <div class="text-center md:text-left">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Smart 응급실 추천 서비스
          </h1>
          <p class="mt-2 text-sm sm:text-base text-white/85">
            응급 상황에서 빠르고 정확하게 응급실을 찾아보세요
          </p>
        </div>

        <!-- 카드 영역 -->
        <div class="mt-8 md:mt-12 relative">
          <!-- ✅ md~: 카드 사이 중앙 + -->
          <div
            class="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   h-12 w-12 items-center justify-center rounded-full
                   bg-white/85 backdrop-blur shadow-lg ring-1 ring-black/10
                   text-2xl font-extrabold text-black"
            aria-hidden="true"
          >
            +
          </div>

          <div class="grid gap-4 sm:gap-6 md:gap-12 md:grid-cols-2">
            <!-- 카드 1 -->
            <div class="rounded-2xl bg-white/90 backdrop-blur p-5 sm:p-6 shadow-lg ring-1 ring-white/10">
              <h2 class="text-lg sm:text-xl font-bold text-black">
                AI 기반 응급실 추천
              </h2>

              <p class="mt-2 text-sm sm:text-base text-black/80 leading-relaxed">
                증상만 입력하면 위치 정보와 증상을 종합해
                <span class="font-semibold">최적의 응급실</span>을 추천합니다.
              </p>

              <ul class="mt-4 space-y-2 text-sm text-black/85">
                <li class="flex gap-2">
                  <span class="mt-0.5">•</span>
                  <span>증상 입력 → 추천 결과 즉시 제공</span>
                </li>
                <li class="flex gap-2">
                  <span class="mt-0.5">•</span>
                  <span>거리/접근성까지 고려한 추천</span>
                </li>
              </ul>
            </div>

            <!-- ✅ 모바일(~md): 카드 사이 + (세로 흐름) -->
            <div class="md:hidden -my-1 flex justify-center" aria-hidden="true">
              <div
                class="h-11 w-11 flex items-center justify-center rounded-full
                       bg-white/85 backdrop-blur shadow-lg ring-1 ring-black/10
                       text-2xl font-extrabold text-black"
              >
                +
              </div>
            </div>

            <!-- 카드 2 -->
            <div class="rounded-2xl bg-white/90 backdrop-blur p-5 sm:p-6 shadow-lg ring-1 ring-white/10">
              <h2 class="text-lg sm:text-xl font-bold text-black">
                실시간 응급실 가용상태 반영
              </h2>

              <p class="mt-2 text-sm sm:text-base text-black/80 leading-relaxed">
                병상/가용 상태 등 실시간 정보를 반영해
                <span class="font-semibold">지금 갈 수 있는</span> 응급실을 우선 안내합니다.
              </p>

              <ul class="mt-4 space-y-2 text-sm text-black/85">
                <li class="flex gap-2">
                  <span class="mt-0.5">•</span>
                  <span>가용 상태 기반 정렬/추천</span>
                </li>
                <li class="flex gap-2">
                  <span class="mt-0.5">•</span>
                  <span>헛걸음 최소화</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 요약 -->
        <div class="mt-8 sm:mt-10">
          <div class="text-center rounded-2xl bg-white/85 backdrop-blur p-5 sm:p-6 ring-1 ring-white/10">
            <p class="text-sm sm:text-base text-black/90">
              “위치 + 증상 + 실시간 가용상태”를 결합해, 응급 상황에서의 의사결정을 돕습니다.
            </p>
          </div>
        </div>

        <!-- ✅ 모바일에서 아래 여백 확보 (iOS 안전영역) -->
        <div class="h-[env(safe-area-inset-bottom)]"></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import img1 from "../../assets/AI.jpg";
import img2 from "../../assets/응급실.jpg";
</script>

<style scoped>
/* 필요하면 여기에 추가 */
</style>
