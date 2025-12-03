<script setup>
import { ref } from "vue";

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const currentPasswordError = ref("");
const newPasswordError = ref("");
const confirmPasswordError = ref("");

// 현재 비밀번호 검증
const validateCurrentPassword = () => {
  currentPasswordError.value =
    currentPassword.value.trim() === "" ? "현재 비밀번호를 입력하세요." : "";
};

// 새 비밀번호 검증
const validateNewPassword = () => {
  const pw = newPassword.value;

  if (pw.length < 8) {
    newPasswordError.value = "8자 이상 입력하세요.";
    return;
  }
  if (!/[0-9]/.test(pw) || !/[!@#$%^&*]/.test(pw)) {
    newPasswordError.value = "숫자와 특수문자를 포함해야 합니다.";
    return;
  }

  newPasswordError.value = "";
};

// 새 비밀번호 확인 검증
const validateConfirmPassword = () => {
  confirmPasswordError.value =
    confirmPassword.value !== newPassword.value ? "비밀번호가 일치하지 않습니다." : "";
};

// 제출
const submitChangePassword = () => {
  validateCurrentPassword();
  validateNewPassword();
  validateConfirmPassword();

  if (
    currentPasswordError.value ||
    newPasswordError.value ||
    confirmPasswordError.value
  ) {
    return;
  }

  // 여기에 실제 서버 요청 추가
  console.log("비밀번호 변경 요청:", {
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
  });
};
</script>

<template>
    <div class="text-center mb-6">
      <h1 class="text-xl font-semibold">비밀번호 변경</h1>
    </div>

    <!-- 현재 비밀번호 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        현재 비밀번호
      </label>
      <input
        v-model="currentPassword"
        type="password"
        autocomplete="current-password"
        required
        class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="현재 비밀번호 입력"
        @blur="validateCurrentPassword"
      />
      <div v-if="currentPasswordError" class="mx-2 text-red-500 text-xs mt-1">
        {{ currentPasswordError }}
      </div>
    </div>

    <!-- 새 비밀번호 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        새 비밀번호
      </label>
      <input
        v-model="newPassword"
        type="password"
        autocomplete="new-password"
        required
        class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="8자 이상, 숫자+특수문자 포함"
        @blur="validateNewPassword"
      />
      <div v-if="newPasswordError" class="mx-2 text-red-500 text-xs mt-1">
        {{ newPasswordError }}
      </div>
    </div>

    <!-- 새 비밀번호 확인 -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        새 비밀번호 확인
      </label>
      <input
        v-model="confirmPassword"
        type="password"
        autocomplete="new-password"
        required
        class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="새 비밀번호 재입력"
        @blur="validateConfirmPassword"
      />
      <div v-if="confirmPasswordError" class="mx-2 text-red-500 text-xs mt-1">
        {{ confirmPasswordError }}
      </div>
    </div>

    <!-- 제출 버튼 -->
    <button
      @click="submitChangePassword"
      class="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      비밀번호 변경하기
    </button>
</template>


<style scoped>


</style>