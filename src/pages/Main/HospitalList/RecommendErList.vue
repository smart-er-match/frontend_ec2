<template>
  <div class="w-full max-w-7xl mx-auto px-4 py-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

      <!-- 왼쪽: 지도 -->
      <div>
        <FindLocation />
      </div>

      <!-- 오른쪽: 정렬 버튼 + 리스트 -->
      <div class="min-w-0">
        <!-- 정렬 토글 -->
        <div class="flex items-center justify-between">
  <!-- 정렬 토글 -->
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

          <!-- 마지막 업데이트 -->
          <div class="text-sm text-gray-500 whitespace-nowrap">
            마지막 업데이트: {{ lastUpdatedText }}
          </div>
        </div>



        <!-- ✅ 리스트 영역: min-h로 높이 고정(튐 방지) -->
        <div class="mt-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2 min-h-[420px]">

          <!-- 거리순 -->
          <div v-show="selected === 'distance'">
            <!-- ✅ 스켈레톤 -->
            <div v-show="isLoading">
              <SkeletonCard v-for="i in 5" :key="'d-skel-' + i" />
            </div>

            <!-- ✅ 실제 리스트 -->
            <div v-show="!isLoading">
              <div
                v-for="value in hospital_distance"
                :key="value.hpid"
                class="border p-3 rounded-lg shadow-sm mb-3 bg-white"
              >
                <p class="font-bold text-gray-900">{{ value.name }}</p>
                <p class="text-gray-700 text-sm">전화번호 : {{ value.phone }}</p>
                <p class="text-gray-700 text-sm">주소 : {{ value.address }}</p>
                <p class="text-gray-700 text-sm">거리 : {{ value.distance }}km</p>
                <a
                  @click="userClickData(value.name)"
                  :href="`https://map.naver.com/p/search/${encodeURIComponent(value.name)}?c=15.00,0,0,0,dh`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-blue-600 underline hover:text-blue-800"
                >
                  병원 위치 확인
                </a>
              </div>

              <div v-if="hospital_distance.length === 0" class="text-gray-500">
                조회된 병원이 없습니다.
              </div>
            </div>
          </div>

          <!-- 정확도순 -->
          <div v-show="selected === 'score'">
            <h2 class="font-bold text-lg text-red-500 mb-2">AI 분석 기반 추천 응급실입니다.</h2>

            <!-- ✅ 스켈레톤 -->
            <div v-show="isLoading">
              <SkeletonCard v-for="i in 5" :key="'s-skel-' + i" />
            </div>

            <!-- ✅ 실제 리스트 -->
            <div v-show="!isLoading">
              <div
                v-for="value in hospital_score"
                :key="value.hpid"
                class="border p-3 rounded-lg shadow-sm mb-3 bg-white"
              >
                <p class="font-bold text-gray-900">{{ value.name }}</p>
                <p class="text-gray-700 text-sm">전화번호 : {{ value.phone }}</p>
                <p class="text-gray-700 text-sm">주소 : {{ value.address }}</p>
                <p class="text-gray-700 text-sm">AI 추천 점수: {{ value.score }}</p>
                <a
                  @click="userClickData(value.name)"
                  :href="`https://map.naver.com/p/search/${encodeURIComponent(value.name)}?c=15.00,0,0,0,dh`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-blue-600 underline hover:text-blue-800"
                >
                  병원 위치 확인
                </a>
              </div>

              <div v-if="hospital_score.length === 0" class="text-gray-500">
                조회된 병원이 없습니다.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import api from "../../../components/api";
import GeneralFindMap from "../Location/GeneralFindMap.vue";
import { useLocationStore } from "@/stores/location";
import SkeletonCard from "../../../components/SkeletonCard.vue";
import FindLocation from "../Location/FindLocation.vue";

const locationStore = useLocationStore();
const selected = ref("distance");

const isLoading = ref(false);
const lat = computed(() => locationStore.lat);
const lng = computed(() => locationStore.lng);
const address = computed(() => locationStore.address);
const distance = computed(() => locationStore.distance);

const hospital_data = ref(
  JSON.parse(localStorage.getItem("hospital_data")) || null
);

const hospital_distance = computed(() => hospital_data.value?.sorted_by_distance || []);
const hospital_score = computed(() => hospital_data.value?.sorted_by_score || []);

const user_data = JSON.parse(localStorage.getItem("user"));
const symptom = JSON.parse(localStorage.getItem("symptom"));

let intervalId = null;
const lastUpdatedAt = ref(null); // Date.now() 숫자(ms)로 저장
const nowTick = ref(Date.now()); // “n분 전” 갱신용

let tickTimer = null;


onMounted(() => {
  // 5분 = 300,000ms
  intervalId = setInterval(() => {
    fetchHospitals();
  }, 5 * 60 * 1000);

  tickTimer = setInterval(() => {
  nowTick.value = Date.now();
}, 1000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }

  if (tickTimer) clearInterval(tickTimer);
});


const fetchHospitals = async () => {
  if (!lat.value || !lng.value) return;

  isLoading.value = true;
  console.log(symptom)
  try {
    const res = await api.post("hospitals/general/symptom/", {
      symptom,
      latitude: lat.value,
      longitude: lng.value,
    });

    lastUpdatedAt.value = Date.now();
    hospital_data.value = res.data;
    localStorage.setItem("hospital_data", JSON.stringify(res.data));
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => [lat.value, lng.value, distance.value, address.value],
  async () => {
    fetchHospitals();
  },
  { immediate: true }
);

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


</script>
