<!-- FindLocation.vue (통째로 교체) -->
<template>
  <GetLocation ref="getLoc" @error="onLocError" />

  <div class="text-center">
    <div class="flex justify-center items-center gap-4">
      <!-- ✅ 반경(줌 단계) 프리셋 슬라이더 -->
      <div class="mt-3 w-72 gap-2 border rounded-lg p-3 bg-white">
        <h3 class="mb-2 flex items-center font-semibold text-gray-800">
          <span>반경 설정:</span>
          <span class="ml-2 text-sm font-medium text-gray-800">
            {{ currentRadius.km }} km
          </span>
        </h3>

        <input
          type="range"
          v-model.number="stepIndex"
          :min="0"
          :max="radiusPresets.length - 1"
          step="1"
          class="w-full"
        />
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
            {{ myAddress || "위치를 불러오는 중입니다…" }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed, nextTick } from "vue";
import { useLocationStore } from "@/stores/location";
import GetLocation from "../../../components/getLocation.vue";

const locationStore = useLocationStore();

const onLocError = (msg) => {
  console.log("[loc error]", msg);
  window.alert(msg);
};

const mapDiv = ref(null);
const getLoc = ref(null);

let map = null;
let myMarker = null;
let hospitalMarkers = [];

// ✅ 맵 준비 상태 + 맵 준비 전 들어온 top3 목록 임시 저장
const isMapReady = ref(false);
const pendingTopHospitals = ref(null);

const myLat = ref("-");
const myLng = ref("-");
const myAddress = ref("");

// ✅ 반경 프리셋(네이버 줌 기준)
const radiusPresets = [
  { km: 5, zoom: 13 },
  { km: 10, zoom: 11 },
  { km: 25, zoom: 10 },
  { km: 40, zoom: 9 },
  { km: 50, zoom: 8 },
];

const stepIndex = ref(1);
const currentRadius = computed(() => radiusPresets[stepIndex.value]);

// ✅ 단계 변경 시: store distance 갱신 + 지도 줌 갱신
watch(
  stepIndex,
  () => {
    if (typeof locationStore.setDistance === "function") {
      locationStore.setDistance(currentRadius.value.km);
    } else {
      locationStore.distance = currentRadius.value.km;
    }

    if (map) {
      map.setZoom(currentRadius.value.zoom, true);
    }
  },
  { immediate: true }
);

// ✅ store의 lat/lng 변경되면 지도/마커/주소 갱신
watch(
  () => [locationStore.lat, locationStore.lng, locationStore.address],
  ([lat, lng, addr]) => {
    if (!lat || !lng) return;
    if (!map || !myMarker) return;

    myLat.value = Number(lat).toFixed(6);
    myLng.value = Number(lng).toFixed(6);
    myAddress.value = addr || myAddress.value;

    const pos = new window.naver.maps.LatLng(lat, lng);
    map.setCenter(pos);
    map.setZoom(currentRadius.value.zoom, true);
    myMarker.setPosition(pos);
  }
);

// ✅ 병원 객체에서 좌표를 유연하게 뽑기 (lat/lng 없을 때 대비)
const pickCoord = (h) => {
  const lat =
    h?.lat ?? h?.latitude ?? h?.y ?? h?.mapy ?? h?.wgs84Lat ?? h?.LAT;
  const lng =
    h?.lng ?? h?.longitude ?? h?.x ?? h?.mapx ?? h?.wgs84Lon ?? h?.LON;

  const nLat = Number(lat);
  const nLng = Number(lng);

  if (!Number.isFinite(nLat) || !Number.isFinite(nLng)) return null;
  return { lat: nLat, lng: nLng };
};

onMounted(async () => {
  await nextTick();

  if (!window.naver || !window.naver.maps) {
    console.error("네이버 지도 스크립트가 로드되지 않았습니다.");
    return;
  }

  // ✅ 위치 없으면 요청 (GetLocation이 store 채우는 구조)
  if (!locationStore.hasLocation) {
    getLoc.value?.requestLocation?.();
  }

  // 초기 지도
  const startPos = new window.naver.maps.LatLng(37.3595704, 127.105399);
  map = new window.naver.maps.Map(mapDiv.value, {
    center: startPos,
    zoom: currentRadius.value.zoom,
  });

  myMarker = new window.naver.maps.Marker({
    position: startPos,
    map,
  });

  // ✅ Pinia에 위치 있으면 그걸로 세팅
  if (locationStore.hasLocation) {
    const myPos = new window.naver.maps.LatLng(locationStore.lat, locationStore.lng);
    map.setCenter(myPos);
    map.setZoom(currentRadius.value.zoom, true);
    myMarker.setPosition(myPos);

    myLat.value = Number(locationStore.lat).toFixed(6);
    myLng.value = Number(locationStore.lng).toFixed(6);
    myAddress.value = locationStore.address;
  }

  // ✅ 맵 준비 완료
  isMapReady.value = true;

  // ✅ 맵 준비 전 들어온 top3 있으면 바로 한번 그리기
  if (pendingTopHospitals.value) {
    drawTopHospitals(pendingTopHospitals.value);
    pendingTopHospitals.value = null;
  }
});

const openAddressSearch = () => {
  new window.daum.Postcode({
    oncomplete: async (data) => {
      const addr = data.roadAddress || data.jibunAddress;
      myAddress.value = addr;

      const coords = await getCoordsFromAddress(addr);
      if (!coords) return;

      const myPos = new window.naver.maps.LatLng(coords.lat, coords.lng);
      map.setCenter(myPos);
      map.setZoom(currentRadius.value.zoom, true);
      myMarker.setPosition(myPos);

      myLat.value = Number(coords.lat).toFixed(6);
      myLng.value = Number(coords.lng).toFixed(6);

      // ✅ Pinia 저장
      locationStore.setLocation({
        lat: coords.lat,
        lng: coords.lng,
        address: addr,
      });

      // distance도 같이 store에 저장
      if (typeof locationStore.setDistance === "function") {
        locationStore.setDistance(currentRadius.value.km);
      } else {
        locationStore.distance = currentRadius.value.km;
      }
    },
  }).open();
};

async function getCoordsFromAddress(address) {
  const clean = normalizeAddress(address);
  const query = encodeURIComponent(clean);

  const res = await fetch(`/naver/map-geocode/v2/geocode?query=${query}`);
  const data = await res.json();

  if (!data.addresses || data.addresses.length === 0) {
    console.error("좌표를 찾을 수 없습니다.");
    return null;
  }

  const location = data.addresses[0];
  return { lat: Number(location.y), lng: Number(location.x) };
}

function normalizeAddress(address) {
  return address.replace(/지하/g, "").replace(/지상/g, "").replace(/\s+/g, " ").trim();
}

const clearHospitalMarkers = () => {
  hospitalMarkers.forEach((m) => m.setMap(null));
  hospitalMarkers = [];
};

// ✅ 외부(부모)에서 호출하는 함수
const drawTopHospitals = (hospitalList) => {
  // 맵 준비 전이면 임시 저장
  if (!isMapReady.value || !map || !window.naver?.maps) {
    pendingTopHospitals.value = hospitalList;
    return;
  }

  clearHospitalMarkers();

  (hospitalList || []).slice(0, 3).forEach((h, idx) => {
    const c = pickCoord(h);
    if (!c) {
      console.warn("[marker skip] no coord:", h);
      return;
    }

    const pos = new window.naver.maps.LatLng(c.lat, c.lng);

    const marker = new window.naver.maps.Marker({
      position: pos,
      map,
      title: h?.name || "",
      icon: {
        content: `
          <div style="
            background:#ef4444;
            color:white;
            font-size:12px;
            font-weight:bold;
            padding:4px 7px;
            border-radius:9999px;
            border:2px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,.2);
          ">
            ${idx + 1}
          </div>
        `,
        anchor: new window.naver.maps.Point(12, 12),
      },
    });

    hospitalMarkers.push(marker);
  });
};

defineExpose({ openAddressSearch, drawTopHospitals });
</script>

<style scoped></style>
