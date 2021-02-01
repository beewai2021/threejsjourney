import * as THREE from "three"
import * as CANNON from "cannon-es"
// import cannonDebugger from "cannon-es-debugger";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import "./style.css"

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const fogColor = 0xfefefe
const scene = new THREE.Scene()
scene.fog = new THREE.Fog(fogColor, 0, 50)

// Axes helper
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

// Camera
const camera = new THREE.OrthographicCamera(
  -3 * (sizes.width / sizes.height),
  3 * (sizes.width / sizes.height),
  3,
  -3,
  0.1,
  100
)
camera.position.set(-7.9, 3.85, 16.36)
scene.add(camera)

// Lights
const ambientLight = new THREE.AmbientLight(0x0099ff, 0.35)
scene.add(ambientLight)

const frontLight = new THREE.DirectionalLight(0xffffff, 0.5)
frontLight.castShadow = true
frontLight.position.set(3, 3, 5)
frontLight.shadow.mapSize.height = 512 * 2
frontLight.shadow.mapSize.width = 512 * 2
frontLight.shadow.camera.top = 3
frontLight.shadow.camera.bottom = -3
frontLight.shadow.camera.left = -3
frontLight.shadow.camera.right = 3
frontLight.shadow.camera.near = 3.5
frontLight.shadow.camera.far = 12
scene.add(frontLight)

// Beewai
const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
const defaultMaterial = new CANNON.Material()
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  { restitution: 0.1 }
)
world.defaultContactMaterial = defaultContactMaterial
const material = new THREE.MeshStandardMaterial({
  metalness: 0.5,
  roughness: 0.25,
})
const plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(80, 80), material)
plane.receiveShadow = true
scene.add(plane)
plane.rotation.x = -Math.PI / 2
const planeShape = new CANNON.Plane()
const planeBody = new CANNON.Body({ shape: planeShape, mass: 0 })
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
world.addBody(planeBody)
const title = document.querySelector(".title").innerText
const letters = Array.from(title)
const letterMeshes = []
const lettersGroup = []
const fontLoader = new THREE.FontLoader()
let startPos = -(letters.length - 1) * 0.5
fontLoader.load("/font/font.typeface.json", (data) => {
  document.body.style.opacity = 1
  letters.forEach((letter, index) => {
    const letterGeometry = new THREE.TextBufferGeometry(letter, {
      font: data,
      size: 1.2,
      height: 0.3,
      curveSegments: 203,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.04,
      bevelOffset: 0,
      bevelSegments: 35,
    })
    const letterMesh = new THREE.Mesh(letterGeometry, material)
    letterMesh.geometry.center()
    letterMesh.castShadow = true
    letterGeometry.computeBoundingBox()
    const letterSize = letterGeometry.boundingBox.getSize(new THREE.Vector3())
    letterMesh.position.x = (startPos + index) * 1.25
    letterMesh.position.y = 1
    const letterShape = new CANNON.Box(
      new CANNON.Vec3().copy(letterSize).scale(0.5)
    )
    const letterBody = new CANNON.Body({
      shape: letterShape,
      mass: 5.5,
      position: letterMesh.position,
    })
    scene.add(letterMesh)
    world.addBody(letterBody)
    letterMeshes.push(letterMesh)
    lettersGroup.push({ letterMesh, letterBody })
  })
})

// Raycaster
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
window.addEventListener("mousemove", (e) => {
  const { clientX, clientY } = e
  mouse.x = (clientX / sizes.width) * 2 - 1
  mouse.y = -(clientY / sizes.height) * 2 + 1
})
// add click handler
document.addEventListener("click", () => {
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(letterMeshes)
  const isIntersecting = intersects.length > 0
  if (isIntersecting) {
    const letter = intersects[0]
    const { object, face } = letter
    const clickedLetter = lettersGroup.find(
      (letter) => letter.letterMesh.uuid === object.uuid
    )
    clickedLetter.letterBody.applyLocalImpulse(
      new THREE.Vector3().copy(face.normal).negate().multiplyScalar(3),
      new CANNON.Vec3()
    )
  }
})

// Orbit controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enableZoom = false
controls.enablePan = false
// controls.addEventListener("change", (e) => {
//   console.log(e.target.object.position);
// });

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.setClearColor(fogColor)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// Resize
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.top = 3
  camera.right = 3 * (sizes.width / sizes.height)
  camera.bottom = -3
  camera.left = -3 * (sizes.width / sizes.height)
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Cannon debugger
// cannonDebugger(scene, world.bodies, { color: "orangered" });

const clock = new THREE.Clock()
let prevElapsedTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - prevElapsedTime
  prevElapsedTime = elapsedTime

  world.step(1 / 60, deltaTime, 3)

  lettersGroup.forEach((letter) => {
    letter.letterMesh.position.copy(letter.letterBody.position)
    letter.letterMesh.quaternion.copy(letter.letterBody.quaternion)
  })

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
