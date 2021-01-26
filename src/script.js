import "./style.css"

import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from "dat.gui"

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

// Axes helper
const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

// Particles
const particlesConfig = {
  particlesCount: 100,
  particleSize: 0.02,
  particleColor: 0xff0000,
  particlesRadius: 2,
  levels: 3,
}

const particlesGeometry = new THREE.BufferGeometry()

const pointsPerVertex = 3

const particlesPositions = new Float32Array(
  particlesConfig.particlesCount * pointsPerVertex
)

// 0 ---> particlesCount
for (let point = 0; point < particlesConfig.particlesCount; point++) {
  const vertexPoint = point * 3 // 0... 3... 6... 9...
  const vertexX = vertexPoint + 0 // x
  const vertexY = vertexPoint + 1 // y
  const vertexZ = vertexPoint + 2 // z
  particlesPositions[vertexX] = Math.random() * particlesConfig.particlesRadius
  // first 20 should be 0
  // second 20 should be 1
  // third 20 should be 2
  // fourth 20 should be 3
  // last 20 should be 4
  const levelElevation = Math.floor(
    point / (particlesConfig.particlesCount / particlesConfig.levels)
  )
  // TODO: add levelElevation range
  particlesPositions[vertexY] = levelElevation
  particlesPositions[vertexZ] = 0
}

particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(particlesPositions, pointsPerVertex)
)

const particlesMaterial = new THREE.PointsMaterial({
  size: particlesConfig.particleSize,
  sizeAttenuation: true,
  color: particlesConfig.particleColor,
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)

scene.add(particles)

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

// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.set(0, 0, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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
