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
    console.error('Google code 없음')
    router.push({ name: 'home' })
    return
  }

  try {
    const result = await auth.googleCallback(code)
    if (result.ok) {
      router.push({ name: 'main' })
    }
  } catch (err) {
    console.error('Google 로그인 에러:', err?.response?.data || err)
    router.push({ name: 'home' })
  }
})
</script>
