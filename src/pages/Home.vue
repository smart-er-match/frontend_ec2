<template>
  <GetLocation @success="onLocSuccess" ref="getLoc" />

  <!-- ✅ 모바일: body 스크롤(내부 스크롤 X) / ✅ PC: 풀페이지 스냅 -->
  <main
    ref="scroller"
    :class="[mainClass, 'overscroll-contain']"
  >
    <nav class="sticky top-0 z-50 h-16 bg-black/30 backdrop-blur text-white">
      <Navbar />
    </nav>

    <!-- 1번 섹션 -->
    <section :class="sectionClass">
      <Home1 />
    </section>

    <!-- 2,3번 섹션: PC만 -->
    <section v-if="!isMobile" :class="sectionClass">
      <Home2 />
    </section>

    <section v-if="!isMobile" :class="sectionClass">
      <Home3 />
    </section>
  </main>

  <!-- 좌측 인디케이터 (PC만) -->
  <div
    v-if="!isMobile"
    class="fixed left-6 top-1/2 -translate-y-1/2 z-[60]
           flex flex-col items-center gap-4 px-4 py-5 rounded-full
           bg-black/50 backdrop-blur shadow-lg text-white"
  >
    <div class="text-xs font-semibold tabular-nums opacity-90">
      {{ String(index + 1).padStart(2, '0') }}
    </div>

    <div class="flex flex-col gap-3">
      <button
        v-for="(_, i) in sectionCount"
        :key="i"
        class="h-2.5 w-2.5 rounded-full transition-all duration-200"
        :class="i === index ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'"
        @click="go(i)"
      />
    </div>

    <div class="text-xs font-semibold tabular-nums opacity-60">
      {{ String(sectionCount).padStart(2, '0') }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

import GetLocation from '../components/getLocation.vue'
import Navbar from '../components/Navbar.vue'
import Home1 from './Home/Home1.vue'
import Home2 from './Home/Home2.vue'
import Home3 from './Home/Home3.vue'

/** ✅ 반응형 판정: coarse pointer면 모바일/터치로 간주 */
const isMobile = ref(false)
const detectMobile = () => {
  isMobile.value = !!window.matchMedia?.('(pointer: coarse)')?.matches
}

/** ✅ main/section 클래스: 모바일은 snap/내부스크롤 제거 */
const mainClass = computed(() => {
  return isMobile.value
    ? 'min-h-screen overflow-visible' // ✅ 모바일: body 스크롤(내부 스크롤 X)
    : 'h-[100dvh] overflow-y-auto snap-y snap-mandatory scroll-smooth overscroll-contain' // ✅ PC: 스냅
})

const sectionClass = computed(() => {
  return isMobile.value
    ? 'page' // 모바일: 일반 흐름(스냅/scroll-mt 제거)
    : 'page snap-start scroll-mt-16' // PC: 스냅 정렬 + 네비 높이 보정
})

const scroller = ref(null)
const sections = ref([])
const index = ref(0)
const sectionCount = computed(() => sections.value.length || 1)

let io = null
let resizeTimer = null
let locked = false

const getLoc = ref(null)
const askLocation = () => getLoc.value?.requestLocation()
const onLocSuccess = ({ lat, lng, address }) => {}

/** ✅ 스냅+sticky에서 scrollIntoView보다 scroller.scrollTo가 안정적 */
const go = (next) => {
  const maxIdx = sections.value.length - 1
  const clamped = Math.max(0, Math.min(maxIdx, next))
  index.value = clamped

  const target = sections.value[clamped]
  if (!target) return

  // 모바일은 body 스크롤이라 그냥 scrollIntoView 사용
  if (isMobile.value) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  // PC는 내부 scroller 기준
  scroller.value?.scrollTo({
    top: target.offsetTop,
    behavior: 'smooth',
  })
}

/** ✅ wheel 페이지네이션: PC에서만 */
const onWheel = (e) => {
  e.preventDefault()
  if (locked) return
  if (Math.abs(e.deltaY) < 8) return

  locked = true
  setTimeout(() => (locked = false), 600)

  if (e.deltaY > 0) go(index.value + 1)
  else go(index.value - 1)
}

const rebuildSections = () => {
  sections.value = Array.from(document.querySelectorAll('section.page') || [])
}

const setupObserver = () => {
  io?.disconnect()
  io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (!visible) return

      const i = sections.value.indexOf(visible.target)
      if (i !== -1) index.value = i
    },
    {
      // ✅ PC만 내부 스크롤 컨테이너를 root로
      root: isMobile.value ? null : scroller.value,
      threshold: 0.6,
    }
  )
  sections.value.forEach((sec) => io.observe(sec))
}

const onResize = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(async () => {
    detectMobile()
    await nextTick()

    rebuildSections()
    setupObserver()

    // PC에서만 현재 섹션으로 다시 정렬
    if (!isMobile.value && scroller.value) {
      const target = sections.value[index.value]
      if (target) scroller.value.scrollTo({ top: target.offsetTop, behavior: 'auto' })
    }
  }, 120)
}

onMounted(async () => {
  detectMobile()
  askLocation()

  await nextTick()

  rebuildSections()
  setupObserver()

  // ✅ PC에서만 wheel 이벤트
  if (!isMobile.value) {
    scroller.value?.addEventListener('wheel', onWheel, { passive: false })
  }

  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  if (!isMobile.value) {
    scroller.value?.removeEventListener('wheel', onWheel)
  }
  window.removeEventListener('resize', onResize)

  io?.disconnect()
  clearTimeout(resizeTimer)
})
</script>

<style scoped>
/* ✅ 공통: 기본은 자연 높이(모바일) */
.page {
  width: 100%;
  height: auto;
}

/* ✅ PC 전용: 풀페이지 스냅 높이 고정 */
@media (min-width: 640px) {
  .page {
    height: calc(100dvh - 4rem); /* nav(4rem=64px) 제외 */
  }
  .page > :deep(*) {
    width: 100%;
    height: 100%;
  }
}
</style>
