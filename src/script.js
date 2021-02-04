import * as THREE from "three"
import * as dat from "dat.gui"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import "./style.css"

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
gui.width = 350
const debugObject = {}

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

// Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.82)
directionalLight.position.set(0.25, 3, -2.25)
directionalLight.castShadow = true
// directionalLight.shadow.bias = 0.05 // helps with shadow acene for flat surfaces
// directionalLight.shadow.normalBias = 0.05 // helps with shadow acene for rounded surfaces (shrinking burger smaller so that it doesnt cast shadows on itself) 0.00 <---> 0.05 should be enough
scene.add(directionalLight)
// const directionalLightCameraHelper = new THREE.CameraHelper(
//   directionalLight.shadow.camera
// )
// scene.add(directionalLightCameraHelper)
directionalLight.shadow.camera.far = 10
directionalLight.shadow.mapSize.height = 512 * 2
directionalLight.shadow.mapSize.width = 512 * 2

const directionalLightFolder = gui.addFolder("dirLight")
directionalLightFolder.open()
directionalLightFolder.add(directionalLight, "intensity", 0, 10, 0.001)
directionalLightFolder.add(directionalLight.position, "x", -5, 5, 0.001)
directionalLightFolder.add(directionalLight.position, "y", -5, 5, 0.001)
directionalLightFolder.add(directionalLight.position, "z", -5, 5, 0.001)

// Env Map
const cubeTextureLoader = new THREE.CubeTextureLoader()
const envMap = cubeTextureLoader.load(
  [
    "/textures/environmentMaps/3/px.jpg",
    "/textures/environmentMaps/3/nx.jpg",
    "/textures/environmentMaps/3/py.jpg",
    "/textures/environmentMaps/3/ny.jpg",
    "/textures/environmentMaps/3/pz.jpg",
    "/textures/environmentMaps/3/nz.jpg",
  ],
  () => console.log("loading textures")
)

envMap.encoding = THREE.sRGBEncoding // apply srgb encoding to the texture itself
scene.background = new THREE.Color(0x2f2f2f)
// scene.background = envMap
// scene.environment = envMap // applies env map to every material in scene, although dont use this for normal maps

// Update all materials
const updateAllMaterial = () => {
  scene.traverse((child) => {
    // test if child is a mesh and its material is of MeshStandardMaterial
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.castShadow = true
      child.receiveShadow = true
      child.material.envMap = envMap
      child.material.envMapIntensity = debugObject.envMapIntensity
      child.material.needsUpdate = true
    }
  })
}

const envMapFolder = gui.addFolder("envMap")
debugObject.envMapIntensity = 5
envMapFolder.open()
envMapFolder
  .add(debugObject, "envMapIntensity", 0, 10, 0.001)
  .onChange(updateAllMaterial)

// Model
const gltfLoader = new GLTFLoader()
gltfLoader.load(
  "/models/FlightHelmet/glTF/FlightHelmet.gltf",
  (gltf) => {
    const model = gltf.scene
    model.scale.set(10, 10, 10)
    model.position.y = -3
    model.rotation.y = Math.PI / 1.5
    scene.add(model)

    const modelFolder = gui.addFolder("model")
    modelFolder.open()
    modelFolder
      .add(model.rotation, "y", -Math.PI, Math.PI, 0.001)
      .name("modelRotation")

    updateAllMaterial()
    // GLTFLoader automatically applies the correct encoding to the model's textures
  },
  () => console.log("loading model")
)

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
camera.position.set(3.33, 1.39, -5.6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.autoRotate = 1
controls.autoRotateSpeed = 0.5
// controls.addEventListener("change", (e) => console.log(e))

/**
 * Renderer
 */
// super sampling (SSAA) multiples 4 times the pixels for every pixel. High performance cost
// multi sampling (MSAA) applies SSAA only for pixels near the edges, this is the default anti alias option for three.js
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: window.devicePixelRatio < 2 ? true : false,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding // more precise lighting from bright to dark
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
// tonemapping is converting HDR values to LDR values with algorithims to between 0 <---> 1
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 3

// select options for tone mapping
const toneMappingFolder = gui.addFolder("toneMapping")
toneMappingFolder.open()
toneMappingFolder
  .add(renderer, "toneMapping", {
    none: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
  })
  .onFinishChange(() => {
    // dat.gui bug, we have to convert stringified select option back to number format
    renderer.toneMapping = Number(renderer.toneMapping)
    updateAllMaterial() // update material for model
  })
toneMappingFolder.add(renderer, "toneMappingExposure", 0, 2, 0.001) // how much light the renderer will let in

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
