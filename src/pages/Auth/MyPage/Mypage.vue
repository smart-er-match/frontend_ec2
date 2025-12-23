<template>
  <div class="min-h-screen bg-slate-100">
    <div
      class="mx-auto mt-6 w-full
             max-w-3xl md:max-w-5xl
             bg-white shadow-sm rounded-2xl border border-slate-200
             px-4 py-6 sm:px-8 sm:py-8"
    >
      <!-- 헤더 -->
      <div class="border-b border-slate-200 pb-4 sm:pb-6">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900 text-center">
          My Page
        </h1>
        <p class="mt-2 text-center text-xs sm:text-sm text-gray-500">
          내 정보를 확인하고 수정할 수 있어요.
        </p>
      </div>

      <!-- 본문 -->
      <div
        class="grid grid-cols-1 md:grid-cols-[260px_1fr]
               gap-6 sm:gap-8 pt-4 sm:pt-6"
      >
        <!-- ================= LEFT : 프로필 / 버튼 ================= -->
        <div class="flex flex-col items-center text-center">
          <div class="flex flex-col items-center gap-3">
            <h2 class="text-base sm:text-lg font-bold text-gray-900">
              {{ form.name || '사용자' }}
            </h2>
          </div>

          <!-- 버튼들 -->
          <div class="mt-5 flex w-full max-w-[240px] gap-2">
            <button
              @click="onClickEditOrSave"
              class="flex-1 rounded-xl bg-indigo-600 py-2 text-sm sm:text-base
                     text-white font-semibold hover:bg-indigo-500 transition"
            >
              {{ isEdit ? '저장' : '회원 정보 수정' }}
            </button>
            <button
              v-if="isEdit"
              @click="onCancel"
              class="w-20 rounded-xl border border-gray-200 bg-white py-2
                     text-sm text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              취소
            </button>
          </div>

          <div class="mt-3 flex w-full max-w-[240px]">
            <button
              @click="onClickAiToken"
              class="flex-1 rounded-xl bg-indigo-600 py-2 text-sm sm:text-base
                     text-white font-semibold hover:bg-indigo-500 transition"
            >
              AI 토큰 발급 신청
            </button>
          </div>

          <div
            v-if="!isChangePasswordEdit && form.sign_kind === 1"
            class="mt-3 flex w-full max-w-[240px]"
          >
            <button
              @click="Withdrawmembership"
              class="flex-1 rounded-xl bg-indigo-600 py-2 text-sm sm:text-base
                     text-white font-semibold hover:bg-indigo-500 transition"
            >
              회원 탈퇴
            </button>
          </div>

          <div
            v-if="!isChangePasswordEdit && form.sign_kind === 1"
            class="mt-3 w-full max-w-[240px]"
          >
            <button
              @click="openChangePassword"
              class="w-full rounded-xl border border-indigo-200 bg-indigo-50
                     py-2 text-sm sm:text-base text-indigo-700 font-semibold
                     hover:bg-indigo-100 transition"
            >
              비밀번호 변경
            </button>
          </div>
        </div>

        <!-- ================= RIGHT : 상세 정보 ================= -->
        <div class="space-y-4 text-gray-800">
          <!-- 자격 -->
          <div class="info-row">
            <span class="info-label">자격</span>
            <div class="info-value">
              <span>{{ form.role ? '의료진' : '일반인' }}</span>
            </div>
          </div>

          <!-- 로그인 계정 -->
          <div class="info-row">
            <span class="info-label">로그인 계정</span>
            <div class="info-value">
              <div class="font-medium text-gray-900 break-all">
                {{ loginData }}
              </div>
              <div class="text-xs sm:text-sm text-gray-500 mt-0.5">
                {{ loginData1 }}
              </div>
            </div>
          </div>

          <!-- 생년월일 -->
          <div class="info-row">
            <span class="info-label">생년월일</span>
            <div class="info-value">
              <span v-if="!isEdit">{{ form.birth_date }}</span>
              <input
                v-else
                v-model="form.birth_date"
                type="date"
                class="w-full max-w-[200px] rounded-lg border border-gray-200
                       px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500
                       focus:outline-none"
              />
            </div>
          </div>

          <!-- 전화번호 -->
          <div class="info-row">
            <span class="info-label">전화번호</span>
            <div class="info-value">
              <span v-if="!isEdit">
                {{ formatPhone(form.phone_number) }}
              </span>
              <input
                v-else
                v-model="form.phone_number"
                type="tel"
                inputmode="numeric"
                maxlength="11"
                @input="onPhoneInput"
                class="w-full max-w-[200px] rounded-lg border border-gray-200
                       px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500
                       focus:outline-none"
              />
            </div>
          </div>

          <!-- 성별 -->
          <div class="info-row">
            <span class="info-label">성별</span>
            <div class="info-value">
              <span v-if="!isEdit">
                {{ form.gender === 'M' ? '남성'
                  : form.gender === 'F' ? '여성'
                  : '' }}
              </span>

              <div v-else class="flex gap-2 justify-end">
                <button
                  type="button"
                  @click="form.gender = 'M'"
                  class="px-3 py-1 rounded-lg border text-xs sm:text-sm font-semibold"
                  :class="form.gender === 'M'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300'"
                >
                  남성
                </button>
                <button
                  type="button"
                  @click="form.gender = 'F'"
                  class="px-3 py-1 rounded-lg border text-xs sm:text-sm font-semibold"
                  :class="form.gender === 'F'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300'"
                >
                  여성
                </button>
              </div>
            </div>
          </div>

          <!-- AI Token -->
          <div class="info-row">
            <span class="info-label">AI Token</span>
            <div class="info-value">
              <span
                class="inline-block w-full sm:w-auto
                       max-w-full sm:max-w-xs
                       break-all text-xs sm:text-sm text-gray-800"
                :title="form.token_status === 3 ? form.service_key : ''"
              >
                {{ tokenStatusText }}
              </span>
            </div>
          </div>

          <!-- 비밀번호 변경 폼 -->
          <change-password
            v-if="isChangePasswordEdit"
            class="mt-4 w-full"
            @submit-password="handlePasswordSubmit"
            @cancel-password="onPasswordCancel"
          />
        </div>
      </div>

      <!-- 내가 찜한 응급실 -->
      <div class="mt-6 px-0 sm:px-2 pb-2">
        <my-er-list
          :bookmarked-hospitals="form.bookmarked_hospitals ?? []"
          @remove-bookmark="onRemoveBookmark"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import api from '../../../components/api'
import ChangePassword from './ChangePassword.vue'
import MyErList from './MyErList.vue'
import router from '../../../router'
import { useAuthStore } from '@/stores/auth'

const storedUserRef = ref(JSON.parse(localStorage.getItem('user') || '{}'))

const form = reactive({
  name: '',
  birth_date: '',
  phone_number: '',
  gender: '',
  sign_kind: '',
  role: '',
  username: '',
  email: '',
  token_status: '',
  service_key: '',
  bookmarked_hospitals: [],
})

const tokenStatusText = computed(() => {
  if (form.token_status === 1) return '발급 진행 중'
  if (form.token_status === 2) return '발급 반려'
  if (form.token_status === 3) {
    const key = String(form.service_key || '')
    if (!key) return '-'
    if (key.length <= 18) return key
    return `${key.slice(0, 10)}...${key.slice(-4)}`
  }
  return '-'
})

const isEdit = ref(false)
const isChangePasswordEdit = ref(false)

const loginData = computed(() => {
  return form.sign_kind === 1
    ? form.username
    : form.sign_kind === 2
    ? form.email
    : form.sign_kind === 3
    ? form.email
    : form.sign_kind === 4
    ? form.email
    : '알 수 없음'
})

const loginData1 = computed(() => {
  return form.sign_kind === 1
    ? '이메일로 로그인하였습니다'
    : form.sign_kind === 2
    ? '카카오로 로그인하였습니다'
    : form.sign_kind === 3
    ? '네이버로 로그인하였습니다'
    : form.sign_kind === 4
    ? '구글로 로그인하였습니다'
    : '알 수 없음'
})

const openChangePassword = () => {
  isChangePasswordEdit.value = true
}

const onPasswordCancel = () => {
  isChangePasswordEdit.value = false
}

const handlePasswordSubmit = async (payload) => {
  try {
    await api.post('accounts/password/change/', {
      old_password: payload.current_password,
      new_password: payload.new_password,
      new_password_confirm: payload.new_password_confirm,
    })

    alert('비밀번호 변경이 완료되었습니다.')
    isChangePasswordEdit.value = false
  } catch (err) {
    console.error(err)
    alert('현재 비밀번호가 맞지 않거나 새 비밀번호가 일치하지 않습니다.')
  }
}

const onPhoneInput = (e) => {
  let onlyNums = e.target.value.replace(/\D/g, '')
  if (onlyNums.length > 11) onlyNums = onlyNums.slice(0, 11)
  form.phone_number = onlyNums
}

const formatPhone = (phone) => {
  if (!phone) return ''
  const cleaned = String(phone).replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  }
  return phone
}

const onClickEditOrSave = async () => {
  if (!isEdit.value) {
    isEdit.value = true
    return
  }
  try {
    await api.patch('accounts/profile/update/', form)
    alert('회원 정보가 저장되었습니다.')
    isEdit.value = false
  } catch (err) {
    console.error(err)
    alert('회원 정보 수정 중 오류가 발생했습니다.')
  }
}

const onCancel = () => {
  const u = storedUserRef.value || {}

  form.name = u?.name || ''
  form.birth_date = u?.birth_date || ''
  form.phone_number = u?.phone_number || ''
  form.gender = u?.gender || ''

  isEdit.value = false
}

const onClickAiToken = () => {
  router.push({ name: 'getaitoken' })
}

const authStore = useAuthStore()

onMounted(async () => {
  await getUser()
})

const getUser = async () => {
  await authStore.updateUserInfo()

  const user = authStore.user
  form.name = user?.name || ''
  form.birth_date = user?.birth_date || ''
  form.phone_number = user?.phone_number || ''
  form.gender = user?.gender || ''
  form.sign_kind = user?.sign_kind || ''
  form.role = user?.role || ''
  form.username = user?.username || ''
  form.email = user?.email || ''
  form.token_status = user?.token_status || ''
  form.service_key = user?.service_key || ''
  form.bookmarked_hospitals = user?.bookmarked_hospitals || []
}

const onRemoveBookmark = async (hpid) => {
  try {
    const res = await api.delete(`hospitals/bookmark/${hpid}/`)
    const { is_bookmarked } = res.data

    if (is_bookmarked === false) {
      form.bookmarked_hospitals = (form.bookmarked_hospitals ?? []).filter(
        (h) => String(h.hpid) !== String(hpid),
      )
    }
    await getUser()
  } catch (err) {
    console.error(err)
    alert('찜 해제 중 오류가 발생했습니다.')
  }
}

const Withdrawmembership = async () => {
  const ok = confirm('정말 회원 탈퇴하시겠습니까?')
  if (!ok) return

  try {
    await api.delete('accounts/profile/delete/')
    authStore.logout()
    alert('회원탈퇴가 완료되었습니다.')
    router.replace({ name: 'home' })
  } catch (err) {
    console.error(err)
    alert('회원탈퇴 중 오류가 발생했습니다.')
  }
}
</script>

<style scoped>
/* 공통 행 스타일: 모바일에서는 세로 정렬 */
.info-row {
  display: flex;
  flex-direction: column;         /* 모바일: label 위, 값 아래 */
  align-items: flex-start;
  gap: 0.35rem;
  padding: 0.75rem 0;             /* py-3 정도 */
  border-bottom: 1px solid #e5e7eb; /* gray-200 비슷한 색 */
}

/* 왼쪽 라벨 */
.info-label {
  font-weight: 600;
  color: #374151;                 /* text-gray-700 느낌 */
  font-size: 0.75rem;             /* text-xs ~ text-sm 사이 */
}

/* 값 영역 */
.info-value {
  width: 100%;
  font-size: 0.875rem;            /* text-sm */
  text-align: left;
  word-break: break-word;         /* 긴 이메일/토큰 줄바꿈 */
}

/* sm 이상에서는 기존 2열 레이아웃 */
@media (min-width: 640px) {
  .info-row {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .info-label {
    font-size: 0.875rem;          /* text-sm */
    white-space: nowrap;
  }

  .info-value {
    text-align: right;
    width: auto;
    max-width: 65%;
  }
}
</style>
