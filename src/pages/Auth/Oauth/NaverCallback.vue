<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  const code = route.query.code
  const state = route.query.state

  if (!code) {
    console.error('네이버 code 없음')
    router.push({ name: 'home' })
    return
  }

  try {
    const result = await auth.naverCallback(code, state)
    if (result.ok) {
      router.push({ name: 'main' })
    }
  } catch (err) {
    console.error('네이버 로그인 에러:', err?.response?.data || err)
    router.push({ name: 'home' })
  }
})
</script>
