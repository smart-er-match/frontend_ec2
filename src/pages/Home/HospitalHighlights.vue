<!-- HospitalHighlights.vue -->
<template>
  <section class="rounded-2xl border bg-white p-5 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-lg font-extrabold text-slate-900">병원별 주요 리뷰</h1>
        <p class="mt-1 text-xs text-slate-500">
          평균( {{ avgRating.toFixed(1) }} ) 이상 리뷰 중 랜덤 {{ pickCount }}개
        </p>
      </div>

      <button
        type="button"
        class="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
        :disabled="loading || !hpid"
        @click="fetchAndPick"
      >
        새로 뽑기
      </button>
    </div>

    <div v-if="!hpid" class="mt-4 rounded-xl border bg-slate-50 p-4 text-slate-600">
      병원을 선택하면 주요 리뷰가 표시됩니다.
    </div>

    <div v-else-if="loading" class="mt-4 rounded-xl border bg-slate-50 p-4 text-slate-600">
      불러오는 중...
    </div>

    <div v-else-if="error" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
      {{ error }}
    </div>

    <div v-else class="mt-4 space-y-3">
      <div v-if="picked.length === 0" class="rounded-xl border bg-slate-50 p-4 text-slate-600">
        평균 이상 리뷰가 없습니다.
      </div>

      <article
        v-for="r in picked"
        :key="r.id ?? r.created_at ?? r.content"
        class="rounded-xl border p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-bold text-slate-900">
              {{ r.user_name || r.name || '익명' }}
              <span class="ml-2 text-xs font-semibold text-slate-500">
                · {{ formatDate(r.created_at) }}
              </span>
            </p>

            <p class="mt-2 text-sm text-slate-800 whitespace-pre-line">
              {{ r.content }}
            </p>
          </div>

          <div class="shrink-0 text-right">
            <p class="text-sm font-extrabold text-slate-900">{{ r.rating }}점</p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import api from '@/components/api'

const props = defineProps({
  hpid: { type: String, default: '' },  // 선택된 병원 hpid
  pickCount: { type: Number, default: 3 },
})

const reviews = ref([])
const picked = ref([])
const loading = ref(false)
const error = ref('')

const avgRating = computed(() => {
  if (!reviews.value.length) return 0
  const sum = reviews.value.reduce((acc, r) => acc + Number(r.rating || 0), 0)
  return sum / reviews.value.length
})

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const pickHighlights = () => {
  const avg = avgRating.value
  const overAvg = reviews.value.filter((r) => Number(r.rating || 0) >= avg)
  picked.value = shuffle(overAvg).slice(0, props.pickCount)
}

const fetchAndPick = async () => {
  if (!props.hpid) return
  loading.value = true
  error.value = ''
  try {
    const res = await api.get(`/hospitals/reviews/${props.hpid}/`)
    // 배열 or {results: []} 대응
    reviews.value = Array.isArray(res.data) ? res.data : (res.data?.results ?? [])
    pickHighlights()
  } catch (e) {
    console.error(e)
    error.value = '리뷰를 불러오지 못했습니다.'
    reviews.value = []
    picked.value = []
  } finally {
    loading.value = false
  }
}

const formatDate = (iso) => {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

// ✅ 병원 선택이 바뀌면 자동 갱신
watch(() => props.hpid, () => {
  reviews.value = []
  picked.value = []
  if (props.hpid) fetchAndPick()
}, { immediate: true })
</script>
