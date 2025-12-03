<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-gray-700">
      주소
    </label>

    <div class="flex gap-2">
      <input
        type="text"
        v-model="postcode"
        readonly
        placeholder="우편번호"
        class="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm"
      />
      <button
        type="button"
        @click="openPostcode"
        class="rounded-md bg-indigo-600 px-3 py-1 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        주소검색
      </button>
    </div>

    <input
      type="text"
      v-model="address"
      readonly
      placeholder="기본 주소"
      class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
    />

    <input
      type="text"
      v-model="detailAddress"
      placeholder="상세 주소를 입력하세요"
      class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 부모에게 주소 넘겨주고 싶으면 사용
const emit = defineEmits(['updateAddress'])

const postcode = ref('')
const address = ref('')
const detailAddress = ref('')

const openPostcode = () => {
  if (!window.daum || !window.daum.Postcode) {
    console.error('Daum Postcode 스크립트가 로드되지 않았습니다.')
    return
  }

  new window.daum.Postcode({
    oncomplete: (data) => {
      // 도로명 / 지번 중 선택
      const addr = data.roadAddress || data.jibunAddress

      postcode.value = data.zonecode
      address.value = addr

      // 부모 쪽으로도 전달하고 싶으면 emit
      emit('updateAddress', {
        postcode: postcode.value,
        address: address.value,
        detailAddress: detailAddress.value,
      })
    },
  }).open()
}
</script>

<style scoped></style>
