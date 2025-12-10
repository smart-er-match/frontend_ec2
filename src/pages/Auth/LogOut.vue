<script setup>
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const logout = () => {
  // 1. localStorage 비우기
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')

  delete axios.defaults.headers.common['Authorization']

  // 3. 로그인 화면으로 이동 
  router.push({ name: 'home'})
}

</script>

<template>
    <button @click="logout">
        로그아웃
    </button>

</template>

<style scoped>

</style>