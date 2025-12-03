<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { API_BASE_URL } from "../../config";

const router = useRouter();

const email = ref("");
const emailError = ref("");

const code = ref("");
const codeError = ref("");

const isCodeSent = ref(false);      // 메세지 전송했는지
const isVerifying = ref(false);     // 인증 중 로딩
const message = ref("");

// 이메일 유효성 체크 (간단 버전)
const validateEmail = () => {
  if (!email.value.trim()) {
    emailError.value = "이메일을 입력하세요.";
  } else {
    emailError.value = "";
  }
};

// 1) 이메일로 인증번호 보내기
const sendCode = async () => {
  validateEmail();
  if (emailError.value) return;

  try {
    message.value = "";
    // 🔥 백엔드: 이 메일로 인증번호 발송
    await axios.post(`${API_BASE_URL}accounts/password-code/send/`, {
      email: email.value,
    });

    isCodeSent.value = true;
    message.value = "이메일로 인증번호를 전송했습니다.";
  } catch (err) {
    console.error(err);
    message.value = "인증번호 전송에 실패했습니다. 다시 시도해 주세요.";
  }
};

// 2) 인증번호 확인 -> 성공하면 비밀번호 변경 페이지로 이동
const verifyCode = async () => {
  if (!code.value.trim()) {
    codeError.value = "인증번호를 입력하세요.";
    return;
  }
  codeError.value = "";
  isVerifying.value = true;

  try {
    // 🔥 백엔드: 이메일 + 코드 검증
    const res = await axios.post(`${API_BASE_URL}accounts/password-code/verify/`, {
      email: email.value,
      code: code.value,
    });

    // 예: 서버에서 임시 토큰 같은 걸 넘겨준다 가정
    const verifyToken = res.data.verify_token;

    // 👉 인증 성공했으니 비밀번호 변경 페이지로 이동
    router.push({
      name: "resetPassword",
      query: {
        email: email.value,
        verifyToken, // 비밀번호 변경 페이지에서 이걸로 다시 확인
      },
    });
  } catch (err) {
    console.error(err);
    codeError.value = "인증번호가 올바르지 않거나 만료되었습니다.";
  } finally {
    isVerifying.value = false;
  }
};
</script>

<template>
    <div class="text-center mb-6">
      <h1 class="text-xl font-semibold">비밀번호 재설정</h1>
      <p class="mt-2 text-sm font-normal text-gray-600">
        가입하신 이메일로 인증번호를 보내드립니다.
      </p>
    </div>

    <!-- 이메일 입력 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        이메일
      </label>
      <input
        v-model="email"
        type="email"
        autocomplete="email"
        required
        class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="example@email.com"
        @blur="validateEmail"
      />
      <div v-if="emailError" class="mx-2 text-red-500 text-xs mt-1">
        {{ emailError }}
      </div>
    </div>

    <!-- 메시지 전송 버튼 -->
    <button
      @click="sendCode"
      class="w-full mb-4 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      인증번호 전송
    </button>

    <!-- 안내 메시지 -->
    <div v-if="message" class="text-xs text-green-600 mb-2">
      {{ message }}
    </div>

    <!-- 인증번호 입력 영역 (전송 후에만 보이게) -->
    <div v-if="isCodeSent" class="mt-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        이메일로 받은 인증번호
      </label>
      <input
        v-model="code"
        type="text"
        class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="인증번호 6자리를 입력하세요"
      />
      <div v-if="codeError" class="mx-2 text-red-500 text-xs mt-1">
        {{ codeError }}
      </div>

      <button
        @click="verifyCode"
        :disabled="isVerifying"
        class="mt-4 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-60"
      >
        {{ isVerifying ? "확인 중..." : "인증번호 확인" }}
      </button>
    </div>
</template>
