<template>
  
  <div class="text-center">
    <h1 class="text-3xl">증상 선택하기</h1>
    <p class="text-xs">(증상 설명은 안적어도 무방하지만 자세한 응급실 찾기를 위해 증상 입력 바랍니다.)</p>
  </div>
  <div ref="canvasContainer" class="mt-3 three-container"></div>
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
      class="border border-black-500 rounded-sm ml-4 w-1/2">
  </div>

    <div>
      <p class="text-red-500 text-sm" v-if="errorMsg">{{ errorMsg }}</p>
    <button @click="findhospital" class=" mt-5 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500">
      병원 찾기
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useRouter } from 'vue-router'
import api from '../../../components/api'

const access = localStorage.getItem("access_token")
const router = useRouter()
const errorMsg = ref('')

const findhospital = async () => {
  const mergedSymptoms = bodyPartLabels
    .filter(v => symptoms.value.includes(v.name))   // 선택된 부위만
    .map(v => `${v.label} ${SymptomDescription.value[v.label] || ''}`)
  

  console.log(mergedSymptoms)
  try{
    const res = await api.post(`hospitals/general/symptom/`,{
      symptom : mergedSymptoms
     },{
          headers: {
            Authorization: `Bearer ${access}`,
          },})
        localStorage.setItem('hospital_data', JSON.stringify(res.data))
        router.push({ name: 'hospitallist' })
    }
    catch (error){
      errorMsg.value="아픈곳을 선택해주세요"
    }
    
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
let geo


// 부위 클릭용
let raycaster = new THREE.Raycaster()
let mouse = new THREE.Vector2()
const bodyParts = [
  //  머리
  { name: "Head",       pos: [0, 0.82, 0], type: "sphere", size: [0.15] },

  //  상체
  { name: "Chest",      pos: [0, 0.52, 0.08], type: "box",    size: [0.35, 0.4, 0.25] },
  { name: "UpperBack",  pos: [0, 0.55, -0.08], type: "box",    size: [0.35, 0.35, 0.20] },
  { name: "LowerBack",  pos: [0, 0.25, -0.08], type: "box",    size: [0.28, 0.20, 0.20] },
  { name: "Abdomen",    pos: [0, 0.22, 0.08], type: "box",    size: [0.28, 0.23, 0.20] },

  //  팔 (상완)
  { name: "Biceps_R",   pos: [-0.3, 0.62, 0], type: "box",    size: [0.3, 0.15, 0.15] },
  { name: "Biceps_L",   pos: [0.3, 0.62, 0], type: "box",    size: [0.3, 0.15, 0.15] },

  //  팔 (하완)
  { name: "Forearm_R",  pos: [-0.6, 0.62, 0], type: "box",    size: [0.35, 0.15, 0.15] },
  { name: "Forearm_L",  pos: [0.6, 0.62, 0], type: "box",    size: [0.35, 0.15, 0.15] },

  //  손
  { name: "Hand_R",     pos: [-0.88, 0.62, 0], type: "sphere", size: [0.12] },
  { name: "Hand_L",     pos: [0.88, 0.62, 0], type: "sphere", size: [0.12] },

  //  허벅지
  { name: "Thighs_R",   pos: [-0.12, -0.25, 0], type: "box",    size: [0.15, 0.35, 0.18] },
  { name: "Thighs_L",   pos: [0.12, -0.25, 0], type: "box",    size: [0.15, 0.35, 0.18] },

  //  종아리
  { name: "Calf_R",     pos: [-0.15, -0.6, 0], type: "box",    size: [0.16, 0.35, 0.16] },
  { name: "Calf_L",     pos: [0.15, -0.6, 0], type: "box",    size: [0.16, 0.35, 0.16] },

  //  발
  { name: "Foot_R",     pos: [-0.15, -0.9, 0], type: "sphere", size: [0.14] },
  { name: "Foot_L",     pos: [0.15, -0.9, 0], type: "sphere", size: [0.14] },

  //  골반
  { name: "Hips",       pos: [0, 0.05, -0.08], type: "box",    size: [0.35, 0.2, 0.25] },

  // 중요 부위
  { name: "Genitalia",  pos: [0, 0, 0.08], type: "box",    size: [0.35, 0.2, 0.25] },
];

const bodyPartLabels = [
  { name: "Head",       label: "머리" },

  { name: "Chest",      label: "가슴" },
  { name: "UpperBack",  label: "등(상부)" },
  { name: "LowerBack",  label: "허리" },
  { name: "Abdomen",    label: "복부" },

  { name: "Biceps_R",   label: "오른쪽 위팔" },
  { name: "Biceps_L",   label: "왼쪽 위팔" },

  { name: "Forearm_R",  label: "오른쪽 팔뚝" },
  { name: "Forearm_L",  label: "왼쪽 팔뚝" },

  { name: "Hand_R",     label: "오른손" },
  { name: "Hand_L",     label: "왼손" },

  { name: "Thighs_R",   label: "오른쪽 허벅지" },
  { name: "Thighs_L",   label: "왼쪽 허벅지" },

  { name: "Calf_R",     label: "오른쪽 종아리" },
  { name: "Calf_L",     label: "왼쪽 종아리" },

  { name: "Foot_R",     label: "오른발" },
  { name: "Foot_L",     label: "왼발" },

  { name: "Hips",       label: "골반" },
  { name: "Genitalia",  label: "급소" }
]


const parts = {}        // 실제 glTF 파트 (헤드, 손 등)
const hitboxes = {}     // hitbox 객체
const selected = {} 


const handleWheel = (e) => {
  if (!camera) return

  // e.deltaY > 0 : 휠 내리기(축소)
  // e.deltaY < 0 : 휠 올리기(확대)
  camera.position.z += e.deltaY * 0.01 * zoomSpeed

  // 줌 한계 설정 (너무 가까워지거나 멀어지지 않게)
  camera.position.z = Math.min(Math.max(camera.position.z, 1.5), 5)
}

const handleMouseMove = (e) => {
  if (!isDragging) return 

  const rect = canvasContainer.value.getBoundingClientRect()

  const x = (e.clientX - rect.left) / rect.width  // 0 ~ 1
  const y = (e.clientY - rect.top) / rect.height // 0 ~ 1

  const nx = x * 2 - 1   // -1 ~ 1
  // const ny = y * 2 - 1   // -1 ~ 1 상하는 필요 없음

  // 마우스 좌우에 따라 Y축 회전, 상하에 따라 X축 회전
  const maxRot = Math.PI// 최대 45도까지만

  targetRotY = nx * maxRot    // 좌우 회전
  // targetRotX = -ny * maxRot   // 위아래 회전(뒤집히지 않도록 부호 반전)
}

const handleMouseDown = (e) => {
  isDragging = true
  // handleMouseMove(e)   // 눌렀을 때도 한 번 반응하도록
}

const handleMouseUp = () => {
  isDragging = false
}

onMounted(() => {

  const width = canvasContainer.value.clientWidth 
  const height = canvasContainer.value.clientHeight 

  // 씬 생성
  scene = new THREE.Scene();

  // 카메라 생성
  camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000);
  camera.position.set(0, 0.25, 5)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  canvasContainer.value.appendChild(renderer.domElement)

  // 조명 생성
  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1)
  scene.add(light)

  // 배경
  scene.background = new THREE.Color('white');

  // glTF 로드
  const loader = new GLTFLoader();
  loader.load(
    '/mannequin/scene.gltf', 
    (gltf) => {
    model = gltf.scene
    model.position.set(0, 0, 0)
    scene.add(model);


    bodyParts.forEach(p => {
      parts[p.name] = model.getObjectByName(p.name)
      selected[p.name] = false
    })

    makeHeatbox()
    animate()

    const dom = renderer.domElement
    dom.addEventListener('wheel', handleWheel)
    dom.addEventListener('mousedown', handleMouseDown)
    dom.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    dom.addEventListener('click', onClickHitbox)
  },
  undefined,
  (error) => {
    console.error('GLTF load error:', error)
  }
);


const animate = () => {
  animationId = requestAnimationFrame(animate)

  if (model) {
    // 부드럽게 보간
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
    dom.removeEventListener('mousedown', handleMouseDown)
    dom.removeEventListener('mousemove', handleMouseMove)
    dom.removeEventListener('wheel', handleWheel)
    dom.removeEventListener('click', onClickHitbox)
  }
  window.removeEventListener('mouseup', handleMouseUp)
})


// 히트박스 만들기
const makeHeatbox = () => {

    const hitMat  = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    })

    bodyParts.forEach(p => {
      if (p.type === "sphere") {
        geo = new THREE.SphereGeometry(p.size[0], 16, 16);
      } 
      else if (p.type === "box") {
        geo = new THREE.BoxGeometry(p.size[0], p.size[1], p.size[2]);
      }
      const mesh = new THREE.Mesh(geo, hitMat.clone())
      mesh.position.set(...p.pos)
      mesh.visible = false

      hitboxes[p.name] = mesh
      model.add(mesh)
   })

}

const onClickHitbox = (event) => {
  if (!renderer || !camera) return

  errorMsg.value = ""
  const rect = renderer.domElement.getBoundingClientRect()

  // 화면 좌표 → NDC(-1 ~ 1)
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  // headHitbox만 검사
  const hitboxList = Object.values(hitboxes)
  const intersects = raycaster.intersectObjects(hitboxList, false)

  if (!intersects.length) return

  const hitObj = intersects[0].object
  const clickedName = Object.keys(hitboxes).find(
    key => hitboxes[key] === hitObj
  )

  togglePart(clickedName)
}

const togglePart = (name) => {
  selected[name] = !selected[name]

  const part = parts[name]
  if (!part) return

  part.traverse(child => {
    if (child.isMesh) {
      child.material = child.material.clone()
      
      if (selected[name]) {
        child.material.color.set(0xff0000)     // 선택됨
      } else {
        child.material.color.set(0xffffff)     // 기본색
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
  border: 2px solid black;
}
</style>