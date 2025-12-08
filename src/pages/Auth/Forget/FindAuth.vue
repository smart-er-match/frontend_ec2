<template>
  <div class="max-w-xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg dark:bg-gray-800">
    <h1 class="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
      계정 찾기
    </h1>
    <!-- 이메일(아이디) 찾기 -->
    <section class="space-y-4 text-gray-700 dark:text-gray-200 border-b pb-6">

    <h2 class="text-xl font-semibold">이메일 찾기</h2>
    <p class="text-sm text-gray-500 dark:text-gray-400">
        가입 시 입력한 이름과 생년월일로 이메일(아이디)을 찾아드려요.
    </p>

    <form @submit.prevent="onFindEmail" class="space-y-4">

        <div>
        <label class="block text-sm font-medium mb-1">이름</label>
        <input
            v-model="findEmailForm.name"
            type="text"
            required
            class="w-full border rounded-md px-3 py-2 text-gray-900 dark:bg-gray-700 dark:text-white"
            placeholder="이름을 입력하세요"
        />
        </div>

        <div>
        <label class="block text-sm font-medium mb-1">생년월일</label>
        <input
            v-model="findEmailForm.birth_date"
            type="date"
            required
            class="w-full border rounded-md px-3 py-2 text-gray-900 dark:bg-gray-700 dark:text-white"
        />
        </div>

        <button
        type="submit"
        class="w-full bg-indigo-600 text-white font-semibold py-2 rounded-md
                hover:bg-indigo-500 transition dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
        아이디(이메일) 찾기
        </button>

    </form>

    <!-- 결과 출력 -->
    <p v-if="foundEmail" class="mt-3 text-center text-green-600 dark:text-green-500 font-semibold">
        찾은 이메일: {{ foundEmail }}
    </p>
    </section>


    <!-- 비밀번호 찾기 -->
    <section class="space-y-4 text-gray-700 dark:text-gray-200 mt-6">
      <h2 class="text-xl font-semibold">비밀번호 찾기</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        이메일과 생년월일을 입력 후, 인증번호 확인을 완료하면 <br>비밀번호를 변경할 수 있습니다.
      </p>

      <div>
        <label class="block text-sm font-medium mb-1">이메일</label>
        <input
          v-model="findPasswordForm.email"
          type="email"
          class="w-full border rounded-md px-3 py-2 text-gray-900 dark:bg-gray-700 dark:text-white"
          placeholder="example@domain.com"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">생년월일</label>
        <input
          v-model="findPasswordForm.birth_date"
          type="date"
          class="w-full border rounded-md px-3 py-2 text-gray-900 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <!-- 인증번호 전송 + 입력 -->
      <div class="space-y-2">
        <div class="flex gap-2">
          <input
            v-model="findPasswordForm.code"
            type="text"
            class="flex-1 border rounded-md px-3 py-2 text-gray-900 dark:bg-gray-700 dark:text-white"
            placeholder="인증번호를 입력하세요"
          />
          <button
            type="button"
            @click="onSendCode"
            class="whitespace-nowrap px-3 py-2 border rounded-md text-sm font-semibold
                   text-indigo-600 border-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:border-indigo-300 dark:hover:bg-gray-700"
          >
            인증번호 전송
          </button>
        </div>

        <button
          type="button"
          @click="onVerifyCode"
          class="w-full bg-indigo-600 text-white font-semibold py-2 rounded-md
                 hover:bg-indigo-500 transition dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          인증번호 확인
        </button>
        <p v-if="timer > 0" class="text-red-500 font-semibold text-sm">
        남은 시간: {{ timerText }}
        </p>

        <p v-if="isVerified" class="mt-3 text-center text-green-600 dark:text-green-500 font-semibold">
            인증이 완료되었습니다.
        </p>
      </div>

      <!-- 인증 완료 후 비밀번호 변경 폼 노출 -->
      <div v-if="isVerified" class="mt-4 border-t pt-4">
        <ResetPassword
          @submit-password="handlePasswordSubmit"
          @cancel-password="onPasswordCancel"
        />
      </div>
    </section>
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
