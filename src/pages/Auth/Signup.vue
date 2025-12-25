<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { API_BASE_URL } from '../../config'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const password2 = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const gender = ref('M')
const phonenumber = ref('')
const birth_date = ref('')

const emailCheckMsg = ref('')
const emailCheckStatus = ref(null)
const passwordError = ref('')
const password2Error = ref('')

const agree1 = ref(false)
const agree2 = ref(false)
const agree3 = ref(false)
const agreeAll = ref(false)

const toggleAll = () => {
  agree1.value = agreeAll.value
  agree2.value = agreeAll.value
  agree3.value = agreeAll.value
}
const syncAgreeAll = () => {
  agreeAll.value = agree1.value && agree2.value && agree3.value
}

const checkEmail = async () => {
  // ✅ 이메일 비어있을 때
  if (!email.value.trim()) {
    emailCheckStatus.value = false
    emailCheckMsg.value = '이메일을 입력하세요'
    return
  }

  try {
    const res = await axios.get(`${API_BASE_URL}accounts/signup/uu/`, {
      params: { username: email.value },
    })

    if (res.data.bool_uu === true) {
      emailCheckStatus.value = true
      emailCheckMsg.value = '사용 가능한 이메일입니다.'
    } else {
      emailCheckStatus.value = false
      emailCheckMsg.value = '중복된 이메일입니다.'
    }
  } catch (err) {
    console.error(err)
    emailCheckStatus.value = false
    emailCheckMsg.value = '검사 중 오류가 발생했습니다.'
  }
}

const handleSignup = async () => {
  if (
    emailCheckStatus.value === true &&
    passwordError.value === '' &&
    password2Error.value === ''
  ) {
    try {
      await axios.post(`${API_BASE_URL}accounts/signup/`, {
        username: email.value,
        password: password.value,
        name: name.value,
        phone_number: phonenumber.value,
        birth_date: birth_date.value,
        gender: gender.value,
        email: email.value,
      })
      router.push('/')
    } catch (err) {
      errorMsg.value = '회원가입 실패'
      console.error(err)
    }
  } else {
    errorMsg.value = '뭐가 제대로 안돼있어요'
  }
}

const password1End = () => {
  const pw = password.value
  passwordError.value = ''

  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pw)
  const hasNumber = /\d/.test(pw)
  const hasLetter = /[a-zA-Z]/.test(pw)

  if (pw.length < 8) passwordError.value = '8자리 이상으로 만드세요'
  else if (!hasLetter) passwordError.value = '알파벳을 포함해야 합니다'
  else if (!hasNumber) passwordError.value = '숫자를 포함해야 합니다'
  else if (!hasSpecial) passwordError.value = '특수문자를 포함해야 합니다'
}

const password2End = () => {
  password2Error.value = ''
  if (password.value !== password2.value) password2Error.value = '비번이 안맞습니다.'
}

const today = new Date().toISOString().split('T')[0]
// ===== 약관 보기 모달 =====
const modalOpen = ref(false)
const modalType = ref(null) // 'agree1' | 'agree2' | 'agree3'

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

const openModal = (type) => {
  modalType.value = type
  modalOpen.value = true
  // 배경 스크롤 잠금
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  modalOpen.value = false
  modalType.value = null
  // 스크롤 잠금 해제
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
}

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


</script>

<template>
  <div class="w-full">
    <h2 class="text-center text-2xl font-extrabold tracking-tight text-gray-900 mb-6 sm:mb-8">
      회원가입
    </h2>

    <form @submit.prevent="handleSignup" class="space-y-5 sm:space-y-6">
      <!-- 이메일 -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">
          이메일
        </label>

        <!-- ✅ 모바일: 세로 / sm+: 가로 -->
        <div class="flex flex-col sm:flex-row gap-2">
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900
                   placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="example@email.com"
          />

         <button
        type="button"
        @click="checkEmail"
        :disabled="emailCheckStatus === true"
        class="h-11 w-full sm:w-auto sm:px-4 rounded-lg px-3
                min-w-[96px] sm:min-w-[112px]
              text-xs font-semibold
              transition
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
              disabled:cursor-not-allowed
              disabled:bg-gray-300
              disabled:text-gray-500"
        :class="emailCheckStatus === true
          ? 'bg-gray-300'
          : 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-600'"
      >
        {{ emailCheckStatus === true ? '확인완료' : '중복확인' }}
      </button>

        </div>

        <p
          v-if="emailCheckStatus !== null"
          class="mt-1.5 text-xs"
          :class="emailCheckStatus ? 'text-green-600' : 'text-red-500'"
        >
          {{ emailCheckMsg }}
        </p>
      </div>

      <!-- 비밀번호 -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">
          비밀번호
        </label>
        <input
          v-model="password"
          @blur="password1End"
          type="password"
          autocomplete="new-password"
          name="new-password"
          required
          class="h-11 block w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900
                 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="알파벳+숫자+특수문자로 8자리 이상 입력하세요"
        />
        <p v-if="passwordError" class="mt-1.5 text-xs text-red-500">
          {{ passwordError }}
        </p>
      </div>

      <!-- 비밀번호 확인 -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">
          비밀번호 확인
        </label>
        <input
          v-model="password2"
          @blur="password2End"
          type="password"
          autocomplete="new-password"
          name="confirm-password"
          required
          class="h-11 block w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900
                 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="비밀번호를 다시 입력하세요"
        />
        <p v-if="password2Error" class="mt-1.5 text-xs text-red-500">
          {{ password2Error }}
        </p>
      </div>

      <!-- 이름 -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">
          이름
        </label>
        <input
          v-model="name"
          type="text"
          autocomplete="name"
          required
          class="h-11 block w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900
                 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="이름을 입력하세요"
        />
      </div>

      <!-- 성별 -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">
          성별
        </label>

        <!-- ✅ 터치 영역 크게 -->
        <div class="flex gap-4">
          <label class="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <input class="size-4" type="radio" value="M" v-model="gender" />
            <span class="text-sm font-medium text-gray-800">남</span>
          </label>

          <label class="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <input class="size-4" type="radio" value="F" v-model="gender" />
            <span class="text-sm font-medium text-gray-800">여</span>
          </label>
        </div>
      </div>

      <!-- 생년월일 -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">
          생년월일
        </label>
         <input
          v-model="birth_date"
          type="date"
          :max="today"
          autocomplete="bday"
          required
          class="appearance-none h-11 block w-full rounded-lg border border-gray-300 bg-white px-3
                text-sm text-gray-900 leading-5
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

      </div>


      <!-- 전화번호 -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">
          전화번호
        </label>
        <input
          v-model="phonenumber"
          type="tel"
          inputmode="numeric"
          pattern="[0-9]*"
          autocomplete="tel"
          maxlength="11"
          required
          class="h-11 block w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900
                 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="- 빼고 숫자만 입력하세요"
        />
      </div>

      <!-- 약관 -->
      <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <label class="flex items-center gap-2 font-semibold text-gray-900">
          <input type="checkbox" class="size-4" v-model="agreeAll" @change="toggleAll" />
          <span class="text-sm">전체 동의</span>
        </label>

        <div class="mt-3 space-y-2">
          <div class="flex items-center justify-between gap-3">
            <label class="flex items-center gap-2">
              <input type="checkbox" class="size-4" v-model="agree1" @change="syncAgreeAll" />
              <span class="text-sm text-gray-800">개인정보 이용 동의</span>
            </label>
            <button
            type="button"
            class="px-2 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-500"
            @click="openModal('agree1')"
          >
            보기
          </button>
          </div>

          <div class="flex items-center justify-between gap-3">
            <label class="flex items-center gap-2">
              <input type="checkbox" class="size-4" v-model="agree2" @change="syncAgreeAll" />
              <span class="text-sm text-gray-800">제3자 정보 제공 동의</span>
            </label>
            <button
          type="button"
          class="px-2 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-500"
          @click="openModal('agree2')"
        >
          보기
        </button>
          </div>

          <div class="flex items-center justify-between gap-3">
            <label class="flex items-center gap-2">
              <input type="checkbox" class="size-4" v-model="agree3" @change="syncAgreeAll" />
              <span class="text-sm text-gray-800">고유식별정보처리 동의</span>
            </label>
            <button
            type="button"
            class="px-2 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-500"
            @click="openModal('agree3')"
          >
            보기
          </button>
          </div>
        </div>
      </div>

      <!-- 에러/성공 -->
      <div v-if="errorMsg || successMsg" class="text-sm">
        <p v-if="errorMsg" class="text-red-500">{{ errorMsg }}</p>
        <p v-if="successMsg" class="text-green-600">{{ successMsg }}</p>
      </div>

      <!-- 제출 버튼 -->
      <button
        type="submit"
        class="h-12 w-full rounded-lg bg-indigo-600 px-4 text-base font-semibold text-white
               shadow-sm hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2
               focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
      >
        회원가입 하기
      </button>
    </form>

    <!-- 약관 보기 모달 -->
<teleport to="body">
  <div v-if="modalOpen" class="fixed inset-0 z-[200]">
    <div class="absolute inset-0 bg-black/60" @click="closeModal"></div>

    <div class="absolute inset-0 flex items-center justify-center p-4">
      <div class="w-full max-w-lg rounded-2xl bg-white shadow-xl border overflow-hidden">
        <!-- header -->
        <div class="flex items-center justify-between px-5 py-4 border-b">
          <h3 class="text-base font-extrabold text-gray-900">{{ modalTitle }}</h3>
          <button
            type="button"
            class="h-9 w-9 rounded-lg hover:bg-gray-100 grid place-items-center"
            @click="closeModal"
            aria-label="닫기"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <!-- body -->
        <div class="max-h-[70vh] overflow-y-auto px-5 py-4">
          <pre class="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 font-sans">{{ modalBody }}</pre>
        </div>

        <!-- footer -->
        <div class="px-5 py-4 border-t flex justify-end gap-2">
          <button
            type="button"
            class="h-10 px-4 rounded-xl border font-semibold text-sm hover:bg-gray-50"
            @click="closeModal"
          >
            닫기
          </button>
          <button
            type="button"
            class="h-10 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500"
            @click="agreeFromModal"
          >
            동의하기
          </button>
        </div>
      </div>
    </div>
  </div>
</teleport>


    <p class="mt-6 text-center text-xs text-gray-500">
      이미 회원이신가요?
      <router-link to="/" class="font-semibold text-indigo-600 hover:text-indigo-500">
        로그인 하러가기
      </router-link>
    </p>
  </div>
</template>

<style scoped>

/* iOS Safari에서 date input 기본 UI가 글씨/정렬을 깨는 경우가 있어 강제로 통일 */
input[type="date"] {
  -webkit-appearance: none;
  appearance: none;
  font-size: 0.875rem;   /* text-sm */
  line-height: 1.25rem;  /* leading-5 */
  padding-top: 0.5rem;   /* py-2 느낌 */
  padding-bottom: 0.5rem;
}

/* iOS에서 달력 아이콘/내부 버튼이 레이아웃 밀면 숨김(필요시) */
input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0.8;
}


</style>
