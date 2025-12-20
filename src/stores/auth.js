import { defineStore } from 'pinia'
import axios from 'axios'
import api from '../components/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    access_token: localStorage.getItem('access_token') || '',
    refresh_token: localStorage.getItem('refresh_token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),

  getters: {
    // ✅ Login.vue에서 쓰는 이름으로 통일
    isAuthenticated: (state) => !!state.access_token,
    // (기존 이름도 유지해도 됨)
    isLoggedIn: (state) => !!state.access_token,
  },

  actions: {
    setAuth(accessToken, refreshToken, user) {
      this.access_token = accessToken || ''
      this.refresh_token = refreshToken || ''
      this.user = user || null

      localStorage.setItem('access_token', this.access_token)
      localStorage.setItem('refresh_token', this.refresh_token)
      localStorage.setItem('user', JSON.stringify(this.user))

      axios.defaults.headers.common['Authorization'] = `Bearer ${this.access_token}`
    },

    clearAuth() {
      this.access_token = ''
      this.refresh_token = ''
      this.user = null

      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')

      delete axios.defaults.headers.common['Authorization']
    },

    logout() {
      localStorage.setItem('auto_login', 'false')
      this.clearAuth()
    },

    hydrate() {
      this.access_token = localStorage.getItem('access_token') || ''
      this.refresh_token = localStorage.getItem('refresh_token') || ''
      this.user = JSON.parse(localStorage.getItem('user') || 'null')

      if (this.access_token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.access_token}`
      }
    },

    // ✅ 로그인
    async login(username, password) {
      console.log("111")
      try {
        const res = await api.post(`accounts/login/`, { username, password })

        console.log("333")
        // ✅ 성공 판정은 "access 토큰이 있냐"로 확정
        if (res?.data?.access) {
          this.setAuth(res.data.access, res.data.refresh, res.data.user)
          return { ok: true }
        }

        // 서버가 200으로 실패를 주는 케이스 대응
        console.log("2222")
        return {
          ok: false,
          error_type: res?.data?.error_type || 'unknown',
        }
      } catch (err) {
        // ✅ 실패 시 기존 토큰이 남아서 "로그인 상태"로 인식되는 문제 방지
        this.clearAuth()

        return {
          ok: false,
          error_type: err?.response?.data?.error_type || 'network_or_auth_error',
        }
      }
    },

    // ✅ 자동 로그인 (refresh로 access 재발급)
    async tryAutoLogin() {
      try {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) return false

        // 너 백엔드 refresh 엔드포인트로 맞춰
        const res = await api.post('accounts/token/refresh/', { refresh })
        if (!res?.data?.access) return false

        // access만 갱신 (refresh는 그대로 두는 경우 많음)
        this.access_token = res.data.access
        localStorage.setItem('access_token', res.data.access)
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`

        return true
      } catch (e) {
        this.clearAuth()
        localStorage.setItem('auto_login', 'false')
        return false
      }
    },

    async kakaoCallback(code) {
      const res = await api.post('accounts/social/kakao/', { code })
      this.setAuth(res.data.access, res.data.refresh, res.data.user)
      return { ok: true }
    },

    async naverCallback(code, state) {
      const res = await api.post('accounts/social/naver/', { code, state })
      this.setAuth(res.data.access, res.data.refresh, res.data.user)
      return { ok: true }
    },

    async googleCallback(code) {
      const res = await api.post('accounts/social/google/', { code })
      this.setAuth(res.data.access, res.data.refresh, res.data.user)
      return { ok: true }
    },
  },
})
