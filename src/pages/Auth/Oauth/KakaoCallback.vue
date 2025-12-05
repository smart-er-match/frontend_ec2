<script setup>
import { onMounted } from 'vue' 
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { API_BASE_URL } from '../../../config'

const route = useRoute()
const router = useRouter()

onMounted(async () => {

  const code = route.query.code

  if (!code) {
    console.error('카카오 code 없음')
    return
  }

  // Django로 code 전송
  try {
    const res = await axios.post(`${API_BASE_URL}accounts/social/kakao/`, {
      code: code
    })

    // 토큰 저장
    localStorage.setItem('access_token', res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)
    localStorage.setItem('user', JSON.stringify(res.data.user)) 
    router.push('/main')
  } catch (err) {
  console.error('카카오 로그인 에러:', err.response?.data || err)
}
})
</script>
