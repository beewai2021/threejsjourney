import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from "dat.gui"

import "./style.css"

import vertexShader from "./shaders/vertex.glsl"
import fragmentShader from "./shaders/fragment.glsl"

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

// const axesHelper = new THREE.AxesHelper(3)
// scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const flagTexture = textureLoader.load("/textures/share-image.png")

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 60, 60)
const posCount = geometry.attributes.position.count // count of vertices
const posCountFloat32Array = new Float32Array(posCount)
for (let i = 0; i < posCount; i++) {
  posCountFloat32Array[i] = Math.random() // randomise positions
}
geometry.setAttribute(
  "aRandom",
  new THREE.Float32BufferAttribute(posCountFloat32Array, 1)
)

// Material
const material = new THREE.RawShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    uFrequency: { value: new THREE.Vector2(8.63, 1.448) },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0, 48, 210, 1) },
    uTexture: { value: flagTexture },
  },
  // common material properties
  wireframe: false,
  // transparent: true,
  // flatShading: true,
  side: THREE.FrontSide,
  // material properties require re-write in shaders
  // map, alphaMap, opacity, color
})
// gui.add(material.uniforms.uFrequency.value, "x", 0, 20, 0.01).name("frequencyX")
// gui.add(material.uniforms.uFrequency.value, "y", 0, 2, 0.001).name("frequencyY")

// Mesh
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.set(-0.22, 0.0375, 0.9)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enableRotate = false
controls.enablePan = false
controls.enableZoom = false
controls.target = new THREE.Vector3(0.5, 0, 0)
// controls.addEventListener("change", (e) => console.log(e.target.object))

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  material.uniforms.uTime.value = elapsedTime

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
