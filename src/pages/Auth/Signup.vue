<script setup>
import { ref } from 'vue';
import { API_BASE_URL } from '../../config';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const password2 = ref('')
const errorMsg = ref('')
const successMsg = ref('') 
const gender = ref('M') 
const phonenumber = ref('') 
const birth_date = ref('')
const emailCheckMsg = ref('')
const emailCheckStatus = ref(null)  
const passwordError = ref('')
const password2Error = ref('')
const agree1 = ref(false)
const agree2 = ref(false)
const agree3 = ref(false)
const agreeAll = ref(false);

const toggleAll = () => {
  agree1.value = agreeAll.value;
  agree2.value = agreeAll.value;
  agree3.value = agreeAll.value;
};

const syncAgreeAll = () => {
  agreeAll.value = agree1.value && agree2.value && agree3.value;
};


const checkEmail = async () => {
  try{
    const res = await axios.get(`${API_BASE_URL}accounts/signup/uu/`, {
        params: {                     
        username: email.value,
      },
    })
    if(res.data.bool_uu == true){
      emailCheckStatus.value = true
      emailCheckMsg.value = '사용 가능한 이메일입니다.'
    }else{
      emailCheckStatus.value = false
      emailCheckMsg.value = '중복된 이메일입니다.'
    }
    }catch (err){
      console.error(err)
      emailCheckStatus.value = null
      emailCheckMsg.value = '검사 중 오류 발생'
    }
}

const handleSignup = async () => {

  if(emailCheckStatus.value === true &&
  passwordError.value === '' &&
  password2Error.value === ''){
    try {
    await axios.post(`${API_BASE_URL}accounts/signup/`,{
      username: email.value,
      password: password.value,
      name: name.value,
      phone_number: phonenumber.value,
      birth_date: birth_date.value,
      gender: gender.value,
      email: email.value
    })
    router.push('/')
  }catch (err){
    errorMsg.value = '회원가입 실패'
    console.error(err)
  }
  }else{
    errorMsg.value = '뭐가 제대로 안돼있어요'
  }

}

const password1End = () => {
  const pw = password.value
  passwordError.value = ""

  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pw)
  const hasNumber = /\d/.test(pw)
  const hasLetter = /[a-zA-Z]/.test(pw)

  if (pw.length < 8) {
    passwordError.value = "8자리 이상으로 만드세요"
  } else if (!hasLetter) {
    passwordError.value = "알파벳을 포함해야 합니다"
  } else if (!hasNumber) {
    passwordError.value = "숫자를 포함해야 합니다"
  } else if (!hasSpecial) {
    passwordError.value = "특수문자를 포함해야 합니다"
  }
}

const password2End = () =>{
  password2Error.value = ""
  if(password.value !== password2.value){
    password2Error.value = "비번이 안맞습니다."
  }
}

</script>

<template>
      <router-link 
      :to="{ name: 'home'}"
      class="block text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500"
    >
    뒤로 가기
    </router-link>
  <div>
    <h2 class="text-center text-2xl font-bold tracking-tight text-gray-900 mb-8">
      회원가입
    </h2>

    <form @submit.prevent="handleSignup" class="space-y-6">
  
      <!-- 이메일 -->
      <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
          이메일
      </label>

      <div class="flex gap-2">
          <!-- 이메일 입력 -->
          <input
          v-model="email"
          type="email"
          autocomplete="email"
          required
          class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="example@email.com"
          />

          <!-- 중복확인 버튼 -->
          <button
          type="button"
          @click="checkEmail"
          class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
          >
          중복확인
          </button>
      </div>
      <div
        class="mx-2"
        v-if="emailCheckStatus !== null" 
        :class="emailCheckStatus ? 'text-green-500' : 'text-red-500', 'text-xs mt-1'  "
      >
        {{ emailCheckMsg }}
      </div>

      </div>
      

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          비밀번호
        </label>
        <input
          v-model="password"
          @blur="password1End"
          type="password"
          autocomplete="new-password"
          name="new-password" 
          required
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="알파벳+숫자+특수문자로 8자리 이상 입력하세요"
        />
      <div v-if="passwordError" class="mx-2 text-red-500 text-xs mt-1">
        {{ passwordError }}
      </div>

      </div>

      <!-- 비밀번호 확인 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          비밀번호 확인
        </label>
        <input
          v-model="password2"
          @blur="password2End"
          type="password"
          autocomplete="new-password"
          name="confirm-password" 
          required
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="비밀번호를 다시 입력하세요"
        />
      <div v-if="password2Error" class="mx-2  text-red-500 text-xs mt-1">
        {{ password2Error }}
      </div>
      </div>
        




      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          이름
        </label>
        <input
          v-model="name"
          type="text"
          autocomplete="name"
          required
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="이름을 입력하세요"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          성별
        </label>

        <!-- 성별 선택 라디오 -->
        <div class="flex gap-4 mb-2">
          <label class="flex items-center gap-1">
            <input type="radio" value="M" v-model="gender" />
            남
          </label>

          <label class="flex items-center gap-1">
            <input type="radio" value="F" v-model="gender" />
            여
          </label>

      
          </div>
        </div>


      <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
          생년월일
      </label>
      <input
          v-model="birth_date"
          type="date"
          autocomplete="bday"
          required
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      </div>
      
      <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
          전화번호
          </label>
          <input
              v-model="phonenumber"
              type="tel"
              inputmode="numeric"
              pattern="[0-9]*"
              autocomplete="tel" 
              required
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder=" - 빼고 숫자만 입력하세요"
          />
      </div>


     <div class="border-t pt-4 mt-4">
        <div class="flex items-center mb-3">
          <input type="checkbox" class="mr-2" v-model="agreeAll" @change="toggleAll"/>
          <span>전체 동의</span>
        </div>

        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center">
            <input type="checkbox" v-model="agree1" class="mr-2" @change="syncAgreeAll"/>
            <span class="text-sm">개인정보 이용 동의</span>
          </div>
          <button class="text-blue-500 text-xs">보기</button>
        </div>

        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center">
            <input type="checkbox" v-model="agree2" class="mr-2" @change="syncAgreeAll"/>
            <span class="text-sm">제3자 정보 제공 동의</span>
          </div>
          <button class="text-blue-500 text-xs">보기</button>
        </div>

        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <input type="checkbox" v-model="agree3" class="mr-2" @change="syncAgreeAll"/>
            <span class="text-sm">고유식별정보처리 동의</span>
          </div>
          <button class="text-blue-500 text-xs">보기</button>
        </div>
      </div>

      <!-- 에러 / 성공 메시지 -->
      <div v-if="errorMsg || successMsg" class="text-sm">
        <p v-if="errorMsg" class="text-red-500">
          {{ errorMsg }}
        </p>
        <p v-if="successMsg" class="text-green-600">
          {{ successMsg }}
        </p>
      </div>

      <!-- 버튼 -->
      <div>
        <button
          type="submit"
          class="w-full flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
        >
          회원가입 하기
        </button>
      </div>
    </form>

    <!-- 로그인 링크 -->
    <p class="mt-6 text-center text-xs text-gray-500">
      이미 회원이신가요?
      <router-link
        to="/"
        class="font-semibold text-indigo-600 hover:text-indigo-500"
      >
        로그인 하러가기
      </router-link>
    </p>
    </div>
</template>

<style scoped>

</style>