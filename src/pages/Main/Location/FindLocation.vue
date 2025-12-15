<template>
  <GetLocation ref="getLoc" />

  <div class="text-center">
    <div class="flex justify-center items-center gap-4">
      <!-- ✅ 반경(줌 단계) 프리셋 슬라이더 -->
      <div class="mt-3 w-72 border rounded-lg p-3 bg-white">
        <h3 class="font-semibold text-gray-800 mb-2">반경 설정</h3>

        <!-- stepIndex: 0 ~ presets.length-1 -->
        <input
          type="range"
          v-model.number="stepIndex"
          :min="0"
          :max="radiusPresets.length - 1"
          step="1"
          class="w-full"
        />

        <div class="mt-2 flex items-center justify-center text-sm text-gray-700">
          {{ currentRadius.km }} km
        </div>
      </div>

      <button
        class="mt-3 justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500
               focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
               dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
        @click="openAddressSearch"
      >
        주소 검색
      </button>

       <button
          v-if="!locationStore.hasLocation"
          @click="askLocation"
          class="mt-3 rounded-md border border-gray-300 bg-gray-100
                px-3 py-1.5 text-sm font-semibold text-gray-700
                shadow-sm hover:bg-gray-200 hover:text-gray-900
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400
                disabled:opacity-50 disabled:cursor-not-allowed"
        >
          현재 위치 동의하기
        </button>
    </div>

    <div class="mt-5" ref="mapDiv" style="width: 100%; height: 400px"></div>

    <!-- ✅ 현재 위치 카드 UI -->
    <div class="mt-4 w-full max-w-3xl mx-auto">
      <div class="flex items-start gap-3 rounded-xl border bg-white p-4 shadow-sm">
        <div class="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          📍
        </div>
        <div class="text-left">
          <h3 class="text-sm font-semibold text-gray-500">현재 위치</h3>
          <p class="mt-1 text-gray-900 font-medium">
            {{ myAddress || '위치를 불러오는 중입니다…' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useLocationStore } from '@/stores/location'
import GetLocation from '../../../components/getLocation.vue'

const locationStore = useLocationStore()
const emit = defineEmits(['updateLocation'])

const mapDiv = ref(null)
let map = null
let marker = null
const getLoc = ref(null)

const myLat = ref('-')
const myLng = ref('-')
const myAddress = ref('')

// ✅ 반경 프리셋(네이버 줌 기준)
// 필요하면 km/zoom 값 더 튜닝하면 됨
const radiusPresets = [
  { km: 5,  zoom: 15 }, // 🔥 제일 가까움
  { km: 10,  zoom: 14 },
  { km: 25,  zoom: 13 },
  { km: 40, zoom: 12 },
  { km: 50, zoom: 11 },
]

const askLocation = () => {
  getLoc.value?.requestLocation()
}

// ✅ 슬라이더는 "단계 index"
const stepIndex = ref(2) // 기본 10km(인덱스 2)

// 현재 선택된 반경/줌
const currentRadius = computed(() => radiusPresets[stepIndex.value])

const syncLocationToParent = () => {
  if (myLat.value === '-' || myLng.value === '-') return
  emit('updateLocation', {
    lat: myLat.value,
    lng: myLng.value,
    address: myAddress.value,
    distance: currentRadius.value.km,
  })
}

// ✅ 단계가 바뀌면: store distance 갱신 + 지도 줌 갱신 + emit
watch(stepIndex, () => {
  // Pinia에 distance 저장(선택)
  if (locationStore.setDistance) {
    locationStore.setDistance(currentRadius.value.km)
  } else {
    locationStore.distance = currentRadius.value.km
  }

  if (map) {
    map.setZoom(currentRadius.value.zoom, true)
  }

  syncLocationToParent()
})
watch(
  () => [locationStore.lat, locationStore.lng],
  async ([lat, lng]) => {
    if (!lat || !lng) return
    if (!map || !marker) return // 지도 초기화 전이면 스킵

    // 1) 화면 표시용 lat/lng 업데이트
    myLat.value = Number(lat).toFixed(6)
    myLng.value = Number(lng).toFixed(6)

    // 2) 지도/마커 이동 (주소보다 먼저 해도 됨)
    const pos = new window.naver.maps.LatLng(lat, lng)
    map.setCenter(pos)
    map.setZoom(currentRadius.value.zoom, true)
    marker.setPosition(pos)

    // 3) 주소 역지오코딩
    await getAddressFromCoords(myLat.value, myLng.value)

    // 4) store에 주소까지 저장 (무한루프 방지: 주소가 바뀔 때만)
    if (locationStore.address !== myAddress.value) {
      locationStore.setLocation({ lat, lng, address: myAddress.value })
    }

    // 5) 부모로 emit
    syncLocationToParent()
  },
  { immediate: false } // 지도 생성 전에 immediate 돌면 map=null이라 의미 없음
)


onMounted(async () => {
  if (!window.naver || !window.naver.maps) {
    console.error('네이버 지도 스크립트가 로드되지 않았습니다.')
    return
  }

  // ✅ store에 distance가 있으면 그에 맞는 stepIndex로 맞춰줌(선택)
  const savedKm = Number(locationStore.distance)
  if (!Number.isNaN(savedKm)) {
    const idx = radiusPresets.findIndex(p => p.km === savedKm)
    if (idx !== -1) stepIndex.value = idx
  }

  // 초기 지도
  const startPos = new window.naver.maps.LatLng(37.3595704, 127.105399)
  map = new window.naver.maps.Map(mapDiv.value, {
    center: startPos,
    zoom: currentRadius.value.zoom,
  })

  marker = new window.naver.maps.Marker({
    position: startPos,
    map,
  })

  // ✅ 1) Pinia에 위치 있으면 그걸로 세팅
  if (locationStore.hasLocation) {
    const myPos = new window.naver.maps.LatLng(locationStore.lat, locationStore.lng)
    map.setCenter(myPos)
    map.setZoom(currentRadius.value.zoom, true)
    marker.setPosition(myPos)

    myLat.value = Number(locationStore.lat).toFixed(6)
    myLng.value = Number(locationStore.lng).toFixed(6)
    myAddress.value = locationStore.address || ''

    syncLocationToParent()
    return
  }

  // ✅ 2) 없으면 geolocation
  if (!navigator.geolocation) {
    alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.')
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords

      myLat.value = latitude.toFixed(6)
      myLng.value = longitude.toFixed(6)

      await getAddressFromCoords(myLat.value, myLng.value)

      // Pinia 저장
      locationStore.setLocation({
        lat: latitude,
        lng: longitude,
        address: myAddress.value,
      })

      const myPos = new window.naver.maps.LatLng(latitude, longitude)
      map.setCenter(myPos)
      map.setZoom(currentRadius.value.zoom, true)
      marker.setPosition(myPos)

      syncLocationToParent()
    },
    (err) => {
      console.error(err)
      alert('위치 권한을 허용해야 현재 위치를 표시할 수 있습니다.')
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
})

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
    myAddress.value = '주소를 불러오지 못했습니다.'
    return
  }

  const data = await res.json()
  const results = data?.results || []

  if (results.length === 0) {
    console.error('reverse geocode 결과 없음', data)
    myAddress.value = '주소를 찾을 수 없습니다.'
    return
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

  myAddress.value = `${base} ${roadPart}`.trim()
}

const openAddressSearch = () => {
  new window.daum.Postcode({
    oncomplete: async (data) => {
      const addr = data.roadAddress || data.jibunAddress
      myAddress.value = addr

      const coords = await getCoordsFromAddress(addr)
      if (!coords) return

      const myPos = new window.naver.maps.LatLng(coords.lat, coords.lng)
      map.setCenter(myPos)
      map.setZoom(currentRadius.value.zoom, true)
      marker.setPosition(myPos)

      myLat.value = Number(coords.lat).toFixed(6)
      myLng.value = Number(coords.lng).toFixed(6)

      // ✅ Pinia에도 저장 (주소검색으로 위치 바꾼 경우)
      locationStore.setLocation({
        lat: coords.lat,
        lng: coords.lng,
        address: addr,
      })

      syncLocationToParent()
    },
  }).open()
}

async function getCoordsFromAddress(address) {
  const clean = normalizeAddress(address)
  const query = encodeURIComponent(clean)

  const res = await fetch(`/naver/map-geocode/v2/geocode?query=${query}`)
  const data = await res.json()

  if (!data.addresses || data.addresses.length === 0) {
    console.error('좌표를 찾을 수 없습니다.')
    return null
  }

  const location = data.addresses[0]
  return { lat: Number(location.y), lng: Number(location.x) }
}

function normalizeAddress(address) {
  return address
    .replace(/지하/g, '')
    .replace(/지상/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
</script>

<style scoped></style>
