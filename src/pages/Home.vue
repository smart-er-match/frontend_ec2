<template>
  <nav class="fixed top-0 left-0 w-full z-50 h-16 bg-black/30 backdrop-blur text-white">
    <Navbar />
  </nav>

  <!-- 강제이동 모드: snap 제거 -->
  <main
    ref="scroller"
    class="mt-16 h-[calc(100vh-4rem)] overflow-hidden scroll-smooth"
  >
    <section ref="s0" class="page">
      <Home1 />
    </section>

    <section ref="s1" class="page">
      <Home2 />
    </section>

    <section ref="s2" class="page">
      <Home3 />
    </section>
  </main>

  <!-- 왼쪽 인디케이터 -->
  <div class="fixed left-8 top-1/2 -translate-y-1/2 z-[60] flex flex-col items-center gap-3 text-white/80">
    <div class="text-xs font-semibold tabular-nums">{{ String(index + 1).padStart(2, '0') }}</div>
    <button
      v-for="(n, i) in 3"
      :key="i"
      class="h-2 w-2 rounded-full transition"
      :class="i === index ? 'bg-white' : 'bg-white/30 hover:bg-white/60'"
      @click="go(i)"
      aria-label="go section"
    ></button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

import Navbar from '../components/Navbar.vue'
import Home1 from './Home/Home1.vue'
import Home2 from './Home/Home2.vue'
import Home3 from './Home/Home3.vue'

const scroller = ref(null)
const sections = ref([])
const index = ref(0)

let locked = false
let io = null

const pageH = () => scroller.value?.clientHeight || 0

const go = (next) => {
  if (!scroller.value) return
  const clamped = Math.max(0, Math.min(sections.value.length - 1, next))
  index.value = clamped

  scroller.value.scrollTo({
    top: clamped * pageH(), // ✅ 딱 페이지 높이로 이동(한틱 밀림 방지)
    behavior: 'smooth',
  })
}

const onWheel = (e) => {
  e.preventDefault()

  if (locked) return
  if (Math.abs(e.deltaY) < 8) return // 트랙패드 미세 움직임 컷

  locked = true
  setTimeout(() => (locked = false), 600)

  if (e.deltaY > 0) go(index.value + 1)
  else go(index.value - 1)
}

onMounted(() => {
  sections.value = Array.from(scroller.value?.querySelectorAll('section.page') || [])

  // main 안에서만 휠 강제 이동
  scroller.value?.addEventListener('wheel', onWheel, { passive: false })
  sections.value.forEach((sec, i) => {
      console.log(
        `section ${i}`,
        {
          offsetHeight: sec.offsetHeight,
          scrollHeight: sec.scrollHeight,
          clientHeight: sec.clientHeight,
          offsetTop: sec.offsetTop,
        }
      )
    })
  // 인덱스 자동 갱신(스크롤바 드래그/키보드 이동도 반영)
  io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (!visible) return
      const i = sections.value.indexOf(visible.target)
      if (i !== -1) index.value = i
    },
    { root: scroller.value, threshold: [0.6] }
  )

  sections.value.forEach(sec => io.observe(sec))
})

onBeforeUnmount(() => {
  scroller.value?.removeEventListener('wheel', onWheel)
  if (io) io.disconnect()
})
</script>

<style scoped>
.page {
  height: calc(100vh - 4rem); /* nav(64px) 제외 */
  overflow: hidden;          /* 내부가 커도 다음 섹션 밀지 않게 */
}

/* Home1/Home2/Home3 최상단이 min-h-screen이어도 섹션 안에 꽉 차게 강제 */
.page > :deep(*) {
  height: 100%;
  min-height: 100%;
}

</style>
