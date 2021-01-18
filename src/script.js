import "./style.css"

import * as THREE from "three"
import gsap from "gsap"

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

const axesHelper = new THREE.AxesHelper()
scene.add(axesHelper)

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  wireframe: true,
})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Sizes
const sizes = {
  width: 800,
  height: 600,
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)

gsap.to(mesh.position, {
  delay: 0.5,
  duration: 1,
  x: 2,
  ease: "bounce.out",
})

// Animation
// rAf calls the function on the next frame, like stop motion
// 60hz screens calls the function 60 times per second

// getElapsedTime() counts up, starting from 0, using seconds
// getElapsedTime() * Math.PI * 2 === one revolution per second
// since it goes up in seconds, it means each second its going up by 1 unit
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  //   mesh.position.y = Math.sin(elapsedTime) // starts at 0
  //   mesh.position.x = Math.cos(elapsedTime) // starts at 1

  camera.lookAt(mesh.position)

  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}

tick()
