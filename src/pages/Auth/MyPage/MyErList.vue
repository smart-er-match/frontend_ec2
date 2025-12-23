<template>
  <!-- 제목 -->
  <h1 class="m-6 text-xl font-bold text-gray-900">내가 찜한 응급실</h1>

  <!-- 찜한 응급실이 없을 때 -->
  <div
    v-if="favoriteList.length === 0"
    class="flex flex-col items-center justify-center
           rounded-2xl border border-gray-200 bg-gray-50
           px-6 py-16 text-center"
  >
    <div
      class="flex h-16 w-16 items-center justify-center rounded-full
             bg-indigo-100 text-indigo-600"
    >
      <svg
        viewBox="0 0 24 24"
        class="h-8 w-8"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z" />
        <path d="M12 11v.01" />
      </svg>
    </div>

    <p class="mt-2 text-sm text-gray-500">
      아직 찜한 응급실이 없습니다.
      <br />
      자주 가는 응급실을 찜해두면 빠르게 확인할 수 있어요.
    </p>

    <button
      class="mt-8 inline-flex items-center gap-2
             rounded-xl bg-indigo-600 px-6 py-2.5
             text-sm font-semibold text-white
             hover:bg-indigo-500 active:scale-[0.98] transition"
      @click="goToER"
    >
      응급실 찾으러 가기
    </button>
  </div>

  <!-- 찜한 응급실이 있을 때 -->
  <div v-else>
    <div
      class="h-[900px] mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-max"
    >
      <div
        v-for="item in paginatedList"
        :key="item.hpid"
        role="button"
        tabindex="0"
        @click="goDetail(item)"
        @keydown.enter.prevent="goDetail(item)"
        class="relative mx-5 border rounded-lg p-4 shadow-md bg-white
               hover:shadow-lg transition h-40
               cursor-pointer focus:outline-none focus:ring-2
               focus:ring-indigo-500"
      >
        <!-- 즐겨찾기 버튼(해제) -->
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

        <!-- 평점 -->
        <div class="mt-1 flex items-center gap-1">
          <svg
            v-for="n in 5"
            :key="n"
            viewBox="0 0 24 24"
            class="h-4 w-4"
            :class="n <= Math.round(Number(item.average_rating || 0))
              ? 'text-amber-400'
              : 'text-gray-300'"
            fill="currentColor"
          >
            <path
              d="M12 17.27l5.18 3.05-1.64-5.81L20 10.24l-5.91-.5L12 4.5 9.91 9.74 4 10.24l4.46 4.27-1.64 5.81z"
            />
          </svg>

          <span class="ml-1 text-sm font-medium text-gray-700">
            {{ (Number(item.average_rating) || 0).toFixed(1) }}
          </span>
          <span class="text-xs text-gray-400">
            ({{ item.review_count ?? 0 }})
          </span>
        </div>

        <p class="mt-1 text-sm text-gray-700">
          📞 {{ item.emergency_phone }}
        </p>
        <p class="text-sm text-gray-700 line-clamp-1">
          📍 {{ item.address }}
        </p>
      </div>

      <p
        v-if="paginatedList.length === 0"
        class="col-span-full text-center text-gray-500 mt-8"
      >
        조회된 병원이 없습니다.
      </p>
    </div>

    <!-- 페이지네이션 -->
    <div class="mt-4 flex justify-center items-center gap-3">
      <button
        class="px-3 py-1 rounded border disabled:opacity-50"
        :disabled="currentPage === 1"
        @click="goPrevPage"
      >
        이전
      </button>

      <span class="text-sm text-gray-700">
        {{ currentPage }} / {{ totalPages }}
      </span>

      <button
        class="px-3 py-1 rounded border disabled:opacity-50"
        :disabled="currentPage === totalPages"
        @click="goNextPage"
      >
        다음
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
} from 'vue'
import { useRouter } from 'vue-router'
import api from '@/components/api'

const router = useRouter()

const props = defineProps({
  bookmarkedHospitals: { type: Array, default: () => [] },
})

const emit = defineEmits(['remove-bookmark'])

const favoriteList = computed(() =>
  Array.isArray(props.bookmarkedHospitals)
    ? props.bookmarkedHospitals
    : [],
)

// ⭐ 즐겨찾기 Set
const favoriteIds = ref(new Set())

watch(
  favoriteList,
  (list) => {
    favoriteIds.value = new Set(list.map((h) => String(h?.hpid)))
  },
  { immediate: true },
)

const isFavorite = (hpid) => favoriteIds.value.has(String(hpid))

// ✅ 즐겨찾기 해제 (부모가 실제 삭제 처리)
const toggleFavorite = async (item) => {
  const hpid = String(item.hpid)
  emit('remove-bookmark', hpid)
  favoriteIds.value.delete(hpid)
}

// 라우팅
const goToER = () => router.push({ name: 'erlist' })

const goDetail = (item) => {
  const plainHospital = JSON.parse(JSON.stringify(item))
  router.push({
    name: 'erdetail',
    params: { id: item.hpid },
    state: { hospital: plainHospital },
  })
}

/* ===== 페이지네이션 (모바일: 5개, 그 외: 10개) ===== */
const currentPage = ref(1)
const pageSize = ref(10)

const updatePageSize = () => {
  if (window.matchMedia?.('(max-width: 640px)').matches) {
    pageSize.value = 5 // 모바일에서 5개씩
  } else {
    pageSize.value = 10 // 데스크탑/태블릿은 10개씩
  }
}

onMounted(() => {
  updatePageSize()
  window.addEventListener('resize', updatePageSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updatePageSize)
})

watch(favoriteList, () => {
  currentPage.value = 1
})

const totalPages = computed(() => {
  const len = favoriteList.value.length
  const size = pageSize.value || 10
  return len === 0 ? 1 : Math.ceil(len / size)
})

const paginatedList = computed(() => {
  const size = pageSize.value || 10
  const start = (currentPage.value - 1) * size
  return favoriteList.value.slice(start, start + size)
})

const goPrevPage = () => {
  currentPage.value = Math.max(1, currentPage.value - 1)
}
const goNextPage = () => {
  currentPage.value = Math.min(totalPages.value, currentPage.value + 1)
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
