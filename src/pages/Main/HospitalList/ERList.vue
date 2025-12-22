<template>
  <div>
    <h1 class="font-bold text-3xl mb-4">전국 응급실 리스트</h1>

    <!-- 지역 카테고리 -->
    <div class="flex flex-wrap gap-2 mb-6 top-0 bg-white z-50 py-2">
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

    <!-- 카드 영역 -->
    <div class="h-[900px] grid grid-cols-2 gap-3 auto-rows-max">
      <div
        v-for="item in paginatedList"
        :key="item.hpid"
        role="button"
        tabindex="0"
        @click="goDetail(item)"
        @keydown.enter.prevent="goDetail(item.hpid)"
        class="relative border rounded-lg p-4 shadow-md bg-white hover:shadow-lg transition h-40
               cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <!-- ✅ 즐겨찾기 버튼 (클릭해도 상세로 안감: stop) -->
        <button
          class="absolute top-3 right-3 inline-flex items-center justify-center
                 h-9 w-9 rounded-full border transition
                 hover:bg-gray-50 active:scale-[0.98]"
          :class="isFavorite(item.hpid)
            ? 'bg-yellow-50 border-yellow-300 text-yellow-600'
            : 'bg-white border-gray-200 text-gray-400'"
          @click.stop="toggleFavorite(item)"
          :aria-pressed="isFavorite(item.hpid)"
          :title="isFavorite(item.hpid) ? '즐겨찾기 해제' : '즐겨찾기'"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
            <path
              d="M12 17.27l5.18 3.05-1.64-5.81L20 10.24l-5.91-.5L12 4.5 9.91 9.74 4 10.24l4.46 4.27-1.64 5.81z"
              :opacity="isFavorite(item.hpid) ? 1 : 0.25"
            />
          </svg>
        </button>

        <h3 class="text-lg font-semibold text-gray-900 mb-1">
          {{ item.name }}
        </h3>

        <p class="text-sm text-gray-700">📞 {{ item.emergency_phone }}</p>
        <p class="text-sm text-gray-700">📍 {{ item.address }}</p>
      </div>

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

      <span class="text-gray-700">{{ currentPage }} / {{ totalPages }}</span>

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
import { useRouter } from 'vue-router'
import api from '../../../components/api'

const router = useRouter()

const er_list = reactive({})
const selectedRegion = ref('전체')
const currentPage = ref(1)
const pageSize = 10

const favoriteIds = ref(new Set())

const regionList = computed(() => ['전체', ...Object.keys(er_list)])

const currentList = computed(() => {
  if (selectedRegion.value === '전체') return Object.values(er_list).flat()
  return er_list[selectedRegion.value] || []
})

const paginatedList = computed(() => {
  const list = currentList.value
  const start = (currentPage.value - 1) * pageSize
  return list.slice(start, start + pageSize)
})

const totalPages = computed(() => {
  const len = currentList.value.length
  return len === 0 ? 1 : Math.ceil(len / pageSize)
})

const selectRegion = (region) => {
  selectedRegion.value = region
  currentPage.value = 1
}
const goPrevPage = () => (currentPage.value = Math.max(1, currentPage.value - 1))
const goNextPage = () => (currentPage.value = Math.min(totalPages.value, currentPage.value + 1))

const isFavorite = (hospitalId) => favoriteIds.value.has(hospitalId)

const toggleFavorite = async (item) => {
  const id = item.id
  const wasFav = isFavorite(id)

  const next = new Set(favoriteIds.value)
  wasFav ? next.delete(id) : next.add(id)
  favoriteIds.value = next

  try {
    if (wasFav) await api.delete(`favorites/hospitals/${id}/`)
    else await api.post(`favorites/hospitals/${id}/`)
  } catch (e) {
    const rollback = new Set(favoriteIds.value)
    wasFav ? rollback.add(id) : rollback.delete(id)
    favoriteIds.value = rollback
    console.error(e)
  }
}

// ✅ 상세 페이지 이동 (라우트 이름/경로 둘 중 하나로 맞추면 됨)
const goDetail = (item) => {

  router.push({ name: 'erdetail',  
    params: { id: item.hpid },  // ID는 params로 넘기고
    state: { hospital: item }   })


}

onMounted(async () => {
  try {
    const res = await api.get('hospitals/list/')
    Object.assign(er_list, res.data.data)
    console.log(res.data.data)
  } catch (e) {
    console.error(e)
  }
})
</script>
