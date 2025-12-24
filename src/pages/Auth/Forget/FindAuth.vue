<template>
    <div class="mx-auto w-full max-w-xl">
      <div class="bg-white shadow-sm border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
        <h1 class="text-xl sm:text-2xl font-extrabold mb-6 text-center text-gray-900">
          계정 찾기
        </h1>

        <!-- 이메일(아이디) 찾기 -->
        <section class="space-y-4 text-gray-700 border-b border-slate-200 pb-6">
          <div class="space-y-1">
            <h2 class="text-lg sm:text-xl font-bold">이메일 찾기</h2>
            <p class="text-sm text-gray-500 leading-relaxed">
              가입 시 입력한 이름과 생년월일로<br class="sm:hidden" />
              이메일을 찾아드려요.
            </p>
          </div>

          <form @submit.prevent="onFindEmail" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-1.5 text-gray-700">이름</label>
              <input
                v-model="findEmailForm.name"
                type="text"
                required
                autocomplete="name"
                class="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="이름을 입력하세요"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-1.5 text-gray-700">생년월일</label>
              <input
                v-model="findEmailForm.birth_date"
                type="date"
                required
                autocomplete="bday"
               class="appearance-none h-11 block w-full rounded-lg border border-gray-300 bg-white px-3
                      text-sm text-gray-900 leading-5
                      focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
    

            <button
              type="submit"
              class="h-12 w-full rounded-lg bg-indigo-600 text-white text-base font-semibold
                     hover:bg-indigo-500 active:scale-[0.99] transition
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
            >
              아이디 찾기
            </button>
          </form>

          <!-- 결과 출력 -->
          <p v-if="foundEmail" class="rounded-lg bg-green-50 border border-green-200 p-3 text-center text-green-700 font-semibold text-sm">
            찾은 이메일: {{ foundEmail }}
          </p>
        </section>

        <!-- 비밀번호 찾기 -->
        <section class="space-y-4 text-gray-700 mt-6">
          <div class="space-y-1">
            <h2 class="text-lg sm:text-xl font-bold">비밀번호 찾기</h2>
            <p class="text-sm text-gray-500 leading-relaxed">
              이메일과 생년월일을 입력 후, 인증번호 확인을 완료하면<br class="sm:hidden" />
              비밀번호를 변경할 수 있습니다.
            </p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-1.5 text-gray-700">이메일</label>
              <input
                v-model="findPasswordForm.email"
                type="email"
                autocomplete="email"
                class="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="example@domain.com"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-1.5 text-gray-700">생년월일</label>
              <input
                v-model="findPasswordForm.birth_date"
                type="date"
                autocomplete="bday"
                 class="appearance-none h-11 block w-full rounded-lg border border-gray-300 bg-white px-3
                      text-sm text-gray-900 leading-5
                      focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>

            <!-- 인증번호 전송 + 입력 -->
            <div class="space-y-2">
              <!-- ✅ 모바일: 세로 / sm+: 가로 -->
              <div class="flex flex-col sm:flex-row gap-2">
                <input
                  v-model="findPasswordForm.code"
                  type="text"
                  inputmode="numeric"
                  class="h-11 w-full sm:flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="인증번호를 입력하세요"
                />
                <button
                  type="button"
                  @click="onSendCode"
                  class="h-11 w-full sm:w-auto sm:px-4 rounded-lg border border-indigo-600 text-sm font-semibold
                         text-indigo-600 hover:bg-indigo-50 active:scale-[0.99] transition"
                >
                  인증번호 전송
                </button>
              </div>

              <button
                type="button"
                @click="onVerifyCode"
                class="h-12 w-full rounded-lg bg-indigo-600 text-white text-base font-semibold
                       hover:bg-indigo-500 active:scale-[0.99] transition"
              >
                인증번호 확인
              </button>

              <p v-if="timer > 0" class="text-red-500 font-semibold text-sm">
                남은 시간: {{ timerText }}
              </p>

              <p v-if="isVerified" class="rounded-lg bg-green-50 border border-green-200 p-3 text-center text-green-700 font-semibold text-sm">
                인증이 완료되었습니다.
              </p>
            </div>

            <!-- 인증 완료 후 비밀번호 변경 폼 -->
            <div v-if="isVerified" class="mt-2 border-t border-slate-200 pt-4">
              <ResetPassword
                @submit-password="handlePasswordSubmit"
                @cancel-password="onPasswordCancel"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
</template>


<script setup>
import { reactive, ref, watch } from 'vue'
import ResetPassword from './ResetPassword.vue'
import api from '../../../components/api'
import { useRouter } from 'vue-router'

const router = useRouter()

// 이메일 찾기 폼
const findEmailForm = reactive({
  name: '',
  birth_date: '',
})

const foundEmail = ref('') // 서버에서 응답 받은 이메일 저장용 (임시)

// 비밀번호 찾기 폼
const findPasswordForm = reactive({
  email: '',
  birth_date: '',
  code: '',
})

watch(foundEmail, (newValue) => {
  if (!newValue) return
  // foundEmail이 "찾은 이메일: example" 형식이라면 필요시 정제도 가능
  findPasswordForm.email = newValue
})

const timer = ref(0) // 남은 시간 (초단위)
const timerText = ref("") // 화면에 보여줄 "05:00"
let timerInterval = null



const isVerified = ref(false) // 인증번호 통과 여부

const onFindEmail = async () => {
  // TODO: 이메일 찾기 API 연동
  console.log('이메일 찾기 요청:', findEmailForm)

    try{
        const res = await api.post('accounts/find/email/',
            {
                name: findEmailForm.name,
                birth_date: findEmailForm.birth_date
            }
        ) 
        
        foundEmail.value = `${mail}`
    } catch (err){
        alert("사용 이메일을 찾을 수 없습니다.")
    }

}

const onSendCode = async () => {
  alert('입력하신 이메일로 인증번호를 전송했습니다.')
  startTimer()

  try {
    const res = await api.post('accounts/find/password/send/',
      {
        email: findPasswordForm.email,
        birth_date: findPasswordForm.birth_date,
      },
    )

  } catch (err) {
    console.error(err)
  }
}

const startTimer = () => {
  // 5분 = 300초
  timer.value = 300

  updateTimerText()

  // 기존 인터벌 있으면 제거
  if (timerInterval) clearInterval(timerInterval)

  timerInterval = setInterval(() => {
    timer.value -= 1
    updateTimerText()

    if (timer.value <= 0 && isVerified === false) {
      clearInterval(timerInterval)
      alert("인증 시간이 만료되었습니다. 다시 인증번호를 요청해주세요.")
    }
  }, 1000)
}

const updateTimerText = () => {
  const min = String(Math.floor(timer.value / 60)).padStart(2, "0")
  const sec = String(timer.value % 60).padStart(2, "0")
  timerText.value = `${min}:${sec}`
}


const onVerifyCode = async () => {
    
 try {
    const res = await api.post('accounts/find/password/verify/',
      {
        email: findPasswordForm.email,
        code: findPasswordForm.code
      },
    )
    isVerified.value = true
    timer.value = 0
  } catch (err) {
    console.error(err)
    alert('인증번호가 일치하지 않습니다.')
  }
}


const handlePasswordSubmit = async (payload) => {

 try {
    const res = await api.post('accounts/find/password/reset/',
      {
          email: findPasswordForm.email,
        birth_date: findPasswordForm.birth_date,
        new_password: payload.new_password,
        new_password_confirm: payload.new_password_confirm,

      },
    )
      
    router.push({ name:'home'})
    alert('비밀번호 변경이 왼료되었습니다.')
    
  } catch (err) {
    console.error(err)
    alert('현재 비밀번호가 맞지 않거나 새비밀번호가 일치하지 않습니다.')
  }
}


// ChangePassword에서 취소 눌렀을 때
const onPasswordCancel = () => {
  isVerified.value = false
}
</script>

<style scoped>
</style>
