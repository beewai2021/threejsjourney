import * as THREE from "three"
import * as CANNON from "cannon-es"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from "dat.gui"

import "./style.css"

/**
 * Debug
 */
const gui = new dat.GUI()

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

// Sound
const hitSound = new Audio("/sounds/hit.mp3")
const playHitSound = (collison) => {
  const impactStrength = collison.contact.getImpactVelocityAlongNormal()
  if (impactStrength > 1.5) {
    // can use impactStrength to adjust sound volume
    // hitSound.volume = Math.random() // volume goes from 0 <---> 1
    hitSound.currentTime = 0 // reset sound effect before playing new hit sound
    hitSound.play()
  }
}

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.png",
  "/textures/environmentMaps/0/nx.png",
  "/textures/environmentMaps/0/py.png",
  "/textures/environmentMaps/0/ny.png",
  "/textures/environmentMaps/0/pz.png",
  "/textures/environmentMaps/0/nz.png",
])

// Physics
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world) // better performance for collision detection
world.allowSleep = true // stop listening to collision detection when body speed becomes very low, it will reactivate from sleep when a strong force is applied to the body
world.gravity.set(0, -9.82, 0) // negative y of gravity constant on earth (falls down on the y-axis)

// material (not three.js texture material, but physical material of the CANNON body)
// const concreteMaterial = new CANNON.Material("concrete")
// const plasticMaterial = new CANNON.Material("plastic")
const defaultMaterial = new CANNON.Material("default")

// custom material collision physics behaviour between two materials
// const concretePlasticContactMaterial = new CANNON.ContactMaterial(
//   concreteMaterial,
//   plasticMaterial,
//   {
//     friction: 0.1, // rub (0.3 default)
//     restitution: 0.7, // bounce (0.3 default)
//   }
// )

// apply material physics to all bodys in world
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1, // rub (0.3 default)
    restitution: 0.7, // bounce (0.3 default)
  }
)

// add material collision physics behaviour config to world
// world.addContactMaterial(concretePlasticContactMaterial)
// world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial // set as default contact material for world

// Utils
const objectsToUpdate = []

const sphereGeometry = new THREE.SphereBufferGeometry(1, 20, 20)
const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1)

const material = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
})

const createSphere = (radius, position) => {
  const mesh = new THREE.Mesh(sphereGeometry, material)
  mesh.scale.set(radius, radius, radius)
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.position.copy(position)
  scene.add(mesh)

  // CANNON body
  const shape = new CANNON.Sphere(radius)
  const body = new CANNON.Body({
    shape: shape,
    mass: 1,
  })
  body.position.copy(position)
  body.addEventListener("collide", playHitSound)
  world.addBody(body)

  // Objects to update
  objectsToUpdate.push({
    mesh: mesh,
    body: body,
  })
}

const createBox = (dimension, position) => {
  const box = new THREE.Mesh(boxGeometry, material)
  box.castShadow = true
  box.receiveShadow = true
  box.scale.set(dimension, dimension, dimension) // default value of 1, so it scales perfectly
  box.position.copy(position)
  scene.add(box)

  // CANNON box is measured in half-extent, which is the length from the box's center to its height/width/depth edges
  const shape = new CANNON.Box(
    new CANNON.Vec3(dimension / 2, dimension / 2, dimension / 2)
  )
  const body = new CANNON.Body({
    shape: shape,
    mass: 1,
  })
  body.position.copy(position)
  body.addEventListener("collide", playHitSound)
  world.addBody(body)

  objectsToUpdate.push({
    mesh: box,
    body: body,
  })
}

const guiConfig = {
  reset: () => {
    objectsToUpdate.forEach((obj) => {
      obj.body.removeEventListener("collide", playHitSound)
      world.remove(obj.body)
      scene.remove(obj.mesh)
    })
  },
  createSphere: () => {
    createSphere(Math.random() + 0.35, {
      x: (Math.random() - 0.5) * 3,
      y: 3,
      z: (Math.random() - 0.5) * 3,
    })
  },
  createBox: () => {
    createBox(Math.random(), {
      x: (Math.random() - 0.5) * 3,
      y: 3,
      z: (Math.random() - 0.5) * 3,
    })
  },
}

gui.add(guiConfig, "reset")
gui.add(guiConfig, "createSphere")
gui.add(guiConfig, "createBox")

// body is like a mesh of three.js
// body shapes include: box, cylinder, plane, sphere, etc.

// sphere physics
// const sphereShape = new CANNON.Sphere(0.5) // same sphere radius used in three.js
// const sphereBody = new CANNON.Body({
//   shape: sphereShape,
//   mass: 1,
//   position: new CANNON.Vec3(0, 2.5, 0), // similar to Vector3() from three.js, starting position for sphere is at y 3
//   // material: plasticMaterial,
// })
// const xAxisPushForce = 150
// sphereBody.applyLocalForce(
//   new CANNON.Vec3(xAxisPushForce, 0, 0),
//   new CANNON.Vec3(0, 0, 0) // push point
// )

// world.addBody(sphereBody)

// plane physics
const planeShape = new CANNON.Plane() // CANNON plane has an infinite size
const floorBody = new CANNON.Body()
floorBody.mass = 0 // immovable, static object
floorBody.addShape(planeShape)
// floorBody.material = concreteMaterial
// no rotation in CANNON, only quaternion
// rotate x-axis by negative of Math.PI * 0.5 angle
// .setFromAxisAngle(axis, angle)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
world.addBody(floorBody)

/**
 * Test sphere
 */
// const sphere = new THREE.Mesh(
//   new THREE.SphereBufferGeometry(0.5, 32, 32),
//   new THREE.MeshStandardMaterial({
//     metalness: 0.3,
//     roughness: 0.4,
//     envMap: environmentMapTexture,
//   })
// )
// sphere.castShadow = true
// sphere.position.y = 0.5
// scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: "#777777",
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
  })
)
floor.receiveShadow = true
floor.rotation.x = -Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = -7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
camera.position.set(0, 4, 5)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true })
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  const deltaTime = elapsedTime - oldElapsedTime
  oldElapsedTime = elapsedTime

  // wind
  // sphereBody.applyForce(new CANNON.Vec3(-0.05, 0, 0), sphereBody.position)

  // Update physics world
  world.step(
    1 / 60, // experience to run at 60fps
    deltaTime, // don't use getDelta() method from THREE.Clock()
    3
  )

  // Synchronize CANNON physics world with three.js world
  // sphere.position.copy(sphereBody.position)
  // equivalent to sphere.position.set(sphereBody.position.x, sphereBody.position.y, sphereBody.position.z)
  objectsToUpdate.forEach(({ mesh, body }) => {
    mesh.position.copy(body.position)
    mesh.quaternion.copy(body.quaternion)
  })

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
