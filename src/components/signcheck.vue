<template>
  <!-- 약관 동의 영역 -->
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
    <!-- 전체 동의 -->
    <label class="flex items-center gap-2 font-semibold text-gray-900">
      <input
        type="checkbox"
        class="h-4 w-4"
        v-model="agreeAll"
        @change="toggleAll"
      />
      <span class="text-sm">전체 동의</span>
    </label>

    <hr class="border-gray-200" />

    <!-- 개인정보 이용 동의 -->
    <div class="flex items-center justify-between">
      <label class="flex items-center gap-2">
        <input
          type="checkbox"
          class="h-4 w-4"
          v-model="agree1"
          @change="syncAgreeAll"
        />
        <span class="text-sm text-gray-800">개인정보 이용 동의</span>
        <span class="text-xs text-red-500 font-semibold">(필수)</span>
      </label>

      <button
        type="button"
        class="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
        @click="openModal('agree1')"
      >
        보기
      </button>
    </div>

    <!-- 제3자 정보 제공 동의 -->
    <div class="flex items-center justify-between">
      <label class="flex items-center gap-2">
        <input
          type="checkbox"
          class="h-4 w-4"
          v-model="agree2"
          @change="syncAgreeAll"
        />
        <span class="text-sm text-gray-800">제3자 정보 제공 동의</span>
        <span class="text-xs text-gray-500 font-semibold">(선택)</span>
      </label>

      <button
        type="button"
        class="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
        @click="openModal('agree2')"
      >
        보기
      </button>
    </div>

    <!-- 고유식별정보 처리 동의 -->
    <div class="flex items-center justify-between">
      <label class="flex items-center gap-2">
        <input
          type="checkbox"
          class="h-4 w-4"
          v-model="agree3"
          @change="syncAgreeAll"
        />
        <span class="text-sm text-gray-800">고유식별정보처리 동의</span>
        <span class="text-xs text-gray-500 font-semibold">(선택)</span>
      </label>

      <button
        type="button"
        class="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
        @click="openModal('agree3')"
      >
        보기
      </button>
    </div>
  </div>

  <!-- 약관 보기 모달 -->
  <teleport to="body">
    <div v-if="modalOpen" class="fixed inset-0 z-[200]">
      <!-- overlay -->
      <div
        class="absolute inset-0 bg-black/60"
        @click="closeModal"
      ></div>

      <!-- modal -->
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="w-full max-w-lg rounded-2xl bg-white shadow-xl border overflow-hidden">
          <!-- header -->
          <div class="flex items-center justify-between px-5 py-4 border-b">
            <h3 class="text-base font-extrabold text-gray-900">
              {{ modalTitle }}
            </h3>
            <button
              type="button"
              class="h-9 w-9 rounded-lg hover:bg-gray-100 grid place-items-center"
              @click="closeModal"
            >
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <!-- body -->
          <div class="max-h-[70vh] overflow-y-auto px-5 py-4">
            <pre class="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 font-sans">
{{ modalBody }}
            </pre>
          </div>

          <!-- footer -->
          <div class="px-5 py-4 border-t flex justify-end gap-2">
            <button
              type="button"
              class="h-10 px-4 rounded-xl border font-semibold text-sm hover:bg-gray-50"
              @click="closeModal"
            >
              닫기
            </button>

            <button
              type="button"
              class="h-10 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500"
              @click="agreeFromModal"
            >
              동의하기
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

/* =====================
   체크 상태
===================== */
const agreeAll = ref(false)
const agree1 = ref(false) // 개인정보 (필수)
const agree2 = ref(false) // 제3자 (선택)
const agree3 = ref(false) // 고유식별 (선택)

const toggleAll = () => {
  const v = agreeAll.value
  agree1.value = v
  agree2.value = v
  agree3.value = v
}

const syncAgreeAll = () => {
  agreeAll.value = agree1.value && agree2.value && agree3.value
}

/* =====================
   모달 상태
===================== */
const modalOpen = ref(false)
const modalType = ref(null) // 'agree1' | 'agree2' | 'agree3'

const openModal = (type) => {
  modalType.value = type
  modalOpen.value = true
  lockScroll()
}

const closeModal = () => {
  modalOpen.value = false
  modalType.value = null
  unlockScroll()
}

const agreeFromModal = () => {
  if (modalType.value === 'agree1') agree1.value = true
  if (modalType.value === 'agree2') agree2.value = true
  if (modalType.value === 'agree3') agree3.value = true
  syncAgreeAll()
  closeModal()
}

/* =====================
   약관 텍스트
===================== */
const PRIVACY_TEXT = `[개인정보 수집 및 이용 동의]

수집 항목: 이메일, 비밀번호
수집 목적: 회원가입 및 서비스 제공
보유 기간: 회원 탈퇴 시까지

동의를 거부할 권리가 있으나,
동의하지 않을 경우 회원가입이 제한될 수 있습니다.
`

const THIRD_TEXT = `[제3자 정보 제공 동의]

제공받는 자: (주)카카오, Google LLC, 네이버(주)
제공 목적: 소셜 로그인 연동
제공 항목: 이메일
보유 기간: 제공 목적 달성 시까지
`

const UNIQUE_TEXT = `[고유식별정보처리 동의]

본 서비스는 주민등록번호, 여권번호, 운전면허번호 등
고유식별정보를 수집·처리하지 않습니다.
`

const modalTitle = computed(() => {
  if (modalType.value === 'agree1') return '개인정보 수집 및 이용 동의'
  if (modalType.value === 'agree2') return '제3자 정보 제공 동의'
  if (modalType.value === 'agree3') return '고유식별정보처리 동의'
  return ''
})

const modalBody = computed(() => {
  if (modalType.value === 'agree1') return PRIVACY_TEXT
  if (modalType.value === 'agree2') return THIRD_TEXT
  if (modalType.value === 'agree3') return UNIQUE_TEXT
  return ''
})

/* =====================
   스크롤 잠금 + ESC
===================== */
const lockScroll = () => {
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
}

const unlockScroll = () => {
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
}

const onKeydown = (e) => {
  if (e.key === 'Escape' && modalOpen.value) closeModal()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  unlockScroll()
})

/* 👉 부모에서 쓰고 싶으면 expose 가능
defineExpose({
  agree1, // 필수 동의 여부
})
*/
</script>
