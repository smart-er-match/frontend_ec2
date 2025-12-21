<template>
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
    <form @submit.prevent="handleLogin" class="space-y-6">
      <div>
        <label for="email" class="block text-sm/6 font-medium text-gray-900">Email address</label>
        <div class="mt-2">
          <input
            type="email"
            autocomplete="email"
            required
            class="
              block w-full rounded-md
              bg-white
              px-3 py-2
              text-base text-gray-900
              border border-gray-300
              placeholder:text-gray-500
              focus:border-indigo-600
              focus:ring-2 focus:ring-indigo-500
            "
            v-model="useremail"
          />
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between">
          <label for="password" class="block text-sm/6 font-medium text-gray-900">Password</label>

        </div>

        <div class="mt-2">
          <input
            type="password"
            autocomplete="current-password"
            required
            class="
              block w-full rounded-md
              bg-white
              px-3 py-2
              text-base text-gray-900
              border border-gray-300
              placeholder:text-gray-500
              focus:border-indigo-600
              focus:ring-2 focus:ring-indigo-500
            "
            v-model="password"
          />
        </div>
      </div>
      <!-- ✅ 자동 로그인 + 아이디/비번 찾기 -->
      <div class="flex items-center justify-between">
        <!-- 왼쪽: 자동 로그인 -->
        <label
          class="inline-flex items-center gap-2 text-sm text-gray-900
                select-none cursor-pointer"
        >
          <input
            type="checkbox"
            v-model="autoLogin"
            class="h-4 w-4 rounded border-gray-300
                  text-indigo-600 focus:ring-indigo-500"
          />
          자동 로그인
        </label>

        <!-- 오른쪽: 아이디/비번 찾기 -->
        <router-link
          :to="{ name: 'findauth' }"
          class="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          아이디/비번 찾기
        </router-link>
      </div>

      <!-- 안내 문구는 아래로 -->
      <transition name="bubble">
      <div
        v-if="autoLogin"
        class="relative inline-block -mt-2
              rounded-lg bg-gray-600 px-3 py-2 text-sm text-white shadow-md"
      >
        개인정보 보호를 위해 본인 기기에서만 이용해주세요.

        <!-- 말풍선 꼬리 -->
        <span
            class="absolute -top-[6px] left-4
                  h-0 w-0
                  border-l-[6px] border-r-[6px] border-b-[6px]
                  border-l-transparent border-r-transparent
                  border-b-gray-600"
          ></span>
      </div>
    </transition>


      <p v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</p>

      <div>
        <button
          type="submit"
          class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5
                 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500"
        >
          로그인하기
        </button>
      </div>
    </form>

    <!-- 소셜 로그인 버튼들 (기존 그대로) -->
    <button
      @click="kakaoLogin"
      class="mt-1 w-full relative
            bg-[#FEE500]
            hover:bg-[#FDDC00]
            active:bg-[#F5CF00]
            transition-colors duration-150
            rounded-md px-4 py-2
            flex justify-center items-center"
    >
      <svg class="absolute left-6" width="24" height="24" viewBox="0 0 24 24" fill="#000000">
        <path d="M12 2C6.48 2 2 5.58 2 10c0 2.54 1.64 4.79 4.11 6.24L5 22l5.17-3.02c.58.1 1.18.16 1.83.16 5.52 0 10-3.58 10-8s-4.48-9-10-9z"/>
      </svg>
      <span class="w-full text-black text-sm font-semibold">카카오 로그인</span>
    </button>

    <button
      @click="naverLogin"
      class="mt-1 w-full relative
            bg-[#03C75A]
            hover:bg-[#02B350]
            active:bg-[#029E47]
            transition-colors duration-150
            rounded-md px-4 py-2
            flex justify-center items-center"
    >
      <svg class="absolute left-6" width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M4 4h5.4l4.6 6.4V4H20v16h-5.4l-4.6-6.4V20H4V4z"/>
      </svg>
      <span class="w-full text-white text-sm font-medium">네이버 로그인</span>
    </button>

    <button
      @click="googleLogin"
      class="mt-1 w-full relative
            bg-white
            border border-gray-300
            rounded-md px-4 py-2
            flex justify-center items-center
            transition-all duration-150
            hover:bg-gray-50
            hover:border-gray-400
            hover:shadow-sm
            active:bg-gray-100
            focus:outline-none
            focus:ring-2 focus:ring-blue-500/40"
    >
      <svg class="absolute left-6" width="22" height="22" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.02 1.53 7.4 2.81l5.45-5.45C33.56 3.86 29.2 2 24 2 14.9 2 7.1 7.36 3.5 15.17l6.36 4.94C11.6 13.06 17.3 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.5 24c0-1.64-.15-3.21-.43-4.73H24v9.03h12.7c-.55 2.97-2.2 5.49-4.7 7.18l7.2 5.6C43.73 37.1 46.5 31.1 46.5 24z"/>
        <path fill="#FBBC05" d="M9.86 28.11A14.6 14.6 0 0 1 9.1 24c0-1.43.25-2.82.7-4.11l-6.36-4.94A23.93 23.93 0 0 0 2 24c0 3.86.92 7.5 2.54 10.71l5.32-4.6z"/>
        <path fill="#34A853" d="M24 46c6.2 0 11.4-2.05 15.2-5.6l-7.2-5.6c-2 1.34-4.56 2.14-8 2.14-6.7 0-12.4-3.56-14.14-8.6l-5.32 4.6C7.1 40.64 14.9 46 24 46z"/>
      </svg>
      <span class="w-full text-gray-700 text-sm font-medium">Google 로그인</span>
    </button>

    <div v-if="lastLoginMessage" class="text-center text-gray-600 text-sm mt-2">
      {{ lastLoginMessage }}
    </div>

    <p class="mt-10 text-center text-sm/6 text-gray-900">회원이 아니신가요?</p>
    <router-link
      :to="{ name: 'signup' }"
      class="block text-center text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500"
    >
      회원가입 하러 가기
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()

const useremail = ref('')
const password = ref('')
const errorMsg = ref('')

const auth = useAuthStore()

// ✅ 자동 로그인 체크 상태 (로컬에 저장)
const autoLogin = ref(localStorage.getItem('auto_login') === 'true')

/**
 * ✅ 로그인 페이지 진입 시:
 * - autoLogin=true 이고
 * - 토큰/refresh로 로그인 복구 가능하면
 * => 로그인 페이지 스킵하고 main으로 이동
 */
onMounted(async () => {
  if (!autoLogin.value) return

  // 이미 로그인 상태면 바로 스킵
  if (auth.isAuthenticated) {
    router.replace({ name: 'main' })
    return
  }

  // refresh 토큰으로 자동 로그인 시도
  try {
    const ok = await auth.tryAutoLogin()
    if (ok) {
      router.replace({ name: 'main' })
    }
  } catch (e) {
    // 실패하면 로그인 페이지 그대로 유지
    console.error(e)
  }
})

const handleLogin = async () => {
  errorMsg.value = ''

  try {
    const result = await auth.login(useremail.value, password.value, autoLogin.value)

    if (result.ok) {
      // ✅ 자동 로그인 여부 저장
      localStorage.setItem('auto_login', autoLogin.value ? 'true' : 'false')

      router.replace({ name: 'main' })
      return
    }

    if (result.error_type === 'undefined_email') {
      errorMsg.value = '아이디가 없습니다.'
    } else if (result.error_type === 'wrong_password') {
      errorMsg.value = '비밀번호가 틀렸습니다.'
    } else {
      errorMsg.value = '로그인 실패'
    }
  } catch (err) {
    errorMsg.value = '통신 실패'
    console.error(err)
  }
}

const kakaoLogin = () => {
  localStorage.setItem('auto_login', autoLogin.value ? 'true' : 'false')
  const REST_API_KEY = import.meta.env.VITE_KAKAO_KEY
  const REDIRECT_URI = encodeURIComponent(import.meta.env.VITE_KAKAO_REDIRECT_URI)

  const url =
    'https://kauth.kakao.com/oauth/authorize' +
    `?client_id=${REST_API_KEY}` +
    `&redirect_uri=${REDIRECT_URI}` +
    '&response_type=code'

  window.location.href = url
}

const naverLogin = () => {
  localStorage.setItem('auto_login', autoLogin.value ? 'true' : 'false')
  const clientId = import.meta.env.VITE_NAVER_CLIENT_ID
  const redirectUri = encodeURIComponent(import.meta.env.VITE_NAVER_REDIRECT_URI)

  const state = Math.random().toString(36).substring(2) + Date.now().toString(36)

  const url =
    `https://nid.naver.com/oauth2.0/authorize` +
    `?response_type=code` +
    `&client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&state=${state}`

  window.location.href = url
}

const googleLogin = () => {
  localStorage.setItem('auto_login', autoLogin.value ? 'true' : 'false')
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const redirectUri = encodeURIComponent(import.meta.env.VITE_GOOGLE_REDIRECT_URI)

  const url =
    'https://accounts.google.com/o/oauth2/v2/auth' +
    `?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=profile email`

  window.location.href = url
}

const lastLoginMessage = ref('')

function providerLabel(p) {
  return ({
    email: '이메일',
    kakao: '카카오',
    naver: '네이버',
    google: '구글',
  })[p] || ''
}

onMounted(() => {
  const provider = localStorage.getItem('last_login_provider')
  const at = localStorage.getItem('last_login_at')

  if (!provider || !at) return

  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000
  const isExpired = Date.now() - Number(at) > ONE_WEEK

  if (isExpired) {
    // ✅ 7일 지나면 기록 삭제
    localStorage.removeItem('last_login_provider')
    localStorage.removeItem('last_login_at')
    return
  }

  lastLoginMessage.value = `가장 최근에 ${providerLabel(provider)}로 로그인 하였습니다.`
})

</script>


<style scoped>

.bubble-enter-active,
.bubble-leave-active {
  transition: all 0.15s ease-out;
}

.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.96);
}

.bubble-enter-to,
.bubble-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

</style>
