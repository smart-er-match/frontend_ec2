<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { API_BASE_URL } from '../../config'

const router = useRouter()

const useremail = ref('')
const password = ref('')
const errorMsg = ref('')


const handleLogin = async () => {
  try {
    const res = await axios.post(`${API_BASE_URL}accounts/login/`,{
      username: useremail.value,
      password: password.value,
    })
    if (res.data.error_type === ''){
      localStorage.setItem('access_token', res.data.access)
      localStorage.setItem('refresh_token', res.data.refresh)
      localStorage.setItem('user', JSON.stringify(res.data.user)) 
      
      router.push({ name:'main'})
    } else if (res.data.error_type === 'undefined_email') {
      errorMsg.value = '아이디가 없습니다.'
    } else if (res.data.error_type === 'wrong_password') {
      errorMsg.value = '비밀번호가 틀렸습니다.'
    } else (errorMsg.value = '예외')


  }catch (err){
    errorMsg.value = '통신 실패'
    console.error(err)
  }
}

const kakaoLogin = () => {
  const REST_API_KEY = import.meta.env.VITE_KAKAO_KEY
  const REDIRECT_URI = encodeURIComponent(import.meta.env.VITE_KAKAO_REDIRECT_URI)

  const url =
    'https://kauth.kakao.com/oauth/authorize' +
    `?client_id=${REST_API_KEY}` +
    `&redirect_uri=${REDIRECT_URI}` +
    '&response_type=code'

  window.location.href = url
};


const naverLogin = () => {
  const clientId = import.meta.env.VITE_NAVER_CLIENT_ID
  const redirectUri = encodeURIComponent(import.meta.env.VITE_NAVER_REDIRECT_URI)

  // CSRF용도
  const state = Math.random().toString(36).substring(2) + Date.now().toString(36)

  const url =
    `https://nid.naver.com/oauth2.0/authorize` +
    `?response_type=code` +
    `&client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&state=${state}`

  // 디버깅용
  console.log('NAVER URL:', url)

  window.location.href = url
}



</script>

<template>

    <div class=" sm:mx-auto sm:w-full sm:max-w-sm">
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="block text-sm/6 font-medium text-gray-900">Email address</label>
          <div class="mt-2">
            <input 
              type="email" 
              autocomplete="email" 
              required="" 
              class="
                block w-full rounded-md 
                bg-white        /* 배경 확실하게 */
                px-3 py-2 
                text-base text-gray-900 
                border border-gray-300   /* outline 대신 border 사용 */
                placeholder:text-gray-500 
                focus:border-indigo-600 
                focus:ring-2 focus:ring-indigo-500 
              "
              v-model = "useremail"
              />
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm/6 font-medium text-gray-900">Password</label>
            <div class="text-sm">
              <router-link 
                :to="{ name: 'resetpassword' }" 
                class="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                > 
                Forgot password?
              </router-link>
              
            </div>
          </div>
          <div class="mt-2">
            <input 
              type="password" 
              autocomplete="current-password" 
              required="" 
              class="
                block w-full rounded-md 
                bg-white        /* 배경 확실하게 */
                px-3 py-2 
                text-base text-gray-900 
                border border-gray-300   /* outline 대신 border 사용 */
                placeholder:text-gray-500 
                focus:border-indigo-600 
                focus:ring-2 focus:ring-indigo-500 
              "
              v-model = "password"
              />
          </div>
        </div>
        <p v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</p>
        <div>
          <button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500">
            로그인하기
          </button>
        </div>
      </form>



      <button 
        @click="kakaoLogin"
        class="mt-1 w-full relative bg-[#FEE500] rounded-md px-4 py-2 flex justify-center items-center"
      >
        <!-- 아이콘: 왼쪽 고정 배치 -->
        
        <svg 
          class="absolute left-6"
          width="24" height="24" viewBox="0 0 24 24" fill="#000000"
        >
          <path d="M12 2C6.48 2 2 5.58 2 10c0 2.54 1.64 4.79 4.11 6.24L5 22l5.17-3.02c.58.1 1.18.16 
                  1.83.16 5.52 0 10-3.58 10-8s-4.48-9-10-9z"/>
        </svg>

        <!-- 중앙 텍스트 -->
        <span class="w-full text-black font-medium text-sm font-semibold">
          카카오 로그인
        </span>
      </button>

      <button 
        @click="naverLogin"
        class="mt-1 w-full relative bg-[#03C75A] rounded-md px-4 py-2 flex justify-center items-center"
      >
        <!-- 네이버 로고 아이콘 (N 로고) -->
        <svg 
          class="absolute left-6"
          width="22" height="22" viewBox="0 0 24 24" fill="white"
        >
          <path d="M4 4h5.4l4.6 6.4V4H20v16h-5.4l-4.6-6.4V20H4V4z"/>
        </svg>

        <!-- 중앙 텍스트 -->
        <span class="w-full text-white font-medium text-sm">
          네이버 로그인
        </span>
      </button>


      <p class="mt-10 text-center text-sm/6 text-gray-500 dark:text-gray-400">
        회원이 아니신가요?
      </p>  
        <router-link
          :to="{ name: 'signup' }"
          class="block text-center text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500"
        >
          회원가입 하러 가기
        </router-link>
      
    </div>


</template>


<style scoped>


</style>