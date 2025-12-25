<script setup>
import axios from 'axios'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { API_BASE_URL } from '../../config'
import { useRouter } from 'vue-router'
import api from '../../components/api'

/* ================= 기본 상태 ================= */
const router = useRouter()
const selectedCert = ref(null)
const name = ref('')
const birth = ref('')
const phoneNumber = ref('')
const juminHead = ref('')
const juminTail = ref('')
const agree1 = ref(false)
const agree2 = ref(false)
const agree3 = ref(false)
const agreeAll = ref(false)
const errorMsg = ref('')
const access = localStorage.getItem('access_token')

/* ================= 약관 동의 ================= */
const toggleAll = () => {
  agree1.value = agreeAll.value
  agree2.value = agreeAll.value
  agree3.value = agreeAll.value
}

const syncAgreeAll = () => {
  agreeAll.value = agree1.value && agree2.value && agree3.value
}

/* ================= 인증 수단 ================= */
const certList = [
  { id: 0, name: '카카오', img: '/cert/kakao.png' },
  { id: 1, name: '삼성패스', img: '/cert/pass.jpg' },
  { id: 2, name: '페이코', img: '/cert/payco.jpg' },
  { id: 3, name: 'PASS', img: '/cert/tel.jpg' },
  { id: 4, name: '네이버', img: '/cert/naver.png' },
  { id: 5, name: '신한인증서', img: '/cert/shinhan.png' },
]

/* ================= 약관 모달 ================= */
const modalOpen = ref(false)
const modalType = ref(null) // agree1 | agree2 | agree3

const PRIVACY_TEXT = `[개인정보 수집 및 이용 동의]

수집 항목: 이메일, 비밀번호
수집 목적: 회원가입 및 서비스 제공
보유 기간: 회원 탈퇴 시까지

동의를 거부할 권리가 있으나,
동의하지 않을 경우 회원가입이 제한될 수 있습니다.
`

const THIRD_TEXT = `[제3자 정보 제공 동의]

제공받는 자: (주)카카오, Google LLC, 네이버(주)
제공 목적: 소셜 로그인 연동
제공 항목: 이메일
보유 기간: 제공 목적 달성 시까지
`

const UNIQUE_TEXT = `[고유식별정보처리 동의]

본 서비스는 주민등록번호, 여권번호, 운전면허번호 등
고유식별정보를 수집·처리하지 않습니다.
`

const modalTitle = computed(() => {
  if (modalType.value === 'agree1') return '개인정보 수집 및 이용 동의'
  if (modalType.value === 'agree2') return '제3자 정보 제공 동의'
  if (modalType.value === 'agree3') return '고유식별정보처리 동의'
  return ''
})

const modalBody = computed(() => {
  if (modalType.value === 'agree1') return PRIVACY_TEXT
  if (modalType.value === 'agree2') return THIRD_TEXT
  if (modalType.value === 'agree3') return UNIQUE_TEXT
  return ''
})

const openModal = (type) => {
  modalType.value = type
  modalOpen.value = true
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  modalOpen.value = false
  modalType.value = null
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
}

const agreeFromModal = () => {
  if (modalType.value === 'agree1') agree1.value = true
  if (modalType.value === 'agree2') agree2.value = true
  if (modalType.value === 'agree3') agree3.value = true
  syncAgreeAll()
  closeModal()
}

const onKeydown = (e) => {
  if (e.key === 'Escape' && modalOpen.value) closeModal()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
})

/* ================= 제출 ================= */
const handleLogin = async () => {
  errorMsg.value = ''

  if (selectedCert.value === null) {
    errorMsg.value = '간편인증을 선택하세요.'
    return
  }

  if (!(agree1.value && agree2.value && agree3.value)) {
    errorMsg.value = '동의 진행 바랍니다.'
    return
  }

  try {
    const res = await api.post(
      'accounts/paramedic/apply/',
      {
        LOGINOPTION: selectedCert.value,
        JUMIN: juminHead.value + juminTail.value,
        DSNM: name.value,
        PHONENUM: phoneNumber.value,
        TELECOMGUBUN: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      }
    )

    localStorage.setItem('role', res.data.result)
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    storedUser.role = res.data.result
    localStorage.setItem('user', JSON.stringify(storedUser))

    router.push('/main')
  } catch (err) {
    errorMsg.value = '인증할 수 없는 사용자입니다.'
    console.error(err)
  }
}
</script>

<template>
  <div class="mt-5">
    <form @submit.prevent="handleLogin" class="space-y-6">
      <!-- 간편인증 -->
      <div class="bg-white p-6 border rounded-lg">
        <h2 class="text-lg font-semibold mb-4">간편인증</h2>
        <div class="grid grid-cols-3 gap-3">
          <label
            v-for="item in certList"
            :key="item.id"
            class="flex flex-col items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50"
            :class="{ 'border-blue-500 bg-blue-50': selectedCert === item.id }"
          >
            <input type="radio" class="hidden" v-model="selectedCert" :value="item.id" />
            <img :src="item.img" class="w-10 h-10" />
            <span class="text-xs mt-1">{{ item.name }}</span>
            <div class="mt-1 h-2">
              <div v-if="selectedCert === item.id" class="w-2 h-2 bg-black rounded-full"></div>
            </div>
          </label>
        </div>
      </div>

      <!-- 입력 -->
      <div>
        <label class="text-sm">이름</label>
        <input v-model="name" class="w-full border p-2 rounded mt-1" required />
      </div>

      <div>
        <label class="text-sm">생년월일</label>
        <input v-model="birth" class="w-full border p-2 rounded mt-1" required />
      </div>

      <div>
        <label class="text-sm">휴대폰 번호</label>
        <input v-model="phoneNumber" class="w-full border p-2 rounded mt-1" required />
      </div>

      <div>
        <label class="text-sm">주민번호</label>
        <div class="flex gap-2 mt-1">
          <input v-model="juminHead" class="border p-2 rounded w-24" required />
          <span>-</span>
          <input v-model="juminTail" class="border p-2 rounded w-10" required />
          <span>******</span>
        </div>
      </div>

      <!-- 약관 -->
      <div class="border-t pt-4">
        <label class="flex items-center gap-2 mb-3">
          <input type="checkbox" v-model="agreeAll" @change="toggleAll" />
          전체 동의
        </label>

        <div class="flex justify-between mb-2">
          <label><input type="checkbox" v-model="agree1" @change="syncAgreeAll" /> 개인정보 이용 동의</label>
          <button type="button" class="text-blue-500 text-xs" @click="openModal('agree1')">보기</button>
        </div>

        <div class="flex justify-between mb-2">
          <label><input type="checkbox" v-model="agree2" @change="syncAgreeAll" /> 제3자 정보 제공 동의</label>
          <button type="button" class="text-blue-500 text-xs" @click="openModal('agree2')">보기</button>
        </div>

        <div class="flex justify-between">
          <label><input type="checkbox" v-model="agree3" @change="syncAgreeAll" /> 고유식별정보처리 동의</label>
          <button type="button" class="text-blue-500 text-xs" @click="openModal('agree3')">보기</button>
        </div>
      </div>

      <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>

      <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded">
        인증 요청
      </button>
    </form>

    <!-- 모달 -->
    <teleport to="body">
      <div v-if="modalOpen" class="fixed inset-0 z-[200]">
        <div class="absolute inset-0 bg-black/60" @click="closeModal"></div>
        <div class="absolute inset-0 flex items-center justify-center p-4">
          <div class="bg-white max-w-lg w-full rounded-xl shadow-lg">
            <div class="p-4 border-b font-bold">{{ modalTitle }}</div>
            <pre class="p-4 text-sm whitespace-pre-wrap">{{ modalBody }}</pre>
            <div class="p-4 border-t flex justify-end gap-2">
              <button class="px-4 py-2 border rounded" @click="closeModal">닫기</button>
              <button class="px-4 py-2 bg-indigo-600 text-white rounded" @click="agreeFromModal">동의하기</button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>
