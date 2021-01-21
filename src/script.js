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
scene.background = new THREE.Color("silver")

// const axesHelper = new THREE.AxesHelper(3)
// scene.add(axesHelper)

// Loading Manager
const loadingManager = new THREE.LoadingManager()
loadingManager.onProgress = (_, itemsLoaded, itemsTotal) =>
  console.log(`${(itemsLoaded / itemsTotal) * 100}%`)
loadingManager.onLoad = () => console.log("loading done")

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load("/textures/matcaps/3.png")

/**
 * Object
 */
// const cube = new THREE.Mesh(
//   new THREE.BoxBufferGeometry(1, 1, 1),
//   new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
// )

// scene.add(cube)

const material = new THREE.MeshMatcapMaterial({
  matcap: matcapTexture,
})

// Font geometry
const fontLoader = new THREE.FontLoader(loadingManager)
const fontPath = "/fonts/helvetiker_regular.typeface.json"
fontLoader.load(fontPath, (font) => {
  const textGeometry = new THREE.TextBufferGeometry("beewai", {
    font: font,
    size: 0.5,
    height: 0.04, // z or depth of text
    curveSegments: 6, // smoothness of curves
    bevelEnabled: true,
    bevelThickness: 0.01, // bevel depth extension
    bevelSize: 0.01, // bevel edge size
    bevelOffset: 0, // inner bevel offset
    bevelSegments: 5, // bevel edge layers (anti alias)
  })

  const text = new THREE.Mesh(textGeometry, material)

  scene.add(text)

  text.geometry.computeBoundingBox() // must be computed before using geometry.boundingBox, otherwise would return null
  // geometry.boundingBox ignores bevel sizes
  // boundingBox is used for three.js to calculate what to and what not to render based on its intersection with the camera's frustum cull

  // translates the vertices of the vertices without changing the mesh's position
  // intended to be a one time only setter event, not ran in an animation loop
  // textGeometry.translate(
  //   -textGeometry.boundingBox.max.x * 0.5,
  //   -textGeometry.boundingBox.max.y * 0.5,
  //   -textGeometry.boundingBox.max.z * 0.5
  // )

  text.geometry.center() // center geometry based on its bounding box, including bezel protrusions
})

// 100 donuts
const donutGeometry = new THREE.TorusBufferGeometry(0.3, 0.07, 20, 45)
const amountOfDonuts = 100
for (let i = 0; i < amountOfDonuts; i++) {
  const donut = new THREE.Mesh(donutGeometry, material)

  donut.position.set(
    (Math.random() - 0.5) * 5,
    (Math.random() - 0.5) * 5,
    -Math.random() - 1
  )

  donut.rotation.x = Math.random() * Math.PI
  donut.rotation.y = Math.random() * Math.PI

  const randomScale = Math.random() + 0.1

  donut.scale.set(randomScale, randomScale, randomScale)

  scene.add(donut)
}

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
camera.position.set(0, -0.2, 1.5)
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

  camera.position.y = Math.sin(elapsedTime) * 0.08

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
