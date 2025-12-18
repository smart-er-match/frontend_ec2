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
        <!-- 프로필 이미지 -->
        <div class="relative">
          <img
            :src="profilePreview || form.profile_image || defaultAvatar"
            alt="profile"
            class="h-40 w-40 rounded-full object-cover ring-2 ring-gray-100"
          />

          <!-- 수정 모드 업로드 버튼 -->
          <label
            v-if="isEdit"
            class="absolute -bottom-2 -right-2 inline-flex cursor-pointer items-center justify-center
                  rounded-full bg-indigo-600 p-2 text-white shadow
                  hover:bg-indigo-500 transition"
          >
            <input
              type="file"
              accept="image/*"
              class="hidden"
              @change="onPickProfileImage"
            />
            <svg
              viewBox="0 0 24 24"
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </label>
        </div>

        <!-- 이름 / 역할 -->
        <div class="flex flex-col items-center gap-2">
          <h2 class="text-lg font-bold text-gray-900">
            {{ form.name || "사용자" }}
          </h2>

          <span
            class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border"
            :class="form.role
              ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
              : 'bg-emerald-50 text-emerald-700 border-emerald-100'"
          >
            {{ form.role ? "의료진" : "일반인" }}
          </span>

          <p v-if="isEdit" class="text-xs text-gray-400">
            사진은 JPG / PNG 권장 · 저장 후 반영됩니다
          </p>
        </div>
      </div>

      <!-- 버튼 -->
      <div class="mt-6 flex w-full max-w-[240px] gap-2">
        <button
          @click="onClickEditOrSave"
          class="flex-1 rounded-xl bg-indigo-600 py-2.5 text-white font-semibold
                hover:bg-indigo-500 transition"
        >
          {{ isEdit ? '저장' : '회원 정보 수정' }}
        </button>

        <button
          v-if="isEdit"
          @click="onCancel"
          class="w-20 rounded-xl border border-gray-200 bg-white py-2.5
                text-gray-700 font-semibold hover:bg-gray-50 transition"
        >
          취소
        </button>
      </div>

      <!-- 비밀번호 변경 -->
      <button
        v-if="!isChangePasswordEdit && form.sign_kind === 1"
        @click="openChangePassword"
        class="mt-4 w-full max-w-[240px] rounded-xl
              border border-indigo-200 bg-indigo-50 py-2.5
              text-indigo-700 font-semibold hover:bg-indigo-100 transition"
      >
        비밀번호 변경
      </button>

    </div>


      <!-- ================= RIGHT : 상세 정보 ================= -->
      <div class="space-y-5 text-gray-800">

        <!-- 이름 -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <span class="font-semibold text-gray-700">이름</span>
          <div class="text-right">
            <span v-if="!isEdit">{{ form.name }}</span>
            <input
              v-else
              v-model="form.name"
              type="text"
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm
                     focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
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
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm
                     focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
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
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm
                     focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
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
                :class="form.gender === 'M'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300'"
              >
                남성
              </button>

              <button
                type="button"
                @click="form.gender = 'F'"
                class="px-3 py-1 rounded-lg border text-sm font-semibold"
                :class="form.gender === 'F'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300'"
              >
                여성
              </button>
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
    <my-er-list/>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import api from "../../../components/api";
import ChangePassword from "./ChangePassword.vue";
import MyErList from "./MyErList.vue";

const defaultAvatar =
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=300&q=80";

const storedUserRef = ref(JSON.parse(localStorage.getItem("user") || "{}"));

const form = reactive({
  name: storedUserRef.value?.name || "",
  birth_date: storedUserRef.value?.birth_date || "",
  phone_number: storedUserRef.value?.phone_number || "",
  gender: storedUserRef.value?.gender || "",
  sign_kind: storedUserRef.value?.sign_kind || "",
  role: storedUserRef.value?.role || "",
  username: storedUserRef.value?.username || "",
  email: storedUserRef.value?.email || "",
  // ✅ 프로필 이미지(서버에서 URL 내려준다고 가정)
  profile_image: storedUserRef.value?.profile_image || "",
});

const isEdit = ref(false);
const isChangePasswordEdit = ref(false);

// ✅ 업로드 파일 & 미리보기
const profileFile = ref(null);
const profilePreview = ref("");

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

const onPickProfileImage = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // 간단한 검증
  if (!file.type.startsWith("image/")) {
    alert("이미지 파일만 업로드할 수 있어요.");
    return;
  }

  profileFile.value = file;
  profilePreview.value = URL.createObjectURL(file);
};

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

  try {
    // ✅ 사진 포함 저장: multipart/form-data
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("birth_date", form.birth_date);
    fd.append("phone_number", form.phone_number);
    fd.append("gender", form.gender);

    // 파일 선택한 경우에만 추가
    if (profileFile.value) {
      fd.append("profile_image", profileFile.value);
    }

    const res = await api.patch("accounts/profile/update/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // ✅ localStorage & storedUserRef 갱신 (취소 롤백 정상화)
    localStorage.setItem("user", JSON.stringify(res.data.user));
    storedUserRef.value = res.data.user;

    // ✅ 폼에도 최신값 반영
    form.profile_image = res.data.user.profile_image || form.profile_image;

    alert("회원 정보가 저장되었습니다.");
    isEdit.value = false;

    // ✅ 미리보기 초기화
    profileFile.value = null;
    profilePreview.value = "";
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
  form.profile_image = u?.profile_image || "";

  // ✅ 미리보기/파일 초기화
  profileFile.value = null;
  profilePreview.value = "";

  isEdit.value = false;
};
</script>

<style scoped>
  
</style>
