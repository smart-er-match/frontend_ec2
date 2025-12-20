<template>
  <div class="min-w-0">
    <!-- 리스트 영역 -->
    <div class="mt-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2 min-h-[420px]">

      <!-- 로딩 -->
      <div v-if="isLoading">
        <SkeletonCard v-for="i in 5" :key="'d-skel-' + i" />
      </div>

      <!-- 데이터 -->
      <div v-else>
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

              <!-- ✅ 병상 Progress 유지 -->
              <CircularProgress
                label="응급실 일반 병상"
                :current="value.hvec"
                :total="value.hvs01"
                :size="68"
                :stroke="8"
              />

              <!-- ✅ 거리순에도 ai_matches 뱃지 표시 -->
              <div class="mt-3">
                <p class="text-sm font-semibold text-gray-900 mb-2">가용/보유 상태</p>

                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="item in aiMatchBadges(value.ai_matches)"
                    :key="item.key"
                    class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
                    :class="item.type === 'capacity'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'"
                    :title="item.key"
                  >
                    <span
                      class="inline-block h-2 w-2 rounded-full"
                      :class="item.type === 'capacity' ? 'bg-indigo-500' : 'bg-emerald-500'"
                    />
                    <span class="truncate max-w-[160px]">{{ item.label }}</span>
                    <span class="font-bold whitespace-nowrap">{{ item.display }}</span>
                  </span>
                </div>

                <div
                  v-if="aiMatchBadges(value.ai_matches).length === 0"
                  class="text-xs text-gray-500"
                >
                  표시할 가용/보유 정보가 없습니다.
                </div>
              </div>
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

        <div v-if="filteredHospitalDistance.length === 0" class="text-gray-500">
          반경 {{ radiusKm }}km 이내에 조회된 병원이 없습니다.
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
  isLoading: { type: Boolean, default: false },
  hospitalDistance: { type: Array, default: () => [] },
});

defineEmits(["click-hospital"]);

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

/** ✅ 반경 이내만 */
const filteredHospitalDistance = computed(() => {
  const r = radiusKm.value;
  return (props.hospitalDistance || []).filter((v) => {
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

/** ✅ 반경이 바뀌면 열린 카드 닫기 */
watch(radiusKm, () => {
  openId.value = null;
});

/* ---------------- ai_matches 뱃지 로직 (Score에서 가져옴) ---------------- */

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
};

const filteredMatches = (ai_matches) =>
  Object.entries(ai_matches || {})
    .filter(([_, v]) => v === "Y" || (typeof v === "number" && v >= 1))
    .reduce((acc, [k, v]) => {
      acc[k] = v;
      return acc;
    }, {});

const aiMatchBadges = (ai_matches) => {
  const fm = filteredMatches(ai_matches);

  return Object.entries(fm)
    .map(([key, value]) => {
      const label = HOSPITAL_FIELD_DESC[key] || key;

      if (typeof value === "number") {
        return {
          key,
          label,
          type: "capacity",
          value,
          display: `${value}개 수용 가능`,
        };
      }

      if (value === "Y") {
        return {
          key,
          label,
          type: "has",
          value,
          display: "보유중",
        };
      }

      return null;
    })
    .filter(Boolean);
};
</script>

<style scoped></style>
