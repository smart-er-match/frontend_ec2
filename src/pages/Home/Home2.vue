<template>
  <div class="w-full h-full bg-gray-200">
    <div class="max-w-6xl mx-auto px-6 py-10">
      <!-- 헤더 -->
      <div class="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
            지역별 Top 3 응급실
          </h1>
        </div>

        <!-- 지역 선택 -->
        <div class="flex items-center gap-3 mt-4 sm:mt-0">
          <label class="text-sm font-semibold text-slate-700">지역</label>
          <select
            v-model="selectedRegion"
            class="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option v-for="r in regionList" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
      </div>

      <!-- 로딩/빈 상태 -->
      <div v-if="loading" class="rounded-xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
        불러오는 중...
      </div>

      <div v-else-if="top3.filter(Boolean).length === 0" class="rounded-xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
        해당 지역 데이터가 없습니다.
      </div>

     <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
    <PodiumCard
      :rank="2"
      :item="top3[1]"
      class="md:order-1"
      :selected="top3[1]?.pk === selectedPk"
      @select="onSelect"
    />

    <PodiumCard
      :rank="1"
      :item="top3[0]"
      highlight
      class="md:order-2"
      :selected="top3[0]?.pk === selectedPk"
      @select="onSelect"
    />

    <PodiumCard
      :rank="3"
      :item="top3[2]"
      class="md:order-3"
      :selected="top3[2]?.pk === selectedPk"
      @select="onSelect"
    />
  </div>

  <div class="mt-8 text-lg text-slate-500">
    주요 리뷰들 보여줄 예정
  </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import PodiumCard from './PodiumCard.vue' // 경로 맞게 조정

const er_list = reactive({})
const loading = ref(false)
const selectedRegion = ref('전체')

const regionList = computed(() => ['전체', ...Object.keys(er_list)])

const currentList = computed(() => {
  if (selectedRegion.value === '전체') return Object.values(er_list).flat()
  return er_list[selectedRegion.value] || []
})

// pk가 "A2200008" 같은 문자열 → 숫자만 뽑아서 점수로 사용
const getScore = (h) => {
  if (!h?.pk) return 0
  const onlyNum = String(h.pk).replace(/\D/g, '') // A2200008 -> 2200008
  return Number(onlyNum) || 0
}

const top3 = computed(() => {
  const arr = [...currentList.value]
    .sort((a, b) => getScore(b) - getScore(a))
    .slice(0, 3)

  while (arr.length < 3) arr.push(null)
  return arr
})

onMounted(async () => {
  loading.value = true
  try {
    const res = await fetch('/LocationHospital.json')
    const data = await res.json()
    Object.assign(er_list, data)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
const selectedPk = ref(null)

const onSelect = (item) => {
  if (!item) return
  selectedPk.value = item.pk
}
</script>
