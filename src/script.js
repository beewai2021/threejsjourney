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

// Axes helper
const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

// Galaxy
const galaxyParameters = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: 0xff6030,
  outsideColor: 0x1b3984,
}

let galaxyGeometry = null
let galaxyMaterial = null
let galaxyPoints = null

const galaxyFolder = gui.addFolder("galaxy")
galaxyFolder.open()

const generateGalaxy = () => {
  if (galaxyPoints !== null) {
    // dispose - clears memory
    galaxyGeometry.dispose()
    galaxyMaterial.dispose()
    // theres not much memory usage as a mesh just combines a geometry and material, so use scene.remove() instead
    scene.remove(galaxyPoints)
  }

  galaxyGeometry = new THREE.BufferGeometry()
  const vertexPositions = 3

  // x,y,z
  const geometryVertexPositions = new Float32Array(
    galaxyParameters.count * vertexPositions
  )

  // r,g,b
  const geometryVertexColors = new Float32Array(
    galaxyParameters.count * vertexPositions
  )

  const colorInside = new THREE.Color(galaxyParameters.insideColor)
  const colorOutside = new THREE.Color(galaxyParameters.outsideColor)

  for (let i = 0; i < galaxyParameters.count; i++) {
    // create (x,y,z) for each vertex by multiplying by 3
    const i3 = i * 3 // 3, 6, 9, 12...

    const radius = Math.random() * galaxyParameters.radius // 0 <---> 5
    const spinAngle = radius * galaxyParameters.spin
    const branchAngle =
      ((i % galaxyParameters.branches) / galaxyParameters.branches) *
      (Math.PI * 2) // normalize angle between 0 <---> 1 based on # of branches

    const randomX =
      Math.pow(Math.random(), galaxyParameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      galaxyParameters.randomness
    const randomY =
      Math.pow(Math.random(), galaxyParameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      galaxyParameters.randomness
    const randomZ =
      Math.pow(Math.random(), galaxyParameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      galaxyParameters.randomness

    geometryVertexPositions[i3 + 0] =
      Math.cos(branchAngle + spinAngle) * radius + randomX // x
    geometryVertexPositions[i3 + 1] = randomY // y
    geometryVertexPositions[i3 + 2] =
      Math.sin(branchAngle + spinAngle) * radius + randomZ // z

    // Colors
    const mixedColor = colorInside.clone()
    mixedColor.lerp(colorOutside, radius / galaxyParameters.radius)

    geometryVertexColors[i3 + 0] = mixedColor.r
    geometryVertexColors[i3 + 1] = mixedColor.g
    geometryVertexColors[i3 + 2] = mixedColor.b
  }

  galaxyGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(geometryVertexPositions, vertexPositions)
  )

  galaxyGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(geometryVertexColors, vertexPositions)
  )

  galaxyMaterial = new THREE.PointsMaterial({
    size: galaxyParameters.size,
    sizeAttenuation: true,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial)

  scene.add(galaxyPoints)
}

generateGalaxy()

galaxyFolder
  .add(galaxyParameters, "count", 100, 100000, 100)
  .onFinishChange(generateGalaxy) // regenerate galaxy
galaxyFolder
  .add(galaxyParameters, "radius", 0.01, 20, 0.01)
  .onFinishChange(generateGalaxy)
galaxyFolder
  .add(galaxyParameters, "spin", -5, 5, 0.001)
  .onFinishChange(generateGalaxy)
galaxyFolder
  .add(galaxyParameters, "randomness", 0, 2, 0.001)
  .onFinishChange(generateGalaxy)
galaxyFolder
  .add(galaxyParameters, "randomnessPower", 1, 10, 0.001)
  .onFinishChange(generateGalaxy)
galaxyFolder
  .add(galaxyParameters, "branches", 2, 20, 1)
  .onFinishChange(generateGalaxy)
galaxyFolder
  .add(galaxyParameters, "size", 0, 0.1, 0.001)
  .onChange(() => (galaxyMaterial.size = galaxyParameters.size)) // update particle size using existing galaxy
galaxyFolder
  .addColor(galaxyParameters, "insideColor")
  .onFinishChange(generateGalaxy)
galaxyFolder
  .addColor(galaxyParameters, "outsideColor")
  .onFinishChange(generateGalaxy)

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
camera.position.set(2, 5, 10)
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
