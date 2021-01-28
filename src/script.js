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

const axesHelper = new THREE.AxesHelper(3)
scene.add(axesHelper)

const object1 = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial()
)
object1.position.x = -2

const object2 = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial()
)

const object3 = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial()
)
object3.position.x = 2

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

window.addEventListener("mousemove", (e) => {
  const { clientX, clientY } = e
  // normalise mouse between -1 and 1 based on threejs x/y axes
  mouse.x = (clientX / sizes.width) * 2 - 1
  mouse.y = -(clientY / sizes.height) * 2 + 1
})

// sphere click event
window.addEventListener("click", () => {
  if (currentIntersect) {
    switch (currentIntersect.object) {
      case object1:
        console.log("clicked on object 1")
        break
      case object2:
        console.log("clicked on object 2")
        break
      case object3:
        console.log("clicked on object 3")
        break
      default:
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

let currentIntersect = null

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5
  object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5
  object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5

  // use color to detect which object is intersecting
  //   const rayOrigin = new Vector3(-3, 0, 0)
  //   const rayDirection = new Vector3(10, 0, 0).normalize()
  //   raycaster.set(rayOrigin, rayDirection) // set casting pov
  //   const intersect = raycaster.intersectObject(object2)
  //   const intersects = raycaster.intersectObjects([object1, object2, object3])

  // objects.forEach((object) => {
  //   object.material.color.set("blue")
  // })

  //   intersects.forEach((int) => {
  //     int.object.material.color.set("red")
  //   })

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(objects)

  if (intersects.length > 0) {
    // mouse enter event
    if (currentIntersect !== null) {
      currentIntersect.object.material.color.set("green")
    }
    currentIntersect = intersects[0]
  } else {
    // mouse leave event
    if (currentIntersect) {
      currentIntersect.object.material.color.set("white")
    }
    currentIntersect = null
  }

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
