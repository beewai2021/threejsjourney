// uniforms carry same value for each vertex (mat4 for vec4 of position)
uniform mat4 projectionMatrix; // clipspace coordinates (normalized), transform 3d space into 2d screen, discards coordinates outside of range, and remaining coordinates end up as visible fragments 
uniform mat4 viewMatrix; // position based on camera position/fov/near/far/rotation
uniform mat4 modelMatrix; // position based on mesh position/rotation/scale in the world world, rather than local space
// uniform mat4 modelViewMatrix; // modelMatrix * viewMatrix

attribute vec3 position; // different position for each vertex (x,y,z), at local space. Float32BufferAttributes
attribute float aRandom; // custom created attribute, a for attributes

varying float vRandom;

// float sum(float a, float b) {
//     return a + b;
// }

// functions that doesnt return anything, nor has any function parameters can use void

void main() {
    // vec2 (x,y)
    // vec3 (x,y,z) or (r,g,b)
    // vec4 (x,y,z,w) or (r,g,b,a)

    // float result = sum(1.0, 2.0);
    
    // position of the vertex (vec4(x, y, z, w = 1.0)) in screen coordinates
    // w helps with perspective projection
    // each matrix transforms position to get final clip space coordinates
    // matrix applies to position through multiplication
    // must be in the following order
    // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vec4 modelPos = modelMatrix * vec4(position, 1.0); // world space position

    float waveFrequency = 7.0;
    float waveStrength = 0.08;
    // modelPos.z = modelPos.z + sin(modelPos.x * waveFrequency) * waveStrength;
    modelPos.z = aRandom * waveStrength;

    vRandom = aRandom; // pass varying to fragment shader

    vec4 viewPos = viewMatrix * modelPos; // camera projection
    vec4 projectionPos = projectionMatrix * viewPos;

    gl_Position = projectionPos;
}
