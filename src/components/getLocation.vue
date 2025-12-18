<template></template>

<script setup>
import { useLocationStore } from '@/stores/location'

const locationStore = useLocationStore()
const emit = defineEmits(['success', 'error'])

const requestLocation = async () => {
  // ✅ 1) 권한 상태 먼저 확인
  if (navigator.permissions?.query) {
    const p = await navigator.permissions.query({ name: 'geolocation' })

    if (p.state === 'denied') {
      emit(
        'error',
        `현재 위치 권한이 차단되어 있습니다.

        주소창 왼쪽 🔒 아이콘을 클릭한 뒤
        사이트 설정에서 위치를 "허용"으로 변경해주세요.
        
        혹은 주소 검색을 통해 위치를 골라주세요.
        `

      )
      return
    }
  }

  // ✅ 2) 실제 위치 요청
  if (!navigator.geolocation) {
    emit('error', '이 브라우저에서는 위치 정보를 지원하지 않습니다.')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords

      locationStore.setLocation({
        lat: latitude,
        lng: longitude,
      })

      emit('success', { lat: latitude, lng: longitude })
    },
    (err) => {
      let message = '위치 정보를 가져오지 못했습니다.'

      if (err.code === 1) {
        message = '위치 권한이 거부되었습니다.'
      }
      if (err.code === 2) {
        message = '위치 정보를 사용할 수 없습니다.'
      }
      if (err.code === 3) {
        message = '위치 요청 시간이 초과되었습니다.'
      }

      emit('error', message)
    },
    {
      enableHighAccuracy: false, // 성공률 우선
      timeout: 20000,
      maximumAge: 60000,
    }
  )
}

defineExpose({ requestLocation })
</script>
