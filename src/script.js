import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from "dat.gui"

import "./style.css"
import { Vector3 } from "three"

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

const ambientLight = new THREE.AmbientLight("#ffffff", 0.35)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight()
directionalLight.position.set(0, 3, 0)
scene.add(directionalLight)

const raycasterInteractionColors = {
  default: "yellow",
  mouseOver: "orange",
  mouseClick: "orangered",
}

const object1 = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5, 16, 16),
  new THREE.MeshPhongMaterial({ color: raycasterInteractionColors.default })
)
object1.position.x = -1.5

const object2 = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5, 16, 16),
  new THREE.MeshPhongMaterial({ color: raycasterInteractionColors.default })
)

const object3 = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5, 16, 16),
  new THREE.MeshPhongMaterial({ color: raycasterInteractionColors.default })
)
object3.position.x = 1.5

scene.add(object1, object2, object3)

// raycaster
const raycaster = new THREE.Raycaster()
// const rayOrigin = new THREE.Vector3(-3, 0, 0)
// const rayDirection = new THREE.Vector3(10, 0, 0)

// normalize direction incase the ray direction is changed
// ray direction is always 1 unit long, but its raycasting length is based on its near/far parameter
// rayDirection.normalize() // all Vector3 classes can normalize, turning values between 0 to 1, in this case it keeps the direction

// raycaster.set(rayOrigin, rayDirection) // determine where raycaster looks from and in what direction

// intersect information
// distance - length of distance between ray origin and intersected object face
// face - vector 3 of intersected face
// object - object that is intersected
// point - 3d worldspace vector 3 coordinate of intersection
// uv - uv of collison

// const intersect = raycaster.intersectObject(object2) // one object being intersected would still be stored in an array, because the ray can go through the object multiple times, like penetrating two sides of a donut
// const intersects = raycaster.intersectObjects([object1, object2, object3])

// const rayOrigin = new Vector3(-3, 0, 0)
// const rayDirection = new Vector3(10, 0, 0).normalize()
// raycaster.set(rayOrigin, rayDirection) // set casting pov
// const intersect = raycaster.intersectObject(object2)
// const intersects = raycaster.intersectObjects([object1, object2, object3])

// (x,y) instead of object
const mouse = new THREE.Vector2()
const objects = [object1, object2, object3]
let currentIntersect = null

// raycaster mouse enter & leave event
window.addEventListener("mousemove", (e) => {
  const { clientX, clientY } = e

  // normalise mouse between -1 and 1 based on threejs x/y axes
  mouse.x = (clientX / sizes.width) * 2 - 1
  mouse.y = -(clientY / sizes.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(objects)

  const intersecting = intersects.length > 0

  if (intersecting) {
    if (!currentIntersect) {
      currentIntersect = intersects[0].object
      intersects[0].object.material.color.set(
        raycasterInteractionColors.mouseOver
      )
    }
  } else {
    if (currentIntersect) {
      currentIntersect = null
      objects.forEach((obj) =>
        obj.material.color.set(raycasterInteractionColors.default)
      )
    }
  }
})

// raycaster click event
window.addEventListener("click", () => {
  if (currentIntersect) {
    switch (currentIntersect) {
      case object1:
        object1.material.color.set(raycasterInteractionColors.mouseClick)
        break
      case object2:
        object2.material.color.set(raycasterInteractionColors.mouseClick)
        break
      case object3:
        object3.material.color.set(raycasterInteractionColors.mouseClick)
        break
    }
  }
})

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

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  object1.position.y = Math.sin(elapsedTime * 3) / 3
  object2.position.y = Math.sin(elapsedTime * 2) / 3
  object3.position.y = Math.sin(elapsedTime * 1) / 3

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
