import { defineStore } from 'pinia'
import axios from 'axios'
import { API_BASE_URL } from '@/config' // 너 프로젝트 경로에 맞게
import api from '../components/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    access_token: localStorage.getItem('access_token') || '',
    refresh_token: localStorage.getItem('refresh_token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),

  getters: {
    isLoggedIn: (state) => !!state.access_token,
  },

  actions: {
    setAuth(accessToken, refreshToken, user) {
      this.access_token = accessToken
      this.refresh_token = refreshToken
      this.user = user

      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))

      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    },

    logout() {
      this.access_token = ''
      this.refresh_token = ''
      this.user = null

      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')

      delete axios.defaults.headers.common['Authorization']
    },

    hydrate() {
      this.access_token = localStorage.getItem('access_token') || ''
      this.refresh_token = localStorage.getItem('refresh_token') || ''
      this.user = JSON.parse(localStorage.getItem('user') || 'null')

      if (this.access_token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.access_token}`
      }
    },

    // ✅ 로그인 로직을 store로 이동
    async login(username, password) {
      const res = await api.post(`accounts/login/`, {
        username,
        password,
      })

      // 서버가 주는 에러 타입 분기
      if (res.data.error_type === '') {
        this.setAuth(res.data.access, res.data.refresh, res.data.user)
        return { ok: true }
      }

      return { ok: false, error_type: res.data.error_type }
    },

    
    async kakaoCallback(code) {
      const res = await api.post('accounts/social/kakao/', { code })

      // 응답이 access/refresh/user 준다는 가정 (네 코드 기준)
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
    }

  },
})
