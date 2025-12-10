<template>
  <div>
    <h1 class="font-bold text-3xl mb-4">전국 응급실 리스트</h1>

    <!-- 지역 카테고리 -->
    <div
      class="flex flex-wrap gap-2 mb-6 top-0 bg-white z-50 py-2"
    >
      <button
        v-for="region in regionList"
        :key="region"
        @click="selectRegion(region)"
        class="px-3 py-1 rounded-full text-sm border transition"
        :class="selectedRegion === region
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'"
      >
        {{ region }}
      </button>
    </div>

    <!-- 현재 선택된 영역 제목 -->
    <h2 class="text-2xl font-bold mb-4 text-gray-900">
      {{ selectedRegion === '전체' ? '전국' : selectedRegion }}
    </h2>

    <!-- 카드 영역: 높이 고정 + 10개만 -->

    <div class="h-[900px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-max">

      <div
        v-for="item in paginatedList"
        :key="item.id"
        class="border rounded-lg p-4 shadow-md bg-white hover:shadow-lg transition h-40"
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-1">
          {{ item.name }}
        </h3>

        <p class="text-sm text-gray-700">
          📞 {{ item.emergency_phone }}
        </p>
        <p class="text-sm text-gray-700 truncate">
        📍 {{ item.address }}
        </p>
      </div>

      <!-- 선택된 리스트가 없을 때 -->
      <p
        v-if="paginatedList.length === 0"
        class="col-span-full text-center text-gray-500 mt-8"
      >
        조회된 병원이 없습니다.
      </p>
    </div>

    <!-- 페이지네이션 -->
    <div class="flex justify-center items-center gap-4 mt-4">
      <button
        @click="goPrevPage"
        :disabled="currentPage === 1"
        class="px-3 py-1 rounded border disabled:opacity-50"
      >
        이전
      </button>

      <span class="text-gray-700">
        {{ currentPage }} / {{ totalPages }}
      </span>

      <button
        @click="goNextPage"
        :disabled="currentPage === totalPages"
        class="px-3 py-1 rounded border disabled:opacity-50"
      >
        다음
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import api from '../../../components/api'

// { '서울특별시': [...], '경기도': [...], ... }
const er_list = reactive({})

const selectedRegion = ref('전체')      // 현재 선택된 지역
const currentPage = ref(1)
const pageSize = 10

// 버튼에 쓸 지역 목록
const regionList = computed(() => {
  return ['전체', ...Object.keys(er_list)]
})

// 현재 선택된 지역의 병원 리스트 (전국일 땐 flatten)
const currentList = computed(() => {
  if (selectedRegion.value === '전체') {
    // 전국: 모든 지역 배열 합치기
    return Object.values(er_list).flat()
  }
  // 특정 지역
  return er_list[selectedRegion.value] || []
})

// 페이지네이션 적용 리스트
const paginatedList = computed(() => {
  const list = currentList.value
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return list.slice(start, end)
})

// 총 페이지 수
const totalPages = computed(() => {
  const list = currentList.value
  if (list.length === 0) return 1
  return Math.ceil(list.length / pageSize)
})

// 지역 선택 시 페이지를 1페이지로 초기화
const selectRegion = (region) => {
  selectedRegion.value = region
  currentPage.value = 1
}

const goPrevPage = () => {
  currentPage.value = Math.max(1, currentPage.value - 1)
}

const goNextPage = () => {
  currentPage.value = Math.min(totalPages.value, currentPage.value + 1)
}

onMounted(async () => {
  try {
    const res = await api.get('hospitals/list/')
    // res.data.data 가 { '서울특별시': [...], '경기도': [...], ... } 라고 가정
    Object.assign(er_list, res.data.data)
    console.log('응급실 데이터', res.data.data)
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
</style>
