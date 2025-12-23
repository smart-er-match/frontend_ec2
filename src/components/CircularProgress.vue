<template>
  <div class="mt-3 inline-flex flex-col items-center gap-2">
    <!-- 제목 -->
    <p class="text-sm font-semibold text-gray-900 text-center">
      {{ label }}
    </p>

    <!-- 원형 프로그레스 -->
    <div
      class="relative grid place-items-center"
      :style="{ width: sizePx, height: sizePx }"
    >
      <svg :width="size" :height="size" class="-rotate-90">
        <!-- 트랙(배경 원) -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          :stroke-width="stroke"
          class="text-gray-200"
          stroke="currentColor"
          fill="none"
        />

        <!-- 진행(가용 병상 비율) -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          :stroke-width="stroke"
          :class="progressColorClass"
          stroke="currentColor"
          fill="none"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
        />
      </svg>

      <!-- 중앙 텍스트 -->
      <div class="absolute inset-0 grid place-items-center">
        <div class="text-center leading-tight">
          <div class="text-sm font-bold tabular-nums text-gray-900">
            {{ percent }}%
          </div>
          <div class="text-[11px] text-gray-500 tabular-nums">
            {{ remaining }} / {{ tot }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  label: { type: String, default: "가용 병상" },
  current: { type: [Number, String], default: 0 }, // 사용 중 병상
  total: { type: [Number, String], default: 0 },   // 전체 병상
  size: { type: Number, default: 64 },
  stroke: { type: Number, default: 8 },
  disabled: { type: Boolean, default: false },
});

// 숫자 정규화
const cur = computed(() => Number(props.current) || 0);
const tot = computed(() => Number(props.total) || 0);

// ✅ 남은 병상 수
const remaining = computed(() => {
  if (tot.value <= 0) return 0;
  return Math.max(0, tot.value - cur.value);
});

// ✅ 남은 병상 비율(%)
const percent = computed(() => {
  if (tot.value <= 0) return 0;
  const p = Math.round((remaining.value / tot.value) * 100);
  return Math.max(0, Math.min(100, p));
});

// ✅ 퍼센트 기준 색상
// 50% 이하 → 초록 / 75% 미만 → 노랑 / 그 이상 → 빨강
const progressColorClass = computed(() => {
  if (percent.value <= 50) return "text-emerald-500";
  if (percent.value < 75) return "text-amber-500";
  return "text-rose-500";
});

// SVG 계산
const center = computed(() => props.size / 2);
const radius = computed(() => (props.size - props.stroke) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const dashOffset = computed(() => {
  return circumference.value * (1 - percent.value / 100);
});

const sizePx = computed(() => `${props.size}px`);
</script>
