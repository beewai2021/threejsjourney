import * as THREE from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass"
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass"
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass"
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import * as dat from "dat.gui"

import "./style.css"

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const textureLoader = new THREE.TextureLoader()

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMapIntensity = 5
      child.material.needsUpdate = true
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.jpg",
  "/textures/environmentMaps/0/nx.jpg",
  "/textures/environmentMaps/0/py.jpg",
  "/textures/environmentMaps/0/ny.jpg",
  "/textures/environmentMaps/0/pz.jpg",
  "/textures/environmentMaps/0/nz.jpg",
])
environmentMap.encoding = THREE.sRGBEncoding

scene.background = environmentMap
scene.environment = environmentMap

/**
 * Models
 */
gltfLoader.load("/models/DamagedHelmet/glTF/DamagedHelmet.gltf", (gltf) => {
  gltf.scene.scale.set(2, 2, 2)
  gltf.scene.rotation.y = Math.PI * 0.5
  scene.add(gltf.scene)

  updateAllMaterials()
})

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 3, -2.25)
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

  // update effect composer
  effectComposer.setSize(sizes.width, sizes.height)
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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
camera.position.set(4, 1, -18)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.autoRotate = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 1.5
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

let RenderTargetClass = null
const rendererPixelRatio = renderer.getPixelRatio()
const webGL2available = renderer.capabilities.isWebGL2
// use built in webGL 2 anti alias if pixel ratio is lower than 2 and webGL 2 is available
if (rendererPixelRatio < 2 && webGL2available) {
  RenderTargetClass = THREE.WebGLMultisampleRenderTarget
} else {
  // otherwise use default render target and use SMAA pass
  RenderTargetClass = THREE.WebGLRenderTarget
}

// Post processing
// multisample render target supports MSAA (but not available in some browsers, 76% support)
const customRenderTarget = new RenderTargetClass(
  // size does not matter, as it will be handled by effect composer
  100, // height
  100, // width
  {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    // to compensate for the disabled sRGBEncoding for the renderer when using other passes
    encoding: THREE.sRGBEncoding,
  }
)

// effect composer is the composition of all render passes
const effectComposer = new EffectComposer(renderer, customRenderTarget)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(sizes.width, sizes.height)

// first render pass
// if only one pass exists, it wont go into a render target
// when using multiple passes (or multiple render targets), then the default renderer output encoding uses the default value of LinearEncoding
// multiple passes will disable anti alias, as it goes to the render target
const renderPass = new RenderPass(scene, camera) // first pass targets the existing scene
effectComposer.addPass(renderPass)

const dotScreenPass = new DotScreenPass()
dotScreenPass.enabled = false // toggle pass
effectComposer.addPass(dotScreenPass)

const glitchPass = new GlitchPass()
glitchPass.enabled = false
glitchPass.goWild = false
effectComposer.addPass(glitchPass)

const rgbShiftPass = new ShaderPass(RGBShiftShader)
rgbShiftPass.enabled = false
effectComposer.addPass(rgbShiftPass)

const unrealBloomPass = new UnrealBloomPass()
unrealBloomPass.enabled = true
unrealBloomPass.strength = 0.646
unrealBloomPass.threshold = 0.668
unrealBloomPass.radius = 1.362
// 3 main parameters
// strength = intensity of bloom
// threshold = when elements start to glow
// radius = how far the glow extends
// gui.add(unrealBloomPass, "strength", 0, 2, 0.001)
// gui.add(unrealBloomPass, "threshold", 0, 2, 0.001)
// gui.add(unrealBloomPass, "radius", 0, 2, 0.001)
gui.add(unrealBloomPass, "enabled")
effectComposer.addPass(unrealBloomPass)

// custom tint shader pass
const tintShader = {
  // t for texture
  uniforms: { tDiffuse: { value: null }, uTint: { value: null } },
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 uTint;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      color.rgb += uTint;
      gl_FragColor = color;
    }
  `,
}
const TintPass = new ShaderPass(tintShader)
TintPass.material.uniforms.uTint.value = new THREE.Vector3(0, 0.085, 0.106)
effectComposer.addPass(TintPass)

gui.add(TintPass.material.uniforms.uTint.value, "x", 0, 1, 0.001).name("r")
gui.add(TintPass.material.uniforms.uTint.value, "y", 0, 1, 0.001).name("g")
gui.add(TintPass.material.uniforms.uTint.value, "z", 0, 1, 0.001).name("b")

// custom displacement pass
const displacementShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: null,
    uNormalMap: { value: null },
  },
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D uNormalMap;
    // uniform float uTime;
    
    varying vec2 vUv;

    void main() {
      vec3 normalColor = texture2D(uNormalMap, vUv).rgb * 2.0 - 1.0;
      vec2 newUv = vUv + normalColor.xy * 0.1;
      vec4 color = texture2D(tDiffuse, newUv);
      
      gl_FragColor = color;
    }
  `,
}
const DisplacementPass = new ShaderPass(displacementShader)
const interfaceNormalMap = textureLoader.load(
  "/textures/interfaceNormalMap.png"
)
DisplacementPass.material.uniforms.uNormalMap = interfaceNormalMap
effectComposer.addPass(DisplacementPass)

// smaa has to be at the last pass in order
// cost to performance
// use smaa pass as a last resort
if (rendererPixelRatio < 2 && !webGL2available) {
  const smaaPass = new SMAAPass()
  smaaPass.enabled = true
  effectComposer.addPass(smaaPass)
}

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  DisplacementPass.material.uniforms.uTime.value = elapsedTime

  // Update controls
  controls.update()

  // Render
  //   renderer.render(scene, camera)
  effectComposer.render()

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
