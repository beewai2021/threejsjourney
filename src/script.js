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

// const axesHelper = new THREE.AxesHelper(2)
// scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const heart = textureLoader.load("/textures/particles/10.png")
const matcapTexture = textureLoader.load("/textures/matcap.png")

// Particle
// particle geometry
const particlesGeometry = new THREE.BufferGeometry()

const verticesCount = 5000

const positions = new Float32Array(verticesCount * 3) // positions attribute (x,y,z)
const colors = new Float32Array(verticesCount * 3) // colors attribute (r,g,b)

for (let i = 0; i < verticesCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 10 // -5 <---> 5
  colors[i] = Math.random() // -1 <---> 1
}

particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
)

particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

// particle material
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.1, // size of particle,
  sizeAttenuation: true, // particle sizing relative to camera (far - small, near - big)
  // color: new THREE.Color(0xff000ff),
  vertexColors: true, // use 'color' attribute stored inside geometry.attributes.color
  // map: heart,
  transparent: true,
  alphaMap: heart, // render visibility based on white and black
  // alphaTest: 0.01, // 0 <---> 1 determine how white the pixel has to be to be rendered, 0 - everything will render, 1 - nothing will be rendered
  // depthTest: false, // turn depth test off (objects will phase / clip through each other)
  depthWrite: false, // leave depth test on, but dont draw inside depth buffer
  blending: THREE.AdditiveBlending, // like photoshop Overlay blend mode, will impact performance
})

// particles
const particles = new THREE.Points(particlesGeometry, particlesMaterial)

scene.add(particles)

gui.add(particles.material, "size", 0, 1, 0.001)

const cube = new THREE.Mesh(
  new THREE.BoxBufferGeometry(),
  new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
)

scene.add(cube)

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
camera.position.set(1, 1, 2.5)
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

// to animate each particle (meaning each vertex's x/y/z of a geometry's 'position' attribute, its best performance wise to use custom shaders)
const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  particles.rotation.y = elapsedTime / 10

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
