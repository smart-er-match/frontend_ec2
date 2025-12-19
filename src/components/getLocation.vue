<template></template>

<script setup>
import { useLocationStore } from '@/stores/location'

const locationStore = useLocationStore()
const emit = defineEmits(['success', 'error'])

async function getAddressFromCoords(lat, lng) {
  const url =
    `/naver/map-reversegeocode/v2/gc` +
    `?request=coordsToaddr` +
    `&coords=${lng},${lat}` +
    `&sourcecrs=epsg:4326` +
    `&orders=roadaddr,addr` +
    `&output=json`

  const res = await fetch(url)

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error('reverse geocode 실패', res.status, text)
    return null
  }

  const data = await res.json()
  const results = data?.results || []

  if (results.length === 0) {
    console.error('reverse geocode 결과 없음', data)
    return null
  }

  const road = results.find(r => r.name === 'roadaddr')
  const jibun = results.find(r => r.name === 'addr')
  const picked = road || jibun || results[0]

  const region = picked.region
  const land = picked.land

  const base = `${region.area1.name} ${region.area2.name} ${region.area3.name}`.trim()
  const roadPart =
    land?.name
      ? `${land.name} ${land.number1 || ''}${land.number2 ? '-' + land.number2 : ''}`.trim()
      : `${land?.number1 || ''}${land?.number2 ? '-' + land.number2 : ''}`.trim()

  return `${base} ${roadPart}`.trim()
}

const requestLocation = async () => {
  // 1) 권한 상태 확인
  if (navigator.permissions?.query) {
    const p = await navigator.permissions.query({ name: 'geolocation' })
    if (p.state === 'denied') {
      emit(
      'error',
      `현재 위치 권한이 차단되어 있습니다.

      주소창 왼쪽 🔒 아이콘을 클릭한 뒤
      사이트 설정에서 위치를 "허용"으로 변경해주세요.

      혹은 주소 검색을 통해 위치를 골라주세요.`
            )
            return
          }
        }

  if (!navigator.geolocation) {
    emit('error', '이 브라우저에서는 위치 정보를 지원하지 않습니다.')
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude, accuracy } = pos.coords
      

      // ✅ 여기서 바로 주소까지 조회
      const address = await getAddressFromCoords(latitude, longitude)

      // ✅ store 저장
      locationStore.setLocation({
        lat: latitude,
        lng: longitude,
        address: address || '',
      })

    // console.log(locationStore.lat)
    // console.log(locationStore.lng)
    // console.log(locationStore.address)

      // ✅ 상위 컴포넌트에 한번에 전달
      emit('success', {
        lat: latitude,
        lng: longitude,
        address: address || '주소를 불러오지 못했습니다.',
      })
    },
    (err) => {
      let message = '위치 정보를 가져오지 못했습니다.'
      if (err.code === 1) message = '위치 권한이 거부되었습니다.'
      if (err.code === 2) message = '위치 정보를 사용할 수 없습니다.'
      if (err.code === 3) message = '위치 요청 시간이 초과되었습니다.'
      emit('error', message)
    },
    {
      enableHighAccuracy: false, // 데스크탑 성공률 우선 (모바일은 true도 고려)
      timeout: 20000,
      maximumAge: 0,            // ✅ 정확도가 중요하면 0 추천
    }
  )
}

defineExpose({ requestLocation })
</script>
