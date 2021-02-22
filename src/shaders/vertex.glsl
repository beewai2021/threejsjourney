// // uniforms carry same value for each vertex (mat4 for vec4 of position)
// uniform mat4 projectionMatrix; // clipspace coordinates (normalized), transform 3d space into 2d screen, discards coordinates outside of range, and remaining coordinates end up as visible fragments 
// uniform mat4 viewMatrix; // position based on camera position/fov/near/far/rotation
// uniform mat4 modelMatrix; // position based on mesh position/rotation/scale in the world world, rather than local space
// // uniform mat4 modelViewMatrix; // modelMatrix * viewMatrix

// custom uniforms passed from js
uniform vec2 uFrequency;
uniform float uTime;

// attribute vec3 position; // different position for each vertex (x,y,z), at local space. Float32BufferAttributes

// custom attributes from custom made geometry attributes from js
attribute float aRandom; // custom created attributes, "a" for attributes
// attribute vec2 uv;

// passing varyings to fragment shaders
// varying float vRandom;
varying vec2 vUv;
varying float vElevation;

// functions that doesnt return anything, nor has any function parameters can use "void"
// vec2 (x,y)
// vec3 (x,y,z) or (r,g,b)
// vec4 (x,y,z,w) or (r,g,b,a)
    // position of the vertex (vec4(x, y, z, w = 1.0)) in screen coordinates
    // w helps with perspective projection
    
// must be in the following order
// matrix applies to position through multiplication
// gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
// or
// gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

void main() {
    vec4 modelPos = modelMatrix * vec4(position, 1.0); // transform local to world space coordinates

    float waveStrength = 0.08;

    // sin wave elevation based on uniform time thats updated every next frame
    float elevation = sin(modelPos.x * uFrequency.x - uTime) * waveStrength;
    elevation += sin(modelPos.y * uFrequency.y - uTime) * waveStrength;

    modelPos.z += elevation;

    // pass varying to fragment shader
    // vRandom = aRandom; 
    vUv = uv;
    vElevation = elevation;

    vec4 viewPos = viewMatrix * modelPos; // camera projection
    vec4 projectionPos = projectionMatrix * viewPos; // add perspective if using perspective camera

    gl_Position = projectionPos;
}
