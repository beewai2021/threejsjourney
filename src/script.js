import "./style.css"

import * as THREE from "three"
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper"
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

// const axesHelper = new THREE.AxesHelper(4)
// scene.add(axesHelper)

/**
 * Lights
 */

// ambient light illuminates every part of the scene equally
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

// directional light has infinite range regardless of position, and all light rays are parallel to each other
// like sun rays
const directionalLight = new THREE.DirectionalLight(0x00ffcc, 0.3)
scene.add(directionalLight)
directionalLight.position.set(1, 0.25, 0)

// hemilight is a gradient between sky light to floor light
// it illuminates every part of the scene like ambient light
const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3)
scene.add(hemisphereLight)

// pointlight is an infinitely small lantern that illuminates in every direction around it's position
const pointLight = new THREE.PointLight(0xff9000, 0.5, 10, 2)
pointLight.position.set(1, -0.5, 1)
scene.add(pointLight)

// rectAreaLight is like a plane photoshoot light
// rectAreaLight does not look at (0,0,0) by default
const rectAreaLight = new THREE.RectAreaLight(0xffffff, 1, 3, 1)
rectAreaLight.position.set(-1.5, 0, 1.5)
rectAreaLight.lookAt(new THREE.Vector3()) // empty vector 3 is (0,0,0)
scene.add(rectAreaLight)

// spotlight is like a flashlight
// distance is the range of the light that goes from bright to dim
// angle is the wideness of the illumination by the flashlight (use radians / Math instead of hardcode)
// penumbra is the sharpness of the edges of the spotlight's angle
// decay is how fast the light will dim across the distance, usually set the decay to 1 to let the distance decide the light's dimming
const spotlight = new THREE.SpotLight(0x78ff00, 0.5, 10, Math.PI * 0.1, 0.25, 1)
spotlight.position.set(0, 2, 3)
scene.add(spotlight)
// to change the spotlight's direction, we have to add the spotlight's target to the scene
// then change the target's position instead of using lookAt of the spotlight
scene.add(spotlight.target)
spotlight.target.position.set(-1, 0, 0)

// Performance cost
// use as little to no lights as possible, use baking instead
// 1. Light: AmbientLight / HemisphereLight
// 2. Moderate: DirectionalLight / PointLight
// 3. Heavy: SpotLight / RectAreaLight

// Light helpers
// There are light helpers for every light except for AmbientLight
const hemispherelightHelper = new THREE.HemisphereLightHelper(
  hemisphereLight,
  0.2
)
scene.add(hemispherelightHelper)

const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight,
  0.2
)
scene.add(directionalLightHelper)

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
scene.add(pointLightHelper)

// no size
// spotlight helper does not point at the correct spot by default, needs to update in requestAnimationFrame (in the next frame)
const spotLightHelper = new THREE.SpotLightHelper(spotlight)
scene.add(spotLightHelper)

// rect area light helper requires custom import, not part of the THREE class
// does not point at correct spot by default, needs to update, copy position and quaternion (rotation) in requestAnimationFrame (in the next frame)
const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight)
scene.add(rectAreaLightHelper)

/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4

// Objects
const sphere = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5, 32, 32),
  material
)
sphere.position.x = -1.5

const cube = new THREE.Mesh(
  new THREE.BoxBufferGeometry(0.75, 0.75, 0.75),
  material
)

const torus = new THREE.Mesh(
  new THREE.TorusBufferGeometry(0.3, 0.2, 32, 64),
  material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(5, 5), material)
plane.rotation.x = -Math.PI * 0.5
plane.position.y = -0.65

scene.add(sphere, cube, torus, plane)

// gui
gui.width = 300
gui.add(material, "metalness", 0, 1, 0.01)
gui.add(material, "roughness", 0, 1, 0.01)
// gui.add(ambientLight, "intensity", 0, 1, 0.01).name("ambLightIntensity")

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
camera.position.z = 2
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

  // Update objects
  sphere.rotation.y = 0.1 * elapsedTime
  cube.rotation.y = 0.1 * elapsedTime
  torus.rotation.y = 0.1 * elapsedTime

  sphere.rotation.x = 0.15 * elapsedTime
  cube.rotation.x = 0.15 * elapsedTime
  torus.rotation.x = 0.15 * elapsedTime

  //   light helpers
  spotLightHelper.update()
  rectAreaLightHelper.position.copy(rectAreaLight.position) // helper copies the position of its own light
  rectAreaLightHelper.quaternion.copy(rectAreaLight.quaternion)
  rectAreaLightHelper.update()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
