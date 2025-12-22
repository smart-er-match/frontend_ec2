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

    saveLastLoginProvider(provider) {
      localStorage.setItem('last_login_provider', provider) 
      localStorage.setItem('last_login_at', Date.now().toString())
      // provider: 'email' | 'kakao' | 'naver' | 'google' | 'auto'
    },

    setAuth(accessToken, refreshToken, user) {
      this.access_token = accessToken || ''
      this.refresh_token = refreshToken || ''
      this.user = user || null

      localStorage.setItem('access_token', this.access_token)
      localStorage.setItem('refresh_token', this.refresh_token)
      localStorage.setItem('user', JSON.stringify(this.user))

      axios.defaults.headers.common['Authorization'] = `Bearer ${this.access_token}`
    },

    getAuth() {
      // localStorage에서 유저 정보 및 토큰 가져오기
      const accessToken = localStorage.getItem('access_token')
      const refreshToken = localStorage.getItem('refresh_token')
      const user = JSON.parse(localStorage.getItem('user'))

      // 가져온 데이터가 있다면 상태에 설정
      if (accessToken && refreshToken && user) {
        this.access_token = accessToken
        this.refresh_token = refreshToken
        this.user = user
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.access_token}`;}
        
       else {
       // 데이터가 없으면 초기화
        this.clearAuth()
      }
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
    async login(username, password, auto_login=false) {
      try {
        const res = await api.post(`accounts/login/`, { username, password, auto_login })

        // ✅ 성공 판정은 "access 토큰이 있냐"로 확정
        if (res?.data?.access) {
          this.setAuth(res.data.access, res.data.refresh, res.data.user)
          this.saveLastLoginProvider('email')  

          return { ok: true }
        }

        // 서버가 200으로 실패를 주는 케이스 대응
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
      const auto_login = localStorage.getItem('auto_login') === 'true'
      const res = await api.post('accounts/social/kakao/', { code, auto_login })
      
      this.setAuth(res.data.access, res.data.refresh, res.data.user)
      this.saveLastLoginProvider('kakao')   

      return { ok: true }
    },

    async naverCallback(code, state) {
      const auto_login = localStorage.getItem('auto_login') === 'true'
      const res = await api.post('accounts/social/naver/', { code, state, auto_login })
      
      this.setAuth(res.data.access, res.data.refresh, res.data.user)
      this.saveLastLoginProvider('naver')  
      return { ok: true }
    },

    async googleCallback(code) {
      const auto_login = localStorage.getItem('auto_login') === 'true'
      const res = await api.post('accounts/social/google/', { code, auto_login })
      
      this.setAuth(res.data.access, res.data.refresh, res.data.user)
      this.saveLastLoginProvider('google')
    
      return { ok: true }
    },

    async updateUserInfo() {
      try {
        // API를 통해 사용자 정보 가져오기
        const res = await api.post('accounts/mypage/', {});
        const user = res.data.user;

        if (user) {
          // 사용자 정보 업데이트
          this.user = {
            ...this.user,
            name: user.name || '',
            role: user.role || '',
            birth_date: user.birth_date || '',
            phone_number: user.phone_number || '',
            gender: user.gender || '',
            sign_kind: user.sign_kind || '',
            email: user.email || '',
            token_status: user.token_status || '',
            service_key: user.service_key || '',
          };

          // localStorage에 저장
          console.log(user)
          localStorage.setItem('user', JSON.stringify(this.user));
        } else {
          console.log('사용자 정보가 없습니다.');
        }
      } catch (error) {
        console.error('사용자 정보 갱신 실패:', error);
      }
    },
  },
})
