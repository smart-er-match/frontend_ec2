<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  const code = route.query.code

  if (!code) {
    console.error('카카오 code 없음')
    router.push({ name: 'home' })
    return
  }

  try {
    const result = await auth.kakaoCallback(code)
    if (result.ok) {
      router.push({ name: 'main' }) // '/main' 말고 name 추천
    }
  } catch (err) {
    console.error('카카오 로그인 에러:', err?.response?.data || err)
    router.push({ name: 'home' })
  }
})
</script>
