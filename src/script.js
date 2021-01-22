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

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.position.set(2, 2, -1)
gui.add(directionalLight, "intensity").min(0).max(1).step(0.001)
gui.add(directionalLight.position, "x").min(-5).max(5).step(0.001)
gui.add(directionalLight.position, "y").min(-5).max(5).step(0.001)
gui.add(directionalLight.position, "z").min(-5).max(5).step(0.001)
// scene.add(directionalLight)

// only three lights support shadows: PointLight, DirectionalLight, SpotLight
// for every light that casts shadow, on each frame the light's camera will capture the scene and calculate where shadows go by replacing the material with MeshDepthMaterial, then mapping the capture as a texture into a shadow map
directionalLight.castShadow = true

// shadow maps are captures with height and width, that must be the power of 2, due to mipmap (scale down to 1x1), the larger the shadow map capture is, the sharper the shadow
directionalLight.shadow.mapSize.height = 512 * 2 // 1024 x 1024 is already a big shadow map
directionalLight.shadow.mapSize.width = 512 * 2

// show the shadow's camera
// directional light camera is an orthographic camera
const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
)
scene.add(directionalLightCameraHelper)
// tighter orthographic camera around the object that cast/receive shadows mean higher quality shadows
directionalLight.shadow.camera.top = 2
directionalLight.shadow.camera.bottom = -2
directionalLight.shadow.camera.left = -2
directionalLight.shadow.camera.right = 2

directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 6 // how far the directional light camera look out

directionalLight.shadow.radius = 10 // blur of shadow, radius does not work with PCFSoftShadowMap

directionalLightCameraHelper.visible = false // allow quick toggle of shadow helper

// SpotLight
// spotlight light camera is a perspective camera
const spotLight = new THREE.SpotLight(0xffffff, 0.4, 10, Math.PI * 0.3)

spotLight.position.set(0, 1, 2)

spotLight.castShadow = true

// scene.add(spotLight.target)
// scene.add(spotLight)

spotLight.shadow.mapSize.height = 512 * 2
spotLight.shadow.mapSize.width = 512 * 2

spotLight.shadow.camera.fov = 30
spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 6

// tightening up shadow maps around the objects will result in better performance and higher quality shadows

const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
scene.add(spotLightCameraHelper)
spotLightCameraHelper.visible = false

// PointLight
const pointLight = new THREE.PointLight(0xffffff, 0.3)

pointLight.position.set(-1, 1.5, 0)

scene.add(pointLight)

pointLight.castShadow = true

pointLight.shadow.mapSize.height = 512 * 2
pointLight.shadow.mapSize.width = 512 * 2

pointLight.shadow.camera.near = 0.1
pointLight.shadow.camera.far = 5

// pointlight camera is a perspective camera, but it only shows one angle of all the camera renders, as it illuminates lights/shadows in every direction, hence avoid pointlight shadows or any shadows if possible, there are too many shadow map renders per frame
// pointlight camera fov should not be touched as its setup to capture every direction
const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
scene.add(pointLightCameraHelper)

pointLightCameraHelper.visible = false

// Baked shadows – static shadow
const textureLoader = new THREE.TextureLoader()
const bakedShadow = textureLoader.load("/textures/bakedShadow.jpg")
const simpleShadow = textureLoader.load("/textures/simpleShadow.jpg")

// const planeMaterial = new THREE.MeshBasicMaterial({ map: bakedShadow })

/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide })
material.roughness = 0.7
gui.add(material, "metalness").min(0).max(1).step(0.001)
gui.add(material, "roughness").min(0).max(1).step(0.001)

/**
 * Objects
 */
const sphere = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5, 32, 32),
  material
)
sphere.castShadow = true

const plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(5, 5), material)
plane.rotation.x = -Math.PI * 0.5
plane.position.y = -0.5
plane.receiveShadow = true

scene.add(sphere, plane)

// Baked shadow alternative – dynamic shadow
const sphereShadow = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1.5, 1.5),
  new THREE.MeshBasicMaterial({
    color: 0x000000, // black shadow
    alphaMap: simpleShadow,
    transparent: true,
  })
)
scene.add(sphereShadow)
sphereShadow.rotation.x = -Math.PI * 0.5
sphereShadow.position.y = plane.position.y + 0.01 // + 0.01 to prevent z-index fighting

// for the best effect, combine static baked shadows and dynamic baked shadows

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
camera.position.z = 3
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

// enable shadows in renderer
// renderer.shadowMap.enabled = true
renderer.shadowMap.enabled = false // disable all shadows to use baked shadows
// default shadowMap.type = THREE.PCFShadowMap
renderer.shadowMap.type = THREE.PCFSoftShadowMap // radius does not work with PCFSoftShadowMap

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  sphere.position.x = Math.cos(elapsedTime) * 0.65
  sphere.position.z = Math.sin(elapsedTime) * 0.65
  sphere.position.y = Math.abs(Math.sin(elapsedTime * 3)) // Math.abs is a way to do bouncing animation

  sphereShadow.position.x = sphere.position.x
  sphereShadow.position.z = sphere.position.z
  sphereShadow.material.opacity = 1 - sphere.position.y + 0.2

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
