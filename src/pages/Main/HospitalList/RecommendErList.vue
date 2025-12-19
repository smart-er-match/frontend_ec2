<template>
  <div class="w-full max-w-7xl mx-auto px-4 py-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

      <!-- 왼쪽: 지도 -->
      <div>
        <FindLocation />
        <div
          class="mt-4 max-w-3xl mx-auto rounded-xl border bg-white p-5 shadow-sm"
        >
          <!-- 헤더 -->
          <div class="mb-3 flex items-center gap-2">
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-full
                    bg-indigo-100 text-indigo-600 font-bold"
            >
              AI
            </span>
            <h2 class="text-lg font-semibold text-gray-900">
              AI 추천 내용
            </h2>
          </div>

          <!-- 본문 -->
          <div
            class="text-sm leading-relaxed text-gray-700 whitespace-pre-line"
          >
            <template v-if="openai_comment">
              {{ openai_comment }}
            </template>

            <!-- 로딩 상태 -->
            <div v-else class="flex items-center gap-2 text-gray-400">
              <svg
                class="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span>AI가 환자 정보와 증상을 분석 중입니다...</span>
            </div>
          </div>
        </div>

      </div>

      <!-- 오른쪽: 정렬 버튼 + 리스트 -->
      <MainErList
        v-model="selected"
        :isLoading="isLoading"
        :lastUpdatedText="lastUpdatedText"
        :hospitalDistance="hospital_distance"
        :hospitalScore="hospital_score"
        @click-hospital="userClickData"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import api from "@/components/api";
import { useLocationStore } from "@/stores/location";
import FindLocation from "../Location/FindLocation.vue";
import MainErList from "./MainErList.vue";

const locationStore = useLocationStore();
const selected = ref("distance");

const isLoading = ref(false);
const lat = computed(() => locationStore.lat);
const lng = computed(() => locationStore.lng);
// address / distance는 “표시용”으로만 두고, fetch 트리거는 최소화 권장
const address = computed(() => locationStore.address);
const distance = computed(() => locationStore.distance);

const hospital_data = ref(
  JSON.parse(localStorage.getItem("hospital_data")) || null
);

const hospital_distance = computed(() => hospital_data.value?.sorted_by_distance || []);
const hospital_score = computed(() => hospital_data.value?.sorted_by_score || []);
const openai_comment = computed(() => hospital_data.value?.openai_comment || "");


const user_data = JSON.parse(localStorage.getItem("user"));
const symptom = JSON.parse(localStorage.getItem("symptom"));
const patient_gender = localStorage.getItem("patient_gender");
const patient_age = localStorage.getItem("patient_age");

let intervalId = null;
let tickTimer = null;

const lastUpdatedAt = ref(null);
const nowTick = ref(Date.now());


/** ✅ 중복요청/응답역전 방지용 */
let reqSeq = 0;              // 요청 번호
let inFlightAbort = null;    // 이전 요청 취소용 AbortController

/** ✅ (선택) 연속 변경 디바운스 */
let debounceTimer = null;
const debounce = (fn, ms = 300) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fn, ms);
};


const HOSPITAL_FIELD_DESC = {
    hvec: "응급실 일반 병상",
    hvoc: "수술실",
    hvcc: "신경과 중환자실",
    hvncc: "신생아 중환자실",
    hvccc: "흉부외과 중환자실",
    hvicc: "일반 중환자실",
    hvgc: "일반 입원실",
    hvctayn: "CT 가용 여부",
    hvmriayn: "MRI 가용 여부",
    hvangioayn: "혈관촬영기 가용 여부",
    hvventiayn: "인공호흡기 가용 여부",
    hvventisoayn: "조산아 인공호흡기 가용 여부",
    hvincuayn: "인큐베이터 가용 여부",
    hvcrrtayn: "CRRT(지속적 신대체 요법) 가용 여부",
    hvecmoayn: "ECMO(체외막산소공급) 가용 여부",
    hvoxyayn: "고압산소치료기 가용 여부",
    hvhypoayn: "중심체온조절유도기 가용 여부",
    hvamyn: "구급차 가용 여부",
    hv2: "내과 중환자실",
    hv3: "외과 중환자실",
    hv4: "정형외과 입원실",
    hv5: "신경과 입원실",
    hv6: "신경외과 중환자실",
    hv7: "약물 중환자실",
    hv8: "화상 중환자실",
    hv9: "외상 중환자실",
    hv10: "소아 인공호흡기",
    hv11: "인큐베이터(보육기)",
    hv13: "격리진료구역 음압격리병상",
    hv14: "격리진료구역 일반격리병상",
    hv15: "소아 음압격리병상",
    hv16: "소아 일반격리병상",
    hv17: "응급전용 중환자실 음압격리",
    hv18: "응급전용 중환자실 일반격리",
    hv19: "응급전용 입원실 음압격리",
    hv21: "응급전용 입원실 일반격리",
    hv22: "감염병 전담병상 중환자실",
    hv23: "감염병 전담병상 중환자실 내 음압격리",
    hv24: "감염 중증 병상",
    hv25: "감염 준-중증 병상",
    hv26: "감염 중등증 병상",
    hv27: "코호트 격리 병상",
    hv28: "소아 병상",
    hv29: "응급실 음압 격리 병상",
    hv30: "응급실 일반 격리 병상",
    hv31: "응급전용 중환자실",
    hv32: "소아 중환자실",
    hv33: "응급전용 소아중환자실",
    hv34: "심장내과 중환자실",
    hv35: "음압격리 중환자실",
    hv36: "응급전용 입원실",
    hv37: "응급전용 소아입원실",
    hv38: "외상전용 입원실",
    hv39: "외상전용 수술실",
    hv40: "정신과 폐쇄병동",
    hv41: "음압격리 입원실",
    hv42: "분만실",
    hv43: "화상전용 처치실",
    hv60: "외상 소생실",
    hv61: "외상 환자 진료구역",
    hvs01: "일반 기준",
    hvs02: "소아 기준",
    hvs03: "응급실 음압 격리 기준",
    hvs04: "응급실 일반 격리 기준",
    hvs05: "응급전용 중환자실 기준",
    hvs06: "내과 중환자실 기준",
    hvs07: "외과 중환자실 기준",
    hvs08: "신생아 중환자실 기준",
    hvs09: "소아 중환자실 기준",
    hvs10: "응급전용 소아중환자실 기준",
    hvs11: "신경과 중환자실 기준",
    hvs12: "신경외과 중환자실 기준",
    hvs13: "화상 중환자실 기준",
    hvs14: "외상 중환자실 기준",
    hvs15: "심장내과 중환자실 기준",
    hvs16: "흉부외과 중환자실 기준",
    hvs17: "일반 중환자실 기준",
    hvs18: "음압격리 중환자실 기준",
    hvs19: "응급전용 입원실 기준",
    hvs20: "응급전용 소아입원실 기준",
    hvs21: "외상전용 입원실 기준",
    hvs22: "수술실 기준",
    hvs23: "외상전용 수술실 기준",
    hvs24: "정신과 폐쇄병동 기준",
    hvs25: "음압격리 입원실 기준",
    hvs26: "분만실 기준",
    hvs27: "CT 기준",
    hvs28: "MRI 기준",
    hvs29: "혈관촬영기 기준",
    hvs30: "인공호흡기 일반 기준",
    hvs31: "인공호흡기 조산아 기준",
    hvs32: "인큐베이터 기준",
    hvs33: "CRRT 기준",
    hvs34: "ECMO 기준",
    hvs35: "중심체온조절유도기 기준",
    hvs36: "화상전용 처치실 기준",
    hvs37: "고압산소치료기 기준",
    hvs38: "일반 입원실 기준",
    hvs46: "격리진료구역 음압격리 기준",
    hvs47: "격리진료구역 일반격리 기준",
    hvs48: "소아 음압격리 기준",
    hvs49: "소아 일반격리 기준",
    hvs50: "응급전용 중환자실 음압격리 기준",
    hvs51: "응급전용 중환자실 일반격리 기준",
    hvs52: "응급전용 입원실 음압격리 기준",
    hvs53: "응급전용 입원실 일반격리 기준",
    hvs54: "감염병 전담병상 중환자실 기준",
    hvs55: "감염병 전담병상 중환자실 내 음압격리 기준",
    hvs56: "감염 중증 병상 기준",
    hvs57: "감염 준-중증 병상 기준",
    hvs58: "감염 중등증 병상 기준",
    hvs59: "코호트 격리 기준",
    hvs60: "외상 소생실 기준",
    hvs61: "외상 환자 진료구역 기준",
}


const fetchHospitals = async (reason = "") => {
  // 위치 없으면 안함
  if (!lat.value || !lng.value) return;

  // ✅ 요청 번호 증가
  const myReq = ++reqSeq;

  // ✅ 이전 요청 취소
  if (inFlightAbort) {
    inFlightAbort.abort();
  }
  inFlightAbort = new AbortController();

  isLoading.value = true;
  try {
    // axios라면 v1.4+에서 signal 지원함 (대부분 지원)
    const res = await api.post(
      "hospitals/general/symptom/",
      {
        symptom,
        latitude: lat.value,
        longitude: lng.value,
        gender: patient_gender,
        age: patient_age,
      },
      { signal: inFlightAbort.signal }
    );

    // ✅ “마지막 요청”만 반영
    if (myReq !== reqSeq) return;

    lastUpdatedAt.value = Date.now();
    hospital_data.value = res.data;
    localStorage.setItem("hospital_data", JSON.stringify(res.data));
    console.log(hospital_data)

  } catch (error) {
    // ✅ abort는 에러로 안 치고 조용히 무시
    if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;
    if (error?.name === "AbortError") return;

    console.error("[fetchHospitals error]", error);
  } finally {
    // ✅ 마지막 요청일 때만 로딩 끄기 (중간 요청이면 끄면 깜빡임 생김)
    if (myReq === reqSeq) {
      isLoading.value = false;
    }
  }
};


watch(
  () => [lat.value, lng.value],
  () => {
    debounce(() => fetchHospitals("latlng-change"), 250);
  },
  { immediate: true }
);

/** ✅ 5분마다 갱신: 중복요청 방지 로직이 있으니 그대로 OK */
onMounted(() => {
  localStorage.removeItem("hospital_data");
  hospital_data.value = null;      // ✅ 이것도 같이
  lastUpdatedAt.value = null; 

  // intervalId = setInterval(() => {
  //   fetchHospitals("interval");
  // }, 5 * 60 * 1000);

  tickTimer = setInterval(() => {
    nowTick.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
  if (tickTimer) clearInterval(tickTimer);
  if (inFlightAbort) inFlightAbort.abort();
  clearTimeout(debounceTimer);
});

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
