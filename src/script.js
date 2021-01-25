import "./style.css"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from "dat.gui"

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

// Particle
// particle geometry
const customBufferGeometry = new THREE.BufferGeometry()
// s-shaped 2d geometry
const vertices = new Float32Array([
  -1.0,
  1.0,
  0.0, // top triangle top left
  1.0,
  1.0,
  0.0, // top triangle top right
  -1.0,
  0.5,
  0.0, // top triangle bottom left
  -1.0,
  0.5,
  0.0, // 2nd triangle top left
  1.0,
  0.5,
  0.0, // 2nd triangle top right
  1.0,
  0.0,
  0.0, // 2nd triangle bottom right
  1.0,
  0.0,
  0.0, // 3rd triangle top right
  -1.0,
  0.0,
  0.0, // 3rd triangle top left
  -1.0,
  -0.5,
  0.0, // 3rd triangle bottom left
])
const attributes = new THREE.BufferAttribute(vertices, 3)
customBufferGeometry.setAttribute("position", attributes)

// particle material
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.02, // size of particle,
  sizeAttenuation: true, // particle sizing relative to camera (far - small, near - big)
})

// points
const particles = new THREE.Points(customBufferGeometry, particlesMaterial)

scene.add(particles)

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
camera.position.set(1, 1, 2.5)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

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

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
