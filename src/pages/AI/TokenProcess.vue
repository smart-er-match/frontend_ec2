<template>
  <div class="max-w-3xl mx-auto px-6 py-8">
    <!-- 승인 메시지 -->
    <h1 v-if="mode === 'reject'" class="text-2xl font-semibold text-red-500">반려되었습니다.</h1>
    <h1 v-else class="text-2xl font-semibold text-green-500">승인되었습니다.</h1>
    
    <!-- 남은 시간 표시 -->
    <p>창을 닫아주세요</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/components/api'

// 쿼리 파라미터에서 mode와 key 가져오기
const route = useRoute()
const mode = route.query.mode // ?mode=approve
const key = route.query.key // ?key=be07bc40-9326-47d0-b69d-5f4c4f5aede9


onMounted(async () => {
  // mode와 key가 어디서 오는지에 따라 설정 필요 (예: props, route, 또는 상태에서)
  const mode = 'approve'; // 예시로 하드코딩, 실제로는 props나 route에서 받아옴
  const key = 'some-key-value'; // 예시로 하드코딩, 실제로는 props나 route에서 받아옴
  
  if (mode === 'approve' && key) {
    try {
      const response = await api.post('/accounts/token/success/', {
        key: key, // 보안 난수 전달
      });

      // 응답 확인 후 처리 (성공 시 사용자에게 이메일 발송 및 token_status 변경)
      if (response.status === 200) {
        console.log('승인 완료, 서비스 키 이메일 발송 및 token_status 변경 완료');
      } else {
        console.error('승인 실패:', response.data);
      }
    } catch (error) {
      console.error('승인 요청 실패:', error);
    }
  } else if (key) { // `key`가 있는 경우에만 false 처리
    try {
      const response = await api.post('/accounts/token/false/', {
        key: key, // 보안 난수 전달
        message: 'gdgd', // 추가적인 메시지 전달
      });
      console.log('승인 실패 처리 완료:', response.data);
    } catch (error) {
      console.error('승인 실패 요청 실패:', error);
    }
  }
});

</script>

<style scoped>
/* TailwindCSS 스타일은 이미 위의 HTML 코드에 적용되어 있습니다. 추가로 스타일을 덧붙일 필요는 없습니다. */
</style>
