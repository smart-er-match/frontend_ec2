<template>
  <GetLocation
    @success="onLocSuccess"
    ref="getLoc"
  />

  <main
    ref="scroller"
    class="h-screen overflow-y-auto scroll-smooth snap-y snap-mandatory"
  >
    <nav class="sticky top-0 z-50 h-16 bg-black/30 backdrop-blur text-white">
      <Navbar />
    </nav>

    <!-- 1번 섹션: 항상 노출 -->
    <section class="page snap-start scroll-mt-16">
      <Home1 />
    </section>

    <!-- 2번 섹션: 모바일에서는 렌더 안 함 -->
    <section
      v-if="!isMobile()"
      class="page snap-start scroll-mt-16"
    >
      <Home2 />
    </section>

    <!-- 3번 섹션: 모바일에서는 렌더 안 함 -->
    <section
      v-if="!isMobile()"
      class="page snap-start scroll-mt-16"
    >
      <Home3 />
    </section>
  </main>

  <!-- 좌측 인디케이터 -->
  <div
    v-if="!isMobile()"
    class="fixed left-6 top-1/2 -translate-y-1/2 z-[60]
           flex flex-col items-center gap-4 px-4 py-5 rounded-full
           bg-black/50 backdrop-blur shadow-lg text-white"
    :class="indicatorVisible
      ? 'opacity-100 pointer-events-auto'
      : 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'"
  >
    <!-- 현재 페이지 번호 -->
    <div class="text-xs font-semibold tabular-nums opacity-90">
      {{ String(index + 1).padStart(2, '0') }}
    </div>

    <!-- 점 개수도 섹션 개수에 맞게 -->
    <div class="flex flex-col gap-3">
      <button
        v-for="(_, i) in sectionCount"
        :key="i"
        class="h-2.5 w-2.5 rounded-full transition-all duration-200"
        :class="i === index ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'"
        @click="go(i)"
      />
    </div>

    <!-- 총 페이지 수 -->
    <div class="text-xs font-semibold tabular-nums opacity-60">
      {{ String(sectionCount).padStart(2, '0') }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

import GetLocation from '../components/getLocation.vue'
import Navbar from '../components/Navbar.vue'
import Home1 from './Home/Home1.vue'
import Home2 from './Home/Home2.vue'
import Home3 from './Home/Home3.vue'
// import { useLocationStore } from '@/stores/location' // 필요하면 사용

const indicatorVisible = ref(false)
let hideTimer = null

const isMobile = () =>
  window.matchMedia?.('(pointer: coarse)')?.matches

const showIndicator = () => {
  if (!isMobile()) return
  indicatorVisible.value = true
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    indicatorVisible.value = false
  }, 2500)
}

const scroller = ref(null)
const sections = ref([])
const index = ref(0)

// 실제 섹션 개수에 맞춰 인디케이터 점/총 페이지 숫자 조정
const sectionCount = computed(() => sections.value.length || 1)

let locked = false
let io = null
let resizeTimer = null

const getLoc = ref(null)

const askLocation = () => {
  getLoc.value?.requestLocation()
}

const go = (next) => {
  const maxIdx = sections.value.length - 1
  const clamped = Math.max(0, Math.min(maxIdx, next))
  index.value = clamped
  const target = sections.value[clamped]
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const onWheel = (e) => {
  e.preventDefault()
  if (locked) return
  if (Math.abs(e.deltaY) < 8) return

  locked = true
  setTimeout(() => (locked = false), 600)

  if (e.deltaY > 0) go(index.value + 1)
  else go(index.value - 1)
}

const onResize = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    // 화면 크기 바뀌면 현재 섹션으로 다시 정렬
    sections.value = Array.from(scroller.value?.querySelectorAll('section.page') || [])
    const target = sections.value[index.value]
    target?.scrollIntoView({ behavior: 'auto', block: 'start' })
  }, 100)
}

const onLocSuccess = ({ lat, lng, address }) => {
  // 위치 성공 후 처리 필요하면 여기서
}

onMounted(() => {
  askLocation()

  sections.value = Array.from(scroller.value?.querySelectorAll('section.page') || [])
  scroller.value?.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('resize', onResize)

  io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (!visible) return
      const i = sections.value.indexOf(visible.target)
      if (i !== -1) index.value = i
    },
    { root: scroller.value, threshold: [0.55, 0.6, 0.7] }
  )
  sections.value.forEach((sec) => io.observe(sec))

  if (!isMobile()) return
  window.addEventListener('touchstart', showIndicator, { passive: true })
})

onBeforeUnmount(() => {
  scroller.value?.removeEventListener('wheel', onWheel)
  window.removeEventListener('resize', onResize)
  io?.disconnect()

  window.removeEventListener('touchstart', showIndicator)
  clearTimeout(hideTimer)
})
</script>

<style scoped>
.page {
  height: calc(100vh - 4rem); /* 네비게이션(4rem) 제외한 높이 */
  width: 100%;
}
.page > :deep(*) {
  width: 100%;
  height: 100%; /* 자식 컴포넌트가 섹션 높이를 꽉 채우도록 */
}
</style>
