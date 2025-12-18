<template></template>

<script setup>
import { useLocationStore } from '@/stores/location'
const locationStore = useLocationStore()
const emit = defineEmits(['success', 'error'])

const requestLocation = () => {
  if (!navigator.geolocation) return emit('error', '이 브라우저에서는 위치 정보를 지원하지 않습니다.')

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords
      locationStore.setLocation({ lat: latitude, lng: longitude })
      emit('success', { lat: latitude, lng: longitude })
    },
    (err) => {
      let message = '위치 권한을 허용해야 서비스를 이용할 수 있습니다.'
      if (err.code === 1) message = '위치 권한이 거부되었습니다.'
      if (err.code === 2) message = '위치 정보를 사용할 수 없습니다.'
      if (err.code === 3) message = '위치 요청 시간이 초과되었습니다.'
      emit('error', message)
    },
     {
    enableHighAccuracy: false,
    timeout: 10000,
    maximumAge: 60000,
  }
  )
}

defineExpose({ requestLocation })
</script>
