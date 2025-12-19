<!-- src/components/HospitalListPanel.vue -->
<template>
  <div class="min-w-0">
    <!-- 정렬 토글 + 마지막 업데이트 -->
    <div class="flex items-center justify-between">
      <div class="flex justify-center lg:justify-start">
        <div class="inline-flex bg-gray-100 rounded-full p-1">
          <button
            class="px-4 py-1.5 rounded-full text-sm font-semibold transition"
            :class="selected === 'distance'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-200'"
            @click="selected = 'distance'"
          >
            거리순
          </button>

          <button
            class="px-4 py-1.5 rounded-full text-sm font-semibold transition"
            :class="selected === 'score'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-200'"
            @click="selected = 'score'"
          >
            정확도순
          </button>
        </div>
      </div>

      <div class="text-sm text-gray-500 whitespace-nowrap">
        마지막 업데이트: {{ lastUpdatedText }}
      </div>
    </div>

    <!-- 리스트 영역 -->
    <div class="mt-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2 min-h-[420px]">
      <!-- 거리순 -->
      <div v-show="selected === 'distance'">
        <div v-show="isLoading">
          <SkeletonCard v-for="i in 5" :key="'d-skel-' + i" />
        </div>

        <div v-show="!isLoading">
          <div
            v-for="value in hospitalDistance"
            :key="value.hpid"
            class="border p-3 rounded-lg shadow-sm mb-3 bg-white"
          >
            <p class="font-bold text-gray-900">{{ value.name }}</p>
            <p class="text-gray-700 text-sm">전화번호 : {{ value.phone }}</p>
            <p class="text-gray-700 text-sm">주소 : {{ value.address }}</p>
            <p class="text-gray-700 text-sm">거리 : {{ value.distance }}km</p>

            <a
              @click="onClickHospital(value)"
              :href="naverSearchUrl(value.name)"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-blue-600 underline hover:text-blue-800"
            >
              병원 위치 확인
            </a>
          </div>

          <div v-if="hospitalDistance.length === 0" class="text-gray-500">
            조회된 병원이 없습니다.
          </div>
        </div>
      </div>

      <!-- 정확도순 -->
      <div v-show="selected === 'score'">
        <h2 class="font-bold text-lg text-red-500 mb-2">AI 분석 기반 추천 응급실입니다.</h2>

        <div v-show="isLoading">
          <SkeletonCard v-for="i in 5" :key="'s-skel-' + i" />
        </div>

        <div v-show="!isLoading">
          <div
            v-for="value in hospitalScore"
            :key="value.hpid"
            class="border p-3 rounded-lg shadow-sm mb-3 bg-white"
          >
            <p class="font-bold text-gray-900">{{ value.name }}</p>
            <p class="text-gray-700 text-sm">전화번호 : {{ value.phone }}</p>
            <p class="text-gray-700 text-sm">주소 : {{ value.address }}</p>
            <p class="text-gray-700 text-sm">AI 추천 점수: {{ value.score }}</p>

            <a
              @click="onClickHospital(value)"
              :href="naverSearchUrl(value.name)"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-blue-600 underline hover:text-blue-800"
            >
              병원 위치 확인
            </a>
          </div>

          <div v-if="hospitalScore.length === 0" class="text-gray-500">
            조회된 병원이 없습니다.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs } from "vue"
import SkeletonCard from "@/components/SkeletonCard.vue"

const props = defineProps({
  isLoading: { type: Boolean, default: false },
  lastUpdatedText: { type: String, default: "아직 업데이트 없음" },
  hospitalDistance: { type: Array, default: () => [] },
  hospitalScore: { type: Array, default: () => [] },
  modelValue: { type: String, default: "distance" }, // v-model용
})

const { isLoading, lastUpdatedText, hospitalDistance, hospitalScore } = toRefs(props)

const emit = defineEmits(["update:modelValue", "clickHospital"])

const selected = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
})

const naverSearchUrl = (name) =>
  `https://map.naver.com/p/search/${encodeURIComponent(name)}?c=15.00,0,0,0,dh`

const onClickHospital = (value) => {
  // 부모에서 userClickData 호출하도록 이벤트만 올림
  emit("clickHospital", value)
}
</script>
