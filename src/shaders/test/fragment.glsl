varying vec2 vUv;

// randomize values
// glsl does not have random function
float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    // Grayscale on x-axis pattern 
    // float strength = vUv.x;

    // Grayscale on y-axis pattern 
    // float strength = vUv.y;

    // Grayscale on y-axis (inverted) pattern
    // float strength = 1.0 - vUv.y;

    // Grayscale on y-axis (fast approaching to white on y-axis) pattern 
    // float strength = vUv.y * 15.0;

    // Grayscale on y-axis (10 levels, fast approaching white on y-axis) pattern
    // float strength = mod(vUv.y * 10.0, 1.0);

    // 0.5 as the edge, if below edge return 0.0, if above edge return 1.0
    // float strength = step(0.5, mod(vUv.y * 10.0, 1.0));
    // strength = strength * step(0.5, mod(vUv.x * 10.0, 1.0));

    // float barX = step(0.4, mod(vUv.y * 10.0, 1.0));
    // barX *= step(0.8, mod(vUv.x * 10.0 + 0.2, 1.0));
    
    // float barY = step(0.8, mod(vUv.y * 10.0 + 0.2, 1.0));
    // barY *= step(0.4, mod(vUv.x * 10.0, 1.0));

    // float strength = barX + barY;

    // float square1 = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
    // float square2 = 1.0 - step(0.25, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
    // float strength = square1 * square2;

    // step gradient
    // float strength = floor(vUv.x * 10.0) / 10.0;
    // strength *= floor(vUv.y * 10.0) / 10.0;

    // random noise
    // float randomise = random(vUv.xy);

    // random blocks
    // vec2 gridUV = vec2(
    //     floor(vUv.x * 10.0) / 10.0, 
    //     floor((vUv.y + vUv.x * 0.5) * 10.0) / 10.0 
    // );

    // float strength = random(gridUV);

    // float strength = length(vUv - 0.5);
    float strength = distance(vUv, vec2(0.5, 0.5));

    // rgb(0, 0, 0) = black color
    // rgb(1, 1, 1) = white color    
    gl_FragColor = vec4(vec3(strength), 1.0);
}
