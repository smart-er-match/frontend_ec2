<!-- src/pages/Main/HospitalList/ERList.vue -->
<template>
  <!-- ✅ 최초 진입에만 전체 스피너 (캐시가 있으면 안 가림) -->
  <LoadingSpinner v-if="loading && currentList.length === 0" />

  <div>
    <!-- 제목 -->
    <h1 class="font-bold text-2xl sm:text-3xl mb-4">
      전국 응급실 리스트
    </h1>

    <!-- ✅ 캐시/데이터 있는 상태에서 갱신 중이면 작은 안내만 -->
    <div
      v-if="loading && currentList.length > 0"
      class="mb-3 text-xs text-gray-500"
    >
      갱신 중...
    </div>

    <!-- 지역 카테고리 -->
    <div class="flex flex-wrap gap-2 mb-4 sm:mb-6 top-0 bg-white z-50 py-2">
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
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-max">
      <div
        v-for="item in paginatedList"
        :key="item.hpid"
        role="button"
        tabindex="0"
        @click="goDetail(item)"
        @keydown.enter.prevent="goDetail(item)"
        class="relative flex flex-col border rounded-xl p-4 shadow-md bg-white
               hover:shadow-lg transition cursor-pointer
               focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <!-- ✅ 즐겨찾기 버튼 -->
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

        <!-- 병원명 -->
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
          {{ item.name }}
        </h3>

        <!-- 평점 -->
        <p class="mt-1 text-sm text-gray-700">
          ⭐ {{ (Number(item.average_rating) || 0).toFixed(1) }}
          <span class="text-xs text-gray-500">
            ({{ item.review_count ?? 0 }})
          </span>
        </p>

        <!-- 전화번호 -->
        <p class="mt-1 text-sm text-gray-700">
          📞 {{ item.emergency_phone || '-' }}
        </p>

        <!-- 주소 -->
        <p class="mt-1 text-sm text-gray-700 line-clamp-2">
          📍 {{ item.address }}
        </p>
      </div>

      <!-- 데이터 없을 때 -->
      <p
        v-if="paginatedList.length === 0"
        class="col-span-full text-center text-gray-500 mt-8"
      >
        조회된 병원이 없습니다.
      </p>
    </div>

    <!-- 페이지네이션 -->
    <div class="flex justify-center items-center gap-4 mt-6">
      <button
        @click="goPrevPage"
        :disabled="currentPage === 1"
        class="px-3 py-1 rounded border text-sm
               disabled:opacity-50 disabled:cursor-not-allowed"
      >
        이전
      </button>

      <span class="text-gray-700 text-sm">
        {{ currentPage }} / {{ totalPages }}
      </span>

      <button
        @click="goNextPage"
        :disabled="currentPage === totalPages"
        class="px-3 py-1 rounded border text-sm
               disabled:opacity-50 disabled:cursor-not-allowed"
      >
        다음
      </button>
    </div>

    <p v-if="error" class="mt-3 text-sm text-rose-600">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, reactive, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../../components/api'
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// ===== 상태 =====
const er_list = reactive({})
const selectedRegion = ref('전체')
const currentPage = ref(1)

// ✅ 페이지 사이즈를 반응형으로: 모바일 5개, 데스크탑 10개
const pageSize = ref(10)
const isMobile = ref(false)

const detectLayout = () => {
  if (typeof window === 'undefined') return
  const mobile = window.innerWidth < 768
  isMobile.value = mobile
  pageSize.value = mobile ? 5 : 10

  // 현재 페이지가 최대 페이지 넘어가면 보정
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
}

const favoriteIds = ref(new Set())
const loading = ref(false)
const error = ref('')

const CACHE_KEY = 'er_list_cache_v1'

// ===== 계산 =====
const regionList = computed(() => ['전체', ...Object.keys(er_list)])

const currentList = computed(() => {
  if (selectedRegion.value === '전체') return Object.values(er_list).flat()
  return er_list[selectedRegion.value] || []
})

const paginatedList = computed(() => {
  const list = currentList.value
  const size = pageSize.value
  const start = (currentPage.value - 1) * size
  return list.slice(start, start + size)
})

const totalPages = computed(() => {
  const len = currentList.value.length
  const size = pageSize.value || 1
  return len === 0 ? 1 : Math.ceil(len / size)
})

// 페이지 수 줄어들면 현재 페이지 보정
watch(totalPages, (tp) => {
  if (currentPage.value > tp) currentPage.value = tp
})

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

const isFavorite = (hpid) => favoriteIds.value.has(String(hpid))

// ===== 유저 즐겨찾기 로드 & 동기화 =====
const syncFavoriteFromUser = () => {
  const list = authStore.user?.bookmarked_hospitals || []
  favoriteIds.value = new Set(list.map((h) => String(h?.hpid)))
}

const loadUserFavorites = async () => {
  if (!authStore.isAuthenticated) {
    favoriteIds.value = new Set()
    return
  }
  await authStore.updateUserInfo()
  syncFavoriteFromUser()
}

// ===== 즐겨찾기 토글 =====
const toggleFavorite = async (item) => {
  if (!authStore.isAuthenticated) {
    alert('로그인 후 이용 가능합니다.')
    return
  }

  const hpid = String(item.hpid)
  const wasFav = isFavorite(hpid)

  // 낙관적 업데이트
  const next = new Set(favoriteIds.value)
  wasFav ? next.delete(hpid) : next.add(hpid)
  favoriteIds.value = next

  try {
    const { data } = await api.post(`/hospitals/bookmark/${hpid}/`)

    // 서버 결과에 맞춰 재동기화
    if (typeof data?.is_bookmarked === 'boolean') {
      const sync = new Set(favoriteIds.value)
      data.is_bookmarked ? sync.add(hpid) : sync.delete(hpid)
      favoriteIds.value = sync

      const prevList = authStore.user?.bookmarked_hospitals || []
      if (data.is_bookmarked) {
        if (!prevList.some((h) => String(h?.hpid) === hpid)) {
          authStore.user = {
            ...authStore.user,
            bookmarked_hospitals: [...prevList, item],
          }
          localStorage.setItem('user', JSON.stringify(authStore.user))
        }
      } else {
        const filtered = prevList.filter((h) => String(h?.hpid) !== hpid)
        authStore.user = {
          ...authStore.user,
          bookmarked_hospitals: filtered,
        }
        localStorage.setItem('user', JSON.stringify(authStore.user))
      }
    }
  } catch (e) {
    const rollback = new Set(favoriteIds.value)
    wasFav ? rollback.add(hpid) : rollback.delete(hpid)
    favoriteIds.value = rollback
    console.error(e)
    alert('즐겨찾기 처리 중 오류가 발생했습니다.')
  }
}

const goDetail = (item) => {
  const plainHospital = JSON.parse(JSON.stringify(item))
  router.push({
    name: 'erdetail',
    params: { id: item.hpid },
    state: { hospital: plainHospital },
  })
}

// ===== 데이터 로드 (캐시 + 백그라운드 갱신) =====
const loadHospitals = async () => {
  const cached = localStorage.getItem(CACHE_KEY)
  if (cached) {
    try {
      Object.assign(er_list, JSON.parse(cached))
    } catch {
      // 캐시 파싱 실패해도 무시
    }
  }

  loading.value = Object.keys(er_list).length === 0
  error.value = ''

  try {
    const res = await api.get('hospitals/list/')
    Object.assign(er_list, res.data.data)
    localStorage.setItem(CACHE_KEY, JSON.stringify(res.data.data))
  } catch (e) {
    console.error(e)
    error.value = '병원 목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  detectLayout()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', detectLayout)
  }

  await Promise.all([loadHospitals(), loadUserFavorites()])
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', detectLayout)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
