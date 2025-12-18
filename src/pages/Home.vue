<template>
  <GetLocation
  ref="getLoc"
    @success="(p) => console.log('loc success', p)"
  @error="(m) => console.log('loc error', m)"
/>
  <main
    ref="scroller"
    class="h-screen overflow-y-auto scroll-smooth snap-y snap-mandatory"
  >
    <nav class="sticky top-0 z-50 h-16 bg-black/30 backdrop-blur text-white">
      <Navbar />
    </nav>

    <section class="page snap-start scroll-mt-16">
      <Home1 />
    </section>

    <section class="page snap-start scroll-mt-16">
      <Home2 />
    </section>

    <section class="page snap-start scroll-mt-16">
      <Home3 />
    </section>
  </main>

  <div
    class="fixed left-6 top-1/2 -translate-y-1/2 z-[60]
           flex flex-col items-center gap-4 px-4 py-5 rounded-full
           bg-black/50 backdrop-blur shadow-lg text-white"
  >
    <div class="text-xs font-semibold tabular-nums opacity-90">
      {{ String(index + 1).padStart(2, '0') }}
    </div>

    <div class="flex flex-col gap-3">
      <button
        v-for="(_, i) in 3"
        :key="i"
        class="h-2.5 w-2.5 rounded-full transition-all duration-200"
        :class="i === index ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'"
        @click="go(i)"
      />
    </div>

    <div class="text-xs font-semibold tabular-nums opacity-60">
      {{ String(3).padStart(2, '0') }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

import GetLocation from '../components/getLocation.vue'
import Navbar from '../components/Navbar.vue'
import Home1 from './Home/Home1.vue'
import Home2 from './Home/Home2.vue'
import Home3 from './Home/Home3.vue'

const scroller = ref(null)
const sections = ref([])
const index = ref(0)

let locked = false
let io = null
let resizeTimer = null

const getLoc = ref(null)

const askLocation = () => {
  console.log('[Home] askLocation called, getLoc =', getLoc.value)
getLoc.value?.requestLocation()
}

const go = (next) => {
  const clamped = Math.max(0, Math.min(sections.value.length - 1, next))
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
    const target = sections.value[index.value]
    target?.scrollIntoView({ behavior: 'auto', block: 'start' })
  }, 100)
}

onMounted(async () => {
  console.log('[Home] mounted, getLoc =', getLoc.value)
  askLocation()
  // ✅ (A) 스크롤/섹션 초기화는 항상
  sections.value = Array.from(scroller.value?.querySelectorAll('section.page') || [])
  scroller.value?.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('resize', onResize)

  io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (!visible) return
      const i = sections.value.indexOf(visible.target)
      if (i !== -1) index.value = i
    },
    { root: scroller.value, threshold: [0.55, 0.6, 0.7] }
  )
  sections.value.forEach(sec => io.observe(sec))
})

onBeforeUnmount(() => {
  scroller.value?.removeEventListener('wheel', onWheel)
  window.removeEventListener('resize', onResize)
  io?.disconnect()
})
</script>

<style scoped>
.page {
  height: calc(100vh - 4rem);
  width: 100%;
}
.page > :deep(*) {
  width: 100%;
  min-height: 100%;
}
</style>
