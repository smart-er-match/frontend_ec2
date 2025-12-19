<template>
  <div class="min-w-0">
    <!-- 정렬 토글 + 마지막 업데이트 -->
    <div class="flex items-center justify-between">
      <div class="flex justify-center lg:justify-start">
        <div class="inline-flex bg-gray-100 rounded-full p-1">
          <button
            class="px-4 py-1.5 rounded-full text-sm font-semibold transition"
            :class="modelValue === 'distance'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-200'"
            @click="$emit('update:modelValue', 'distance')"
            type="button"
          >
            거리순
          </button>

          <button
            class="px-4 py-1.5 rounded-full text-sm font-semibold transition"
            :class="modelValue === 'score'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-200'"
            @click="$emit('update:modelValue', 'score')"
            type="button"
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
      <div v-show="modelValue === 'distance'">
        <div v-show="isLoading">
          <SkeletonCard v-for="i in 5" :key="'d-skel-' + i" />
        </div>

        <div v-show="!isLoading">
          <div
            v-for="value in hospitalDistance"
            :key="value.hpid"
            class="border p-3 rounded-lg shadow-sm mb-3 bg-white"
          >
            <!-- 기본 표시(항상 노출): 이름 + 거리 + 버튼 -->
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">

                <p class="font-bold text-gray-900 truncate">{{ value.name }} <a
                @click="$emit('click-hospital', value.name)"
                :href="`https://map.naver.com/p/search/${encodeURIComponent(value.name)}?c=15.00,0,0,0,dh`"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-2 inline-block text-sm text-blue-600 underline hover:text-blue-800"
              >
                길찾기
              </a> </p>


                <p class="text-gray-700 text-sm">거리 : {{ value.distance }}km</p>

                <CircularProgress
                label="응급실 일반 병상"
                :current="value.hvec"
                :total="value.hvs01"
                :size="68"
                :stroke="8"
              />
              </div>

              <button
                type="button"
                class="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                @click="toggle(value.hpid)"
              >
                {{ openId === value.hpid ? "닫기" : "자세히 보기" }}
              </button>
            </div>

            <!-- 상세(눌렀을 때만) -->
            <div v-show="openId === value.hpid" class="mt-3 pt-3 border-t">
              <p class="text-gray-700 text-sm">전화번호 : {{ value.phone }}</p>
              <p class="text-gray-700 text-sm">주소 : {{ value.address }}</p>

              <a
                @click="$emit('click-hospital', value.name)"
                :href="`https://map.naver.com/p/search/${encodeURIComponent(value.name)}?c=15.00,0,0,0,dh`"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-2 inline-block text-sm text-blue-600 underline hover:text-blue-800"
              >
                병원 위치 확인
              </a>
            </div>
          </div>

          <div v-if="hospitalDistance.length === 0" class="text-gray-500">
            조회된 병원이 없습니다.
          </div>
        </div>
      </div>

      <!-- 정확도순 -->
      <div v-show="modelValue === 'score'">
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
            <!-- 기본 표시(항상 노출): 이름 + 점수(+거리 있으면 같이) + 버튼 -->
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-bold text-gray-900 truncate">{{ value.name }}</p>
                <p class="text-gray-700 text-sm">AI 추천 점수: {{ value.score }}</p>
                <!-- score 리스트에 distance도 들어온다면 보여주고, 없으면 안 보여줌 -->
                <p v-if="value.distance != null" class="text-gray-700 text-sm">
                  거리 : {{ value.distance }}km
                </p>

                <CircularProgress
                label="응급실 일반 병상"
                :current="value.hvec"
                :total="value.hvs01"
                :size="68"
                :stroke="8"
              />
              </div>

              <button
                type="button"
                class="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                @click="toggle(value.hpid)"
              >
                {{ openId === value.hpid ? "닫기" : "자세히 보기" }}
              </button>
            </div>

            <!-- 상세(눌렀을 때만) -->
            <div v-show="openId === value.hpid" class="mt-3 pt-3 border-t">
              <p class="text-gray-700 text-sm">전화번호 : {{ value.phone }}</p>
              <p class="text-gray-700 text-sm">주소 : {{ value.address }}</p>
            </div>
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
import { ref, watch } from "vue";
import SkeletonCard from "@/components/SkeletonCard.vue";
import CircularProgress from "../../../components/CircularProgress.vue";

const props = defineProps({
  /** v-model: 'distance' | 'score' */
  modelValue: {
    type: String,
    default: "distance",
    validator: (v) => v === "distance" || v === "score",
  },
  isLoading: { type: Boolean, default: false },
  lastUpdatedText: { type: String, default: "아직 업데이트 없음" },

  hospitalDistance: { type: Array, default: () => [] },
  hospitalScore: { type: Array, default: () => [] },
});

defineEmits(["update:modelValue", "click-hospital"]);

/** ✅ 상세 펼침 상태 (한 번에 하나만) */
const openId = ref(null);

const toggle = (hpid) => {
  openId.value = openId.value === hpid ? null : hpid;
};

/** ✅ 탭 바뀌면 펼친 거 닫기 (원하면 제거 가능) */
watch(
  () => props.modelValue,
  () => {
    openId.value = null;
  }
);
</script>
