import "./style.css"

import * as THREE from "three"

// Vector 3 methods
// length() === length of distance between mesh position and center of scene
// distanceTo() === distance between two Vector 3(s)
// normalize() === set length between vector and center of scene to 1
// console.log(
//   `mesh's distance from the center of scene: ${mesh.position.length()}`
// )
// console.log(
//   `distance between mesh and camera: ${mesh.position.distanceTo(
//     camera.position
//   )}`
// )

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

const axesHelper = new THREE.AxesHelper(1)
scene.add(axesHelper)

/**
 * Sizes
 */
const sizes = {
  width: 800,
  height: 600,
}

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

/**
 * Objects
 */
const group = new THREE.Group()
scene.add(group)

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true,
  })
)
const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
  })
)
cube2.position.x = -2
const cube3 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    wireframe: true,
  })
)
cube3.position.x = 2
group.add(cube1)
group.add(cube2)
group.add(cube3)

group.position.y = 1
group.scale.y = 2
group.rotation.y = 1

camera.lookAt(group.position)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)
