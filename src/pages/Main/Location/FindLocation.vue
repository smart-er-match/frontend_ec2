<template>
  <GetLocation ref="getLoc" @error="onLocError"/>

  <div class="text-center">
    <div class="flex justify-center items-center gap-4">
      <!-- ✅ 반경(줌 단계) 프리셋 슬라이더 -->
      <div class="mt-3 w-72 border rounded-lg p-3 bg-white">
        <h3 class="font-semibold text-gray-800 mb-2">반경 설정</h3>

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
import { onMounted, ref, watch, computed, nextTick } from 'vue'
import { useLocationStore } from '@/stores/location'
import GetLocation from '../../../components/getLocation.vue'

const locationStore = useLocationStore()


const onLocError = (msg) => {
  console.log('[loc error]', msg)
  window.alert(msg)   // ✅ 무조건 전역 alert
}


const mapDiv = ref(null)
let map = null
let marker = null
const getLoc = ref(null)

const myLat = ref('-')
const myLng = ref('-')
const myAddress = ref('')

// ✅ 반경 프리셋(네이버 줌 기준)
const radiusPresets = [
  { km: 5,  zoom: 15 },
  { km: 10, zoom: 14 },
  { km: 25, zoom: 13 },
  { km: 40, zoom: 12 },
  { km: 50, zoom: 11 },
]


// ✅ 슬라이더 단계 index
const stepIndex = ref(2)

// 현재 선택된 반경/줌
const currentRadius = computed(() => radiusPresets[stepIndex.value])

// ✅ 단계 변경 시: store distance 갱신 + 지도 줌 갱신
watch(stepIndex, () => {
  // store에 distance 저장
  if (typeof locationStore.setDistance === 'function') {
    locationStore.setDistance(currentRadius.value.km)
  } else {
    locationStore.distance = currentRadius.value.km
  }

  if (map) {
    map.setZoom(currentRadius.value.zoom, true)
  }
})

// ✅ store의 lat/lng 변경되면 지도/마커/주소 갱신
watch(
  () => [locationStore.lat, locationStore.lng, locationStore.address],
  ([lat, lng, addr]) => {
    if (!lat || !lng) return
    if (!map || !marker) return

    myLat.value = Number(lat).toFixed(6)
    myLng.value = Number(lng).toFixed(6)
    myAddress.value = addr || myAddress.value

    const pos = new window.naver.maps.LatLng(lat, lng)
    map.setCenter(pos)
    map.setZoom(currentRadius.value.zoom, true)
    marker.setPosition(pos)
  }
)


onMounted(async () => {

  await nextTick()            // ref 연결 보장
  if (!locationStore.hasLocation) {
    getLoc.value?.requestLocation()
  }

  //   console.log(locationStore.lat)
  // console.log(locationStore.lng)
  // console.log(locationStore.address)

  if (!window.naver || !window.naver.maps) {
    console.error('네이버 지도 스크립트가 로드되지 않았습니다.')
    return
  }

  // ✅ store distance가 있으면 stepIndex 동기화(선택)
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
    myAddress.value = locationStore.address
  }
})

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

      // ✅ Pinia 저장
      locationStore.setLocation({
        lat: coords.lat,
        lng: coords.lng,
        address: addr,
      })

      // distance도 같이 store에 저장(선택)
      if (typeof locationStore.setDistance === 'function') {
        locationStore.setDistance(currentRadius.value.km)
      } else {
        locationStore.distance = currentRadius.value.km
      }
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
