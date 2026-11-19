import { flipAt, hx } from "../world/weave";

// The five principles' spheres (v6, 19 Nov): real 3D balls drawn with WebGL, each with a piece of the
// HAX weave painted around it in its principle's colour, like porcelain, lit from the top left with a
// soft highlight and a rim of its colour. They spin slowly and turn further as the dial turns. One
// canvas, one small shader, no 3D library.
export type Orb = { k: number; x: number; y: number; r: number; alpha: number; spin: number; focus: number };

const VS = `
attribute vec3 aPos;
attribute vec2 aUv;
uniform vec2 uRes;
uniform vec3 uOrb;
uniform mat3 uRot;
varying vec2 vUv;
varying vec3 vN;
void main() {
  vec3 p = uRot * aPos;
  vN = p;
  vUv = aUv;
  vec2 px = uOrb.xy + vec2(p.x, -p.y) * uOrb.z;
  gl_Position = vec4(px.x / uRes.x * 2.0 - 1.0, 1.0 - px.y / uRes.y * 2.0, 0.0, 1.0);
}`;
const FS = `
precision mediump float;
uniform sampler2D uTex;
uniform vec3 uTint;
uniform float uAlpha;
uniform float uFocus;
varying vec2 vUv;
varying vec3 vN;
void main() {
  vec3 n = normalize(vN);
  if (n.z < 0.0) discard;
  vec3 L = normalize(vec3(-0.42, 0.55, 0.72));
  float diff = max(dot(n, L), 0.0);
  float spec = pow(max(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0), 70.0);
  float rim = pow(1.0 - n.z, 2.6);
  vec3 tex = texture2D(uTex, vUv).rgb;
  vec3 c = tex * (0.6 + 0.48 * diff);
  c = mix(c, c * vec3(0.84, 0.87, 0.95), smoothstep(0.15, -0.7, dot(n, L)));
  c += vec3(spec) * 0.6 + uTint * rim * (0.3 + 0.35 * uFocus);
  float a = uAlpha * smoothstep(0.0, 0.18, n.z);
  gl_FragColor = vec4(min(c, 1.0) * a, a);
}`;

function sphere(seg: number, rings: number) {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let j = 0; j <= rings; j++) {
    const v = j / rings, th = v * Math.PI;
    for (let i = 0; i <= seg; i++) {
      const u = i / seg, ph = u * Math.PI * 2;
      pos.push(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph));
      uv.push(u, v);
    }
  }
  for (let j = 0; j < rings; j++) for (let i = 0; i < seg; i++) {
    const a = j * (seg + 1) + i, b = a + seg + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  return { pos: new Float32Array(pos), uv: new Float32Array(uv), idx: new Uint16Array(idx) };
}

// the weave wrapped around a sphere: 16 tiles round, 8 top to bottom (it joins up all the way round)
function paint(k: number, color: string) {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 512;
  const x = c.getContext("2d");
  if (!x) return c;
  const [r, g, b] = hx(color);
  const base = x.createLinearGradient(0, 0, 0, 512);
  base.addColorStop(0, "#ffffff"); base.addColorStop(.55, "#fbfcfe"); base.addColorStop(1, `rgba(${r},${g},${b},.16)`);
  x.fillStyle = "#ffffff"; x.fillRect(0, 0, 1024, 512);
  x.fillStyle = base; x.fillRect(0, 0, 1024, 512);
  const s = 1024 / 16, h = s / 2, P = new Path2D();
  for (let row = 0; row < 8; row++) for (let q = 0; q < 16; q++) {
    const x0 = q * s, y0 = row * s;
    if (flipAt(row + k * 17, q + k * 5) === 0) {
      P.moveTo(x0 + h, y0); P.arc(x0, y0, h, 0, Math.PI / 2);
      P.moveTo(x0 + h, y0 + s); P.arc(x0 + s, y0 + s, h, Math.PI, Math.PI * 1.5);
    } else {
      P.moveTo(x0 + s, y0 + h); P.arc(x0 + s, y0, h, Math.PI / 2, Math.PI);
      P.moveTo(x0, y0 + h); P.arc(x0, y0 + s, h, Math.PI * 1.5, Math.PI * 2);
    }
  }
  x.lineCap = "butt";
  x.strokeStyle = `rgba(${r},${g},${b},.18)`; x.lineWidth = 18; x.stroke(P);
  x.strokeStyle = color; x.lineWidth = 6.5; x.stroke(P);
  x.strokeStyle = "rgba(255,255,255,.55)"; x.lineWidth = 1.6; x.stroke(P);
  return c;
}

const TILT = -0.16; // the spin axis leans back a little, so the poles stay out of sight

export function createOrbs(canvas: HTMLCanvasElement, colors: string[]) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
  if (!gl) return null;
  const shader = (type: number, src: string) => { const s = gl.createShader(type); if (!s) return null; gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const vs = shader(gl.VERTEX_SHADER, VS), fs = shader(gl.FRAGMENT_SHADER, FS), prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const m = sphere(56, 36);
  const attr = (data: Float32Array, name: string, size: number) => {
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, name); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  };
  attr(m.pos, "aPos", 3); attr(m.uv, "aUv", 2);
  const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.idx, gl.STATIC_DRAW);
  const U = (n: string) => gl.getUniformLocation(prog, n);
  const uRes = U("uRes"), uOrb = U("uOrb"), uRot = U("uRot"), uTint = U("uTint"), uAlpha = U("uAlpha"), uFocus = U("uFocus");
  gl.uniform1i(U("uTex"), 0);
  const tex = colors.map((c, k) => {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, paint(k, c));
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  });
  const tint = colors.map((c) => hx(c).map((v) => v / 255));
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  const ct = Math.cos(TILT), st = Math.sin(TILT);
  return {
    // x, y, r in canvas pixels
    draw(list: Orb[]) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      for (const o of [...list].sort((a, b) => a.focus - b.focus)) { // the one in front last
        if (o.alpha <= .01) continue;
        const c = Math.cos(o.spin), sn = Math.sin(o.spin);
        gl.uniformMatrix3fv(uRot, false, [c, st * sn, -ct * sn, 0, ct, st, sn, -st * c, ct * c]);
        gl.uniform3f(uOrb, o.x, o.y, o.r);
        gl.uniform3fv(uTint, tint[o.k]);
        gl.uniform1f(uAlpha, o.alpha);
        gl.uniform1f(uFocus, o.focus);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex[o.k]);
        gl.drawElements(gl.TRIANGLES, m.idx.length, gl.UNSIGNED_SHORT, 0);
      }
    },
    dispose() { gl.getExtension("WEBGL_lose_context")?.loseContext(); },
  };
}
