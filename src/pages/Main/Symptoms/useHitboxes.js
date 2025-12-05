// src/composables/useHitboxes.js
import * as THREE from 'three'
import { ref } from 'vue'

export function useHitboxes(symptoms, errorMsg) {
  // 내부 상태
  const mouse = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()
  const hitboxes = {}
  const parts = {}
  const selected = ref({}) // { head: true/false, arm: ... }

  // bodyParts 정보로 parts / selected 초기화
  const registerBodyParts = (model, bodyParts) => {
    bodyParts.forEach(p => {
      parts[p.name] = model.getObjectByName(p.name)
      selected.value[p.name] = false
    })
  }

  // 히트박스 생성
  const makeHitbox = (model, bodyParts) => {
    const hitMat  = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    })

    bodyParts.forEach(p => {
      let geo
      if (p.type === "sphere") {
        geo = new THREE.SphereGeometry(p.size[0], 16, 16)
      } else if (p.type === "box") {
        geo = new THREE.BoxGeometry(p.size[0], p.size[1], p.size[2])
      }

      const mesh = new THREE.Mesh(geo, hitMat.clone())
      mesh.position.set(...p.pos)
      mesh.visible = false

      hitboxes[p.name] = mesh
      model.add(mesh)
    })
  }

  const togglePart = (name) => {
    const current = !!selected.value[name]
    selected.value[name] = !current

    const part = parts[name]
    if (!part) return

    part.traverse(child => {
      if (child.isMesh) {
        child.material = child.material.clone()

        if (selected.value[name]) {
          child.material.color.set(0xff0000)     // 선택됨
        } else {
          child.material.color.set(0xffffff)     // 기본색
          child.material.roughness = 0.6
          child.material.metalness = 0
        }
      }
    })

    // symptoms 배열 동기화
    if (selected.value[name]) {
      if (!symptoms.value.includes(name)) {
        symptoms.value.push(name)
      }
    } else {
      const idx = symptoms.value.indexOf(name)
      if (idx !== -1) symptoms.value.splice(idx, 1)
    }
  }

  const onClickHitbox = (event, renderer, camera) => {
    if (!renderer || !camera) return

    if (errorMsg) errorMsg.value = ''

    const rect = renderer.domElement.getBoundingClientRect()

    // 화면 좌표 → NDC(-1 ~ 1)
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)

    const hitboxList = Object.values(hitboxes)
    const intersects = raycaster.intersectObjects(hitboxList, false)

    if (!intersects.length) return

    const hitObj = intersects[0].object
    const clickedName = Object.keys(hitboxes).find(
      key => hitboxes[key] === hitObj
    )

    if (clickedName) {
      togglePart(clickedName)
    }
  }

  return {
    // 상태
    selected,
    parts,
    hitboxes,
    // 메서드
    registerBodyParts,
    makeHitbox,
    togglePart,
    onClickHitbox,
  }
}


// 사용 X