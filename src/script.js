import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from "dat.gui"

import "./style.css"

import vertexShader from "../shaders/water/vertex.glsl"
import fragmentShader from "../shaders/water/fragment.glsl"

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 340 })

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

// const axesHelper = new THREE.AxesHelper(3)
// scene.add(axesHelper)

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512)

const debug = {
  depthColor: 0x186691,
  surfaceColor: 0x9bd8ff,
}

// Material
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  wireframe: false,
  uniforms: {
    uTime: {
      value: 0,
    },
    uBigWavesElevation: {
      value: 0.2,
    },
    uBigWavesFrequency: {
      value: new THREE.Vector2(4.0, 1.5),
    },
    uBigWavesSpeed: {
      value: 0.75,
    },
    uSmallWavesElevation: {
      value: 0.29,
    },
    uSmallWavesFrequency: {
      value: 4.61,
    },
    uSmallWavesSpeed: {
      value: 0.76,
    },
    uSmallWavesIterations: {
      value: 4.0,
    },
    uDepthColor: {
      value: new THREE.Color(debug.depthColor),
    },
    uSurfaceColor: {
      value: new THREE.Color(debug.surfaceColor),
    },
    uColorOffset: {
      value: 0.08,
    },
    uColorMultiplier: {
      value: 5,
    },
  },
})

gui
  .add(waterMaterial.uniforms.uBigWavesElevation, "value", 0, 1, 0.01)
  .name("uBigWavesElevation")
gui
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, "x", 0, 10, 0.01)
  .name("uBigWavesFrequencyX")
gui
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, "y", 0, 10, 0.01)
  .name("uBigWavesFrequencyZ")
gui
  .add(waterMaterial.uniforms.uBigWavesSpeed, "value", 0, 4, 0.01)
  .name("uBigWavesSpeed")
gui
  .add(waterMaterial.uniforms.uSmallWavesElevation, "value", 0, 1, 0.01)
  .name("uSmallWavesElevation")
gui
  .add(waterMaterial.uniforms.uSmallWavesFrequency, "value", 0, 10, 0.01)
  .name("uSmallWavesFrequency")
gui
  .add(waterMaterial.uniforms.uSmallWavesSpeed, "value", 0, 10, 0.01)
  .name("uSmallWavesSpeed")
gui
  .add(waterMaterial.uniforms.uSmallWavesIterations, "value", 0, 4, 1)
  .name("uSmallWavesIterations")
gui
  .addColor(debug, "depthColor")
  .name("depthColor")
  .onChange(() => {
    waterMaterial.uniforms.uDepthColor.value.set(debug.depthColor)
  })
gui
  .addColor(debug, "surfaceColor")
  .name("surfaceColor")
  .onChange(() => {
    waterMaterial.uniforms.uSurfaceColor.value.set(debug.surfaceColor)
  })
gui
  .add(waterMaterial.uniforms.uColorOffset, "value", 0, 5, 0.01)
  .name("uColorOffset")
gui
  .add(waterMaterial.uniforms.uColorMultiplier, "value", 0, 5, 0.01)
  .name("uColorMultiplier")

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = -Math.PI * 0.5
scene.add(water)

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
camera.position.set(1, 1, 1)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
// controls.addEventListener("change", (e) => console.log(e.target))

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

  waterMaterial.uniforms.uTime.value = elapsedTime

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
