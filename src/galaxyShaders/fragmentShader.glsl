varying vec3 vColor;

void main() {
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength *= 2.0; // diffuse circle point, linear diffuse
    strength = 1.0 - strength;
    // light glow, non linear light diffuse
    // light diffusion concentrated at center
    strength = pow(strength, 5.0); 

    vec3 color = mix(vec3(0.0), vColor, strength);

    gl_FragColor = vec4(vec3(color), 1.0);
}
