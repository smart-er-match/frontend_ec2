<template>
  <div class="max-w-3xl mx-auto px-6 py-8">
    <!-- 활용목적 선택 -->
    <div class="mb-8">
      <label for="use-purpose" class="block text-lg font-semibold text-gray-700">활용목적 선택</label>
      <div class="space-y-4 mt-4">
        <div class="flex items-center">
          <input type="radio" id="web" name="usePurpose" value="web" v-model="usePurpose" class="h-4 w-4 text-indigo-600"/>
          <label for="web" class="ml-2 text-gray-600">웹 사이트 개발</label>
        </div>
        <div class="flex items-center">
          <input type="radio" id="app" name="usePurpose" value="app" v-model="usePurpose" class="h-4 w-4 text-indigo-600"/>
          <label for="app" class="ml-2 text-gray-600">앱 개발 (모바일,출력선등)</label>
        </div>
        <div class="flex items-center">
          <input type="radio" id="other" name="usePurpose" value="other" v-model="usePurpose" class="h-4 w-4 text-indigo-600"/>
          <label for="other" class="ml-2 text-gray-600">기타</label>
        </div>
        <div class="flex items-center">
          <input type="radio" id="reference" name="usePurpose" value="reference" v-model="usePurpose" class="h-4 w-4 text-indigo-600"/>
          <label for="reference" class="ml-2 text-gray-600">참고자료</label>
        </div>
        <div class="flex items-center">
          <input type="radio" id="research" name="usePurpose" value="research" v-model="usePurpose" class="h-4 w-4 text-indigo-600"/>
          <label for="research" class="ml-2 text-gray-600">연구(논문 등)</label>
        </div>
      </div>
      <textarea required v-model="purposeDescription" placeholder="활용 목적 설명" rows="4" class="w-full mt-4 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
    </div>

    <!-- 상세기능 정보 -->
    <div class="mb-8">
      <label for="details" class="block text-lg font-semibold text-gray-700">상업용 이용 동의</label>
      <div class="flex items-center mt-4">
        <input type="checkbox" id="function" v-model="isFunctionChecked" class="h-4 w-4 text-indigo-600"/>
        <label for="function" class="ml-2 text-gray-600">상업용 목적으로 이용하십니까?</label>
      </div>
      <p v-if="isFunctionChecked" class="text-sm text-gray-500 mt-2">상업용으로 이용하셔도 무방하지만 해당 데이터는 저희에게 기록됩니다.</p>
    </div>

    <!-- 버튼 -->
    <div class="text-center">
      <!-- 토큰 상태가 1일 때 버튼 문구 및 색상 변경 -->
       <button
        @click="submitRequest"
        class="w-full py-3 mt-4 font-semibold rounded-md shadow-md"
        :class="buttonClass"
        :disabled="!isButtonEnabled"
      >
        {{ buttonText }}
    </button>
    </div>
  </div>
</template>

<script setup>
console.log("Gdgdgdgdg")
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '../../components/api'

const authStore = useAuthStore()
const usePurpose = ref('web') // 활용목적 선택
const purposeDescription = ref('') // 활용목적 설명
const isFunctionChecked = ref(false) // 기능 선택 여부

const tokenStatus = computed(() => authStore.user?.token_status ?? 0)

const buttonClass = computed(() => {
  return isButtonEnabled.value
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
})

const isButtonEnabled = computed(() => {
  return tokenStatus.value === 0 || tokenStatus.value === 2
})

const buttonText = computed(() => {
  switch (tokenStatus.value) {
    case 0:
      return 'AI 토큰 발급'
    case 1:
      return '발급중...'
    case 2:
      return '재발급하기'
    case 3:
      return '발급 완료'
    default:
      return 'AI 토큰 발급'
  }
})


onMounted(async () => {
  await authStore.updateUserInfo(); // 사용자 정보 자동 갱신
})

const submitRequest = async () => {
  try {
    const res = await api.post('accounts/token/application/', {
      purpose: usePurpose.value,
      details: purposeDescription.value,
      is_commercial: isFunctionChecked.value
    })

    console.log('AI 토큰 신청 완료:', res)
    authStore.updateUserInfo()
    console.log(authStore.user)
    alert('신청이 완료되었습니다. 관리자 승인 대기 중입니다.')
  } catch (error) {
    console.error('AI 토큰 신청 실패:', error)
    alert('신청 중 오류가 발생했습니다. 다시 시도해 주세요.')
  }
}
</script>

<style scoped>
/* TailwindCSS를 이용한 추가 스타일링 필요시 작성 */
</style>
