import "./style.css"

import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from "postprocessing"
import * as dat from "dat.gui"

// Debug
const gui = new dat.GUI()
gui.width = 350

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

const loadingManager = new THREE.LoadingManager()

const gltfLoader = new GLTFLoader(loadingManager)
const textureLoader = new THREE.TextureLoader(loadingManager)

gltfLoader.load("/model/scene.gltf", (gltf) => {
  const matcapTexture = textureLoader.load("/matcap/matcap.png")
  const model = gltf.scene.children[0]
  model.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
    }
  })
  scene.add(model)
})

// Particles
const particleTexture = textureLoader.load("/particles/texture.png")

const particlesConfig = {
  particlesCount: 26990,
  particleSize: 0.05,
  particlesRadius: 0.94,
  particlesCeiling: 6,
  levels: 8,
  levelRandomness: 0.413,
  edgeColor: 0xffffff,
  middleColor: 0xff0086,
}

let particlesGeometry = null
let particlesMaterial = null
let particles = null

const createParticles = () => {
  if (particles !== null) {
    particlesGeometry.dispose()
    particlesMaterial.dispose()
    scene.remove(particles)
  }

  particlesGeometry = new THREE.BufferGeometry()

  const pointsPerVertex = 3

  // (x, y, z)
  const particlesPositions = new Float32Array(
    particlesConfig.particlesCount * pointsPerVertex
  )

  // (r, g, b)
  const colorPositions = new Float32Array(
    particlesConfig.particlesCount * pointsPerVertex
  )

  const circleParticleSpread =
    (Math.PI * 2) / (particlesConfig.particlesCount / particlesConfig.levels)

  const edgeColor = new THREE.Color(particlesConfig.edgeColor)
  const middleColor = new THREE.Color(particlesConfig.middleColor)

  for (let point = 0; point < particlesConfig.particlesCount; point++) {
    const vertexPoint = point * 3 // 0... 3... 6... 9...

    const vertexX = vertexPoint + 0 // x
    const vertexY = vertexPoint + 1 // y
    const vertexZ = vertexPoint + 2 // z

    const angle = circleParticleSpread * (point + 1)

    // x offset
    particlesPositions[vertexX] =
      Math.sin(angle) * particlesConfig.particlesRadius * 2

    const particlesPerLevel =
      particlesConfig.particlesCount / particlesConfig.levels

    const levelIndex = Math.floor(point / particlesPerLevel)

    const levelIndexWithCeilingFactor =
      levelIndex *
      (particlesConfig.particlesCeiling / (particlesConfig.levels - 1))

    // y offset
    const yOffsetRandomness =
      (Math.random() - 0.5) * particlesConfig.levelRandomness

    particlesPositions[vertexY] =
      levelIndexWithCeilingFactor + yOffsetRandomness

    // z offset
    particlesPositions[vertexZ] =
      Math.cos(angle) * particlesConfig.particlesRadius * 2

    // color
    const particlesCenter = (particlesConfig.levels - 1) / 2
    const distanceFromCenter =
      Math.abs(particlesCenter - levelIndex) / particlesCenter

    const middleColorClone = middleColor.clone()
    const gradientColor = middleColorClone.lerp(edgeColor, distanceFromCenter)

    colorPositions[vertexX] = gradientColor.r
    colorPositions[vertexY] = gradientColor.g
    colorPositions[vertexZ] = gradientColor.b
  }

  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlesPositions, pointsPerVertex)
  )

  particlesGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colorPositions, pointsPerVertex)
  )

  particlesMaterial = new THREE.PointsMaterial({
    size: particlesConfig.particleSize,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    alphaMap: particleTexture,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  particles = new THREE.Points(particlesGeometry, particlesMaterial)

  particles.geometry.center()

  scene.add(particles)
}

createParticles()

const particlesFolder = gui.addFolder("particles")
particlesFolder.open()
particlesFolder
  .add(particlesConfig, "particlesCount", 100, 100000, 10)
  .onFinishChange(createParticles)
particlesFolder
  .add(particlesConfig, "particlesCeiling", 1, 8, 1)
  .onFinishChange(createParticles)
  .name("particlesHeight")
particlesFolder
  .add(particlesConfig, "particleSize", 0.01, 0.07, 0.001)
  .onFinishChange(createParticles)
particlesFolder
  .add(particlesConfig, "particlesRadius", 0, 3.5, 0.01)
  .onFinishChange(createParticles)
particlesFolder
  .add(particlesConfig, "levels", 2, 20, 1)
  .onFinishChange(createParticles)
particlesFolder
  .add(particlesConfig, "levelRandomness", 0, 1, 0.001)
  .onFinishChange(createParticles)
particlesFolder
  .addColor(particlesConfig, "edgeColor")
  .onFinishChange(createParticles)
particlesFolder
  .addColor(particlesConfig, "middleColor")
  .onFinishChange(createParticles)

// Axes helper
// const axesHelper = new THREE.AxesHelper(particlesConfig.particlesCeiling)
// scene.add(axesHelper)

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
camera.position.set(0, 0, 5)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
// controls.addEventListener("change", (e) => {
//   console.log(e.target.object.position)
// })

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// post processing
const bloomOptions = { intensity: 3, luminanceThreshold: 0.85 }
const composer = new EffectComposer(renderer)
const bloomEffect = new BloomEffect(bloomOptions)
composer.addPass(new RenderPass(scene, camera))
composer.addPass(new EffectPass(camera, bloomEffect))

const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  particles.rotation.y = elapsedTime * 0.05
  // particles.position.y = -Math.tan(elapsedTime) // thanos portal

  // Update controls
  controls.update()

  // Render
  composer.render()
  // renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
