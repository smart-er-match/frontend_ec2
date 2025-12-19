<template>
  <!-- ✅ 찜한 응급실이 없을 때 -->
  <div
    v-if="favoriteList.length === 0"
    class="flex flex-col items-center justify-center
           rounded-2xl border border-gray-200 bg-gray-50
           px-6 py-16 text-center"
  >
    <!-- 아이콘 -->
    <div
      class="flex h-16 w-16 items-center justify-center
             rounded-full bg-indigo-100 text-indigo-600"
    >
      <svg
        viewBox="0 0 24 24"
        class="h-8 w-8"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z"/>
        <path d="M12 11v.01"/>
      </svg>
    </div>

    <h1 class="mt-6 text-xl font-bold text-gray-900">
      내가 찜한 응급실
    </h1>

    <p class="mt-2 text-sm text-gray-500">
      아직 찜한 응급실이 없습니다.
      <br />
      자주 가는 응급실을 찜해두면 빠르게 확인할 수 있어요.
    </p>

    <button
      class="mt-8 inline-flex items-center gap-2
             rounded-xl bg-indigo-600 px-6 py-2.5
             text-sm font-semibold text-white
             hover:bg-indigo-500 active:scale-[0.98]
             transition"
      @click="goToER"
    >
      응급실 찾으러 가기
      <svg
        viewBox="0 0 24 24"
        class="h-4 w-4"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M5 12h14"/>
        <path d="M13 5l7 7-7 7"/>
      </svg>
    </button>
  </div>

  <!-- ✅ 찜한 응급실이 있을 때 -->
  <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div
      v-for="item in favoriteList"
      :key="item.id"
      class="rounded-xl border bg-white p-4 shadow-sm hover:shadow transition"
    >
      <h3 class="text-lg font-semibold text-gray-900">
        {{ item.name }}
      </h3>
      <p class="text-sm text-gray-700">📞 {{ item.emergency_phone }}</p>
      <p class="text-sm text-gray-700">📍 {{ item.address }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/components/api'

const router = useRouter()

// ✅ 찜한 응급실 리스트 (병원 객체)
const favoriteList = ref([])

const goToER = () => {
  router.push({ name: 'erlist' })
}

// onMounted(async () => {
//   try {
//     /**
//      * 권장 응답 형태:
//      * GET favorites/hospitals/
//      * [
//      *   {
//      *     id: 1,
//      *     name: "...",
//      *     emergency_phone: "...",
//      *     address: "..."
//      *   }
//      * ]
//      */
//     const res = await api.get('favorites/hospitals/')
//     favoriteList.value = res.data?.data ?? res.data ?? []
//   } catch (e) {
//     console.warn('즐겨찾기 목록 불러오기 실패', e)
//     favoriteList.value = []
//   }
// })
</script>
