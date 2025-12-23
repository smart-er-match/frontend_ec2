<!-- src/pages/Main/HospitalList/Review/Review.vue -->
<template>
  <hr>
  <section class="bg-white p-5">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-extrabold text-gray-900">리뷰</h3>
        <p class="mt-1 text-xs text-gray-500">
          총 {{ safeReviews.length }}개 · 평균 {{ avgRating.toFixed(1) }}점
        </p>
      </div>
      <button
        type="button"
        class="rounded-xl border px-3 py-2 text-sm font-semibold
              hover:bg-gray-50 disabled:opacity-50
              inline-flex items-center gap-2"
        :disabled="loading"
        @click="fetchReviews"
        aria-label="새로고침"
      >
        <svg
          class="h-4 w-4"
          :class="loading ? 'animate-spin text-indigo-600' : 'text-gray-600'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <!-- refresh-cw 아이콘 -->
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1 2.13-9" />
        </svg>

        <span class="sr-only">새로고침</span>
      </button>

    </div>

    <!-- 작성 폼 -->
    <div class="mt-4 rounded-2xl border bg-gray-50 p-4">
      <div class="w-full">
        <!-- ⭐ 별점 -->
       <div class="w-full flex items-center gap-3">
          <!-- 라벨 -->
          <label class="text-xs font-semibold text-gray-600 shrink-0">
            평점
          </label>

          <!-- 별점 영역 -->
          <div class="flex items-center gap-1">
            <button
              v-for="n in 5"
              :key="n"
              type="button"
              class="transition focus:outline-none focus:ring-0"
              :class="(hoverRating || form.rating) >= n ? 'text-amber-500' : 'text-gray-300'"
              @mouseenter="hoverRating = n"
              @mouseleave="hoverRating = 0"
              @click="setRating(n)"
            >
              <svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path
                  d="M12 17.27l-5.18 3.04 1.4-5.97-4.64-4.02
                    6.1-.52L12 4.5l2.32 5.3 6.1.52-4.64 4.02
                    1.4 5.97L12 17.27z"
                />
              </svg>
            </button>

            <span class="ml-2 text-xs font-semibold text-gray-600">
              {{ form.rating }} / 5
            </span>
          </div>
        </div>


        <!-- 내용 -->
        <div class="w-full mt-3">
          <label class="text-xs font-semibold text-gray-600">내용</label>
          <textarea
            v-model="form.content"
            rows="2"
            class="mt-1 w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm
                   focus:ring-2 focus:ring-indigo-500"
            placeholder="예) 친절합니다."
          />
          <div class="mt-1 flex items-center justify-between">
            <p class="text-[11px]" :class="canSubmit ? 'text-gray-500' : 'text-rose-600'">
              최소 5자 이상
            </p>
            <p class="text-[11px] text-gray-400">
              {{ form.content.trim().length }}/200
            </p>
          </div>

          <button
            type="button"
            class="mt-3 w-full rounded-xl px-4 py-2 text-sm font-semibold text-white transition
                   bg-indigo-600 hover:bg-indigo-700
                   disabled:bg-gray-300 disabled:text-white/70 disabled:cursor-not-allowed"
            :disabled="posting || !canSubmit"
            @click="submitReview"
          >
            <span v-if="!posting">등록</span>
            <span v-else>등록 중...</span>
          </button>
        </div>
      </div>

      <p v-if="postError" class="mt-2 text-sm text-rose-600">{{ postError }}</p>
    </div>

    <!-- 로딩/에러 -->
    <div v-if="loading" class="mt-4 rounded-2xl border bg-white p-4 text-gray-600">
      불러오는 중...
    </div>
    <div v-else-if="error" class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
      {{ error }}
    </div>

    <!-- 목록 -->
    <ReviewList
      :reviews="safeReviews"
      :my-user-id="myUserId"
      @updated="fetchReviews"
      @deleted="onDeleted"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import api from '@/components/api'
import ReviewList from './ReviewList.vue'
import { useAuthStore } from '@/stores/auth' // ✅ 너 프로젝트 경로에 맞게

const auth = useAuthStore() // ✅ auth.user 사용 가능하게

const props = defineProps({
  hpid: { type: String, required: true },
})

const reviews = ref([])
const loading = ref(false)
const error = ref('')

const posting = ref(false)
const postError = ref('')

const form = reactive({
  content: '',
  rating: 5,
})

const hoverRating = ref(0)

const setRating = (n) => {
  form.rating = n
}

const canSubmit = computed(() => form.content.trim().length >= 5)

/** ✅ reviews 내부에 null/undefined 섞여도 안전 */
const safeReviews = computed(() => (Array.isArray(reviews.value) ? reviews.value : []).filter(Boolean))

/** ✅ auth.user가 아직 없을 수 있으니 방어 */
const myUserId = computed(() => String(auth?.user?.id ?? ''))

const avgRating = computed(() => {
  if (!safeReviews.value.length) return 0
  const sum = safeReviews.value.reduce((acc, r) => acc + Number(r?.rating || 0), 0)
  return sum / safeReviews.value.length
})

const fetchReviews = async () => {
  if (!props.hpid) return
  loading.value = true
  error.value = ''
  try {
    const res = await api.get(`/hospitals/reviews/${props.hpid}/`)
    const list = Array.isArray(res.data) ? res.data : (res.data?.results ?? [])
    reviews.value = Array.isArray(list) ? list.filter(Boolean) : []
  } catch (e) {
    console.error(e)
    error.value = '리뷰를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}


const submitReview = async () => {
  if (!canSubmit.value || posting.value) return
  posting.value = true
  postError.value = ''

  console.time('review_submit_total') // ⏱ 시작

  try {
    console.time('review_post')
    await api.post(`/hospitals/reviews/${props.hpid}/`, {
      content: form.content.trim(),
      rating: form.rating,
    })
    console.timeEnd('review_post') // POST 시간

    form.content = ''
    form.rating = 5

    console.time('review_fetch')
    await fetchReviews()
    console.timeEnd('review_fetch') // 목록 다시 가져오는 시간
  } catch (e) {
    console.error(e)
    postError.value = '리뷰 등록에 실패했습니다.'
  } finally {
    console.timeEnd('review_submit_total') // 전체 소요 시간
    posting.value = false
  }
}


const onDeleted = (deletedId) => {
  reviews.value = reviews.value.filter(r => String(r.id) !== String(deletedId)) // ✅ 즉시 반영
  // 선택: 평균/개수 같은 계산이 reviews 기반이면 자동 반영됨
  // 선택: 서버와 동기화 확실히 하려면 아래도 가능
  // fetchReviews()
}
onMounted(fetchReviews)
watch(() => props.hpid, fetchReviews)
</script>
