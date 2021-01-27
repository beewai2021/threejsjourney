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

// Particles
const particlesConfig = {
  particlesCount: 1000,
  particleSize: 0.03,
  particleColor: 0xffff00,
  particlesDiameter: 3,
  particlesCeiling: 3,
  levels: 5,
  levelRandomness: 0.08,
  edgeColor: 0x0000ff,
}

const particlesGeometry = new THREE.BufferGeometry()

const pointsPerVertex = 3

const particlesPositions = new Float32Array(
  particlesConfig.particlesCount * pointsPerVertex
)

const circleParticleSpread =
  (Math.PI * 2) / (particlesConfig.particlesCount / particlesConfig.levels)

for (let point = 0; point < particlesConfig.particlesCount; point++) {
  const vertexPoint = point * 3 // 0... 3... 6... 9...

  const vertexX = vertexPoint + 0 // x
  const vertexY = vertexPoint + 1 // y
  const vertexZ = vertexPoint + 2 // z

  const angle = circleParticleSpread * (point + 1)

  // x offset
  particlesPositions[vertexX] =
    Math.sin(angle) * particlesConfig.particlesDiameter

  const particlesPerLevel =
    particlesConfig.particlesCount / particlesConfig.levels

  const levelIndex = Math.floor(point / particlesPerLevel)

  const levelIndexWithCeilingFactor =
    levelIndex *
    (particlesConfig.particlesCeiling / (particlesConfig.levels - 1))

  // y offset
  const yOffsetRandomness =
    (Math.random() - 0.5) * particlesConfig.levelRandomness

  particlesPositions[vertexY] = levelIndexWithCeilingFactor + yOffsetRandomness

  // z offset
  particlesPositions[vertexZ] =
    Math.cos(angle) * particlesConfig.particlesDiameter
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

// particles.geometry.center()

scene.add(particles)

// Axes helper
const axesHelper = new THREE.AxesHelper(particlesConfig.particlesCeiling)
scene.add(axesHelper)

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
camera.position.set(2.16, 3.18, 6.42)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
// controls.addEventListener("change", (e) => {
//   console.log(e.target.object.position)
// })

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // particles.rotation.y = elapsedTime * 0.2

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
