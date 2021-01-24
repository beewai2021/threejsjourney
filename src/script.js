import "./style.css"

import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from "dat.gui"
import { PCFSoftShadowMap } from "three"

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
gui.close()

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const loadingManager = new THREE.LoadingManager()

const textureLoader = new THREE.TextureLoader(loadingManager)

// door texture
const doorColorTexture = textureLoader.load("/textures/door/color.jpg")
const doorAlphaTexture = textureLoader.load("/textures/door/alpha.jpg")
const doorAmbientOcclusionTexture = textureLoader.load(
  "/textures/door/ambientOcclusion.jpg"
)
const doorHeightTexture = textureLoader.load("/textures/door/height.jpg")
const doorNormalTexture = textureLoader.load("/textures/door/normal.jpg")
const doorMetalnessTexture = textureLoader.load("/textures/door/metalness.jpg")
const doorRoughnessTexture = textureLoader.load("/textures/door/roughness.jpg")

// bricks texture
const bricksColorTexture = textureLoader.load("/textures/bricks/color.jpg")
const bricksAmbientOcclusionTexture = textureLoader.load(
  "/textures/bricks/ambientOcclusion.jpg"
)
const bricksNormalTexture = textureLoader.load("/textures/bricks/normal.jpg")
const bricksRoughnessTexture = textureLoader.load(
  "/textures/bricks/roughness.jpg"
)

// grass texture
const grassColorTexture = textureLoader.load("/textures/grass/color.jpg")
const grassAmbientOcclusionTexture = textureLoader.load(
  "/textures/grass/ambientOcclusion.jpg"
)
const grassNormalTexture = textureLoader.load("/textures/grass/normal.jpg")
const grassRoughnessTexture = textureLoader.load(
  "/textures/grass/roughness.jpg"
)
// repeat texture wrapping
grassColorTexture.repeat.y = 8
grassColorTexture.repeat.x = 8
grassColorTexture.wrapS = THREE.RepeatWrapping
grassColorTexture.wrapT = THREE.RepeatWrapping

grassAmbientOcclusionTexture.repeat.y = 8
grassAmbientOcclusionTexture.repeat.x = 8
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping

grassNormalTexture.repeat.y = 8
grassNormalTexture.repeat.x = 8
grassNormalTexture.wrapS = THREE.RepeatWrapping
grassNormalTexture.wrapT = THREE.RepeatWrapping

grassRoughnessTexture.repeat.y = 8
grassRoughnessTexture.repeat.x = 8
grassRoughnessTexture.wrapS = THREE.RepeatWrapping
grassRoughnessTexture.wrapT = THREE.RepeatWrapping

/**
 * House
 */
// House group
const house = new THREE.Group()
scene.add(house)

// Walls
const wallsDepth = 4
const wallsHeight = 2.5
const walls = new THREE.Mesh(
  new THREE.BoxBufferGeometry(wallsDepth, wallsHeight, wallsDepth),
  new THREE.MeshStandardMaterial({
    map: bricksColorTexture,
    aoMap: bricksAmbientOcclusionTexture,
    normalMap: bricksNormalTexture,
    roughnessMap: bricksRoughnessTexture,
  })
)
walls.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(walls.geometry.attributes.uv.array, 2)
)
walls.material.aoMapIntensity = 1.5
walls.position.y = wallsHeight / 2
house.add(walls)

// roof
const coneHeight = 1
const roof = new THREE.Mesh(
  new THREE.ConeBufferGeometry(3.5, coneHeight, 4),
  new THREE.MeshStandardMaterial({ color: 0xb35f45 })
)
roof.position.y = coneHeight / 2 + wallsHeight
roof.rotation.y = Math.PI / 4
house.add(roof)

// door
const doorHeight = 2.2
const door = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(2, doorHeight, 100, 100),
  new THREE.MeshStandardMaterial()
)

door.material.map = doorColorTexture
door.material.transparent = true
door.material.alphaMap = doorAlphaTexture
door.material.aoMap = doorAmbientOcclusionTexture
door.material.aoMapIntensity = 2.5
door.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(door.geometry.attributes.uv.array, 2)
)
door.material.displacementMap = doorHeightTexture // requires lots of vertices
door.material.displacementScale = 0.1
door.material.normalMap = doorNormalTexture
door.material.metalnessMap = doorMetalnessTexture
door.material.roughnessMap = doorRoughnessTexture

house.add(door)

door.position.y = 1
door.position.z = wallsDepth / 2 + 0.01

// bushes
const bushRadius = 1

// use the same geometry size, but use scale to change sizes individually
const bushGeometry = new THREE.SphereBufferGeometry(bushRadius, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x89c854 })

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(0.8, 0.2, wallsDepth / 2 + 0.3)

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(1.4, 0.1, wallsDepth / 2 + 0.1)

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(-0.8, 0.1, wallsDepth / 2 + 0.1)

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.scale.set(0.15, 0.15, 0.15)
bush4.position.set(-1, 0.05, wallsDepth / 2 + 0.45)

house.add(bush1, bush2, bush3, bush4)

// Graves
const graves = new THREE.Group()
scene.add(graves)

const graveGeometry = new THREE.BoxBufferGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({ color: 0xb2b6b1 })

const graveCount = 50

for (let i = 0; i < graveCount; i++) {
  const angle = Math.random() * Math.PI * 2 // full circle
  // Math.random() outputs a number between 0 <---> 1, multipling it by 6 extends the range to 0 <---> 6, and adding 3 (half of house depth + 1 (offset, so it doesnt touch the house)) means the random value is lifted up from 3 <---> 6
  const radius = Math.random() * 6 + wallsDepth / 2 + 1
  // when two axies have sin & cos with the same parameter, it will go in a circle
  const x = Math.sin(angle) * radius
  const z = Math.cos(angle) * radius

  const grave = new THREE.Mesh(graveGeometry, graveMaterial)

  grave.position.x = x
  grave.position.y = 0.8 / 2 - 0.1
  grave.position.z = z

  grave.rotation.y = (Math.random() - 0.5) * 0.4 // -0.5 <---> 0.5 ---> reduce randomness by 60%
  grave.rotation.z = (Math.random() - 0.5) * 0.4

  grave.castShadow = true
  grave.receiveShadow = true

  graves.add(grave)
}

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(40, 40),
  new THREE.MeshStandardMaterial({
    map: grassColorTexture,
    aoMap: grassAmbientOcclusionTexture,
    normalMap: grassNormalTexture,
    roughnessMap: grassRoughnessTexture,
  })
)
floor.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(floor.geometry.attributes.uv.array, 2)
)
floor.rotation.x = -Math.PI * 0.5
floor.position.y = 0
scene.add(floor)

// Fog
// fog near is where it starts relative to the camera, 0 is right in front of the camera
// fog far is where the fog ends
const fog = new THREE.Fog(0x262837, 2, 15)
scene.fog = fog

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xb9d5ff, 0.12)

gui.add(ambientLight, "intensity").min(0).max(1).step(0.001)

scene.add(ambientLight)

// Directional light
const moonLight = new THREE.DirectionalLight(0xb9d5ff, 0.12)

moonLight.position.set(4, 5, -2)

gui.add(moonLight, "intensity").min(0).max(1).step(0.001)
gui.add(moonLight.position, "x").min(-5).max(5).step(0.001)
gui.add(moonLight.position, "y").min(-5).max(5).step(0.001)
gui.add(moonLight.position, "z").min(-5).max(5).step(0.001)

scene.add(moonLight)

// PointLight
const pointLight = new THREE.PointLight(0xff7d46, 1, 7)
// const pointLightHelper = new THREE.PointLightHelper(pointLight)
pointLight.position.set(0, 2.2, 2.7)
scene.add(pointLight)
// scene.add(pointLightHelper)

// Ghosts
const ghost1 = new THREE.PointLight(0xff00ff, 2, 3)
const ghost2 = new THREE.PointLight(0x00ffff, 2, 3)
const ghost3 = new THREE.PointLight(0xff00ff, 2, 3)
scene.add(ghost1, ghost2, ghost3)

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
camera.position.set(1, 2, 8)
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
renderer.setPixelRatio(2)
renderer.setClearColor(0x262837) // set scene background color to match the fog color to make it seamless

// Shadows
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap

moonLight.castShadow = true
pointLight.castShadow = true
ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true
walls.castShadow = true

walls.receiveShadow = true
bush1.receiveShadow = true
bush2.receiveShadow = true
bush3.receiveShadow = true
floor.receiveShadow = true

pointLight.shadow.mapSize.width = 512 / 2
pointLight.shadow.mapSize.height = 512 / 2
pointLight.shadow.camera.far = 7

ghost1.shadow.mapSize.width = 512 / 2
ghost1.shadow.mapSize.width = 512 / 2
ghost1.shadow.mapSize.width = 7

ghost2.shadow.mapSize.width = 512 / 2
ghost2.shadow.mapSize.width = 512 / 2
ghost2.shadow.mapSize.width = 7

ghost3.shadow.mapSize.width = 512 / 2
ghost3.shadow.mapSize.width = 512 / 2
ghost3.shadow.mapSize.width = 7

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // animate ghosts
  const ghost1Angle = elapsedTime * 0.5 // slow down by 50%
  ghost1.position.x = Math.sin(ghost1Angle) * 4
  ghost1.position.z = Math.cos(ghost1Angle) * 4
  ghost1.position.y = Math.sin(elapsedTime * 3)

  const ghost2Angle = -elapsedTime * 0.5 // reverse direction
  ghost2.position.x = Math.sin(ghost2Angle) * 5
  ghost2.position.z = Math.cos(ghost2Angle) * 5
  ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5) // adding two sins equates to randomness between -2 <---> 2, and at different sin speeds

  const ghost3Angle = -elapsedTime * 0.18
  ghost3.position.x = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32)) // from -8 <--> 8
  ghost3.position.z = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5)) // from -8 <--> 8
  ghost3.position.y = Math.sin(elapsedTime * 3)

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
