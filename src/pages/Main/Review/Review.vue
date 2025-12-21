<template>
  <section class="mt-8">
    <div class="rounded-3xl border bg-white shadow-sm overflow-hidden">
      <!-- 헤더 -->
      <div class="p-6 sm:p-7">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-xl sm:text-2xl font-extrabold text-gray-900">병원 리뷰</h2>
            <p class="mt-1 text-sm text-gray-500">
              실제 방문 후기를 참고하세요. (현재는 목업 + 로컬 저장)
            </p>
          </div>

          <!-- 요약 -->
          <div class="shrink-0 text-right">
            <div class="flex items-center justify-end gap-2">
              <StarRow :value="avgRating" />
              <span class="text-sm font-extrabold text-gray-900">{{ avgRating.toFixed(1) }}</span>
            </div>
            <p class="mt-1 text-xs text-gray-500">총 {{ filteredReviews.length }}개</p>
          </div>
        </div>

        <!-- 컨트롤 -->
        <div class="mt-5 flex flex-col sm:flex-row gap-3">
          <!-- 검색 -->
          <div class="flex-1">
            <div class="relative">
              <input
                v-model="q"
                type="text"
                placeholder="리뷰 검색 (예: 친절, 대기, 주차...)"
                class="w-full rounded-2xl border bg-gray-50 px-4 py-3 pr-10 text-sm
                       focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <svg class="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 21l-4.3-4.3" />
                <circle cx="11" cy="11" r="7" />
              </svg>
            </div>
          </div>

          <!-- 별점 필터 -->
          <div class="flex gap-2">
            <button
              v-for="n in 5"
              :key="n"
              class="rounded-2xl border px-3 py-3 text-sm font-semibold transition
                     hover:bg-gray-50 active:scale-[0.98]"
              :class="minRating === n ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-700'"
              @click="minRating = (minRating === n ? 0 : n)"
              :title="`${n}점 이상`"
            >
              {{ n }}+
            </button>
          </div>

          <!-- 정렬 -->
          <div class="sm:w-[180px]">
            <select
              v-model="sortKey"
              class="w-full rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-gray-800
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="recent">최신순</option>
              <option value="high">별점 높은순</option>
              <option value="low">별점 낮은순</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 구분선 -->
      <div class="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <!-- 작성 폼 -->
      <div class="p-6 sm:p-7 bg-gray-50/60">
        <div class="rounded-3xl border bg-white p-5 sm:p-6">
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-base font-extrabold text-gray-900">리뷰 작성</h3>
            <span class="text-xs text-gray-500">로컬 저장</span>
          </div>

          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700">닉네임</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="예: 신건하"
                class="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700">별점</label>
              <div class="mt-2 flex items-center gap-3">
                <StarPicker v-model="form.rating" />
                <span class="text-sm font-extrabold text-gray-900">{{ form.rating }}.0</span>
              </div>
            </div>

            <div class="sm:col-span-2">
              <label class="block text-sm font-semibold text-gray-700">내용</label>
              <textarea
                v-model="form.content"
                rows="3"
                placeholder="대기 시간, 의료진 응대, 시설/청결, 주차 등 경험을 남겨주세요."
                class="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div class="mt-4 flex items-center justify-between gap-3">
            <p class="text-xs text-gray-500">
              * 개인정보(전화번호/주소 등)는 작성하지 마세요.
            </p>

            <button
              class="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3
                     text-sm font-extrabold text-white hover:bg-indigo-500 active:scale-[0.98] transition disabled:opacity-50"
              :disabled="!canSubmit"
              @click="addReview"
            >
              등록
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14" />
                <path d="M13 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 리스트 -->
      <div class="p-6 sm:p-7">
        <div v-if="sortedReviews.length === 0" class="rounded-3xl border bg-gray-50 p-7 text-center">
          <p class="font-extrabold text-gray-900">아직 리뷰가 없습니다.</p>
          <p class="mt-1 text-sm text-gray-600">첫 리뷰를 남겨주세요.</p>
        </div>

        <div v-else class="space-y-4">
          <article
            v-for="r in sortedReviews"
            :key="r.id"
            class="rounded-3xl border bg-white p-5 sm:p-6 shadow-sm"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-extrabold text-gray-900 truncate">{{ r.name }}</p>
                  <span class="text-xs text-gray-400">•</span>
                  <p class="text-xs text-gray-500">{{ formatDate(r.created_at) }}</p>
                </div>

                <div class="mt-2 flex items-center gap-2">
                  <StarRow :value="r.rating" />
                  <span class="text-sm font-extrabold text-gray-900">{{ r.rating.toFixed(1) }}</span>
                </div>
              </div>

              <button
                class="rounded-2xl border px-3 py-2 text-xs font-extrabold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition"
                @click="removeReview(r.id)"
                title="삭제(로컬)"
              >
                삭제
              </button>
            </div>

            <p class="mt-4 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
              {{ r.content }}
            </p>

            <!-- 태그 느낌(간단 키워드) -->
            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="t in extractTags(r.content)"
                :key="t"
                class="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
              >
                {{ t }}
              </span>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'

const props = defineProps({
  hospitalId: {
    type: [String, Number],
    required: true,
  },
})

/** ====== storage ====== */
const key = computed(() => `reviews:${String(props.hospitalId)}`)
const load = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(key.value) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}
const save = (list) => localStorage.setItem(key.value, JSON.stringify(list))

/** ====== state ====== */
const reviews = ref([])

// 필터/정렬
const q = ref('')
const minRating = ref(0) // 0이면 전체
const sortKey = ref('recent') // recent|high|low

// 폼
const form = reactive({
  name: '',
  rating: 5,
  content: '',
})

const canSubmit = computed(() => form.name.trim().length > 0 && form.content.trim().length >= 5)

onMounted(() => {
  // 초기 mock + 로컬 합치기
  const local = load()
  reviews.value = local.length ? local : seedMockReviews()
})

watch(
  () => props.hospitalId,
  () => {
    reviews.value = load()
    if (!reviews.value.length) reviews.value = seedMockReviews()
  }
)

watch(
  reviews,
  (v) => save(v),
  { deep: true }
)

/** ====== computed ====== */
const filteredReviews = computed(() => {
  const query = q.value.trim().toLowerCase()
  return reviews.value.filter((r) => {
    const okRating = minRating.value ? r.rating >= minRating.value : true
    const okQuery = query
      ? (r.name + ' ' + r.content).toLowerCase().includes(query)
      : true
    return okRating && okQuery
  })
})

const avgRating = computed(() => {
  if (filteredReviews.value.length === 0) return 0
  const sum = filteredReviews.value.reduce((acc, r) => acc + r.rating, 0)
  return sum / filteredReviews.value.length
})

const sortedReviews = computed(() => {
  const arr = [...filteredReviews.value]
  if (sortKey.value === 'high') arr.sort((a, b) => b.rating - a.rating)
  else if (sortKey.value === 'low') arr.sort((a, b) => a.rating - b.rating)
  else arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return arr
})

/** ====== actions ====== */
const addReview = () => {
  if (!canSubmit.value) return

  const now = new Date().toISOString()
  const newItem = {
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name: form.name.trim(),
    rating: Number(form.rating),
    content: form.content.trim(),
    created_at: now,
  }

  reviews.value = [newItem, ...reviews.value]

  // reset
  form.content = ''
  form.rating = 5
}

const removeReview = (id) => {
  reviews.value = reviews.value.filter((r) => r.id !== id)
}

/** ====== utils ====== */
const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

// 내용에서 태그(키워드) 뽑기: 간단 버전
const extractTags = (content) => {
  const dict = ['친절', '불친절', '대기', '빠름', '느림', '주차', '청결', '시설', '설명', '진료', '응급']
  const hit = dict.filter((w) => content.includes(w))
  return hit.slice(0, 4) // 너무 많으면 4개까지만
}

// 초기 목업
const seedMockReviews = () => {
  const now = Date.now()
  return [
    {
      id: 'seed-1',
      name: '이용자A',
      rating: 4.5,
      content: '대기 시간이 생각보다 짧았고 의료진 설명이 친절했습니다. 시설도 전반적으로 청결했어요.',
      created_at: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: 'seed-2',
      name: '이용자B',
      rating: 3.5,
      content: '응급실이라 바빴지만 안내는 괜찮았어요. 다만 주차가 조금 불편했습니다.',
      created_at: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
    },
    {
      id: 'seed-3',
      name: '이용자C',
      rating: 5.0,
      content: '간호사분들이 정말 친절했고 처치가 빨랐습니다. 응급 상황에 추천합니다.',
      created_at: new Date(now - 1000 * 60 * 60 * 42).toISOString(),
    },
  ]
}

/** ====== sub components ====== */
const StarRow = {
  props: { value: { type: Number, default: 0 } },
  template: `
    <div class="flex items-center gap-0.5" aria-label="rating">
      <svg v-for="i in 5" :key="i" viewBox="0 0 24 24"
           class="h-4 w-4"
           :class="i <= Math.round(value) ? 'text-amber-400' : 'text-gray-200'"
           fill="currentColor">
        <path d="M12 17.27l5.18 3.05-1.64-5.81L20 10.24l-5.91-.5L12 4.5 9.91 9.74 4 10.24l4.46 4.27-1.64 5.81z"/>
      </svg>
    </div>
  `,
}

const StarPicker = {
  props: {
    modelValue: { type: Number, default: 5 },
  },
  emits: ['update:modelValue'],
  template: `
    <div class="flex items-center gap-1">
      <button
        v-for="i in 5"
        :key="i"
        type="button"
        class="p-1 rounded-lg hover:bg-gray-100 active:scale-[0.98] transition"
        @click="$emit('update:modelValue', i)"
        :title="i + '점'"
      >
        <svg viewBox="0 0 24 24"
             class="h-5 w-5"
             :class="i <= modelValue ? 'text-amber-400' : 'text-gray-200'"
             fill="currentColor">
          <path d="M12 17.27l5.18 3.05-1.64-5.81L20 10.24l-5.91-.5L12 4.5 9.91 9.74 4 10.24l4.46 4.27-1.64 5.81z"/>
        </svg>
      </button>
    </div>
  `,
}
</script>
