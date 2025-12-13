<template>
  <div class="max-w-xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
    <h1 class="text-2xl font-bold mb-6 text-gray-900 text-center">
      My Page
    </h1>

    <div class="space-y-4 text-gray-700">

      <!-- 이름 -->
      <div class="flex justify-between border-b pb-2 items-center">
        <span class="font-semibold">이름(자격)</span>
        <span v-if="!isEdit">{{ form.name }}({{ form.role ? '의료진' : '일반인' }})</span>
        <input 
          v-else 
          v-model="form.name"
          type="text"
          class="border rounded px-2 py-1 text-sm text-gray-900"
        />
      </div>

      <div class="flex justify-between border-b pb-2 items-center">
      <span class="font-semibold">로그인 계정</span>

      <span class="text-right">
        {{ login_data }} <br>
        <span class="text-sm text-gray-500">{{ login_data1 }}</span>
      </span>
    </div>
      <!-- 생년월일 -->
      <div class="flex justify-between border-b pb-2 items-center">
        <span class="font-semibold">생년월일</span>
        <span v-if="!isEdit">{{ form.birth_date }}</span>
        <input 
          v-else 
          v-model="form.birth_date"
          type="date"
          class="border rounded px-2 py-1 text-sm text-gray-900"
        />
      </div>

      <!-- 전화번호 -->
      <div class="flex justify-between border-b pb-2 items-center">
        <span class="font-semibold">전화번호</span>

        <span v-if="!isEdit">{{ formatPhone(form.phone_number) }}</span>

        <input
          v-else
          v-model="form.phone_number"
          type="tel"
          @input="onPhoneInput"
          maxlength="11"
          class="border rounded px-2 py-1 text-sm text-gray-900"
        />
      </div>


    <div class="flex justify-between border-b pb-2 items-center">
        <span class="font-semibold">성별</span>

        <!-- 보기 모드 -->
        <span v-if="!isEdit">
            {{ form.gender === 'M' ? '남성' : form.gender === 'F' ? '여성' : '' }}
        </span>

        <!-- 수정 모드 (토글) -->
        <div v-else class="flex gap-2">

            <!-- 남성 버튼 -->
            <button
            type="button"
            @click="form.gender = 'M'"
            :class="[
                'px-3 py-1 rounded-md border text-sm',
                form.gender === 'M'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            ]"
            >
            남성
            </button>

            <!-- 여성 버튼 -->
            <button
            type="button"
            @click="form.gender = 'F'"
            :class="[
                'px-3 py-1 rounded-md border text-sm',
                form.gender === 'F'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            ]"
            >
            여성
            </button>
        </div>
        </div>


      <!-- 버튼 영역 -->
      <div class="pt-4 flex gap-2">
        <button
          @click="onClickEditOrSave"
          class="flex-1 bg-indigo-600 text-white font-semibold py-2 rounded-md 
                 hover:bg-indigo-500 transition ">
          {{ isEdit ? '저장' : '회원 정보 수정' }}
        </button>

        <button
          v-if="isEdit"
          @click="onCancel"
          class="w-24 border border-gray-300 text-gray-700 font-semibold py-2 rounded-md 
                 hover:bg-gray-100 transition">
          취소
        </button>
      </div>


      <change-password
        v-if="isChangePasswordEdit"
        @submit-password="handlePasswordSubmit"
        @cancel-password="onPasswordCancel"
      />

      <div class="pt-4 flex gap-2">
        <button
          @click="openChangePassword"
          v-if="!isChangePasswordEdit && form.sign_kind === 1"
          class="flex-1 bg-indigo-600 text-white font-semibold py-2 rounded-md 
                 hover:bg-indigo-500 transition">
         비밀번호 변경
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import api from '../../../components/api'
import ChangePassword from './ChangePassword.vue'

const storedUser = JSON.parse(localStorage.getItem("user"))

const form = reactive({
  name: storedUser?.name || '',
  birth_date: storedUser?.birth_date || '',
  phone_number: storedUser?.phone_number || '',
  gender: storedUser?.gender || '',
  sign_kind: storedUser?.sign_kind || '',
  role: storedUser?.role || '',
  username: storedUser?.username || '',
  email: storedUser?.email || '',
})
console.log(storedUser)

const login_data =
  form.sign_kind === 1 ? form.username :
  form.sign_kind === 2 ? form.email :
  form.sign_kind === 3 ? form.email :
  form.sign_kind === 4 ? form.email :
  '알 수 없음';

  const login_data1 =
  form.sign_kind === 1 ? "이메일로 로그인하였습니다" :
  form.sign_kind === 2 ? "카카오로 로그인하였습니다." :
  form.sign_kind === 3 ? "네이버로 로그인하였습니다" :
  form.sign_kind === 4 ? "구글로 로그인하였습니다" :
  '알 수 없음';

const onPhoneInput = (e) => {
  // 숫자만 남기기
  let onlyNums = e.target.value.replace(/\D/g, '')

  // 11자리로 제한
  if (onlyNums.length > 11) {
    onlyNums = onlyNums.slice(0, 11)
  }

  // form 에 반영
  form.phone_number = onlyNums
}


const isEdit = ref(false)
const isChangePasswordEdit = ref(false)

const openChangePassword = () => {
  isChangePasswordEdit.value = true
}

const onPasswordCancel = () => {
  isChangePasswordEdit.value = false
}

const handlePasswordSubmit = async (payload) => {

 try {
    const res = await api.post('accounts/password/change/',
      {
        old_password: payload.current_password,
        new_password: payload.new_password,
        new_password_confirm: payload.new_password_confirm,
      },
    )

    alert('비밀번호 변경이 왼료되었습니다.')
    isChangePasswordEdit.value = false
    
  } catch (err) {
    console.error(err)
    alert('현재 비밀번호가 맞지 않거나 새비밀번호가 일치하지 않습니다.')
  }
}

const formatPhone = (phone) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  }
  return phone
}

const onClickEditOrSave = async () => {
  if (!isEdit.value) {
    // 보기 → 수정 모드
    isEdit.value = true
    return
  }


  // 수정 모드에서 저장 눌렀을 때: 여기서 API 요청 or localStorage 업데이트
 try {
    const res = await api.patch('accounts/profile/update/',
      {
        name: form.name,
        birth_date: form.birth_date,
        phone_number: form.phone_number,
        gender: form.gender,
      },
    )

    // 서버 응답 기반으로 localStorage 업데이트
    localStorage.setItem("user", JSON.stringify(res.data.user))

    alert('회원 정보가 저장되었습니다.')
    isEdit.value = false
    
  } catch (err) {
    console.error(err)
    alert('회원 정보 수정 중 오류가 발생했습니다.')
  }
}

const onCancel = () => {
  // 수정 내용 버리고 다시 초기값으로 롤백
  form.name = storedUser?.name || ''
  form.birth_date = storedUser?.birth_date || ''
  form.phone_number = storedUser?.phone_number || ''
  form.gender = storedUser?.gender || ''
  isEdit.value = false
}
</script>
