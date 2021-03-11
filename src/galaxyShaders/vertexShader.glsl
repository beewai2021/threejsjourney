uniform float uSize;
uniform float uTime;

attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

void main() {
    vec4 modelPos = modelMatrix * vec4(position,1.0);

    float angle = atan(modelPos.x, modelPos.z);
    float distanceToCenter = length(modelPos.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
    angle += angleOffset;

    modelPos.x = sin(angle) * distanceToCenter;
    modelPos.z = cos(angle) * distanceToCenter;

    modelPos.xyz += aRandomness;

    vec4 viewPos = viewMatrix * modelPos;
    vec4 projectionPos = projectionMatrix * viewPos;
    gl_Position = projectionPos;

    vColor = color;

    gl_PointSize = uSize * aScale; // point size (w/ randomness)
    gl_PointSize *= (1.0 / - viewPos.z); // point size attentuation
}
