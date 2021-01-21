import "./style.css"

import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from "dat.gui"

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl")

// dat.gui
const GUI = new dat.GUI()
const materialConfig = {
  materialColor: 0xffffff,
  specularColor: 0xffffff,
}

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x1c1c1c)

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
camera.position.set(-0.4, 0.45, 2.37)
scene.add(camera)

// Textures
const loadManager = new THREE.LoadingManager()
loadManager.onProgress = () => console.log("loading...")
loadManager.onLoad = () => console.log("loading complete!")

const cubeTextureLoader = new THREE.CubeTextureLoader(loadManager)
const environmentMapTexture = cubeTextureLoader.load([
  "/textures/environmentMaps/custom/px.png", // positive
  "/textures/environmentMaps/custom/nx.png",
  "/textures/environmentMaps/custom/py.png",
  "/textures/environmentMaps/custom/ny.png", // negative
  "/textures/environmentMaps/custom/pz.png",
  "/textures/environmentMaps/custom/nz.png",
])

// const textureLoader = new THREE.TextureLoader(loadManager)
// const doorColorTexture = textureLoader.load("/textures/door/color.jpg")
// const doorAlphaTexture = textureLoader.load("/textures/door/alpha.jpg")
// const doorAmbientOcclusionTexture = textureLoader.load(
//   "/textures/door/ambientOcclusion.jpg"
// )
// const doorHeightTexture = textureLoader.load("/textures/door/height.jpg")
// const doorMetalnessTexture = textureLoader.load("/textures/door/metalness.jpg")
// const doorNormalTexture = textureLoader.load("/textures/door/normal.jpg")
// const doorRoughnessTexture = textureLoader.load("/textures/door/roughness.jpg")
// const gradientTexture = textureLoader.load("/textures/gradients/5.jpg") // 5 shades of gradients
// gradientTexture.minFilter = THREE.NearestFilter // retain cartoonish look
// gradientTexture.magFilter = THREE.NearestFilter // retain cartoonish look
// gradientTexture.generateMipmaps = false // retain cartoonish look
// const matcatTexture = textureLoader.load("/textures/matcaps/3.png")

// Objects
// const material = new THREE.MeshBasicMaterial()
// const material = new THREE.MeshNormalMaterial()
// const material = new THREE.MeshMatcapMaterial()
// const material = new THREE.MeshDepthMaterial() // material becomes whiter as it gets closer to the near of the camera
// const material = new THREE.MeshLambertMaterial()
// const material = new THREE.MeshPhongMaterial()
// const material = new THREE.MeshToonMaterial() // material works with gradient maps
const material = new THREE.MeshStandardMaterial({
  // material and lighting based on environment images
  envMap: environmentMapTexture,
}) // uses PBR principles
// material.wireframe = false
// // material.color.set(materialConfig.materialColor)
material.transparent = true
// material.opacity = 1 // opacity only works when transparent is true
material.side = THREE.DoubleSide
// material.map = doorColorTexture
// // material.matcap = matcatTexture
// material.alphaMap = doorAlphaTexture
// // material.gradientMap = gradientTexture
// material.aoMap = doorAmbientOcclusionTexture // setting aoMap requires MeshStandardMaterial and duplicating the geometry's own uv attributes to a new set of uv2 attributes to add fake shadows to dark areas of the texture
// material.displacementMap = doorHeightTexture // requires lots of vertices in the geometry to accurately adjust different heights of the material
// material.displacementScale = 0.35
// material.metalnessMap = doorMetalnessTexture
// material.roughnessMap = doorRoughnessTexture
material.metalness = 0.7
material.roughness = 0.2
// material.normalMap = doorNormalTexture // normal map adds details to the material without adding or changing extra vertices to the geometry

// material gui
const materialFolder = GUI.addFolder("material")
materialFolder.open()
materialFolder.add(material, "wireframe")
materialFolder.add(material, "transparent")
materialFolder
  .add(material, "flatShading")
  .onChange(() => (material.needsUpdate = true))
materialFolder.add(material, "opacity", 0, 1, 0.01)
materialFolder
  .addColor(materialConfig, "materialColor")
  .onChange(() => material.color.set(materialConfig.materialColor))
  .name("color")
// materialFolder
//   .addColor(materialConfig, "specularColor")
//   .onChange(() => material.specular.set(materialConfig.specularColor))
// materialFolder.add(material, "shininess", 0, 100)
materialFolder.add(material, "metalness", 0, 1, 0.1)
materialFolder.add(material, "roughness", 0, 1, 0.1)
// materialFolder.add(material, "aoMapIntensity", 0, 3, 0.01)
// materialFolder.add(material, "displacementScale", 0, 0.5, 0.001)
// const normalMapFolder = materialFolder.addFolder("normal map")
// normalMapFolder.open()
// normalMapFolder.add(material.normalScale, "x", 0, 1)
// normalMapFolder.add(material.normalScale, "y", 0, 1)

const sphere = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5, 32, 32),
  material
)
const plane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1, 1, 15, 15),
  material
)
const torus = new THREE.Mesh(
  new THREE.TorusBufferGeometry(0.5, 0.2, 23, 55),
  material
)

//
sphere.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2)
)
plane.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2)
)
torus.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2)
)

sphere.position.x = -1.5
torus.position.x = 1.5

scene.add(sphere, plane, torus)

// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.set(2, 3, 4)
scene.add(pointLight)

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

  //   animate objects
  sphere.rotation.y = elapsedTime * 0.1
  plane.rotation.y = elapsedTime * 0.1
  torus.rotation.y = elapsedTime * 0.1
  sphere.rotation.x = elapsedTime * 0.15
  plane.rotation.x = elapsedTime * 0.15
  torus.rotation.x = elapsedTime * 0.15
  sphere.material.displacementScale = (Math.sin(elapsedTime) * 0.5 + 0.5) * 0.35

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
