<template>
  <button
    type="button"
    class="relative w-full max-w-sm h-[320px] text-left"
    @click="$emit('select')"
  >
    <!-- ✅ 선택 시 빛나는 링(바깥 테두리) -->
    <div
      class="h-full rounded-2xl transition
             ring-1 ring-slate-200
             hover:ring-2 hover:ring-slate-300"
      :class="[
        highlight ? 'shadow-md scale-[1.03]' : 'shadow-sm',
        active ? activeRingClass : ''
      ]"
    >
      <!-- 랭크 메달 -->
      <div class="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
        <div
          class="flex items-center gap-1 px-4 py-1 rounded-full text-sm font-extrabold shadow"
          :class="medalClass"
        >
          <span v-if="rank === 1">🥇</span>
          <span v-else-if="rank === 2">🥈</span>
          <span v-else>🥉</span>
          <span>{{ rank }}</span>
        </div>
      </div>

      <!-- 카드 내용 -->
      <div class="h-full rounded-2xl bg-white p-6 pt-10 flex flex-col items-center text-center">
        <div class="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-4">
          🏥
        </div>

        <template v-if="item">
          <div class="text-lg font-extrabold text-slate-900 line-clamp-2">
            {{ item.name }}
          </div>

          <!-- ✅ 평점 박스 -->
          <div class="mt-auto w-full rounded-xl bg-slate-50 border border-slate-200 p-3">
            <div class="text-xs text-slate-500">평점</div>

            <div class="mt-1 flex items-center justify-center gap-2">
              <div class="text-sm font-bold text-slate-900">
                {{ ratingText }}
              </div>
              <div class="text-xs text-slate-400">
                ({{ countText }})
              </div>
            </div>

            <!-- ✅ 별 표시 -->
            <div class="mt-2 flex items-center justify-center gap-1">
              <svg
                v-for="n in 5"
                :key="n"
                viewBox="0 0 24 24"
                class="h-4 w-4"
                :class="n <= roundedRating ? 'text-amber-400' : 'text-slate-300'"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M12 17.27l5.18 3.05-1.64-5.81L20 10.24l-5.91-.5L12 4.5 9.91 9.74 4 10.24l4.46 4.27-1.64 5.81z"
                />
              </svg>
            </div>
          </div>

          <div class="mt-2 text-xs text-slate-500">
            {{ item.emergency_phone || item.phone || '-' }}
          </div>
        </template>

        <div v-else class="text-slate-400">
          데이터 없음
        </div>
      </div>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rank: { type: Number, required: true },
  item: { type: Object, default: null },
  highlight: { type: Boolean, default: false },
  // ✅ 선택 상태
  active: { type: Boolean, default: false },
})

defineEmits(['select'])

const medalClass = computed(() => {
  if (props.rank === 1) return 'bg-amber-400 text-amber-950'
  if (props.rank === 2) return 'bg-slate-300 text-slate-800'
  return 'bg-amber-700 text-amber-50'
})

/**
 * ✅ “반응형”으로 빛나게:
 * - 모바일: 링 두께 얇게
 * - 데스크탑: 링 더 두껍게
 */
const activeRingClass = computed(() => {
  if (props.rank === 1) return 'ring-2 sm:ring-4 ring-amber-400/70'
  if (props.rank === 2) return 'ring-2 sm:ring-4 ring-slate-400/60'
  return 'ring-2 sm:ring-4 ring-amber-700/60'
})

// ✅ 평점/리뷰수
const rating = computed(() => {
  const v = Number(props.item?.average_rating ?? 0)
  return Number.isFinite(v) ? v : 0
})

const roundedRating = computed(() => {
  // 별 채우기용: 반올림(원하면 Math.floor로 바꿔도 됨)
  return Math.max(0, Math.min(5, Math.round(rating.value)))
})

const ratingText = computed(() => rating.value.toFixed(1))
const countText = computed(() => {
  const c = Number(props.item?.review_count ?? 0)
  return Number.isFinite(c) ? c : 0
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
