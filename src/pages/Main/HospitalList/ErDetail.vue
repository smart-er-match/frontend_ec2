<template>
  <div class="w-full max-w-5xl mx-auto px-4 py-6">
    <!-- 상단: 뒤로가기 + 제목 -->
    <div class="flex items-start justify-between gap-3">
      <div>
        <button
          class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          @click="router.back()"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          뒤로가기
        </button>

        <h1 class="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">
          {{ hospital?.name || '응급실 상세' }}
        </h1>
      </div>

      <!-- 즐겨찾기 -->
      <button
        class="shrink-0 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition
               hover:bg-gray-50 active:scale-[0.98]"
        :class="isFavorite
          ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
          : 'border-gray-200 bg-white text-gray-700'"
        @click="toggleFavorite"
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
          <path
            d="M12 17.27l5.18 3.05-1.64-5.81L20 10.24l-5.91-.5L12 4.5 9.91 9.74 4 10.24l4.46 4.27-1.64 5.81z"
            :opacity="isFavorite ? 1 : 0.25"
          />
        </svg>
        {{ isFavorite ? '찜 해제' : '찜' }}
      </button>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="mt-8 rounded-2xl border bg-white p-6 text-gray-600">
      불러오는 중...
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
      {{ error }}
    </div>

    <!-- 본문 -->
    <div v-else class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- 왼쪽(메인 정보) -->
      <div class="lg:col-span-2 space-y-4">
        <!-- 연락/운영 -->
        <div class="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 class="text-lg font-bold text-gray-900">기본 정보</h2>

          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div class="rounded-xl bg-gray-50 p-4 border">
              <p class="text-gray-500">응급실 전화</p>
              <p class="mt-1 font-semibold text-gray-900">
                {{ hospital?.emergency_phone || '-' }}
              </p>
              <a
                v-if="hospital?.emergency_phone"
                class="mt-2 inline-flex text-indigo-600 hover:underline"
                :href="`tel:${hospital.emergency_phone}`"
              >
                전화 걸기
              </a>
            </div>

            <div class="rounded-xl bg-gray-50 p-4 border">
              <p class="text-gray-500">지역</p>
              <p class="mt-1 font-semibold text-gray-900">
                {{ hospital?.region || '-' }}
              </p>
            </div>

            <div class="rounded-xl bg-gray-50 p-4 border sm:col-span-2">
              <p class="text-gray-500">주소</p>
              <p class="mt-1 font-semibold text-gray-900">
                {{ hospital?.address || '-' }}
              </p>

              <button
                v-if="hospital?.address"
                class="mt-2 inline-flex text-indigo-600 hover:underline"
                @click="copyAddress"
              >
                주소 복사
              </button>
            </div>
          </div>
        </div>

        <!-- 가용 상태(있다면) -->
        <div class="rounded-2xl border bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900">가용 상태</h2>
            <span class="text-xs text-gray-500">
              {{ hospital?.updated_at ? `업데이트: ${formatTime(hospital.updated_at)}` : '' }}
            </span>
          </div>

          <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div class="rounded-xl border p-4">
              <p class="text-gray-500">응급실 병상</p>
              <p class="mt-1 text-lg font-bold text-gray-900">{{ hospital?.er_beds ?? '-' }}</p>
            </div>
            <div class="rounded-xl border p-4">
              <p class="text-gray-500">중환자실</p>
              <p class="mt-1 text-lg font-bold text-gray-900">{{ hospital?.icu_beds ?? '-' }}</p>
            </div>
            <div class="rounded-xl border p-4">
              <p class="text-gray-500">수술실</p>
              <p class="mt-1 text-lg font-bold text-gray-900">{{ hospital?.or_available ?? '-' }}</p>
            </div>
            <div class="rounded-xl border p-4">
              <p class="text-gray-500">CT 가능</p>
              <p class="mt-1 text-lg font-bold text-gray-900">
                {{ hospital?.ct_available === true ? '가능' : hospital?.ct_available === false ? '불가' : '-' }}
              </p>
            </div>
          </div>

          <p class="mt-3 text-xs text-gray-500">
            * 위 항목은 데이터가 있을 때만 의미가 있으며, 실제 현장 상황과 다를 수 있습니다.
          </p>
        </div>
      </div>

      <!-- 오른쪽(액션/지도 자리) -->
      <div class="space-y-4">

        <!-- 지도 컴포넌트 자리 (나중에 NaverMap 넣기) -->
        <div class="rounded-2xl border bg-gray-50 p-5 text-sm text-gray-600">
          지도 영역 (추후 NaverMap/GoogleMap 컴포넌트 넣기)
        </div>
      </div>
    </div>
  </div>
  <div>
    <Review/>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/components/api'
import Review from '../Review/Review.vue'

const route = useRoute()
const router = useRouter()

const hospital = ref(null)
const loading = ref(true)
const error = ref('')

// 즐겨찾기 상태 (상세에서만 쓰는 간단 버전)
const isFavorite = ref(false)

// 라우트 params: /er/:id
const hospitalId = computed(() => route.params.id)

const MOCK_HOSPITALS = [
  {
    hospital_id: 1, // 프론트에서 쓰기 편하게 임시 pk 하나 두는 걸 추천
    hpid: "A2118188",
    name: "강철병원",
    first_address: "서울특별시",
    second_address: "송파구",
    third_address: "백제고분로 252, SH타워 2~8층 (삼전동)",
    address: "서울특별시 송파구 백제고분로 252, SH타워 2~8층 (삼전동)",
    main_phone: "02-6287-5500",
    emergency_phone: "02-6287-5500",
    latitude: 37.50234558341771,
    longitude: 127.09429683872202,
  },
]


const fetchDetail = async () => {
  console.log('[DETAIL] route.params.id =', route.params.id, 'typeof:', typeof route.params.id)

  loading.value = true
  error.value = '' 
   try {
    // 1️⃣ mock 데이터에서 병원 찾기
    const data = MOCK_HOSPITALS.find(
      h =>
        h.hpid === String(hospitalId.value)
    )

    if (!data) {
      error.value = '응급실 정보를 찾지 못했습니다.'
      hospital.value = null
      return
    }

    // 2️⃣ 화면에 뿌릴 데이터 세팅
    hospital.value = {
      ...data,
      // 템플릿에서 쓰는 region 보정
      region: `${data.first_address} ${data.second_address}`,
    }

    // 3️⃣ 즐겨찾기(localStorage)
    const favs = JSON.parse(localStorage.getItem('fav_hospitals') || '[]')
    isFavorite.value = favs.includes(data.hospital_id)

  } catch (e) {
    error.value = '응급실 정보를 불러오지 못했습니다.'
    console.error(e)
  } finally {
    loading.value = false
  }
  // try {
  //   const res = await api.get(`hospitals/${hospitalId.value}/`)
  //   hospital.value = res.data?.data ?? res.data

  //   // (선택) 즐겨찾기 여부 체크
  //   try {
  //     const favRes = await api.get('favorites/hospitals/')
  //     const raw = favRes.data?.data ?? favRes.data ?? []
  //     const ids = Array.isArray(raw)
  //       ? raw.map(v => (typeof v === 'number' ? v : v.hospital_id)).filter(Boolean)
  //       : []
  //     isFavorite.value = ids.includes(Number(hospitalId.value))
  //   } catch (_) {
  //     // 로그인 전/없으면 무시
  //     isFavorite.value = false
  //   }
  // } catch (e) {
  //   error.value = '응급실 정보를 불러오지 못했습니다.'
  //   console.error(e)
  // } finally {
  //   loading.value = false
  // }
}

const toggleFavorite = async () => {
  const id = Number(hospitalId.value)
  const wasFav = isFavorite.value
  isFavorite.value = !wasFav

  try {
    if (wasFav) await api.delete(`favorites/hospitals/${id}/`)
    else await api.post(`favorites/hospitals/${id}/`)
  } catch (e) {
    isFavorite.value = wasFav
    console.error(e)
  }
}

const copyAddress = async () => {
  if (!hospital.value?.address) return
  try {
    await navigator.clipboard.writeText(hospital.value.address)
  } catch (e) {
    console.error(e)
  }
}

const openNaverMap = () => {
  if (!hospital.value?.address) return
  // 주소 기반 검색 링크(간단)
  const q = encodeURIComponent(hospital.value.address)
  window.open(`https://map.naver.com/v5/search/${q}`, '_blank')
}

const formatTime = (iso) => {
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch {
    return iso
  }
}

onMounted(fetchDetail)
</script>
