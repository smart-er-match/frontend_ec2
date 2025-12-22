<template>
  <div class="w-full min-h-screen bg-gray-200">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <!-- 헤더 -->
      <div class="mb-6 sm:mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
            지역별 Top 3 응급실
          </h1>
          <p class="mt-1 text-sm text-slate-500">
            평균 평점 기준 (동점: 리뷰 수 → 이름)
          </p>
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
            :selected="top3[0]?.hpid === selectedHpid"
            @select="onSelect"
          />
          <MobileRankCard
            :rank="2"
            :item="top3[1]"
            :selected="top3[1]?.hpid === selectedHpid"
            @select="onSelect"
          />
          <MobileRankCard
            :rank="3"
            :item="top3[2]"
            :selected="top3[2]?.hpid === selectedHpid"
            @select="onSelect"
          />
        </div>

        <!-- ✅ 데스크탑 -->
        <div class="hidden md:grid md:grid-cols-3 md:gap-6 md:items-end">
        <PodiumCard
          :rank="2"
          :item="top3[1]"
          class="md:order-1"
          :active="top3[1]?.hpid === selectedHpid"
          @select="onSelect(top3[1])"
        />

        <PodiumCard
          :rank="1"
          :item="top3[0]"
          highlight
          class="md:order-2"
          :active="top3[0]?.hpid === selectedHpid"
          @select="onSelect(top3[0])"
        />

        <PodiumCard
          :rank="3"
          :item="top3[2]"
          class="md:order-3"
          :active="top3[2]?.hpid === selectedHpid"
          @select="onSelect(top3[2])"
        />

        </div>
        <div>
          <HospitalHighlights 
          class="mt-5"
          :hpid="selectedHpid" :pickCount="3" />
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
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

// ✅ 평균 평점 기준 점수 / 동점처리용 리뷰 수
const getRating = (h) => Number(h?.average_rating ?? 0);
const getCount = (h) => Number(h?.review_count ?? 0);

const top3 = computed(() => {
  const arr = [...currentList.value]
    .sort((a, b) => {
      // 1) 평균 평점 내림차순
      const d1 = getRating(b) - getRating(a);
      if (d1 !== 0) return d1;

      // 2) 동점이면 리뷰 수 많은 순
      const d2 = getCount(b) - getCount(a);
      if (d2 !== 0) return d2;

      // 3) 그래도 동점이면 이름 오름차순
      return String(a?.name ?? "").localeCompare(String(b?.name ?? ""), "ko");
    })
    .slice(0, 3);

  while (arr.length < 3) arr.push(null);
  return arr;
});

onMounted(async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await api.get("/hospitals/list/");
    // 기존 너 응답 형태: res.data.data 에 지역별 묶음이 들어있던 걸로 사용
    const data = res.data?.data ?? res.data;
    console.log(data)
    Object.assign(er_list, data);
  } catch (e) {
    console.error(e);
    error.value = "병원 데이터를 불러오지 못했습니다.";
  } finally {
    loading.value = false;
  }
});

const selectedHpid = ref(null);
const onSelect = (item) => {
  if (!item) return;
  selectedHpid.value = item.hpid;
};

import { watch } from "vue";

watch(top3, (arr) => {
  if (!selectedHpid.value && arr?.[0]?.hpid) {
    selectedHpid.value = arr[0].hpid;
  }
}, { immediate: true });

</script>
