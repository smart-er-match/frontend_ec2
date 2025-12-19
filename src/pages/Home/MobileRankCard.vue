<template>
  <button
    type="button"
    class="w-full text-left rounded-2xl border bg-white shadow-sm p-4
           transition active:scale-[0.99]
           focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

        </div>

        <!-- 핵심 정보 1줄 -->
        <p class="mt-1 text-sm text-slate-600 line-clamp-2">
          {{ item.address || "주소 정보 없음" }}
        </p>

        <div class="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span class="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-slate-700">
            pk: {{ item.pk }}
          </span>

          <!-- 필요하면 거리/전화 같은 필드로 교체 -->
          <span v-if="item.phone" class="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-slate-700">
            {{ item.phone }}
          </span>
        </div>

        <!-- CTA -->
        <div class="mt-3 flex items-center justify-between">
          <span class="text-sm font-semibold text-indigo-600">자세히 보기 →</span>

          <a
            v-if="item.name || item.hospitalname"
            class="text-sm text-slate-500 underline underline-offset-2"
            :href="`https://map.naver.com/p/search/${encodeURIComponent(item.name || item.hospitalname)}?c=15.00,0,0,0,dh`"
            target="_blank"
            rel="noopener noreferrer"
            @click.stop
          >
            지도
          </a>
        </div>
      </div>
    </div>
  </button>
</template>

<script setup>

const props = defineProps({
  rank: { type: Number, required: true },
  item: { type: Object, default: null },
  selected: { type: Boolean, default: false },
});

defineEmits(["select"]);

const rankClassMap = {
  1: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  2: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  3: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
};


const rankClass = (rankClassMap[props.rank] ?? "bg-slate-100 text-slate-700");
</script>

<style scoped>
/* line-clamp 쓰려면 tailwind plugin line-clamp 활성화 필요.
   없으면 아래처럼 fallback: */
.line-clamp-2{
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}
</style>
