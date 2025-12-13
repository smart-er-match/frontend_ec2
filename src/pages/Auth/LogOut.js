import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export function useLogout() {
  const router = useRouter()
  const auth = useAuthStore()

  const logout = () => {
    auth.logout()
    delete axios.defaults.headers.common['Authorization']
    router.push({ name: 'home' })
  }

  return { logout }
}
