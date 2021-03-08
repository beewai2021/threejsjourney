varying vec2 vUv;

void main() {
    vec4 modelPos = modelMatrix * vec4(position, 1.0);
    vec4 viewPos = viewMatrix * modelPos;
    vec4 projectionPos = projectionMatrix * viewPos;

    vUv = uv;

    gl_Position = projectionPos;
}
