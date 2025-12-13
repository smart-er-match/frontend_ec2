<template>
  <section class="relative min-h-screen w-full overflow-hidden">
    <!-- 배경: 반반 이미지 -->
    <div class="absolute inset-0 flex">
      <img :src="img1" alt="AI" class="h-full w-1/2 object-cover" />
      <img :src="img2" alt="응급실" class="h-full w-1/2 object-cover" />
    </div>

    <!-- 전체 어두운 오버레이 -->
    <div class="absolute inset-0 bg-black/45"></div>

    <!-- 중앙 그라데이션 -->
    <div
      class="absolute inset-y-0 left-1/2 w-44 -translate-x-1/2
             bg-gradient-to-r from-black/70 via-black/20 to-black/70"
    ></div>

    <!-- 전경 콘텐츠 -->
    <div class="relative z-10">
      <div class="mt-30 mx-auto w-full max-w-6xl px-6 py-16">

        <!-- 기능 카드 영역(+) 표시를 위해 relative) -->
        <div class="relative">
          <!-- ✅ 데스크탑(md~): 카드 사이 중앙 + -->
          <div
            class="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   h-12 w-12 items-center justify-center rounded-full
                   bg-white/80 backdrop-blur shadow-lg ring-1 ring-black/10
                   text-2xl font-extrabold text-black"
            aria-hidden="true"
          >
            +
          </div>

          <div class="grid gap-20 md:grid-cols-2">
            <!-- 카드 1 -->
            <div class="rounded-2xl bg-white/80 backdrop-blur p-7 shadow-lg ring-1 ring-white/10">
              <div class="flex items-start gap-4">
                <div class="flex-1">
                  <h2 class="text-xl font-bold text-black">AI 기반 응급실 추천</h2>
                  <p class="mt-2 text-black leading-relaxed">
                    증상만 입력하면 위치 정보와 증상을 종합해
                    <span class="font-semibold">최적의 응급실</span>을 추천합니다.
                  </p>

                  <ul class="mt-5 space-y-2 text-sm text-black">
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
              </div>
            </div>

            <!-- ✅ 모바일(~md): 카드 사이 + (세로 흐름에 맞춤) -->
            <div
              class="md:hidden -mt-12 -mb-12 flex justify-center"
              aria-hidden="true"
            >
              <div
                class="h-12 w-12 flex items-center justify-center rounded-full
                       bg-white/80 backdrop-blur shadow-lg ring-1 ring-black/10
                       text-2xl font-extrabold text-black"
              >
                +
              </div>
            </div>

            <!-- 카드 2 -->
            <div class="rounded-2xl bg-white/85 backdrop-blur p-7 shadow-lg ring-1 ring-white/10">
              <div class="flex items-start gap-4">
                <div class="flex-1">
                  <h2 class="text-xl font-bold text-black">실시간 응급실 가용상태 반영</h2>
                  <p class="mt-2 text-gray-700 leading-relaxed">
                    병상/가용 상태 등 실시간 정보를 반영해
                    <span class="font-semibold">지금 갈 수 있는</span> 응급실을 우선 안내합니다.
                  </p>

                  <ul class="mt-5 space-y-2 text-sm text-black">
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
          </div>
        </div>

        <!-- ✅ 요약 위에 "=" 표시 -->
        <div class="mt-10 relative">
          <!-- <div class="flex justify-center -mb-6" aria-hidden="true">
            <div
              class="h-12 w-12 flex items-center justify-center rounded-full
                     bg-white/80 backdrop-blur shadow-lg ring-1 ring-black/10
                     text-2xl font-extrabold text-black"
            >
             <div class="rotate-90 origin-center">
            =&gt;
          </div>
            </div>
          </div> -->

          <!-- 하단 요약 -->
          <div class="mt-20 text-center rounded-2xl bg-white/75 backdrop-blur p-6 ring-1 ring-white/10">
            <p class="text-black">
              “위치 + 증상 + 실시간 가용상태”를 결합해, 응급 상황에서의 의사결정을 돕습니다.
            </p>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import img1 from '../../assets/AI.jpg'
import img2 from '../../assets/응급실.jpg'
</script>

<style scoped>
</style>
