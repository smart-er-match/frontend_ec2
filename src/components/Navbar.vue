<template>
  <nav class="bg-gray-800 text-white relative">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- 로고 -->
        <button
          class="font-bold tracking-tight"
          @click="router.push({ name: 'home' })"
        >
          Smart ER Match
        </button>

        <!-- 🔹 데스크탑 메뉴 -->
        <div class="hidden md:flex items-center gap-2">
          <button
            v-for="v in protectedNav"
            :key="v.name"
            class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition"
            @click="go(v.name)"
          >
            {{ v.label }}
          </button>

          <!-- 로그인 시에만 내 정보 / 로그아웃 -->
          <button
            v-if="auth.isLoggedIn"
            class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition"
            @click="go('mypage')"
          >
            내 정보
          </button>

          <button
            v-if="auth.isLoggedIn"
            class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition"
            @click="go('logout')"
          >
            로그아웃
          </button>
        </div>

        <!-- 🔹 모바일 햄버거 버튼 -->
        <button
          class="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-700 transition"
          @click="isOpen = !isOpen"
          aria-label="메뉴 열기"
        >
          <svg
            v-if="!isOpen"
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg
            v-else
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 🔹 모바일 메뉴 -->
    <transition name="mobile-menu">
      <div
        v-if="isOpen"
        class="md:hidden absolute top-16 inset-x-0 bg-gray-800 border-t border-gray-700 px-4 py-4 space-y-2 z-50"
      >
        <button
          v-for="v in protectedNav"
          :key="v.name"
          class="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-700 transition"
          @click="handleMobileClick(v.name)"
        >
          {{ v.label }}
        </button>

        <button
          v-if="auth.isLoggedIn"
          class="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-700 transition"
          @click="handleMobileClick('mypage')"
        >
          내 정보
        </button>

        <button
          v-if="auth.isLoggedIn"
          class="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-700 transition"
          @click="handleMobileClick('logout')"
        >
          로그아웃
        </button>
      </div>
    </transition>

    <!-- ✅ Toast -->
    <transition name="toast">
      <div
        v-if="toast.open"
        class="fixed top-6 left-1/2 -translate-x-1/2 z-[9999]
               w-[92vw] max-w-sm rounded-xl bg-black/80 backdrop-blur
               text-white shadow-xl px-4 py-3"
        role="status"
        aria-live="polite"
      >
        <div class="flex items-start gap-3">
          <div class="flex-1">
            <div class="font-semibold text-sm">{{ toast.title }}</div>
            <div class="text-sm opacity-90 mt-1">{{ toast.message }}</div>
          </div>

          <button
            class="shrink-0 text-white/80 hover:text-white transition"
            @click="closeToast"
            aria-label="닫기"
            type="button"
          >
            ✕
          </button>
        </div>

        <div class="mt-3 flex justify-end gap-2" v-if="toast.actionLabel">
          <button
            class="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition text-sm"
            @click="closeToast"
            type="button"
          >
            닫기
          </button>
          <!-- <button
            class="px-3 py-1.5 rounded-md bg-indigo-500 hover:bg-indigo-400 transition text-sm font-semibold"
            @click="toastAction"
            type="button"
          >
            {{ toast.actionLabel }}
          </button> -->
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

// 로그인 상태에서만 "이동 허용"할 메뉴들
const protectedNav = [
  { label: '메인', name: 'main' },
]

const isOpen = ref(false)

// 토스트 상태
const toast = reactive({
  open: false,
  title: '',
  message: '',
  actionLabel: '',
  actionRoute: null,
  _timer: null,
})

function showToast({
  title = '알림',
  message = '',
  actionLabel = '',
  actionRoute = null,
  duration = 2500,
} = {}) {
  toast.title = title
  toast.message = message
  toast.actionLabel = actionLabel
  toast.actionRoute = actionRoute
  toast.open = true

  if (toast._timer) clearTimeout(toast._timer)
  toast._timer = setTimeout(() => {
    toast.open = false
  }, duration)
}

function closeToast() {
  toast.open = false
  if (toast._timer) clearTimeout(toast._timer)
  toast._timer = null
}

function toastAction() {
  if (toast.actionRoute) router.push(toast.actionRoute)
  closeToast()
}

function logout() {
  auth.logout()
  delete axios.defaults.headers.common['Authorization']
  router.push({ name: 'home' })
}

// 이동 제어 함수
function go(routeName) {
  if (routeName === 'logout') {
    logout()
    return
  }

  if (!auth.isLoggedIn) {
    showToast({
      title: '로그인이 필요합니다',
      message: '해당 기능은 로그인 후 이용할 수 있습니다.',
      actionLabel: '홈으로',
      actionRoute: { name: 'home' },
      duration: 3500,
    })
    return
  }

  router.push({ name: routeName })
}

// 모바일에서 메뉴 클릭 시 닫기 포함
function handleMobileClick(routeName) {
  isOpen.value = false
  go(routeName)
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
