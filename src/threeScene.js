import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ThreeUI Official "Portal Field" ShaderMaterial Implementation
 * Custom refined: Compact size, scroll-linked path movement, and delicate atmospheric transparency.
 */

const portalVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const portalFragmentShader = `
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform vec2 u_center;
  uniform vec3 u_colorCore;
  uniform vec3 u_colorFringe;
  uniform float u_warp;
  uniform float u_scale;
  uniform float u_chaos;
  varying vec2 vUv;

  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(in vec2 p) {
    const float K1 = 0.366025404;
    const float K2 = 0.211324865;
    vec2 i = floor(p + (p.x + p.y) * K1);
    vec2 a = p - i + (i.x + i.y) * K2;
    vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec2 b = a - o + K2;
    vec2 c = a - 1.0 + 2.0 * K2;
    vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
    vec3 n = h * h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
    return dot(n, vec3(70.0));
  }

  // ThreeUI Portal Arc Function
  float sdArc(vec2 p, vec2 center, float radius, float width, float warp) {
    float totalWarp = warp * (1.0 + u_chaos * 1.6);
    p.y += sin(p.x * 2.2 + u_time * (0.35 + u_chaos * 0.5)) * totalWarp;
    p.x += noise(p * 1.6 + u_time * (0.12 + u_chaos * 0.3)) * (totalWarp * 0.8);
    float d = length(p - center) - radius;
    return abs(d) - width;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 st = uv;
    st.x *= u_resolution.x / u_resolution.y;

    // Pointer-reactive fringe light offset
    vec2 mouseOffset = (u_mouse - 0.5) * 0.06;
    st += mouseOffset;

    // Scroll-linked dynamic portal center
    vec2 center = vec2(u_center.x * (u_resolution.x / u_resolution.y), u_center.y);

    // Refined, compact size
    float r1 = 0.28 * u_scale;
    float r2 = 0.35 * u_scale;
    float r3 = 0.42 * u_scale;

    float d1 = sdArc(st, center, r1, 0.018, u_warp);
    float d2 = sdArc(st, center, r2, 0.040, u_warp * 1.2);
    float d3 = sdArc(st, center, r3, 0.012, u_warp * 0.7);

    float coreGlow = exp(-d1 * 32.0);
    float fringeGlow = exp(-d2 * 11.0);
    float outerGlow = exp(-d3 * 22.0);
    float wash = smoothstep(0.95 * u_scale, -0.3, length(st - center)) * 0.12;

    vec3 finalColor = vec3(0.0);
    finalColor += u_colorCore * (coreGlow * 0.75);
    finalColor += u_colorFringe * (fringeGlow * 0.65);
    finalColor += u_colorCore * (outerGlow * 0.35);
    finalColor += u_colorFringe * wash * (sin(u_time * 0.6) * 0.15 + 0.65);

    // Secondary subtle chromatic depth
    finalColor += vec3(0.01, 0.02, 0.05) * (1.0 - length(st - center) * 0.5);

    float alpha = clamp(coreGlow + fringeGlow + outerGlow + wash, 0.0, 1.0);
    finalColor = vec3(1.0) - exp(-finalColor * 1.2);

    // Subtle atmospheric transparency: content and typography remain 100% crystal clear
    gl_FragColor = vec4(finalColor, alpha * 0.42);
  }
`;

export class ThreeScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Shader Material & Quad
    this.portalMaterial = null;
    this.portalMesh = null;

    // Colors
    this.colorCore = new THREE.Color('#ffffff');
    this.colorFringe = new THREE.Color('#00f0ff');
    this.targetColorCore = new THREE.Color('#ffffff');
    this.targetColorFringe = new THREE.Color('#00f0ff');

    // Scale & Positions
    this.breathingScale = 0.9;
    this.targetScale = 0.9;
    this.chaosFactor = 0.0;

    // Mouse Tracking
    this.mouse = new THREE.Vector2(0.5, 0.5);
    this.targetMouse = new THREE.Vector2(0.5, 0.5);

    this.clock = new THREE.Clock();

    this.init();
    this.createPortal();
    this.setupScrollAnimation();
    this.setupEvents();
    this.animate();
  }

  init() {
    this.scene = new THREE.Scene();
    
    // Orthographic Camera for crisp, high-speed 2D WebGL background rendering
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.z = 1;

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  }

  createPortal() {
    const geometry = new THREE.PlaneGeometry(2, 2);

    this.portalUniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_center: { value: new THREE.Vector2(0.5, 0.52) },
      u_colorCore: { value: this.colorCore },
      u_colorFringe: { value: this.colorFringe },
      u_warp: { value: 0.14 },
      u_scale: { value: 0.9 },
      u_chaos: { value: 0.0 }
    };

    this.portalMaterial = new THREE.ShaderMaterial({
      vertexShader: portalVertexShader,
      fragmentShader: portalFragmentShader,
      uniforms: this.portalUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    this.portalMesh = new THREE.Mesh(geometry, this.portalMaterial);
    this.scene.add(this.portalMesh);
  }

  setupScrollAnimation() {
    // Cinematic Portal Movement Choreographed Along Scroll Journey
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2
      }
    });

    // 1. Hero -> Physics Section (glides towards left to accentuate the dual oscilloscopes)
    scrollTl.to(this.portalUniforms.u_center.value, {
      x: 0.38,
      y: 0.54,
      duration: 2,
      ease: 'power2.inOut'
    }, 0)
    .to(this.portalUniforms.u_warp, {
      value: 0.20,
      duration: 2,
      ease: 'power2.inOut'
    }, 0);

    // 2. Physics -> Pillars Section (drifts gracefully to the right behind cards)
    scrollTl.to(this.portalUniforms.u_center.value, {
      x: 0.65,
      y: 0.46,
      duration: 2.5,
      ease: 'power2.inOut'
    }, 2)
    .to(this.portalUniforms.u_warp, {
      value: 0.16,
      duration: 2.5,
      ease: 'power2.inOut'
    }, 2);

    // 3. Pillars -> Flow Sandbox (re-centers directly behind the breathing ring)
    scrollTl.to(this.portalUniforms.u_center.value, {
      x: 0.50,
      y: 0.50,
      duration: 2.5,
      ease: 'power2.inOut'
    }, 4.5);

    // 4. Sandbox -> Science & Reviews (floats to the upper-left ambient zone)
    scrollTl.to(this.portalUniforms.u_center.value, {
      x: 0.40,
      y: 0.55,
      duration: 2.0,
      ease: 'power2.inOut'
    }, 7);

    // 5. Reviews -> Finale CTA (centers smoothly behind the early access box)
    scrollTl.to(this.portalUniforms.u_center.value, {
      x: 0.50,
      y: 0.46,
      duration: 2.0,
      ease: 'power2.inOut'
    }, 9)
    .to(this.portalUniforms.u_scale, {
      value: 1.05,
      duration: 2.0,
      ease: 'power2.inOut'
    }, 9);
  }

  setupEvents() {
    window.addEventListener('resize', () => this.onResize());

    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x = e.clientX / window.innerWidth;
      this.targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
    });
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    if (this.portalUniforms) {
      this.portalUniforms.u_resolution.value.set(width, height);
    }
  }

  setColor(coreHex, fringeHex) {
    this.targetColorCore.set(coreHex || '#ffffff');
    this.targetColorFringe.set(fringeHex || '#00f0ff');

    gsap.to(this.colorCore, {
      r: this.targetColorCore.r,
      g: this.targetColorCore.g,
      b: this.targetColorCore.b,
      duration: 1.2
    });

    gsap.to(this.colorFringe, {
      r: this.targetColorFringe.r,
      g: this.targetColorFringe.g,
      b: this.targetColorFringe.b,
      duration: 1.2
    });
  }

  setBreathingScale(scale) {
    // Proportional scale factor for compact portal
    this.targetScale = scale * 0.9;
  }

  setChaosFactor(val) {
    gsap.to(this, {
      chaosFactor: val,
      duration: 0.9,
      ease: 'power2.out',
      onUpdate: () => {
        if (this.portalUniforms) {
          this.portalUniforms.u_chaos.value = this.chaosFactor;
        }
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    // Smooth pointer-reactive interpolation
    this.mouse.lerp(this.targetMouse, 0.045);

    // Smooth breathing scaling interpolation
    this.breathingScale += (this.targetScale - this.breathingScale) * 0.05;

    // Update Portal Field Shader Uniforms
    if (this.portalUniforms) {
      this.portalUniforms.u_time.value = elapsedTime;
      this.portalUniforms.u_mouse.value.copy(this.mouse);
      this.portalUniforms.u_scale.value = this.breathingScale;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
