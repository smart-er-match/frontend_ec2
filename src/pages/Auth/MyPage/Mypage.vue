<template>
  <div class="mx-auto mt-10 w-full max-w-5xl bg-white shadow-sm rounded-2xl border border-gray-100">
    <!-- 헤더 -->
    <div class="p-6 sm:p-8 border-b border-gray-100">
      <h1 class="text-2xl font-bold text-gray-900 text-center">My Page</h1>
      <p class="mt-2 text-center text-sm text-gray-500">
        내 정보를 확인하고 수정할 수 있어요.
      </p>
    </div>

    <!-- 본문 -->
    <div class="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 p-6 sm:p-8">
      <!-- ================= LEFT : 프로필 ================= -->
      <div class="flex flex-col items-center text-center">

        <!-- 프로필 + 이름 -->
        <div class="flex flex-col items-center gap-4">
          <!-- 이름 / 역할 -->
          <div class="flex flex-col items-center gap-2">
            <h2 class="text-lg font-bold text-gray-900">{{ form.name || "사용자" }}</h2>
          </div>
        </div>

        <!-- 버튼 -->
        <div class="mt-6 flex w-full max-w-[240px] gap-2">
          <button
            @click="onClickEditOrSave"
            class="flex-1 rounded-xl bg-indigo-600 py-2.5 text-white font-semibold hover:bg-indigo-500 transition">
            {{ isEdit ? '저장' : '회원 정보 수정' }}
          </button>
          <button
            v-if="isEdit"
            @click="onCancel"
            class="w-20 rounded-xl border border-gray-200 bg-white py-2.5 text-gray-700 font-semibold hover:bg-gray-50 transition">
            취소
          </button>
        </div>

        <!-- AI 토큰 발급 신청 버튼 -->
        <div class="mt-6 flex w-full max-w-[240px] gap-2">
          <button
            @click="onClickAiToken"
            class="flex-1 rounded-xl bg-indigo-600 py-2.5 text-white font-semibold hover:bg-indigo-500 transition">
            AI 토큰 발급 신청
          </button>
        </div>

        <!-- 비밀번호 변경 -->
        <button
          v-if="!isChangePasswordEdit && form.sign_kind === 1"
          @click="openChangePassword"
          class="mt-4 w-full max-w-[240px] rounded-xl border border-indigo-200 bg-indigo-50 py-2.5 text-indigo-700 font-semibold hover:bg-indigo-100 transition">
          비밀번호 변경
        </button>

      </div>

      <!-- ================= RIGHT : 상세 정보 ================= -->
      <div class="space-y-5 text-gray-800">

        <!-- 이름 -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <span class="font-semibold text-gray-700">자격</span>
          <div class="text-right">
            <span> {{ form.role ? "의료진" : "일반인" }}</span>
          </div>
        </div>

        <!-- 로그인 계정 -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <span class="font-semibold text-gray-700">로그인 계정</span>
          <div class="text-right">
            <div class="font-medium text-gray-900">{{ loginData }}</div>
            <div class="text-sm text-gray-500">{{ loginData1 }}</div>
          </div>
        </div>

        <!-- 생년월일 -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <span class="font-semibold text-gray-700">생년월일</span>
          <div class="text-right">
            <span v-if="!isEdit">{{ form.birth_date }}</span>
            <input
              v-else
              v-model="form.birth_date"
              type="date"
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
        </div>

        <!-- 전화번호 -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <span class="font-semibold text-gray-700">전화번호</span>
          <div class="text-right">
            <span v-if="!isEdit">{{ formatPhone(form.phone_number) }}</span>
            <input
              v-else
              v-model="form.phone_number"
              type="tel"
              inputmode="numeric"
              maxlength="11"
              @input="onPhoneInput"
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
        </div>

        <!-- 성별 -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <span class="font-semibold text-gray-700">성별</span>
          <div class="text-right">
            <span v-if="!isEdit">
              {{ form.gender === 'M' ? '남성' : form.gender === 'F' ? '여성' : '' }}
            </span>

            <div v-else class="flex gap-2 justify-end">
              <button
                type="button"
                @click="form.gender = 'M'"
                class="px-3 py-1 rounded-lg border text-sm font-semibold"
                :class="form.gender === 'M' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'">
                남성
              </button>
              <button
                type="button"
                @click="form.gender = 'F'"
                class="px-3 py-1 rounded-lg border text-sm font-semibold"
                :class="form.gender === 'F' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'">
                여성
              </button>
            </div>
          </div>
        </div>

        <!-- AI Token -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <span class="font-semibold text-gray-700">Ai Token</span>
          <div class="text-right">
            <div class="flex gap-2 justify-end">
              <span>{{ tokenStatusText }}</span>
            </div>
          </div>
        </div>

        <change-password
          v-if="isChangePasswordEdit"
          class="mt-6 w-full"
          @submit-password="handlePasswordSubmit"
          @cancel-password="onPasswordCancel"
        />
      </div>
    </div>
    <my-er-list />
  </div>
</template>


<script setup>
import { reactive, ref, computed, onMounted } from "vue";
import api from "../../../components/api";
import ChangePassword from "./ChangePassword.vue";
import MyErList from "./MyErList.vue";
import router from "../../../router";
import { useAuthStore } from '@/stores/auth';

const storedUserRef = ref(JSON.parse(localStorage.getItem("user") || "{}"));

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
})

// computed를 사용하여 token_status에 맞는 텍스트 출력
const tokenStatusText = computed(() => {
  if (form.token_status === 1) {
    return '발급중'
  } else if (form.token_status === 2) {
    return '반려'
  } else if (form.token_status === 3) {
    return form.service_key
  } else {
    return '-' // null일 경우 빈 문자열
  }
})


const isEdit = ref(false);
const isChangePasswordEdit = ref(false);

const loginData = computed(() => {
  return form.sign_kind === 1 ? form.username
    : form.sign_kind === 2 ? form.email
    : form.sign_kind === 3 ? form.email
    : form.sign_kind === 4 ? form.email
    : "알 수 없음";
});

const loginData1 = computed(() => {
  return form.sign_kind === 1 ? "이메일로 로그인하였습니다"
    : form.sign_kind === 2 ? "카카오로 로그인하였습니다."
    : form.sign_kind === 3 ? "네이버로 로그인하였습니다"
    : form.sign_kind === 4 ? "구글로 로그인하였습니다"
    : "알 수 없음";
});


const openChangePassword = () => {
  isChangePasswordEdit.value = true;
};

const onPasswordCancel = () => {
  isChangePasswordEdit.value = false;
};

const handlePasswordSubmit = async (payload) => {
  try {
    await api.post("accounts/password/change/", {
      old_password: payload.current_password,
      new_password: payload.new_password,
      new_password_confirm: payload.new_password_confirm,
    });

    alert("비밀번호 변경이 완료되었습니다.");
    isChangePasswordEdit.value = false;
  } catch (err) {
    console.error(err);
    alert("현재 비밀번호가 맞지 않거나 새 비밀번호가 일치하지 않습니다.");
  }
};

const onPhoneInput = (e) => {
  let onlyNums = e.target.value.replace(/\D/g, "");
  if (onlyNums.length > 11) onlyNums = onlyNums.slice(0, 11);
  form.phone_number = onlyNums;
};

const formatPhone = (phone) => {
  if (!phone) return "";
  const cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  return phone;
};


const onClickEditOrSave = async () => {
  if (!isEdit.value) {
    isEdit.value = true;
    return;
  }
  console.log(form)
  try {
    const res = await api.patch("accounts/profile/update/", form);
    // 응답 후 폼에 데이터 반영
    alert("회원 정보가 저장되었습니다.");
    isEdit.value = false;
  } catch (err) {
    console.error(err);
    alert("회원 정보 수정 중 오류가 발생했습니다.");
  }
};


const onCancel = () => {
  const u = storedUserRef.value || {};

  form.name = u?.name || "";
  form.birth_date = u?.birth_date || "";
  form.phone_number = u?.phone_number || "";
  form.gender = u?.gender || "";

  isEdit.value = false;
};

const onClickAiToken = () => {
  router.push({ name: 'getaitoken' })
}


const authStore = useAuthStore();

onMounted(async () => {
  await authStore.updateUserInfo();

  const user = authStore.user;
  form.name = user?.name || '';
  form.birth_date = user?.birth_date || '';
  form.phone_number = user?.phone_number || '';
  form.gender = user?.gender || '';
  form.sign_kind = user?.sign_kind || '';
  form.role = user?.role || '';
  form.username = user?.username || '';
  form.email = user?.email || '';
  form.token_status = user?.token_status || '';
  form.service_key = user?.service_key || '';
})


</script>

<style scoped>
  
</style>
