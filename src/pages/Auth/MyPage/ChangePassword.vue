<template>
  <div>
    <h1 class="mt-5 text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
      비밀번호 변경
    </h1>

    <form @submit.prevent="submitPassword" class="space-y-5">

      <!-- 현재 비밀번호 -->
      <div>
        <label class="block text-sm font-medium mb-1">현재 비밀번호</label>
        <input 
          v-model="currentPassword"
          type="password"
          class="w-full border rounded-md px-3 py-2 text-gray-900 dark:bg-gray-700 dark:text-white"
          placeholder="현재 비밀번호를 입력하세요"
        />
      </div>

      <!-- 새 비밀번호 -->
      <div>
        <label class="block text-sm font-medium mb-1">새 비밀번호</label>
        <input 
          v-model="newPassword"
          type="password"
          class="w-full border rounded-md px-3 py-2 text-gray-900 dark:bg-gray-700 dark:text-white"
          placeholder="새 비밀번호를 입력하세요"
        />
      </div>

      <!-- 새 비밀번호 확인 -->
      <div>
        <label class="block text-sm font-medium mb-1">새 비밀번호 확인</label>
        <input 
          v-model="newPasswordConfirm"
          type="password"
          class="w-full border rounded-md px-3 py-2 text-gray-900 dark:bg-gray-700 dark:text-white"
          placeholder="다시 입력하세요"
        />
      </div>

      <!-- 제출 버튼 -->
      <div class="flex gap-2 pt-3">
        <button
          type="submit"
          class="flex-1 bg-indigo-600 text-white font-semibold py-2 rounded-md
                 hover:bg-indigo-500 transition dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          변경하기
        </button>

        <button
          type="button"
          @click="cancel"
          class="w-24 border border-gray-300 text-gray-700 dark:text-gray-200 font-semibold py-2 rounded-md 
                 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          취소
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit-password', 'cancel-password'])

const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')

// 변경하기 클릭 → 부모로 데이터 전달
const submitPassword = () => {
  emit('submit-password', {
    current_password: currentPassword.value,
    new_password: newPassword.value,
    new_password_confirm: newPasswordConfirm.value,
  })
}

// 취소 클릭 → 부모에 알려주기
const cancel = () => {
  emit('cancel-password')
}
</script>

<style scoped>
</style>
