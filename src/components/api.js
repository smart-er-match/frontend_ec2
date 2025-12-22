// src/api.js
import axios from 'axios'
import { API_BASE_URL } from '../config'
import router from '../router'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// ✅ refresh 로직에서 제외할 인증 관련 URL들
const AUTH_EXCLUDE_PATHS = [
  'accounts/login/',
  'accounts/token/refresh/',
  'accounts/signup/',
  'accounts/social/', 
  // 'hospitals/chatbot/',
  // kakao/naver/google 등
]

// ====== 요청 인터셉터: 매 요청마다 access 토큰 자동 첨부 ======
api.interceptors.request.use((config) => {
  const url = config?.url || ''
  const isExcluded = AUTH_EXCLUDE_PATHS.some((p) => url.includes(p))

  if (!isExcluded) {
    const access = localStorage.getItem('access_token')
    if (access) config.headers.Authorization = `Bearer ${access}`
  }

  return config
})


// 동시 요청 대비용
let isRefreshing = false
let pendingRequests = []

const onRefreshed = (newToken) => {
  pendingRequests.forEach((cb) => cb(newToken))
  pendingRequests = []
}

// ====== 응답 인터셉터: 401이면 refresh 토큰으로 재발급 ======
api.interceptors.response.use(
  (response) => response,
 async (error) => {
  const originalRequest = error.config
  const status = error?.response?.status
  const url = originalRequest?.url || ''

  // 순환 참조 방지: error.config와 error.response를 JSON.stringify로 안전하게 처리
console.log('[API ERROR]', {
  status,
  url,
  method: originalRequest?.method,
  data: error?.response?.data,
})

  // ✅ 1) 인증 관련 요청은 401이어도 refresh/redirect 로직 금지
  if (AUTH_EXCLUDE_PATHS.some((p) => url.includes(p))) {
    return Promise.reject(error)
  }

  // ✅ 2) 401 아니거나, 이미 재시도한 요청이면 그대로 에러
  if (!status || status !== 401 || originalRequest?._retry) {
    return Promise.reject(error)
  }

  originalRequest._retry = true

  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) {
    // refresh도 없으면 로그인부터
    router.push('/login')
    return Promise.reject(error)
  }

  // 이미 다른 요청이 refresh 중일 때는 끝날 때까지 대기
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      pendingRequests.push((newToken) => {
        if (!newToken) {
          reject(error)
          return
        }
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        resolve(api(originalRequest))
      })
    })
  }

  isRefreshing = true

  try {
    // ✅ refresh는 api 말고 axios로 (Authorization 끼지 않게)
    const res = await axios.post(`${API_BASE_URL}accounts/token/refresh/`, { refresh })

    const newAccess = res?.data?.access
    if (!newAccess) throw new Error('No access token in refresh response')

    localStorage.setItem('access_token', newAccess)
    api.defaults.headers.common.Authorization = `Bearer ${newAccess}`

    onRefreshed(newAccess)
    isRefreshing = false

    // 원래 요청 재시도
    originalRequest.headers.Authorization = `Bearer ${newAccess}`
    return api(originalRequest)
  } catch (refreshError) {
    isRefreshing = false
    onRefreshed(null)

    // refresh 실패 → 완전 로그아웃 처리
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.setItem('auto_login', 'false')

    router.push({ name: 'home' })
    return Promise.reject(refreshError)
  }
}

)

export default api
