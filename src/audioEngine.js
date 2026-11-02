/**
 * KAIRO NEURO-ACOUSTIC ENGINE v3.5
 * Generates pure, constant, phase-locked harmonic frequencies (432Hz, 528Hz, 396Hz)
 * and deep velvety Brownian noise using the native Web Audio API.
 * 100% steady, uninterrupted tone with zero wobble or acoustic beating ("11111111").
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.currentPreset = 'alpha';
    
    // Master volume gain
    this.masterGain = null;

    // Phase-coherent constant tone oscillators
    this.carrierOscLeft = null;
    this.carrierOscRight = null;
    this.subDroneOsc = null;
    this.shimmerOsc = null;
    
    // Noise shield
    this.noiseNode = null;
    this.noiseGain = null;
    this.noiseFilter = null;

    // Harmonic Frequency Presets (Pure Constant Tones)
    this.configs = {
      alpha: { 
        carrier: 432, 
        name: 'Natural Alpha Harmonic (432 Hz)',
        desc: 'Steady, uninterrupted harmonic clarity & calm',
        noiseType: 'pink',
        noiseFilter: 420
      },
      theta: { 
        carrier: 432, 
        name: 'Theta Calm Grounding (432 Hz Sub-Deep)',
        desc: 'Constant deep meditative stillness',
        noiseType: 'pink',
        noiseFilter: 320
      },
      antirumination: { 
        carrier: 396, 
        name: 'Solfeggio Liberation (396 Hz)',
        desc: 'Constant steady frequency to silence overthinking & fear',
        noiseType: 'brown',
        noiseFilter: 240
      },
      solfeggio: { 
        carrier: 528, 
        name: 'Solfeggio Transformation (528 Hz)',
        desc: 'Pure miracle frequency for mental reset',
        noiseType: 'pink',
        noiseFilter: 500
      },
      gamma: { 
        carrier: 432, 
        name: 'Gamma Focus Prime (432 Hz + High Octave)',
        desc: 'Sharp, unwavering concentration for complex work',
        noiseType: 'pink',
        noiseFilter: 580
      }
    };
  }

  /**
   * Initializes the AudioContext upon user gesture
   */
  initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Generates a 2-second pink noise buffer (1/f) for ambient speech masking
   */
  createPinkNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  /**
   * Generates deep Brownian noise (1/f²) for a velvety, smooth sound blanket
   */
  createBrownNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.4;
    }
    return buffer;
  }

  /**
   * Starts constant, synchronized frequency playback with smooth fade-in
   */
  start() {
    this.initContext();
    if (this.isPlaying) return;

    const now = this.ctx.currentTime;
    const preset = this.configs[this.currentPreset];

    // Master Output with soft logarithmic fade-in
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0001, now);
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.exponentialRampToValueAtTime(0.42, now + 1.8);

    // 1. Primary Constant Harmonic Frequency (Phase-locked in both Left & Right ears)
    // Both channels receive the EXACT same carrier frequency -> ZERO wobble, pure "11111111" tone!
    const merger = this.ctx.createChannelMerger(2);
    const toneGain = this.ctx.createGain();
    toneGain.gain.value = 0.26;

    this.carrierOscLeft = this.ctx.createOscillator();
    this.carrierOscLeft.type = 'sine';
    this.carrierOscLeft.frequency.setValueAtTime(preset.carrier, now);
    this.carrierOscLeft.connect(merger, 0, 0);

    this.carrierOscRight = this.ctx.createOscillator();
    this.carrierOscRight.type = 'sine';
    this.carrierOscRight.frequency.setValueAtTime(preset.carrier, now); // Identical frequency for perfect phase sync
    this.carrierOscRight.connect(merger, 0, 1);

    merger.connect(toneGain);
    toneGain.connect(this.masterGain);

    this.carrierOscLeft.start(now);
    this.carrierOscRight.start(now);

    // 2. Sub-Octave Foundation Drone (carrier / 2, e.g., 216 Hz for 432 Hz)
    this.subDroneOsc = this.ctx.createOscillator();
    this.subDroneOsc.type = 'sine';
    this.subDroneOsc.frequency.setValueAtTime(preset.carrier / 2, now);
    
    const subGain = this.ctx.createGain();
    subGain.gain.value = 0.16;
    this.subDroneOsc.connect(subGain);
    subGain.connect(this.masterGain);
    this.subDroneOsc.start(now);

    // 3. Shimmer Harmonic Sheen (carrier * 2, e.g., 864 Hz)
    this.shimmerOsc = this.ctx.createOscillator();
    this.shimmerOsc.type = 'sine';
    this.shimmerOsc.frequency.setValueAtTime(preset.carrier * 2, now);

    const shimmerGain = this.ctx.createGain();
    shimmerGain.gain.value = 0.045; // Subtle, high-frequency crystal sheen
    this.shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(this.masterGain);
    this.shimmerOsc.start(now);

    // 4. Smooth, Constant Noise Blanket (Brown or Pink depending on active preset)
    const noiseBuffer = preset.noiseType === 'brown' 
      ? this.createBrownNoiseBuffer() 
      : this.createPinkNoiseBuffer();

    if (noiseBuffer) {
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      this.noiseFilter = this.ctx.createBiquadFilter();
      this.noiseFilter.type = 'lowpass';
      this.noiseFilter.frequency.setValueAtTime(preset.noiseFilter || 420, now);

      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.value = preset.noiseType === 'brown' ? 0.13 : 0.07;

      this.noiseNode.connect(this.noiseFilter);
      this.noiseFilter.connect(this.noiseGain);
      this.noiseGain.connect(this.masterGain);
      this.noiseNode.start(now);
    }

    this.isPlaying = true;
  }

  /**
   * Stops playback with gentle fade-out
   */
  stop() {
    if (!this.isPlaying || !this.ctx) return;

    const now = this.ctx.currentTime;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);

      setTimeout(() => {
        try {
          if (this.carrierOscLeft) this.carrierOscLeft.stop();
          if (this.carrierOscRight) this.carrierOscRight.stop();
          if (this.subDroneOsc) this.subDroneOsc.stop();
          if (this.shimmerOsc) this.shimmerOsc.stop();
          if (this.noiseNode) this.noiseNode.stop();
        } catch (e) {
          // already stopped
        }
        this.isPlaying = false;
      }, 1050);
    } else {
      this.isPlaying = false;
    }
  }

  /**
   * Switches the frequency mode smoothly with zero pitch wobbling
   */
  setPreset(presetKey) {
    if (!this.configs[presetKey]) return;
    this.currentPreset = presetKey;
    const config = this.configs[presetKey];

    if (this.isPlaying && this.ctx) {
      const now = this.ctx.currentTime;
      const smoothTime = 0.35;

      // Smooth, phase-coherent frequency glide for both ears
      if (this.carrierOscLeft) {
        this.carrierOscLeft.frequency.setTargetAtTime(config.carrier, now, smoothTime);
      }
      if (this.carrierOscRight) {
        this.carrierOscRight.frequency.setTargetAtTime(config.carrier, now, smoothTime);
      }
      if (this.subDroneOsc) {
        this.subDroneOsc.frequency.setTargetAtTime(config.carrier / 2, now, smoothTime);
      }
      if (this.shimmerOsc) {
        this.shimmerOsc.frequency.setTargetAtTime(config.carrier * 2, now, smoothTime);
      }
      if (this.noiseFilter) {
        this.noiseFilter.frequency.setTargetAtTime(config.noiseFilter || 420, now, 0.4);
      }
    }
  }

  /**
   * Sound effect when a stressful racing thought is dissolved
   */
  playThoughtDissolved() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Deep Sub Drop (physical pressure release)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(130, now);
    subOsc.frequency.exponentialRampToValueAtTime(36, now + 1.8);
    subGain.gain.setValueAtTime(0.32, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.8);

    // Resonant 396Hz release bell chime
    const bellOsc = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(396, now);
    bellGain.gain.setValueAtTime(0.25, now);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
    bellOsc.connect(bellGain);
    bellGain.connect(this.ctx.destination);
    bellOsc.start(now);
    bellOsc.stop(now + 3.0);
  }

  /**
   * Plays a Zen Bowl celebration chime upon completing a deep work session
   */
  playZenBell() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [528, 1056, 1584, 2112];
    const bellMaster = this.ctx.createGain();
    bellMaster.gain.setValueAtTime(0.28, now);
    bellMaster.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);
    bellMaster.connect(this.ctx.destination);

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.2 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.0);
      osc.connect(gain);
      gain.connect(bellMaster);
      osc.start(now);
      osc.stop(now + 4.5);
    });
  }
}

export const audioEngine = new AudioEngine();
