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
            v-for="value in filteredHospitalDistance"
            :key="value.hpid"
            class="border p-3 rounded-lg shadow-sm mb-3 bg-white"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-bold text-gray-900 truncate">
                  {{ value.name }}
                  <a
                    @click="$emit('click-hospital', value.name)"
                    :href="`https://map.naver.com/p/search/${encodeURIComponent(value.name)}?c=15.00,0,0,0,dh`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="mt-2 inline-block text-sm text-blue-600 underline hover:text-blue-800"
                  >
                    길찾기
                  </a>
                </p>

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

          <div v-if="filteredHospitalDistance.length === 0" class="text-gray-500">
            반경 {{ radiusKm }}km 이내에 조회된 병원이 없습니다.
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
            v-for="value in filteredHospitalScore"
            :key="value.hpid"
            class="border p-3 rounded-lg shadow-sm mb-3 bg-white"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-bold text-gray-900 truncate">{{ value.name }}</p>
                <p class="text-gray-700 text-sm">AI 추천 점수: {{ value.score }}</p>
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

            <div v-show="openId === value.hpid" class="mt-3 pt-3 border-t">
              <p class="text-gray-700 text-sm">전화번호 : {{ value.phone }}</p>
              <p class="text-gray-700 text-sm">주소 : {{ value.address }}</p>
            </div>
          </div>

          <div v-if="filteredHospitalScore.length === 0" class="text-gray-500">
            반경 {{ radiusKm }}km 이내에 조회된 병원이 없습니다.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useLocationStore } from "@/stores/location";
import SkeletonCard from "@/components/SkeletonCard.vue";
import CircularProgress from "../../../components/CircularProgress.vue";

const props = defineProps({
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

const locationStore = useLocationStore();

/** ✅ Pinia 반경(km) */
const radiusKm = computed(() => Number(locationStore.distance) || 10);

/** ✅ "3.2", "3.2km", "3,2 km" 같은 값 파싱 */
const parseKm = (x) => {
  if (x == null) return NaN;
  const s = String(x).trim().replace(",", ".");
  const m = s.match(/[\d.]+/g);
  if (!m) return NaN;
  return parseFloat(m.join(""));
};

/** ✅ 거리순 리스트: 반경 이내만 */
const filteredHospitalDistance = computed(() => {
  const r = radiusKm.value;
  return (props.hospitalDistance || []).filter((v) => {
    const d = parseKm(v.distance);
    if (Number.isNaN(d)) return false; // ✅ NaN이면 숨김 (필터가 확실히 보이게)
    return d <= r;
  });
});

/** ✅ 점수순도 distance 필드가 있다면 반경 이내만 */
const filteredHospitalScore = computed(() => {
  const r = radiusKm.value;
  return (props.hospitalScore || []).filter((v) => {
    if (v.distance == null) return true; // score에 distance 없으면 필터 불가 → 그대로 노출
    const d = parseKm(v.distance);
    if (Number.isNaN(d)) return false;
    return d <= r;
  });
});

/** ✅ 상세 펼침 상태 (한 번에 하나만) */
const openId = ref(null);
const toggle = (hpid) => {
  openId.value = openId.value === hpid ? null : hpid;
};

/** ✅ 탭 바뀌면 펼친 거 닫기 */
watch(
  () => props.modelValue,
  () => {
    openId.value = null;
  }
);

/** ✅ 반경이 바뀌면 열린 카드 닫기(선택) */
watch(radiusKm, () => {
  openId.value = null;
});
</script>

<style scoped></style>
