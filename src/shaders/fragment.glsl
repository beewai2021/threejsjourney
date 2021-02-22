precision mediump float; // precision level of float values (lowp, mediump, highp), high precision is more performance heavy, and might not work on all devices. lowp may cause bugs based on lack of precision

// custom uniforms passed from js
uniform vec3 uColor;
uniform sampler2D uTexture; // 2D image texture. samplerCube for 2D cubemap texture

// passed from vertex shaders
// varying are linearly interpolated (between fragments in this example)
// varying float vRandom;
varying vec2 vUv;
varying float vElevation;

void main() {
    // pick color from texture and apply color onto fragments based on uv coordinates positioning
    vec4 textureColor = texture2D(uTexture, vUv);

    // artificial shadows based on elevation
    textureColor.rgb *= vElevation * 2.0 + 0.65;

    // fragment color
    gl_FragColor = vec4(textureColor); // apply vec4 texture color as fragment color
}
