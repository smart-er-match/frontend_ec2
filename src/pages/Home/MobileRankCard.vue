<template>
  <button
    type="button"
    class="w-full text-left rounded-2xl border bg-white shadow-sm p-4
           transition active:scale-[0.99]
           focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
    :class="selected ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200'"
    @click="$emit('select', item)"
    :disabled="!item"
  >
    <div v-if="!item" class="text-slate-400">데이터 없음</div>

    <div v-else class="flex items-start gap-3">
      <!-- 랭크 뱃지 -->
      <div
        class="shrink-0 h-9 w-9 rounded-xl grid place-items-center font-extrabold text-sm"
        :class="rankClass"
      >
        {{ rank }}
      </div>

      <!-- 본문 -->
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <p class="font-bold text-slate-900 truncate">
            {{ item.name || item.hospitalname || "병원명" }}
          </p>

          <!-- ✅ 지도 -->
          <a
            v-if="item.name || item.hospitalname"
            class="shrink-0 text-xs text-slate-500 underline underline-offset-2"
            :href="`https://map.naver.com/p/search/${encodeURIComponent(item.name || item.hospitalname)}?c=15.00,0,0,0,dh`"
            target="_blank"
            rel="noopener noreferrer"
            @click.stop
          >
            지도
          </a>
        </div>

        <!-- 주소 -->
        <p class="mt-1 text-sm text-slate-600 line-clamp-2">
          {{ item.address || "주소 정보 없음" }}
        </p>

        <!-- ✅ 평점/리뷰수 + 별 -->
        <div class="mt-2 rounded-xl bg-slate-50 border border-slate-200 p-3">
          <div class="flex items-center justify-between">
            <div class="text-xs text-slate-500">평점</div>
            <div class="text-xs text-slate-400">
              ({{ countText }}개)
            </div>
          </div>

          <div class="mt-1 flex items-center gap-2">
            <div class="text-sm font-bold text-slate-900">
              {{ ratingText }}
            </div>

            <div class="flex items-center gap-0.5">
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
        </div>

        <!-- CTA -->
        <div class="mt-3 flex items-center justify-between">

          <!-- 필요하면 여기 다른 뱃지 넣어도 됨 -->
          <span class="text-xs text-slate-400">
            <!-- 예: 거리/가용병상 등 -->
          </span>
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
  selected: { type: Boolean, default: false },
})

defineEmits(['select'])

const rankClassMap = {
  1: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  2: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  3: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
}
const rankClass = rankClassMap[props.rank] ?? 'bg-slate-100 text-slate-700'

// ✅ 평점/리뷰수 (PodiumCard 로직과 동일)
const rating = computed(() => {
  const v = Number(props.item?.average_rating ?? 0)
  return Number.isFinite(v) ? v : 0
})

const ratingText = computed(() => rating.value.toFixed(1))

const countText = computed(() => {
  const c = Number(props.item?.review_count ?? 0)
  return Number.isFinite(c) ? c : 0
})

const roundedRating = computed(() => {
  return Math.max(0, Math.min(5, Math.round(rating.value)))
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
