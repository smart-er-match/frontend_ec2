<template>
  <div class="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">

      <!-- 왼쪽: 지도 + AI 추천 -->
      <div class="min-w-0">
        <FindLocation />

        <div class="mt-4 w-full lg:max-w-3xl lg:mx-auto rounded-xl border bg-white p-4 sm:p-5 shadow-sm">
          <!-- 헤더 -->
          <div class="mb-3 flex items-center gap-2">
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-full
                     bg-indigo-100 text-indigo-600 font-bold"
            >
              AI
            </span>
            <h2 class="text-base sm:text-lg font-semibold text-gray-900">AI 추천 내용</h2>
          </div>

          <!-- 본문 -->
          <div class="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
            <template v-if="openai_comment">
              {{ openai_comment }}
            </template>

            <div v-else class="flex items-center gap-2 text-gray-400">
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span class="text-xs sm:text-sm">AI가 환자 정보와 증상을 분석 중입니다...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 오른쪽: 정렬 + 업데이트 + 리스트 -->
      <div class="min-w-0">
        <!-- 상단 바 (모바일에서도 한 줄 유지) -->
        <div class="flex items-center justify-between gap-2 sm:gap-3">
          <!-- 왼쪽: 정렬 토글 -->
          <div class="shrink-0">
            <div class="inline-flex bg-gray-100 rounded-full p-1 whitespace-nowrap">
              <button
                class="px-3 sm:px-4 py-1.5 rounded-full text-sm font-semibold transition whitespace-nowrap"
                :class="sortMode === 'distance'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200'"
                @click="sortMode = 'distance'"
                type="button"
              >
                거리순
              </button>

              <button
                class="px-3 sm:px-4 py-1.5 rounded-full text-sm font-semibold transition whitespace-nowrap"
                :class="sortMode === 'score'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200'"
                @click="sortMode = 'score'"
                type="button"
              >
                정확도순
              </button>
            </div>
          </div>

          <!-- 오른쪽: 업데이트 / 새로고침 -->
      <div class="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3 sm:justify-end min-w-0">
        <!-- 마지막 업데이트 (모바일: 2줄 허용) -->
        <div class="text-xs sm:text-sm text-gray-500 text-right leading-tight">
          <span class="whitespace-nowrap">마지막 업데이트:</span>
          <span class="block sm:inline sm:ml-1 break-words">{{ lastUpdatedText }}</span>
        </div>

        <button
          type="button"
          class="shrink-0 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold
                bg-white hover:bg-gray-50 active:scale-[0.98] transition
                disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="refreshDisabled"
          @click="onManualRefresh"
          title="수동으로 데이터 다시 불러오기"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </svg>
          <span>새로고침</span>
        </button>
      </div>

        </div>

        <!-- 리스트 -->
        <DistanceMainErList
          v-if="sortMode === 'distance'"
          :isLoading="isLoading"
          :lastUpdatedText="lastUpdatedText"
          :hospitalDistance="hospitalDistance"
          @click-hospital="onClickHospital"
        />

        <ScoreMainErList
          v-else
          :isLoading="isLoading"
          :lastUpdatedText="lastUpdatedText"
          :hospitalScore="hospitalScore"
          @click-hospital="onClickHospital"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import api from "@/components/api";
import { useLocationStore } from "@/stores/location";
import FindLocation from "../Location/FindLocation.vue";
import DistanceMainErList from "./DistanceMainErList.vue";
import ScoreMainErList from "./ScoreMainErList.vue";
import { watch } from "vue";

let locDebounceTimer = null;

const locationStore = useLocationStore();

const sortMode = ref("distance");
const isLoading = ref(false);

const lat = computed(() => locationStore.lat);
const lng = computed(() => locationStore.lng);

const refreshCooldown = ref(false);

const refreshDisabled = computed(() => isLoading.value || refreshCooldown.value);


const hospital_data = ref(
  JSON.parse(localStorage.getItem("hospital_data")) || null
);

const openai_comment = computed(() => hospital_data.value?.openai_comment || "");
const hospitalDistance = computed(() => hospital_data.value?.sorted_by_distance || []);
const hospitalScore = computed(() => hospital_data.value?.sorted_by_score || []);

const user_data = JSON.parse(localStorage.getItem("user"));
const symptom = JSON.parse(localStorage.getItem("symptom"));
const patient_gender = localStorage.getItem("patient_gender");
const patient_age = localStorage.getItem("patient_age");

let tickTimer = null;
const lastUpdatedAt = ref(null);
const nowTick = ref(Date.now());

let reqSeq = 0;
let inFlightAbort = null;

watch(
  () => [locationStore.lat, locationStore.lng],
  ([newLat, newLng], [oldLat, oldLng]) => {
    if (!newLat || !newLng) return;
    if (newLat === oldLat && newLng === oldLng) return;

  
   fetchHospitals("location-changed");

  }
);
const fetchHospitals = async (reason = "", refresh=false) => {
  if (!lat.value || !lng.value) {
    console.warn("[fetchHospitals] 위치가 없어 요청을 생략합니다.", { reason });
    return;
  }

  const myReq = ++reqSeq;

  if (inFlightAbort) inFlightAbort.abort();
  inFlightAbort = new AbortController();

  isLoading.value = true;

  try {
    const res = await api.post(
      "hospitals/general/symptom/",
      {
        symptom,
        latitude: lat.value,
        longitude: lng.value,
        gender: patient_gender,
        age: patient_age,
        refresh: refresh,
      },
      { signal: inFlightAbort.signal }
    );

    if (myReq !== reqSeq) return;

    lastUpdatedAt.value = Date.now();
    hospital_data.value = res.data;
    // console.log(hospital_data)
    localStorage.setItem("hospital_data", JSON.stringify(res.data));
  } catch (error) {
    if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;
    if (error?.name === "AbortError") return;
    console.error("[fetchHospitals error]", error);
  } finally {
    if (myReq === reqSeq) isLoading.value = false;
  }
};

const onClickHospital = (hospitalname) => {
  userClickData(hospitalname);
};

const userClickData = async (hospitalname) => {
  try {
    await api.post(`hospitals/userclick/`, {
      username: user_data?.name,
      usersighkind: user_data?.sigh_kind,
      hospitalname,
    });
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  localStorage.removeItem("hospital_data");
  hospital_data.value = null;
  lastUpdatedAt.value = null;

  fetchHospitals("initial-mount", false);

  tickTimer = setInterval(() => {
    nowTick.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (tickTimer) clearInterval(tickTimer);
  if (inFlightAbort) inFlightAbort.abort();
});

const lastUpdatedText = computed(() => {
  if (!lastUpdatedAt.value) return "아직 업데이트 없음";

  const diffMs = nowTick.value - lastUpdatedAt.value;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 10) return "방금 전";
  if (diffSec < 60) return `${diffSec}초 전`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  return `${diffHour}시간 전`;
});

const onManualRefresh = async () => {
  if (refreshDisabled.value) return;

  refreshCooldown.value = true;
  fetchHospitals("manual-refresh", true);

  // ✅ 최소 3초는 못 누르게
  setTimeout(() => {
    refreshCooldown.value = false;
  }, 3000);
};

</script>
