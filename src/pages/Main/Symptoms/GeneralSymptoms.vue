<template>
  <LoadingSpinner v-if="isLoading" />
  <router-link
    :to="{ name: 'main' }"
    class="block text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500"
  >
    뒤로가기
  </router-link>

  <div class="text-center">
    <h1 class="text-3xl">증상 선택하기</h1>
  </div>

  
<div class="mt-4 flex flex-col lg:flex-row gap-6">
  <!-- 왼쪽: 3D 캔버스 -->
  <div class="w-full lg:w-1/2">
    <div ref="canvasContainer" class="three-container"></div>
    <p class="text-xs text-center mt-2">
      (증상 설명은 안적어도 무방하지만 자세한 응급실 찾기를 위해 증상 입력 바랍니다.)
    </p>
  </div>

  <!-- 오른쪽: 증상 입력 -->
  <div class="w-full lg:w-1/2">
    <div class="mb-6">
  <p class="mb-2 text-sm font-semibold text-gray-800">환자의 성별</p>

  <div class="grid grid-cols-2 gap-3">
    <!-- 남성 -->
    <label
      class="group flex items-center justify-between rounded-lg border p-3 cursor-pointer
             transition hover:bg-gray-50"
      :class="patientGender === 'M'
        ? 'border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50'
        : 'border-gray-200'"
    >
      <div class="flex items-center gap-3">
        <span
          class="grid h-5 w-5 place-items-center rounded-full border"
          :class="patientGender === 'M'
            ? 'border-indigo-600'
            : 'border-gray-300'"
        >
          <span
            class="h-2.5 w-2.5 rounded-full"
            :class="patientGender === 'M'
              ? 'bg-indigo-600'
              : 'bg-transparent'"
          ></span>
        </span>

        <span class="text-sm font-medium text-gray-800">남성</span>
      </div>

      <input
        type="radio"
        value="M"
        v-model="patientGender"
        class="sr-only"
      />
    </label>

    <!-- 여성 -->
    <label
      class="group flex items-center justify-between rounded-lg border p-3 cursor-pointer
             transition hover:bg-gray-50"
      :class="patientGender === 'F'
        ? 'border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50'
        : 'border-gray-200'"
    >
      <div class="flex items-center gap-3">
        <span
          class="grid h-5 w-5 place-items-center rounded-full border"
          :class="patientGender === 'F'
            ? 'border-indigo-600'
            : 'border-gray-300'"
        >
          <span
            class="h-2.5 w-2.5 rounded-full"
            :class="patientGender === 'F'
              ? 'bg-indigo-600'
              : 'bg-transparent'"
          ></span>
        </span>

        <span class="text-sm font-medium text-gray-800">여성</span>
      </div>

      <input
        type="radio"
        value="F"
        v-model="patientGender"
        class="sr-only"
      />
    </label>
  </div>
</div>
<div>
  <p class="mb-2 text-sm font-semibold text-gray-800">환자의 연령대</p>

  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
    <label
      v-for="age in ageGroups"
      :key="age.value"
      class="cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-medium
             transition hover:bg-gray-50"
      :class="patientAgeGroup === age.value
        ? 'border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50 text-indigo-700'
        : 'border-gray-200 text-gray-800'"
    >
      <input
        type="radio"
        :value="age.value"
        v-model="patientAgeGroup"
        class="sr-only"
      />
      {{ age.label }}
    </label>
  </div>
</div>


    <div
      v-for="value in bodyPartLabels.filter(v => symptoms.includes(v.name))"
      :key="value.name"
      class="mt-3 flex items-center justify-between"
    >
      <span class="font-semibold">
        {{ value.label }} :
      </span>
      <input
        type="text"
        v-model="SymptomDescription[value.label]"
        class="border rounded-sm ml-4 w-1/2"
      />
    </div>
  </div>

  </div>

  <div>
  
    <p class="mt-3 text-red-500 text-sm" v-if="errorMsg">{{ errorMsg }}</p>
    <button
      @click="findhospital"
      class="mt-5 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
    >
      병원 찾기
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useRouter } from 'vue-router'
import LoadingSpinner from '../../../components/LoadingSpinner.vue'


const patientGender = ref('')
const patientAgeGroup = ref('')

const ageGroups = [
  { label: '영유아(0~5살)', value: '0~5' },
  { label: '어린이(5~10살)', value: '5~10' },
  { label: '청소년(10대)', value: '10~20' },
  { label: '20대', value: '20~30' },
  { label: '30대', value: '30~40' },
  { label: '40대', value: '40~50' },
  { label: '50대', value: '50~60' },
  { label: '60대', value: '60~70' },
  { label: '70대 이상', value: '70~120' },

]


const router = useRouter()
const errorMsg = ref('')
const isLoading = ref(false)

const findhospital = async () => {
  const mergedSymptoms = bodyPartLabels
    .filter(v => symptoms.value.includes(v.name)) // 선택된 부위만
    .map(v => `${v.label} ${SymptomDescription.value[v.label] || ''}`)

  if (!patientGender.value || !patientAgeGroup.value) {
  errorMsg.value = '성별과 연령대를 선택해주세요.'
  return
  } 

  
  if (mergedSymptoms.length === 0) {
  errorMsg.value = '치료 부위를 선택해주세요'
  return
  } 

  localStorage.setItem('symptom', JSON.stringify(mergedSymptoms))
  localStorage.setItem('patient_gender', patientGender.value)
  localStorage.setItem('patient_age', patientAgeGroup.value)
  router.push({ name: 'recommenderlist' })
 
}

const symptoms = ref([])
const SymptomDescription = ref({})

const canvasContainer = ref(null)
let animationId = null
let model = null
let renderer = null
let scene = null

let targetRotX = 0
let targetRotY = 0
let isDragging = false

let camera = null
let zoomSpeed = 0.5
let lastX = 0

// 부위 클릭용
let raycaster = new THREE.Raycaster()
let mouse = new THREE.Vector2()

const bodyParts = [
  //  머리
  { name: 'Head', pos: [0, 0.82, 0], type: 'sphere', size: [0.15] },

  //  상체
  { name: 'Chest', pos: [0, 0.52, 0.08], type: 'box', size: [0.35, 0.4, 0.25] },
  { name: 'UpperBack', pos: [0, 0.55, -0.08], type: 'box', size: [0.35, 0.35, 0.2] },
  { name: 'LowerBack', pos: [0, 0.25, -0.08], type: 'box', size: [0.28, 0.2, 0.2] },
  { name: 'Abdomen', pos: [0, 0.22, 0.08], type: 'box', size: [0.28, 0.23, 0.2] },

  //  팔 (상완)
  { name: 'Biceps_R', pos: [-0.3, 0.62, 0], type: 'box', size: [0.3, 0.15, 0.15] },
  { name: 'Biceps_L', pos: [0.3, 0.62, 0], type: 'box', size: [0.3, 0.15, 0.15] },

  //  팔 (하완)
  { name: 'Forearm_R', pos: [-0.6, 0.62, 0], type: 'box', size: [0.35, 0.15, 0.15] },
  { name: 'Forearm_L', pos: [0.6, 0.62, 0], type: 'box', size: [0.35, 0.15, 0.15] },

  //  손
  { name: 'Hand_R', pos: [-0.88, 0.62, 0], type: 'sphere', size: [0.12] },
  { name: 'Hand_L', pos: [0.88, 0.62, 0], type: 'sphere', size: [0.12] },

  //  허벅지
  { name: 'Thighs_R', pos: [-0.12, -0.25, 0], type: 'box', size: [0.15, 0.35, 0.18] },
  { name: 'Thighs_L', pos: [0.12, -0.25, 0], type: 'box', size: [0.15, 0.35, 0.18] },

  //  종아리
  { name: 'Calf_R', pos: [-0.15, -0.6, 0], type: 'box', size: [0.16, 0.35, 0.16] },
  { name: 'Calf_L', pos: [0.15, -0.6, 0], type: 'box', size: [0.16, 0.35, 0.16] },

  //  발
  { name: 'Foot_R', pos: [-0.15, -0.9, 0], type: 'sphere', size: [0.14] },
  { name: 'Foot_L', pos: [0.15, -0.9, 0], type: 'sphere', size: [0.14] },

  //  골반
  { name: 'Hips', pos: [0, 0.05, -0.08], type: 'box', size: [0.35, 0.2, 0.25] },

  // 중요 부위
  { name: 'Genitalia', pos: [0, 0, 0.08], type: 'box', size: [0.35, 0.2, 0.25] }
]

const bodyPartLabels = [
  { name: 'Head', label: '머리' },

  { name: 'Chest', label: '가슴' },
  { name: 'UpperBack', label: '등(상부)' },
  { name: 'LowerBack', label: '허리' },
  { name: 'Abdomen', label: '복부' },

  { name: 'Biceps_R', label: '오른쪽 위팔' },
  { name: 'Biceps_L', label: '왼쪽 위팔' },

  { name: 'Forearm_R', label: '오른쪽 팔뚝' },
  { name: 'Forearm_L', label: '왼쪽 팔뚝' },

  { name: 'Hand_R', label: '오른손' },
  { name: 'Hand_L', label: '왼손' },

  { name: 'Thighs_R', label: '오른쪽 허벅지' },
  { name: 'Thighs_L', label: '왼쪽 허벅지' },

  { name: 'Calf_R', label: '오른쪽 종아리' },
  { name: 'Calf_L', label: '왼쪽 종아리' },

  { name: 'Foot_R', label: '오른발' },
  { name: 'Foot_L', label: '왼발' },

  { name: 'Hips', label: '골반' },
  { name: 'Genitalia', label: '급소' }
]

const parts = {} // 실제 glTF 파트 (헤드, 손 등)
const hitboxes = {} // hitbox 객체
const selected = {}

const handleWheel = e => {
  if (!camera) return

  camera.position.z += e.deltaY * 0.01 * zoomSpeed
  camera.position.z = Math.min(Math.max(camera.position.z, 1.5), 5)
}

// ✅ 포인터 다운: 드래그 시작 위치만 기록
const handlePointerDown = e => {
  if (!canvasContainer.value) return
  isDragging = true
  const rect = canvasContainer.value.getBoundingClientRect()
  lastX = e.clientX - rect.left
}

// ✅ 포인터 무브: 이동량(deltaX)만큼 회전
const handlePointerMove = e => {
  if (!isDragging || !canvasContainer.value) return
  const rect = canvasContainer.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const deltaX = x - lastX
  lastX = x

  const rotSpeed = 0.01
  targetRotY += deltaX * rotSpeed
}

// ✅ 포인터 업: 드래그 종료
const handlePointerUp = () => {
  isDragging = false
}

onMounted(() => {
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight

  // 씬 생성
  scene = new THREE.Scene()

  // 카메라 생성
  camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000)
  camera.position.set(0, 0.25, 5)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  canvasContainer.value.appendChild(renderer.domElement)

  // 조명 생성
  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1)
  scene.add(light)

  // 배경
  scene.background = new THREE.Color('white')

  // glTF 로드
  const loader = new GLTFLoader()
  loader.load(
    '/mannequin/scene.gltf',
    gltf => {
      model = gltf.scene
      model.position.set(0, 0, 0)
      scene.add(model)

      bodyParts.forEach(p => {
        parts[p.name] = model.getObjectByName(p.name)
        selected[p.name] = false
      })

      makeHeatbox()
      animate()

      const dom = renderer.domElement
      dom.style.touchAction = 'none' // 모바일에서 드래그 시 스크롤 방지

      dom.addEventListener('wheel', handleWheel)
      dom.addEventListener('pointerdown', handlePointerDown)
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      dom.addEventListener('click', onClickHitbox)
    },
    undefined,
    error => {
      console.error('GLTF load error:', error)
    }
  )

  const animate = () => {
    animationId = requestAnimationFrame(animate)

    if (model) {
      model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, targetRotY, 0.1)
      model.rotation.x = THREE.MathUtils.lerp(model.rotation.x, targetRotX, 0.1)
    }

    renderer.render(scene, camera)
  }
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)

  const dom = canvasContainer.value?.querySelector('canvas')
  if (dom) {
    dom.removeEventListener('wheel', handleWheel)
    dom.removeEventListener('pointerdown', handlePointerDown)
    dom.removeEventListener('click', onClickHitbox)
  }
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
})

// 히트박스 만들기
const makeHeatbox = () => {
  const hitMat = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true,
    transparent: true,
    opacity: 0.4
  })

  bodyParts.forEach(p => {
    let geo
    if (p.type === 'sphere') {
      geo = new THREE.SphereGeometry(p.size[0], 16, 16)
    } else if (p.type === 'box') {
      geo = new THREE.BoxGeometry(p.size[0], p.size[1], p.size[2])
    }
    const mesh = new THREE.Mesh(geo, hitMat.clone())
    mesh.position.set(...p.pos)
    mesh.visible = false

    hitboxes[p.name] = mesh
    model.add(mesh)
  })
}

const onClickHitbox = event => {
  if (!renderer || !camera) return

  errorMsg.value = ''
  const rect = renderer.domElement.getBoundingClientRect()

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  const hitboxList = Object.values(hitboxes)
  const intersects = raycaster.intersectObjects(hitboxList, false)

  if (!intersects.length) return

  const hitObj = intersects[0].object
  const clickedName = Object.keys(hitboxes).find(key => hitboxes[key] === hitObj)

  togglePart(clickedName)
}

const togglePart = name => {
  selected[name] = !selected[name]

  const part = parts[name]
  if (!part) return

  part.traverse(child => {
    if (child.isMesh) {
      child.material = child.material.clone()

      if (selected[name]) {
        child.material.color.set(0xff0000) // 선택됨
      } else {
        child.material.color.set(0xffffff) // 기본색
        child.material.roughness = 0.6
        child.material.metalness = 0
      }
    }
  })

  if (selected[name]) {
    if (!symptoms.value.includes(name)) {
      symptoms.value.push(name)
    }
  } else {
    const idx = symptoms.value.indexOf(name)
    if (idx !== -1) symptoms.value.splice(idx, 1)
  }
}
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 500px; /* 높이 안 주면 안 보일 수 있음 */

    display: flex;
  align-items: center;    /* 세로 중앙 */
  justify-content: center;/* 가로 중앙 */

  border: 2px solid black;
}
</style>
