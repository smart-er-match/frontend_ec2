// src/pages/Main/Symptoms/useThreeModel.js (경로는 네가 쓰는 곳에 맞춰)
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ref } from 'vue'

export function useMannequinThree() {
  const canvasContainer = ref(null)

  let renderer = null
  let camera = null
  let scene = null
  let model = null
  let animationId = null

  const initThree = () => {
    const el = canvasContainer.value
    if (!el) return

    const width = el.clientWidth || 500
    const height = el.clientHeight || 500

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000)
    camera.position.set(0, 0.25, 5)

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    el.appendChild(renderer.domElement)

    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1)
    scene.add(light)
    scene.background = new THREE.Color('white')
  }

  const loadModel = (onLoaded) => {
    const loader = new GLTFLoader()
    loader.load(
      '/mannequin/scene.gltf',
      (gltf) => {
        model = gltf.scene
        model.position.set(0, 0, 0)
        scene.add(model)

        onLoaded && onLoaded(model)
      },
      undefined,
      (error) => {
        console.error('GLTF load error:', error)
      },
    )
  }

  const startAnimation = () => {
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      if (renderer && camera && scene) {
        renderer.render(scene, camera)
      }
    }
    animate()
  }

  const dispose = () => {
    if (animationId) cancelAnimationFrame(animationId)

    if (renderer) {
      renderer.dispose()
      const dom = renderer.domElement
      if (dom && dom.parentNode) {
        dom.parentNode.removeChild(dom)
      }
    }

    renderer = null
    camera = null
    scene = null
    model = null
  }

  const getScene = () => scene
  const getCamera = () => camera
  const getRenderer = () => renderer
  const getModel = () => model

  return {
    canvasContainer,
    initThree,
    loadModel,
    startAnimation,
    dispose,
    getScene,
    getCamera,
    getRenderer,
    getModel,
  }
}


// 사용 X