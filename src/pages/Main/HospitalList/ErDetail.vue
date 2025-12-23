<template>
  <div class="w-full max-w-6xl mx-auto px-4 py-6">
    <!-- Top bar -->
    <div class="flex items-center justify-between gap-3">
      <button
        class="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold
               text-gray-700 hover:bg-gray-100 active:scale-[0.98]"
        @click="router.back()"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        뒤로가기
      </button>

          <!-- ✅ 즐겨찾기 버튼 (원래 있던 위치/모양 그대로 유지) -->
    <button
      class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition
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

    


    <!-- Loading / Error -->
    <div v-if="loading" class="mt-6 rounded-2xl border bg-white p-6 text-gray-600">
      불러오는 중...
    </div>
    <div v-else-if="error" class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
      {{ error }}
    </div>

    <!-- Content -->
    <div v-else class="mt-6 space-y-5">
      <!-- Hero card -->
      <section class="relative overflow-hidden rounded-3xl border bg-white shadow-sm">
        <!-- gradient -->
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-sky-50" />
        <div class="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl" />
        <div class="absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />

        <div class="relative p-5 sm:p-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white">
                  응급실
                </span>
                <span class="inline-flex items-center rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-gray-700 border">
                  {{ hospital?.first_address || '지역 정보 없음' }}
                </span>
              </div>

              <h1 class="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 truncate">
                {{ hospital?.name || '응급실 상세' }}
              </h1>

              <p class="mt-2 text-sm text-gray-600">
                {{ hospital?.second_address || '' }} {{ hospital?.third_address || '' }}
              </p>

              <div class="mt-4 flex flex-wrap gap-2">
                <a
                  v-if="hospital?.emergency_phone"
                  class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold
                         text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98]"
                  :href="`tel:${hospital.emergency_phone}`"
                >
                  <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.54 2.5a2 2 0 0 1-.45 2.11L9 10a16 16 0 0 0 5 5l.67-1.09a2 2 0 0 1 2.11-.45c.8.24 1.64.42 2.5.54A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  응급실 전화
                </a>

                <button
                  v-if="hospital?.address || (hospital?.second_address || hospital?.third_address)"
                  class="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-semibold
                         text-gray-800 hover:bg-gray-50 active:scale-[0.98]"
                  @click="copyAddress"
                >
                  <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 9h10v10H9z" />
                    <path d="M5 5h10v10H5z" />
                  </svg>
                  주소 복사
                </button>
              </div>
            </div>

            <!-- quick stats -->
            <div class="grid w-full sm:w-[320px] grid-cols-2 gap-3">
              <div class="rounded-2xl border bg-white/70 p-4">
                <p class="text-xs font-semibold text-gray-500">응급실 전화</p>
                <p class="mt-1 text-sm font-bold text-gray-900">
                  {{ hospital?.emergency_phone || '-' }}
                </p>
              </div>
              <div class="rounded-2xl border bg-white/70 p-4">
                <p class="text-xs font-semibold text-gray-500">대표 전화</p>
                <p class="mt-1 text-sm font-bold text-gray-900">
                  {{ hospital?.main_phone || '-' }}
                </p>
              </div>
            </div>
          </div>

          <!-- description -->
          <div class="mt-5 rounded-2xl border bg-white/70 p-4">
            <p class="text-sm font-semibold text-gray-800">병원 소개</p>
            <p class="mt-2 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
              {{ hospital?.description || '소개 정보가 없습니다.' }}
            </p>
          </div>
        </div>
      </section>

      <!-- Main grid -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">

        <!-- 🔵 LEFT : 지도 (3) -->
        <aside class="lg:col-span-3 space-y-5">
          <section class="rounded-3xl bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-extrabold text-gray-900">위치</h3>
            </div>

            <div class="mt-4 rounded-2xl overflow-hidden border bg-gray-50">
              <div ref="mapDiv" class="w-full h-[420px] lg:h-[520px]"></div>
            </div>
          </section>
        </aside>

        <!-- 🟣 RIGHT : 가용 상태 (2) -->
        <section class="lg:col-span-2 space-y-5">
          <section class="rounded-3xl bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-extrabold text-gray-900">가용 상태</h3>
              <span class="text-xs text-gray-400">
                {{ hospital?.realtime_status?.last_updated }}
              </span>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-4">
              <!-- 응급실 병상 -->
              <div class="rounded-2xl border bg-gray-50 p-4 flex justify-center">
                <CircularProgress
                  label="응급실 병상"
                  :current="hospital?.realtime_status?.hvec ?? 0"
                  :total="hospital?.realtime_status?.hvs01 ?? 0"
                  :size="80"
                />
              </div>

              <!-- CT -->
              <div class="rounded-2xl border bg-gray-50 p-4 flex justify-center">
                <CircularProgressTF
                  label="CT"
                  :current="hospital?.realtime_status?.hvctayn === 'Y' ? 1 : 0"
                  :total="1"
                  :size="80"
                />
              </div>

              <!-- MRI -->
              <div class="rounded-2xl border bg-gray-50 p-4 flex justify-center">
                <CircularProgressTF
                  label="MRI"
                  :current="hospital?.realtime_status?.hvmriayn === 'Y' ? 1 : 0"
                  :total="1"
                  :size="80"
                />
              </div>
            </div>
          </section>
        </section>
      </div>

      <div>
        <Review :hpid="hospital?.hpid" />
      </div>
    </div>

  </div>

  <div>
    <Review :hpid="hospital?.hpid" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Review from '../Review/Review.vue'
import CircularProgress from '../../../components/CircularProgress.vue'
import api from '../../../components/api'
import CircularProgressTF from '../../../components/CircularProgressTF.vue'
import { useAuthStore } from '@/stores/auth' // ✅ 추가

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore() // ✅ 추가

const hospital = ref(null)
const loading = ref(true)
const error = ref('')
let map = null
const mapDiv = ref(null)
let hospitalMarker = null

// ✅ 즐겨찾기 상태
const isFavorite = ref(false)

// 라우트 params: /er/:id
const hospitalId = computed(() => route.params.id)

const toggleFavorite = async () => {
  // ✅ (선택) 로그인 안 했으면 막기
  if (!authStore.isAuthenticated) {
    alert('로그인 후 이용 가능합니다.')
    return
  }

  const hpid = String(hospitalId.value) // hpid는 str
  const prev = isFavorite.value

  // ✅ 낙관적 업데이트(즉시 반영)
  isFavorite.value = !prev

  try {
    const { data } = await api.post(`/hospitals/bookmark/${hpid}/`)

    if (typeof data?.is_bookmarked === 'boolean') {
      isFavorite.value = data.is_bookmarked
    }
  } catch (e) {
    // ✅ 실패하면 롤백
    isFavorite.value = prev
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

onMounted(async () => {
  const fromState = window.history.state?.hospital || route.state?.hospital

  if (fromState) {
    hospital.value = fromState
  } else {
    error.value = '병원 정보를 불러오지 못했습니다.'
    loading.value = false
    return
  }

  loading.value = false
  await nextTick()

  // ✅ ✅ 추가: "내가 찜한 병원"이면 상세 버튼을 처음부터 활성화
  if (authStore.isAuthenticated) {
    await authStore.updateUserInfo()
    const bookmarked = authStore.user?.bookmarked_hospitals || []
    const hpid = String(hospital.value?.hpid || hospitalId.value)
    isFavorite.value = bookmarked.some((h) => String(h?.hpid) === hpid)
  }

  if (!mapDiv.value) return
  if (!window.naver?.maps) {
    console.error('네이버 지도 SDK가 아직 로드되지 않았습니다.')
    return
  }

  /** 📍 병원 위치 */
  const hospitalPos = new window.naver.maps.LatLng(
    hospital.value.latitude,
    hospital.value.longitude
  )

  map = new window.naver.maps.Map(mapDiv.value, {
    center: hospitalPos,
    zoom: 14,
  })

  // 🔴 병원 마커 (빨간색)
  hospitalMarker = new window.naver.maps.Marker({
    position: hospitalPos,
    map,
    title: hospital.value.name,
    icon: {
      content: `
        <div style="
          width: 18px;
          height: 18px;
          background: #ef4444;
          border: 3px solid white;
          border-radius: 9999px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>
      `,
      anchor: new window.naver.maps.Point(9, 9),
    },
  })
})
</script>
