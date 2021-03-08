// #define to create constant variables
// that won't be changed
#define PI 3.14;

// uv passed from vertex shader
varying vec2 vUv;

// randomize values
// glsl does not have random function
float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

//	Classic Perlin 2D Noise 
//	by Stefan Gustavson
//
vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
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
    // float strength = distance(vUv, vec2(0.5, 0.5));

    // point light effect
    // float strength = 0.015 / distance(vUv, vec2(0.5));

    // wavy effect
    // vec2 waveVuv = vec2(
    //     vUv.x + sin(vUv.x * 100.0) * 0.1,
    //     vUv.y
    // );
    // float strength = 1.0 - step(0.01, abs(distance(waveVuv, vec2(0.5)) - 0.25));

    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
    // float strength = angle;

    // perlin noise pattern
    // use to recreate natural patterns, like clouds, 
    // water, fire, terrain, grass animation etc.
    // float strength = cnoise(vUv * 10.0);

    // strong perlin noise pattern
    // float strength = step(0.0, cnoise(vUv * 10.0));

    // glowing perlin noise pattern
    // float strength = 1.0 - abs(cnoise(vUv * 10.0));

    // optical illusion noise pattern
    float strength = step(0.5,sin(cnoise(vUv * 10.0) * 20.0));

    // clamp strength between 0 and 1 
    strength = clamp(strength, 0.0, 1.0);

    // colored version
    vec3 blackColor = vec3(0.0);
    vec3 uvColor = vec3(vUv, 1.0);
    vec3 mixedColor = mix(blackColor, uvColor, strength);

    gl_FragColor = vec4(mixedColor, 1.0);
}
