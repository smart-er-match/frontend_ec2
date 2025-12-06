

<template>
    <div class="text-center">
    <div class="flex justify-center items-center gap-4">


    <div class="mt-3 w-50 border-2 border-black-500">
      <h3>반경 설정</h3>
         <input
          type="range"
          v-model="distance"
          min="10"
          max="50"
          class="slider"
        />
        {{ distance }} km
     </div>

      <button class="mt-3 justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
      @click="openAddressSearch">주소 검색</button>
    </div>
      <div
        class="mt-5"
        ref="mapDiv"
        style="width: 100%; height: 400px"
      >
    </div>

      <div>
        <h3 class="mt-2">현재 위치 정보</h3>
        <p>{{ myAddress }}</p>
      </div>
    
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

const mapDiv = ref(null)
const myLat = ref('-')
const myLng = ref('-')
const myAddress = ref('')
const distance = ref(10)
let map = null
let marker = null
const emit = defineEmits(['updateLocation'])



const syncLocationToParent = () => {
  if (myLat.value === '-' || myLng.value === '-') return  // 아직 값 없으면 패스

  emit('updateLocation', {
    lat: myLat.value,
    lng: myLng.value,
    address: myAddress.value,
    distance: distance.value,
  })
}



watch(distance, () => {
  syncLocationToParent ()
})

// 접속 하자마자 위치 가져오는 로직
onMounted(() => {
  if (!window.naver || !window.naver.maps) {
    console.error('네이버 지도 스크립트가 로드되지 않았습니다.')
    return
  }

  // 초기 지도
  const startPos = new window.naver.maps.LatLng(37.3595704, 127.105399)
  map = new window.naver.maps.Map(mapDiv.value, {
    center: startPos,
    zoom: 17,
  })

  marker = new window.naver.maps.Marker({
    position: startPos,
    map,
  })

  // 내 위치 가져오기
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords

        myLat.value = latitude.toFixed(6)
        myLng.value = longitude.toFixed(6)

        await getAddressFromCoords(myLat.value, myLng.value)
        const myPos = new window.naver.maps.LatLng(latitude, longitude)

        // 지도/마커 업데이트
        map.setCenter(myPos)
        marker.setPosition(myPos)

        syncLocationToParent()
      },
      (err) => {
        console.error(err)
        alert('위치 권한을 허용해야 현재 위치를 표시할 수 있습니다.')
      }
    )
  } else {
    alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.')
  }

})

async function getAddressFromCoords(lat, lng) {
  const url =
    `/naver/map-reversegeocode/v2/gc` +
    `?request=coordsToaddr` +
    `&coords=${lng},${lat}` +
    `&sourcecrs=epsg:4326` +
    `&orders=roadaddr` +
    `&output=json`

  const res = await fetch(url)   // 헤더 없음

  const data = await res.json()

  const result = data.results[0]
  const region = result.region
  const land = result.land

  myAddress.value =
    `${region.area1.name} ${region.area2.name} ${region.area3.name} ` +
    `${land?.number1 || ''} ${land?.number2 ? '-' + land.number2 : ''}`
}

const openAddressSearch = () => {
  new window.daum.Postcode({
    oncomplete: async (data) => {
      const addr = data.roadAddress || data.jibunAddress
      myAddress.value = addr

      // 주소를 위도,, 경도로 변환
      const coords = await getCoordsFromAddress(addr)

      const myPos = new window.naver.maps.LatLng(coords.lat, coords.lng)
      // 지도/마커 업데이트
      map.setCenter(myPos)
      marker.setPosition(myPos)

      myLat.value = coords.lat
      myLng.value = coords.lng

      syncLocationToParent()
    },
  }).open()
}


async function getCoordsFromAddress(address) {
  const clean = normalizeAddress(address)
  const query = encodeURIComponent(clean)

  const res = await fetch(
    `/naver/map-geocode/v2/geocode?query=${query}`
  )

  const data = await res.json()

  if (!data.addresses || data.addresses.length === 0) {
    console.error("좌표를 찾을 수 없습니다.")
    return null
  }

  const location = data.addresses[0]
  return {
    lat: Number(location.y),
    lng: Number(location.x)
  }
}

function normalizeAddress(address) {
  return address
    .replace(/지하/g, "")     // 지하만 제거, 숫자는 남김
    .replace(/지상/g, "")
    .replace(/\s+/g, " ")     // 공백 정리
    .trim()
}
</script>
<style scoped></style>
