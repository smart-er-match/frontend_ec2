<!-- HospitalHighlights.vue -->
<template>
  <section class="rounded-2xl border bg-white p-5 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-lg font-extrabold text-slate-900">
          {{ displayName }} 주요 리뷰
        </h1>
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
        v-for="rv in picked"
        :key="rv.id ?? rv.created_at ?? rv.content"
        class="rounded-xl border p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-bold text-slate-900">
              <!-- ✅ 익명 대신 이메일 마스킹 표시 -->
              {{ maskEmail(rv?.user?.email ?? rv?.email) }}
              <span class="ml-2 text-xs font-semibold text-slate-500">
                · {{ formatDate(rv.created_at) }}
              </span>
            </p>

            <p class="mt-2 text-sm text-slate-800 whitespace-pre-line">
              {{ rv.content }}
            </p>
          </div>

          <div class="shrink-0 text-right">
            <!-- ⭐ 별점 -->
            <div class="flex items-center justify-end gap-0.5">
              <svg
                v-for="n in 5"
                :key="n"
                viewBox="0 0 24 24"
                class="h-4 w-4"
                :class="n <= Number(rv.rating) ? 'text-amber-400' : 'text-gray-300'"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M12 17.27l5.18 3.05-1.64-5.81L20 10.24l-5.91-.5L12 4.5
                    9.91 9.74 4 10.24l4.46 4.27-1.64 5.81z"
                />
              </svg>
            </div>

            <!-- 숫자 보조 -->
            <p class="mt-1 text-xs font-semibold text-slate-600">
              {{ rv.rating }} / 5
            </p>
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
  hpid: { type: String, default: '' },
  hospitalName: { type: String, default: '' },
  pickCount: { type: Number, default: 3 },
})

const reviews = ref([])
const picked = ref([])
const loading = ref(false)
const error = ref('')
const reqSeq = ref(0)

const displayName = computed(() => {
  const name = (props.hospitalName ?? '').trim()
  return name || '선택한 병원'
})

const avgRating = computed(() => {
  if (!reviews.value.length) return 0
  const sum = reviews.value.reduce((acc, r) => acc + Number(r?.rating || 0), 0)
  return sum / reviews.value.length
})

const maskEmail = (email) => {
  if (!email || !String(email).includes('@')) return '익명'
  const [id, domain] = String(email).split('@')
  const visible = id.slice(0, 1) || 'x'
  return `${visible}****@${domain}`
}

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
  const overAvg = reviews.value.filter((r) => Number(r?.rating || 0) >= avg)
  picked.value = shuffle(overAvg).slice(0, props.pickCount)
}

const fetchAndPick = async () => {
  const hpid = props.hpid
  if (!hpid) return

  const seq = ++reqSeq.value
  loading.value = true
  error.value = ''

  try {
    const res = await api.get(`/hospitals/reviews/${hpid}/`)
    if (seq !== reqSeq.value) return

    reviews.value = Array.isArray(res.data) ? res.data : (res.data?.results ?? [])
    pickHighlights()
  } catch (e) {
    if (seq !== reqSeq.value) return
    console.error(e)
    error.value = '리뷰를 불러오지 못했습니다.'
    reviews.value = []
    picked.value = []
  } finally {
    if (seq === reqSeq.value) loading.value = false
  }
}

const formatDate = (iso) => {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

watch(
  () => props.hpid,
  (newHpid, oldHpid) => {
    if (newHpid === oldHpid) return
    reviews.value = []
    picked.value = []
    error.value = ''
    if (newHpid) fetchAndPick()
  },
  { immediate: true }
)
</script>
