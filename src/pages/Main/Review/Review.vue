<!-- src/pages/Main/HospitalList/Review/Review.vue -->
<template>
  <section class="rounded-3xl bg-white p-5 shadow-sm border">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-extrabold text-gray-900">리뷰</h3>
        <p class="mt-1 text-xs text-gray-500">
          총 {{ reviews.length }}개 · 평균 {{ avgRating.toFixed(1) }}점
        </p>
      </div>
      <button
        type="button"
        class="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
        :disabled="loading"
        @click="fetchReviews"
      >
        새로고침
      </button>
    </div>

    <!-- 작성 폼 -->
<!-- 작성 폼 -->
    <div class="mt-4 rounded-2xl border bg-gray-50 p-4">
      <div class="w-full">
        <!-- ⭐ 별점 -->
        <div class="w-full">
          <label class="text-xs font-semibold text-gray-600">평점</label>

          <div class="mt-1 flex items-center gap-1">
            <button
              v-for="n in 5"
              :key="n"
              type="button"
              class="
                p-1
                transition
                focus:outline-none
                focus:ring-0
              "
              :class="[
                (hoverRating || form.rating) >= n
                  ? 'text-amber-500'
                  : 'text-gray-300'
              ]"
              @mouseenter="hoverRating = n"
              @mouseleave="hoverRating = 0"
              @click="setRating(n)"
            >
              <!-- ⭐ SVG 별 (테두리 없음) -->
              <svg
                class="h-6 w-6"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
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
         <div class="w-full">
        <div>
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
        </div>

        <!-- 등록 버튼 -->
        <div>
          <button
            type="button"
            class="w-full rounded-xl px-4 py-2 text-sm font-semibold text-white transition
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
    <ReviewList v-else :reviews="reviews" />
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import api from '@/components/api'
import ReviewList from './ReviewList.vue'

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

const avgRating = computed(() => {
  if (!reviews.value.length) return 0
  const sum = reviews.value.reduce((acc, r) => acc + Number(r.rating || 0), 0)
  return sum / reviews.value.length
})

const fetchReviews = async () => {
  if (!props.hpid) return
  loading.value = true
  error.value = ''
  try {
    const res = await api.get(`/hospitals/reviews/${props.hpid}/`)
    // 백엔드가 {results: [...]} 형태면 아래 한 줄만 바꾸면 됨:
    reviews.value = Array.isArray(res.data) ? res.data : (res.data?.results ?? [])
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
  try {
    await api.post(`/hospitals/reviews/${props.hpid}/`, {
      content: form.content.trim(),
      rating: form.rating,
    })
    form.content = ''
    form.rating = 5
    await fetchReviews()
  } catch (e) {
    console.error(e)
    postError.value = '리뷰 등록에 실패했습니다.'
  } finally {
    posting.value = false
  }
}

const formatDate = (iso) => {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

onMounted(fetchReviews)
watch(() => props.hpid, fetchReviews)

const maskEmail = (email) => {
  if (!email || !email.includes('@')) return '익명';

  const [id, domain] = email.split('@');

  if (id.length <= 1) {
    return `${id[0]}****@${domain}`;
  }

  const visible = id.slice(0, 1);
  return `${visible}****@${domain}`;
};
</script>
