<script setup>
import { ref, nextTick, watch, onMounted } from 'vue'
import api from '../../components/api'
import { useRouter } from 'vue-router'
import { useLocationStore } from '@/stores/location'
import { useAuthStore } from "@/stores/auth";

const userStore = useAuthStore();
const locationStore = useLocationStore()

const router = useRouter();
/** 부모에서 <AIChatBot @close="..." /> 로 닫기 쓰면 됨 */
const emit = defineEmits(['close'])


const messages = ref([
  { id: 1, role: 'bot', text: '안녕하세요! 무엇을 도와드릴까요?' },
])

const input = ref('')
const isSending = ref(false)
const scroller = ref(null)
const sessionId = ref(null)

const scrollToBottom = async () => {
  await nextTick()
  if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight
}

watch(
  () => messages.value.length,
  () => scrollToBottom(),
  { immediate: true }
)

onMounted(() => scrollToBottom())

const send = async () => {
    const text = input.value

    messages.value.push({ id: Date.now(), role: 'user', text })
    input.value = ''
    isSending.value = true

    try {
        const res = await api.post(`hospitals/chatbot/`, {
            session_id: sessionId.value || '',
            message: text || '',
        })
        sessionId.value = res.data.session_id ?? sessionId.value

        const resData = res.data
        const botText = res.data.message
        messages.value.push({ id: Date.now(), role: 'bot', text: botText || '응답을 받지 못했습니다.' })


        if (resData.is_finished) {

          localStorage.setItem('symptom', JSON.stringify(resData.final_data.symptom))
          localStorage.setItem('patient_gender', resData.final_data.gender)
          localStorage.setItem('patient_age', resData.final_data.age)
          messages.value.push({
            id: Date.now() + 2,
            role: 'bot',
            type: 'action',
            text: '대화가 완료되었습니다. 다음 중 원하는 작업을 선택하세요.',
            actions: [
              {
                label: '추천 결과 보기',
                action: 'VIEW_RESULT',
              },
              {
                label: '채팅 닫기',
                action: 'CLOSE_CHAT',
              },
            ],
          })
        }


        if(resData.find_loc){
          console.log("findlocation")
          messages.value.push({
            id: Date.now() + 2,
            role: 'bot',
            type: 'action',
            text: '위치정보를 먼저 받아오겠습니다. 아래의 작업을 선택하세요.',
            actions: [
              {
                label: '주소 찾기',
                action: 'FIND_LOC',
              },
              
            ],
          })
        }

    }catch (error) {
     console.error('챗봇 요청 실패:', error)
        messages.value.push({
        id: Date.now() + 1,
        role: 'bot',
        text: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',})
  } finally {
    isSending.value = false
  }
}


const handleAction = (action) => {
  if (action === 'VIEW_RESULT') {
    // 예: 추천 결과 페이지 이동


    userStore.updateUserInfo()

    if (userStore.user.remaining_requests === 0){
    alert("AI 활용 토큰을 다 사용하였습니다. 다음날 다시 사도하세요.")
    return
  }
    router.push({name : 'recommenderlist'})
    return
  }

  if (action === 'CLOSE_CHAT') {
    emit('close')
    return
  }

  if (action === 'FIND_LOC') {
    openAddressSearch()
    return
  }
}

const myLat = ref('-')
const myLng = ref('-')
const myAddress = ref('')


const openAddressSearch = () => {
  if (!window.daum?.Postcode) {
    console.error('Daum Postcode 스크립트가 로드되지 않았습니다.')
    return
  }

  new window.daum.Postcode({
    oncomplete: async (data) => {
      try {
        const addr = data.roadAddress || data.jibunAddress
        myAddress.value = addr

        const coords = await getCoordsFromAddress(addr)
        if (!coords) return

        // ✅ 화면 표시용(문자열)
        myLat.value = Number(coords.lat).toFixed(6)
        myLng.value = Number(coords.lng).toFixed(6)

        console.log('[lat,lng]', myLat.value, myLng.value)

        // ✅ Pinia 저장 (숫자로 저장 추천)
        locationStore.setLocation({
          lat: Number(coords.lat),
          lng: Number(coords.lng),
          address: addr,
        })

        // ✅ 서버 저장 (숫자로 보내기 추천)
        await api.post(`hospitals/user/location/`, {
          latitude: Number(coords.lat),
          longitude: Number(coords.lng),
          locationstext: addr,
        })

        console.log('✅ 위치 저장 성공')
      } catch (e) {
        console.error('❌ 위치 저장 실패:', e)
      }
    },
  }).open()
}


console.log('위치 있음?', locationStore.hasLocation)

const onKeydown = (e) => {
  // Enter 전송, Shift+Enter 줄바꿈
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

async function getCoordsFromAddress(address) {
  const clean = normalizeAddress(address)
  const query = encodeURIComponent(clean)

  const res = await fetch(`/naver/map-geocode/v2/geocode?query=${query}`)
  const data = await res.json()

  if (!data.addresses || data.addresses.length === 0) {
    console.error('좌표를 찾을 수 없습니다.')
    return null
  }

function normalizeAddress(address) {
  return address
    .replace(/지하/g, '')
    .replace(/지상/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}


  const location = data.addresses[0]
  return { lat: Number(location.y), lng: Number(location.x) }
}

</script>

<template>
  <div class="h-full w-full flex flex-col bg-white text-gray-900">
    <!-- Header -->
    <header class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <div class="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16M4 12h10M4 18h16" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-bold">AI 챗봇 서비스</p>
          <p class="text-xs text-gray-500">편하게 응급실 추천 받아보세요</p>
        </div>
      </div>

      <button
        type="button"
        class="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800
               focus:outline-none focus:ring-2 focus:ring-indigo-500"
        @click="emit('close')"
        aria-label="닫기"
      >
        ✕
      </button>
    </header>
    <!-- Messages -->
    <main ref="scroller" class="flex-1 overflow-y-auto bg-gray-50 px-4 py-4">
      <div class="space-y-3">
       <div
        v-for="m in messages"
        :key="m.id"
        class="flex"
        :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <!-- ✅ 일반 텍스트 메시지 -->
        <div
          v-if="!m.type || m.type === 'text'"
          class="max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line shadow-sm"
          :class="m.role === 'user'
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-900 border border-gray-200'"
        >
          {{ m.text }}
        </div>

        <!-- ✅ 버튼 포함 메시지 -->
        <div
          v-else-if="m.type === 'action'"
          class="max-w-[85%] rounded-2xl bg-white border border-gray-200 px-3 py-3 shadow-sm space-y-3"
        >
          <p class="text-sm text-gray-900 whitespace-pre-line">
            {{ m.text }}
          </p>

          <div class="flex flex-col gap-2">
            <button
              v-for="btn in m.actions"
              :key="btn.label"
              type="button"
              class="rounded-xl border border-indigo-600 px-3 py-2 text-sm font-semibold
                    text-indigo-600 hover:bg-indigo-50"
              @click="handleAction(btn.action)"
            >
              {{ btn.label }}
            </button>
          </div>
        </div>
      </div>


        <!-- typing 느낌(옵션) -->
        <div v-if="isSending" class="flex justify-start">
          <div class="bg-white border border-gray-200 text-gray-700 rounded-2xl px-3 py-2 text-sm shadow-sm">
            입력 중...
          </div>
        </div>
      </div>
    </main>

    <!-- Input -->
    <footer class="border-t border-gray-200 bg-white p-3">
      <div class="flex items-end gap-2">
        <textarea
          v-model="input"
          rows="1"
          class="flex-1 resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="메시지를 입력하세요..."
          @keydown="onKeydown"
        />
        <button
          type="button"
          class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white
                 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-600"
          :disabled="!input.trim() || isSending"
          @click="send"
        >
          전송
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 필요하면 여기 추가 */
</style>
