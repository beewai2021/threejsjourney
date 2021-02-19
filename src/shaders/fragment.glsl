precision mediump float; // precision level of float values (lowp, mediump, highp), high precision is more performance heavy, and might not work on all devices. lowp may cause bugs based on lack of precision

uniform vec3 uColor;
uniform sampler2D uTexture;

// varying are interpolated (between fragments in this example)
// varying float vRandom; // random attribute passed from vertex shader
varying vec2 vUv;
varying float vElevation;

void main() {
    // rgba, pick color from texture and apply color on fragment based on uv coordinates
    vec4 textureColor = texture2D(uTexture, vUv);
    textureColor.rgb *= vElevation * 2.0 + 0.65;

    // fragment color
    gl_FragColor = vec4(textureColor); // random green and alpha
}
