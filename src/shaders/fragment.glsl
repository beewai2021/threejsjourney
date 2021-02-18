precision mediump float; // precision level of float values (lowp, mediump, highp), high precision is more performance heavy, and might not work on all devices. lowp may cause bugs based on lack of precision

varying float vRandom; // random attribute passed from vertex shader

void main() {
    // varying are interpolated (between fragments in this example)
    // fragment color
    gl_FragColor = vec4(0.5, vRandom, 1.0, vRandom); // random green and alpha
}
