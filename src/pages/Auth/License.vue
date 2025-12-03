<script setup>
import axios from 'axios'
import { ref } from 'vue'
import { API_BASE_URL } from '../../config'
import { useRouter } from 'vue-router';

const router = useRouter()
const selectedCert = ref(null)
const name = ref('')
const birth = ref('')
const phoneNumber = ref('')
const juminHead = ref('')
const juminTail = ref('')
const agree1 = ref(false)
const agree2 = ref(false)
const agree3 = ref(false)
const errorMsg = ref('')
const agreeAll = ref(false);
const access = localStorage.getItem('access_token')

const toggleAll = () => {
  agree1.value = agreeAll.value;
  agree2.value = agreeAll.value;
  agree3.value = agreeAll.value;
};

const syncAgreeAll = () => {
  agreeAll.value = agree1.value && agree2.value && agree3.value;
};

const certList = [
  { id: 0, name: "카카오", img: "/cert/kakao.png" },
  { id: 1, name: "삼성패스", img: "/cert/pass.jpg" },
  { id: 2, name: "페이코", img: "/cert/payco.jpg" },
  { id: 3, name: "PASS", img: "/cert/tel.jpg" },
  { id: 4, name: "네이버", img: "/cert/naver.png" },
  { id: 5, name: "신한인증서", img: "/cert/shinhan.png" },
]

const handleLogin = async () => {

  if(selectedCert.value === null){
    errorMsg.value = '간편인증 선택하세요'
    return
  }

  if(agree1.value && agree2.value && agree3.value){
    try {
      const res = await axios.post(`${API_BASE_URL}accounts/paramedic/apply/`,{
        LOGINOPTION: selectedCert.value,
        JUMIN: juminHead.value + juminTail.value,
        DSNM: name.value,
        PHONENUM: phoneNumber.value,
        TELECOMGUBUN: 1,
      },{
          headers: {
            Authorization: `Bearer ${access}`,
            // 필요하면 아래도 가능
            // 'Content-Type': 'application/json',
          },})

      localStorage.setItem('role', res.data.result)
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      storedUser.role = res.data.result   // 또는 true/false에 맞게
      localStorage.setItem('user', JSON.stringify(storedUser))

      router.push('/main')

    }catch (err){
      errorMsg.value = '인증할 수 없는 사용자입니다.'
      console.error(err)
    }
  }else{
    errorMsg.value = "동의 진행 바랍니다."
  }
}

</script>

<template>
    <router-link
      to="/main"
      class="block text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500"
    >
      뒤로가기
    </router-link>
  <form @submit.prevent="handleLogin" class="space-y-6">
    <!-- ===== 왼쪽: 민간 인증서 선택 ===== -->
    <div class="bg-white p-6 border rounded-lg">
      <h2 class="text-lg font-semibold mb-4">간편인증</h2>

      <div class="grid grid-cols-3 gap-3">
      <label 
        v-for="item in certList" 
        :key="item.id"
        class="flex flex-col items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50"
        :class="{ 'border-blue-500 bg-blue-50': selectedCert === item.id }"
      >
        <input 
          type="radio" 
          class="hidden"
          name="certSelect"
          :value="item.id"
          v-model="selectedCert"
        />

        <img :src="item.img" class="w-10 h-10" />
        <span class="text-xs mt-1">{{ item.name }}</span>

         <div class="mt-1 h-2 flex items-center justify-center">
          <div 
            v-if="selectedCert === item.id" 
            class="w-2 h-2 bg-black rounded-full"
          ></div>
        </div>
      </label>
    </div>
    </div>
    
      <!-- 이름 -->
      <div class="mt-2 mb-4">
        <label class="text-sm">이름</label>
        <input
          v-model="name"
          type="text"
          required
          class="w-full border p-2 rounded mt-1"
          placeholder="홍길동"
        />
      </div>

      <!-- 생년월일 -->
      <div class="mb-4">
        <label class="text-sm">생년월일</label>
        <input
          v-model="birth"
          type="numeric"
          maxlength="8"
          required
          class="w-full border p-2 rounded mt-1"
          placeholder="19900101"
        />
      </div>

      <!-- 전화번호 -->
      <div class="mb-4">
        <label class="text-sm">휴대폰 번호</label>
        <div class="flex gap-2 mt-1">
          <input
            v-model="phoneNumber"
            type="numeric"
            maxlength="11"
            required
            class="flex-1 border p-2 rounded"
            placeholder="- 빼고 숫자만 입력하세요"
          />
        </div>
      </div>

      <div class="mb-4">
      <label class="text-sm">주민 번호</label>

      <div class="flex gap-2 mt-1">

      <!-- 앞 6자리 -->
      <input
        v-model="juminHead"
        type="numeric"
        maxlength="6"
        required
        class=" border p-2 rounded"
        placeholder="앞 6자리"
      />
    <p class="text-lg tracking-widest">-</p>
      <!-- 뒤 1자리 입력 + ****** 표시 -->
      <input
        v-model="juminTail"
        type="numeric"
        maxlength="1"
        required
        class="w-10 border p-2 rounded"
        placeholder=""
      />
       <p class="text-lg tracking-widest">******</p>

    </div>

    </div>

      <!-- 약관 동의 -->
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

      <div class="mt-5">
       <p v-if="errorMsg" class="text-sm text-red-500">
          {{ errorMsg }}
        </p>
      <!-- 인증 요청 버튼 -->
      <button
        type="submit"
        class="mt-1 w-full bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-500"
      >
        인증 요청
      </button>
      </div>
    </form>

</template>

<style scoped>
</style>
