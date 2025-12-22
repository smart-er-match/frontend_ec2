<template>
  <div class="w-full min-h-screen bg-gray-200">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <!-- 헤더 -->
      <div class="mb-6 sm:mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
            지역별 Top 3 응급실
          </h1>
        </div>

        <!-- 지역 선택 -->
        <div class="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-0">
          <label class="text-sm font-semibold text-slate-700">지역</label>
          <select
            v-model="selectedRegion"
            class="h-10 w-full sm:w-56 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option v-for="r in regionList" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
      </div>

      <!-- 로딩/에러/빈 상태 -->
      <div
        v-if="loading"
        class="rounded-xl border border-slate-200 bg-white p-5 sm:p-8 text-slate-600 shadow-sm"
      >
        불러오는 중...
      </div>

      <div
        v-else-if="error"
        class="rounded-xl border border-rose-200 bg-rose-50 p-5 sm:p-8 text-rose-700 shadow-sm"
      >
        {{ error }}
      </div>

      <div
        v-else-if="top3.filter(Boolean).length === 0"
        class="rounded-xl border border-slate-200 bg-white p-5 sm:p-8 text-slate-600 shadow-sm"
      >
        해당 지역 데이터가 없습니다.
      </div>

      <template v-else>
        <!-- ✅ 모바일 전용 -->
        <div class="grid grid-cols-1 gap-3 md:hidden">
          <MobileRankCard
            :rank="1"
            :item="top3[0]"
            :selected="top3[0]?.hpid === selectedHospital?.hpid"
            @select="onSelect"
          />
          <MobileRankCard
            :rank="2"
            :item="top3[1]"
            :selected="top3[1]?.hpid === selectedHospital?.hpid"
            @select="onSelect"
          />
          <MobileRankCard
            :rank="3"
            :item="top3[2]"
            :selected="top3[2]?.hpid === selectedHospital?.hpid"
            @select="onSelect"
          />
        </div>

        <!-- ✅ 데스크탑 -->
        <div class="hidden md:grid md:grid-cols-3 md:gap-6 md:items-end">
          <PodiumCard
            :rank="2"
            :item="top3[1]"
            class="md:order-1"
            :active="top3[1]?.hpid === selectedHospital?.hpid"
            @select="onSelect(top3[1])"
          />

          <PodiumCard
            :rank="1"
            :item="top3[0]"
            highlight
            class="md:order-2"
            :active="top3[0]?.hpid === selectedHospital?.hpid"
            @select="onSelect(top3[0])"
          />

          <PodiumCard
            :rank="3"
            :item="top3[2]"
            class="md:order-3"
            :active="top3[2]?.hpid === selectedHospital?.hpid"
            @select="onSelect(top3[2])"
          />
        </div>

        <!-- ✅ 주요 리뷰 (선택 병원에만 렌더) -->
        <div class="mt-5">
          <HospitalHighlights
            v-if="selectedHospital?.hpid"
            :key="selectedHospital.hpid"
            :hpid="selectedHospital.hpid"
            :hospitalName="selectedHospitalName"
            :pickCount="3"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import api from "@/components/api";
import PodiumCard from "./PodiumCard.vue";
import MobileRankCard from "./MobileRankCard.vue";
import HospitalHighlights from "./HospitalHighlights.vue";

const er_list = reactive({});
const loading = ref(false);
const error = ref("");
const selectedRegion = ref("전체");

const regionList = computed(() => ["전체", ...Object.keys(er_list)]);

const currentList = computed(() => {
  if (selectedRegion.value === "전체") return Object.values(er_list).flat();
  return er_list[selectedRegion.value] || [];
});

const getRating = (h) => Number(h?.average_rating ?? 0);
const getCount = (h) => Number(h?.review_count ?? 0);

const top3 = computed(() => {
  const arr = [...currentList.value]
    .sort((a, b) => {
      const d1 = getRating(b) - getRating(a);
      if (d1 !== 0) return d1;

      const d2 = getCount(b) - getCount(a);
      if (d2 !== 0) return d2;

      return String(a?.name ?? "").localeCompare(String(b?.name ?? ""), "ko");
    })
    .slice(0, 3);

  while (arr.length < 3) arr.push(null);
  return arr;
});

// ✅ 선택은 “병원 객체”로 통일
const selectedHospital = ref(null);

const onSelect = (item) => {
  if (!item) return;
  selectedHospital.value = item;
};

// ✅ 병원 이름 필드가 환경마다 다를 수 있어서 fallback
const selectedHospitalName = computed(() => {
  const h = selectedHospital.value;
  return (
    h?.name ??
    "선택한 병원"
  );
});

const selectTop1 = () => {
  const first = top3.value?.[0];
  if (first?.hpid) selectedHospital.value = first;
};

onMounted(async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await api.get("/hospitals/list/");
    const data = res.data?.data ?? res.data;
    Object.assign(er_list, data);

    // ✅ 여기서만 최초 선택 (데이터가 100% 준비된 뒤)
    const first = top3.value?.[0];
    if (first?.hpid) {
      selectedHospital.value = first;
    }
  } catch (e) {
    console.error(e);
    error.value = "병원 데이터를 불러오지 못했습니다.";
  } finally {
    loading.value = false;
  }
});

watch(selectedRegion, () => {
  selectedHospital.value = null;

  const first = top3.value?.[0];
  if (first?.hpid) {
    selectedHospital.value = first;
  }
});
</script>
