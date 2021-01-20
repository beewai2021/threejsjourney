import "./style.css"

import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

// loading manager
// mutualise / combine all included loaders
const loadingManager = new THREE.LoadingManager()

loadingManager.onStart = () => {
  console.log("starting load")
  console.log("–––––––––––––")
}

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  console.log("loading –", `${(itemsLoaded / itemsTotal) * 100}%`)
}

loadingManager.onLoad = () => {
  console.log("–––––––––––––")
  console.log("loaded all!")
}

loadingManager.onError = (url) => {
  console.log("loading failed on " + url)
}

// textures
const textureLoader = new THREE.TextureLoader(loadingManager)
const checkboard1024Texture = textureLoader.load(
  "/textures/checkerboard-1024x1024.png"
)
const checkboard8Texture = textureLoader.load("/textures/checkerboard-8x8.png")
const minecraftTexture = textureLoader.load("/textures/minecraft.png")
const colorTexture = textureLoader.load("/textures/door/color.jpg")
const alphaTexture = textureLoader.load("/textures/door/alpha.jpg")
const ambientOcclusionTexture = textureLoader.load(
  "/textures/door/ambientOcclusion.jpg"
)
const heightTexture = textureLoader.load("/textures/door/height.jpg")
const metalnessTexture = textureLoader.load("/textures/door/metalness.jpg")
const normalTexture = textureLoader.load("/textures/door/normal.jpg")
const roughnessTexture = textureLoader.load("/textures/door/roughness.jpg")

// texture positioning
// ===================
// by default, rotation of texture pivots at the uv point of (0,0) anti-clockwise
colorTexture.center.x = 0.5
colorTexture.center.y = 0.5

// rotate texture 25% of a full rotation
colorTexture.rotation = Math.PI / 4
// ===================

// texture wrapping / repeating
// ===================
// by default, texture repeats using the pixel at the edge and extends it to the end (THREE.ClampToEdgeWrapping)
// colorTexture.repeat.y = 2 // repeat amount
// colorTexture.repeat.x = 4 // repeat amount

// colorTexture.wrapS = THREE.MirroredRepeatWrapping // repeat like a mirror reflection
// colorTexture.wrapT = THREE.RepeatWrapping // repeat y
// colorTexture.wrapS = THREE.MirroredRepeatWrapping // repeat x
// ===================

// texture filtering / mipmapping
// ===================
// magnification = when the texture becomes too small for how big the material is
// minecraftTexture.magFilter = THREE.LinearFilter // texture smooths out
minecraftTexture.magFilter = THREE.NearestFilter // texture retains sharpness, higher performance

// minification = when the texture becomes too big for how small the material is
minecraftTexture.minFilter = THREE.LinearFilter
// minecraftTexture.minFilter = THREE.NearestFilter // minFilter + NearestFilter combo means you can disable mipmaps

// mipmapping = textures shrink down by half until it gets to 1x1 as the material's side becomes more and more out of view (less pixels)
// mipmapping requires the image width and height to be in power of 2 as it has to divide down to 1x1
// minecraftTexture.generateMipmaps = false
// ===================

// texture transparency can be achieved through two ways
// 1. png transparency
// 2. texture.jpg + alpha.jpg

/**
 * Object
 */
const geometry = new THREE.BoxBufferGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ map: minecraftTexture })
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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 1
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
