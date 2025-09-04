// ShaderCanvas.jsx
import { useEffect, useRef, useState } from "react";

export default function ShaderCanvas() {
  const canvasRef = useRef(null);

  // UI controls (hooked straight to uniforms)
  const [speed, setSpeed] = useState(0.02);
  const [hue, setHue] = useState(0.55);
  const [hueVar, setHueVar] = useState(0);
  const [density, setDensity] = useState(0);
  const [disp, setDisp] = useState(0.4);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: true });
    if (!gl) { console.error("WebGL not supported"); return; }

    // --- 1) Shaders (vertex + fragment) ---
    const vertexSrc = `
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main() {
        vUv = aPosition * 0.5 + 0.5;      // map clip-space to 0..1
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentSrc = `
      precision highp float;
      varying vec2 vUv;

      uniform float uTime;
      uniform vec2  uMouse;         // 0..1 (x, y), y up
      uniform float uHue;
      uniform float uHueVariation;
      uniform float uDensity;
      uniform float uDisplacement;

      // --- noise helpers (2D cnoise) ---
      float mod289(float x){ return x - floor(x * (1.0/289.0)) * 289.0; }
      vec4  mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
      vec4  perm(vec4 x){  return mod289(((x * 34.0) + 1.0) * x); }
      vec2  fade(vec2 t){  return t*t*t*(t*(t*6.0-15.0)+10.0); }

      float cnoise(vec2 P){
        vec4 Pi = floor(P.xyxy) + vec4(0.0,0.0,1.0,1.0);
        vec4 Pf = fract(P.xyxy) - vec4(0.0,0.0,1.0,1.0);
        Pi = mod289(Pi);
        vec4 ix = Pi.xzxz;
        vec4 iy = Pi.yyww;
        vec4 fx = Pf.xzxz;
        vec4 fy = Pf.yyww;

        vec4 i  = perm(perm(ix) + iy);
        vec4 gx = 2.0 * fract(i * (1.0/41.0)) - 1.0;
        vec4 gy = abs(gx) - 0.5;
        vec4 tx = floor(gx + 0.5);
        gx = gx - tx;

        vec2 g00 = vec2(gx.x, gy.x);
        vec2 g10 = vec2(gx.y, gy.y);
        vec2 g01 = vec2(gx.z, gy.z);
        vec2 g11 = vec2(gx.w, gy.w);

        vec4 norm = 1.79284291400159 - 0.85373472095314 *
                    vec4(dot(g00,g00), dot(g01,g01), dot(g10,g10), dot(g11,g11));
        g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;

        float n00 = dot(g00, vec2(fx.x, fy.x));
        float n10 = dot(g10, vec2(fx.y, fy.y));
        float n01 = dot(g01, vec2(fx.z, fy.z));
        float n11 = dot(g11, vec2(fx.w, fy.w));
        vec2  fade_xy = fade(Pf.xy);
        vec2  n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
        float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
        return 2.3 * n_xy; // ~[-1,1]
      }

      // --- HSL -> RGB ---
      float hue2rgb(float f1, float f2, float h){
        if (h < 0.0) h += 1.0; else if (h > 1.0) h -= 1.0;
        if (6.0*h < 1.0) return f1 + (f2 - f1) * 6.0 * h;
        if (2.0*h < 1.0) return f2;
        if (3.0*h < 2.0) return f1 + (f2 - f1) * ((2.0/3.0) - h) * 6.0;
        return f1;
      }
      vec3 hsl2rgb(vec3 hsl){
        float h = hsl.x, s = hsl.y, l = hsl.z;
        if (s == 0.0) return vec3(l);
        float f2 = l < 0.5 ? l * (1.0 + s) : l + s - s * l;
        float f1 = 2.0 * l - f2;
        return vec3(
          hue2rgb(f1, f2, h + 1.0/3.0),
          hue2rgb(f1, f2, h),
          hue2rgb(f1, f2, h - 1.0/3.0)
        );
      }

      void main(){
        // time softened a bit
        float t = uTime * 0.5;

        // soft vignette reacting to mouse
        float mouseDist = length(vUv - uMouse);
        float shadow    = smoothstep(0.0, 0.3 + sin(t * 15.707963) * 0.1, mouseDist);

        // elevation stripes + flow
        float elevation = vUv.y * uDensity * 30.0;
        elevation += shadow * 5.0;

        float displacement = cnoise(vec2(t + vUv.y * 2.0, t + vUv.x * 3.0)) * uDisplacement * 3.0;
        elevation += displacement * 4.0;
        elevation *= 2.0 + cnoise(vec2(t + vUv.y * 1.0, t + 0.5)) * 2.0;

        float light = 0.9 + fract(elevation);
        light *= 0.9 + (1.0 - (displacement * displacement)) * 0.1;
        elevation = floor(elevation);

        float hue = uHue + shadow * 0.1 + cnoise(vec2(elevation * 0.10, 0.1 + t)) * uHueVariation;
        float sat = 0.6;
        float bri = -(1.0 - shadow) * 0.1 + 0.5
                  - smoothstep(0.0, 0.9, cnoise(vec2(elevation * 0.5, 0.4 + t * 5.0))) * 0.1;

        vec3 col = hsl2rgb(vec3(hue, sat, bri)) * vec3(light, 1.0, 1.0);
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    // --- 2) Compile + link program ---
    const compile = (src, type) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };
    const vert = compile(vertexSrc, gl.VERTEX_SHADER);
    const frag = compile(fragmentSrc, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // --- 3) Fullscreen quad (clip-space) ---
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // --- 4) Uniform locations ---
    const uTimeLoc         = gl.getUniformLocation(program, "uTime");
    const uMouseLoc        = gl.getUniformLocation(program, "uMouse");
    const uHueLoc          = gl.getUniformLocation(program, "uHue");
    const uHueVarLoc       = gl.getUniformLocation(program, "uHueVariation");
    const uDensityLoc      = gl.getUniformLocation(program, "uDensity");
    const uDispLoc         = gl.getUniformLocation(program, "uDisplacement");

    // --- 5) Mouse handling (normalized 0..1, y up) ---
    const mouse = { x: 0.5, y: 0.5 };
    function onMouseMove(e){
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / rect.width;
      mouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
    }
    canvas.addEventListener("mousemove", onMouseMove);

    // --- 6) Resize handling (DPR aware) ---
    function resize(){
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width  = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    }
    window.addEventListener("resize", resize);
    resize();

    // --- 7) Render loop ---
    let raf = 0;
    let start = performance.now();
    function frame(now){
      raf = requestAnimationFrame(frame);
      const t = (now - start) * 0.001 * speed;

      // push uniforms
      gl.uniform1f(uTimeLoc, t);
      gl.uniform2f(uMouseLoc, mouse.x, mouse.y);
      gl.uniform1f(uHueLoc, hue);
      gl.uniform1f(uHueVarLoc, hueVar);
      gl.uniform1f(uDensityLoc, density);
      gl.uniform1f(uDispLoc, disp);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    raf = requestAnimationFrame(frame);

    // --- 8) Cleanup ---
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      gl.deleteBuffer(vbo);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, [speed, hue, hueVar, density, disp]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* simple controls */}
      <div style={{
        position: "absolute", zIndex: 2, top: 12, left: 12,
        padding: "10px 12px", background: "rgba(0,0,0,0.35)",
        color: "white", borderRadius: 8, fontFamily: "ui-sans-serif, system-ui",
        backdropFilter: "blur(8px)"
      }}>
        <label style={{ display: "block" }}>speed {speed.toFixed(2)}
          <input type="range" min="0.05" max="1" step="0.01" value={speed}
                 onChange={e => setSpeed(parseFloat(e.target.value))} />
        </label>
        <label style={{ display: "block" }}>hue {hue.toFixed(2)}
          <input type="range" min="0" max="1" step="0.01" value={hue}
                 onChange={e => setHue(parseFloat(e.target.value))} />
        </label>
        <label style={{ display: "block" }}>hue variation {hueVar.toFixed(2)}
          <input type="range" min="0" max="1" step="0.01" value={hueVar}
                 onChange={e => setHueVar(parseFloat(e.target.value))} />
        </label>
        <label style={{ display: "block" }}>density {density.toFixed(2)}
          <input type="range" min="0" max="1" step="0.01" value={density}
                 onChange={e => setDensity(parseFloat(e.target.value))} />
        </label>
        <label style={{ display: "block" }}>displacement {disp.toFixed(2)}
          <input type="range" min="0" max="1" step="0.01" value={disp}
                 onChange={e => setDisp(parseFloat(e.target.value))} />
        </label>
      </div>

      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}