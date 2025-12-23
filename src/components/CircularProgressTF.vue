<template>
  <div class="mt-3 inline-flex flex-col items-center gap-2">
    <p class="text-sm font-semibold text-gray-900 text-center">
      {{ label }}
    </p>

    <div class="relative grid place-items-center" :style="{ width: sizePx, height: sizePx }">
      <svg :width="size" :height="size" class="-rotate-90">
        <!-- 배경 원 -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          :stroke-width="stroke"
          class="text-gray-200"
          stroke="currentColor"
          fill="none"
        />

        <!-- 상태 원 -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          :stroke-width="stroke"
          :class="ringClass"
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
          <div class="text-sm font-bold" :class="textClass">
            {{ centerText }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, default: '상태' },
  current: { type: [Number, String], default: 0 }, // 1=가능, 0=불가
  total: { type: [Number, String], default: 1 },
  size: { type: Number, default: 64 },
  stroke: { type: Number, default: 8 },
  disabled: { type: Boolean, default: false }, // ✅ realtime 없을 때 true
})

const isAvailable = computed(() => Number(props.current) === 1)

// SVG 계산
const center = computed(() => props.size / 2)
const radius = computed(() => (props.size - props.stroke) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const sizePx = computed(() => `${props.size}px`)

// ✅ disabled면 회색 + 빈 원, 텍스트는 "사용불가"
const ringClass = computed(() => {
  if (props.disabled) return 'text-gray-300'
  return isAvailable.value ? 'text-emerald-500' : 'text-rose-500'
})

const dashOffset = computed(() => {
  if (props.disabled) return circumference.value // 빈 원
  return isAvailable.value ? 0 : circumference.value
})

const centerText = computed(() => {
  if (props.disabled) return '사용불가'
  return isAvailable.value ? '가능' : '불가'
})

const textClass = computed(() => {
  if (props.disabled) return 'text-gray-400'
  return isAvailable.value ? 'text-emerald-600' : 'text-rose-600'
})
</script>
