import { ThreeScene } from './threeScene.js';
import { audioEngine } from './audioEngine.js';
import confetti from 'canvas-confetti';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize WebGL 3D Canvas Scene
  const canvas = document.getElementById('webgl-canvas');
  const threeScene = new ThreeScene(canvas);

  // 2. Audio Engine HUD Controls
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioStateText = document.getElementById('audio-state-text');
  const heroSoundBtn = document.getElementById('hero-sound-btn');

  function toggleAudio() {
    if (audioEngine.isPlaying) {
      audioEngine.stop();
      audioToggleBtn.classList.remove('active');
      audioStateText.textContent = 'OFF';
      heroSoundBtn.querySelector('span').textContent = 'Experience 432Hz Calm';
    } else {
      audioEngine.start();
      audioToggleBtn.classList.add('active');
      audioStateText.textContent = 'LIVE';
      heroSoundBtn.querySelector('span').textContent = '432Hz Sound Active (Pause)';
    }
  }

  audioToggleBtn.addEventListener('click', toggleAudio);
  heroSoundBtn.addEventListener('click', toggleAudio);

  // 3. Live 2D Waveform Oscilloscopes for Brainwave Comparison
  const chaosCanvas = document.getElementById('waveform-chaos-canvas');
  const flowCanvas = document.getElementById('waveform-flow-canvas');
  
  function initWaveforms() {
    if (!chaosCanvas || !flowCanvas) return;
    const ctxChaos = chaosCanvas.getContext('2d');
    const ctxFlow = flowCanvas.getContext('2d');

    function resize() {
      chaosCanvas.width = chaosCanvas.offsetWidth * window.devicePixelRatio;
      chaosCanvas.height = chaosCanvas.offsetHeight * window.devicePixelRatio;
      flowCanvas.width = flowCanvas.offsetWidth * window.devicePixelRatio;
      flowCanvas.height = flowCanvas.offsetHeight * window.devicePixelRatio;
    }
    resize();
    window.addEventListener('resize', resize);

    let step = 0;
    function renderWaveforms() {
      step += 0.05;
      const w = chaosCanvas.width;
      const h = chaosCanvas.height;

      // Draw Chaos / High-Beta (Jagged, irregular, anxious spikes)
      ctxChaos.clearRect(0, 0, w, h);
      ctxChaos.beginPath();
      ctxChaos.strokeStyle = '#f43f5e';
      ctxChaos.lineWidth = 2 * window.devicePixelRatio;
      ctxChaos.shadowColor = '#f43f5e';
      ctxChaos.shadowBlur = 10;

      for (let x = 0; x < w; x += 3) {
        const norm = x / w;
        // Superimposed erratic frequencies
        const yVal = Math.sin(norm * 40 + step * 3) * 0.25 +
                     Math.sin(norm * 85 - step * 4) * 0.15 +
                     (Math.random() - 0.5) * 0.25;
        const y = (h / 2) + yVal * (h * 0.7);
        if (x === 0) ctxChaos.moveTo(x, y);
        else ctxChaos.lineTo(x, y);
      }
      ctxChaos.stroke();

      // Draw Coherent / Alpha Flow (Pure harmonic sine resonance)
      ctxFlow.clearRect(0, 0, w, h);
      ctxFlow.beginPath();
      ctxFlow.strokeStyle = '#00f0ff';
      ctxFlow.lineWidth = 2.5 * window.devicePixelRatio;
      ctxFlow.shadowColor = '#00f0ff';
      ctxFlow.shadowBlur = 14;

      for (let x = 0; x < w; x += 2) {
        const norm = x / w;
        const yVal = Math.sin(norm * 14 - step * 1.5) * 0.35;
        const y = (h / 2) + yVal * (h * 0.7);
        if (x === 0) ctxFlow.moveTo(x, y);
        else ctxFlow.lineTo(x, y);
      }
      ctxFlow.stroke();

      requestAnimationFrame(renderWaveforms);
    }
    renderWaveforms();
  }
  initWaveforms();

  // 4. Comparator Slider Controller
  const btnScattered = document.getElementById('btn-mode-scattered');
  const btnCoherent = document.getElementById('btn-mode-coherent');
  const sliderThumb = document.getElementById('spectrum-slider-thumb');
  const sliderTrack = document.getElementById('spectrum-slider-track');
  const cardScattered = document.getElementById('card-scattered');
  const cardCoherent = document.getElementById('card-coherent');

  function setComparatorMode(mode) {
    if (mode === 'scattered') {
      btnScattered.classList.add('active');
      btnCoherent.classList.remove('active');
      sliderThumb.style.left = '10%';
      cardScattered.style.opacity = '1';
      cardCoherent.style.opacity = '0.4';
      threeScene.setChaosFactor(0.75);
      threeScene.setColor('#f43f5e', '#881337');
    } else {
      btnCoherent.classList.add('active');
      btnScattered.classList.remove('active');
      sliderThumb.style.left = '90%';
      cardCoherent.style.opacity = '1';
      cardScattered.style.opacity = '0.4';
      threeScene.setChaosFactor(0.0);
      threeScene.setColor('#ffffff', '#00f0ff');
    }
  }

  btnScattered.addEventListener('click', () => setComparatorMode('scattered'));
  btnCoherent.addEventListener('click', () => setComparatorMode('coherent'));
  sliderTrack.addEventListener('click', (e) => {
    const rect = sliderTrack.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setComparatorMode(ratio < 0.5 ? 'scattered' : 'coherent');
  });

  // 5. Interactive Flow Chamber Sandbox
  const freqButtons = document.querySelectorAll('.freq-preset-btn');
  const activeCarrierVal = document.getElementById('active-carrier-val');
  const activeDiffVal = document.getElementById('active-diff-val');
  const vagalBar = document.getElementById('vagal-bar');
  const vagalText = document.getElementById('vagal-text');
  const entrainmentStatus = document.getElementById('entrainment-status');

  const presetDetails = {
    alpha: {
      carrier: '432.00 Hz',
      diff: 'Phase-Locked Constant Tone (111111)',
      vagal: '88%',
      status: 'Steady Harmonic Clarity (Reading Flow)',
      color: '#ffffff',
      secondaryColor: '#00f0ff'
    },
    theta: {
      carrier: '432.00 Hz',
      diff: 'Deep Octave Constant Tone (111111)',
      vagal: '95%',
      status: 'Constant Deep Meditative Grounding',
      color: '#ffffff',
      secondaryColor: '#a78bfa'
    },
    antirumination: {
      carrier: '396.00 Hz',
      diff: 'Solfeggio Pure Tone (111111)',
      vagal: '97%',
      status: 'Default Mode Network Quieted',
      color: '#ffffff',
      secondaryColor: '#f43f5e'
    },
    solfeggio: {
      carrier: '528.00 Hz',
      diff: 'Miracle Pure Tone (111111)',
      vagal: '92%',
      status: 'Pure Cellular Resonance',
      color: '#ffffff',
      secondaryColor: '#34d399'
    },
    gamma: {
      carrier: '432.00 Hz',
      diff: 'Crystal High Octave (111111)',
      vagal: '81%',
      status: 'Steady High-Throughput Focus',
      color: '#ffffff',
      secondaryColor: '#f59e0b'
    }
  };

  freqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      freqButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const freqKey = btn.getAttribute('data-freq');
      const details = presetDetails[freqKey];
      if (details) {
        activeCarrierVal.textContent = details.carrier;
        activeDiffVal.textContent = details.diff;
        vagalBar.style.width = details.vagal;
        vagalText.textContent = `Optimal (${details.vagal})`;
        entrainmentStatus.textContent = details.status;

        // Sync Audio Engine & 3D WebGL core
        audioEngine.setPreset(freqKey);
        threeScene.setColor(details.color, details.secondaryColor);
      }
    });
  });

  // 6. Box-Breathing (4-4-4-4) & 5-Minute Sprint Timer
  const timerToggleBtn = document.getElementById('timer-toggle-btn');
  const timerBtnText = document.getElementById('timer-btn-text');
  const timerResetBtn = document.getElementById('timer-reset-btn');
  const chamberTimerDisplay = document.getElementById('chamber-timer');
  const breathingRing = document.getElementById('breathing-ring');
  const breathingPhaseText = document.getElementById('breathing-phase-text');
  const breathingCount = document.getElementById('breathing-count');

  let timerRunning = false;
  let totalSeconds = 300; // 5 minutes
  let timerInterval = null;
  let breathingInterval = null;

  // 4-phase box breathing cycle (4 seconds each)
  const breathingPhases = [
    { name: 'INHALE (NOSE)', scale: 1.25, time: 4 },
    { name: 'HOLD (RETAIN)', scale: 1.25, time: 4 },
    { name: 'EXHALE (MOUTH)', scale: 0.85, time: 4 },
    { name: 'HOLD (EMPTY)', scale: 0.85, time: 4 }
  ];
  let currentPhaseIndex = 0;
  let phaseSecondsRemaining = 4;

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateBreathingGuide() {
    const phase = breathingPhases[currentPhaseIndex];
    breathingPhaseText.textContent = phase.name;
    breathingCount.textContent = `${phaseSecondsRemaining}s`;

    if (phaseSecondsRemaining === phase.time) {
      // Phase transition: trigger 3D scale and CSS ring transform
      breathingRing.style.transform = `scale(${phase.scale})`;
      threeScene.setBreathingScale(phase.scale);
    }

    phaseSecondsRemaining--;
    if (phaseSecondsRemaining < 0) {
      currentPhaseIndex = (currentPhaseIndex + 1) % breathingPhases.length;
      phaseSecondsRemaining = breathingPhases[currentPhaseIndex].time;
    }
  }

  function startSprint() {
    timerRunning = true;
    timerBtnText.textContent = 'Pause Flow Sprint';
    timerToggleBtn.classList.remove('btn-primary');
    timerToggleBtn.classList.add('btn-glass');

    // Auto-start ambient audio if not already playing
    if (!audioEngine.isPlaying) {
      toggleAudio();
    }

    // Sprint countdown timer
    timerInterval = setInterval(() => {
      totalSeconds--;
      chamberTimerDisplay.textContent = formatTime(totalSeconds);

      if (totalSeconds <= 0) {
        completeSprint();
      }
    }, 1000);

    // Box breathing cycle ticker
    updateBreathingGuide();
    breathingInterval = setInterval(updateBreathingGuide, 1000);
  }

  function pauseSprint() {
    timerRunning = false;
    timerBtnText.textContent = 'Resume Flow Sprint';
    timerToggleBtn.classList.add('btn-primary');
    timerToggleBtn.classList.remove('btn-glass');
    clearInterval(timerInterval);
    clearInterval(breathingInterval);
  }

  function resetSprint() {
    pauseSprint();
    totalSeconds = 300;
    chamberTimerDisplay.textContent = '05:00';
    timerBtnText.textContent = 'Start 5-Min Flow Sprint';
    currentPhaseIndex = 0;
    phaseSecondsRemaining = 4;
    breathingPhaseText.textContent = 'PREPARE';
    breathingCount.textContent = '4s';
    breathingRing.style.transform = 'scale(1)';
    threeScene.setBreathingScale(1.0);
  }

  function completeSprint() {
    pauseSprint();
    chamberTimerDisplay.textContent = 'FLOW ZENITH';
    breathingPhaseText.textContent = 'CYCLE COMPLETE';
    breathingCount.textContent = '🎉';
    audioEngine.playZenBell();

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#8b5cf6', '#34d399', '#ffffff']
    });
  }

  timerToggleBtn.addEventListener('click', () => {
    if (timerRunning) pauseSprint();
    else startSprint();
  });

  timerResetBtn.addEventListener('click', resetSprint);

  // 7. Interactive 3D Card Hover Tilt Effect
  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  // 8. Ocular Focus Laboratory (Visual Attention & Smooth Pursuit Trainer)
  function initOcularLab() {
    const ocularCanvas = document.getElementById('ocular-canvas');
    if (!ocularCanvas) return;

    const ctx = ocularCanvas.getContext('2d');
    const ocularVignette = document.getElementById('ocular-vignette');
    const ocularActionBtn = document.getElementById('ocular-action-btn');
    const ocularBtnText = document.getElementById('ocular-btn-text');
    const ocularResetBtn = document.getElementById('ocular-reset-btn');
    const coherenceNum = document.getElementById('coherence-num');
    const coherenceFill = document.getElementById('coherence-fill');
    const ocularHudMsg = document.getElementById('ocular-hud-msg');
    const saccadeSpeedText = document.getElementById('saccade-speed-text');
    const neuroReadinessText = document.getElementById('neuro-readiness-text');
    const protocolText = document.getElementById('ocular-protocol-text');

    const tabFocal = document.getElementById('tab-mode-focal');
    const tabPursuit = document.getElementById('tab-mode-pursuit');
    const tabPanoramic = document.getElementById('tab-mode-panoramic');
    const ocularTabs = [tabFocal, tabPursuit, tabPanoramic];

    let currentOcularMode = 'focal'; // 'focal' | 'pursuit' | 'panoramic'
    let isTracking = false;
    let trackingSeconds = 0;
    let trackingTimer = null;

    function resizeCanvas() {
      ocularCanvas.width = ocularCanvas.offsetWidth * window.devicePixelRatio;
      ocularCanvas.height = ocularCanvas.offsetHeight * window.devicePixelRatio;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Tab switcher
    ocularTabs.forEach(tab => {
      if (!tab) return;
      tab.addEventListener('click', () => {
        ocularTabs.forEach(t => t && t.classList.remove('active'));
        tab.classList.add('active');
        currentOcularMode = tab.getAttribute('data-mode');

        if (currentOcularMode === 'focal') {
          protocolText.textContent = '30s Gaze Lock (Huberman Protocol)';
          ocularHudMsg.textContent = 'LOCK GAZE ON THE PULSING ANCHOR';
          saccadeSpeedText.textContent = '0.08 rad/s (Fixated)';
        } else if (currentOcularMode === 'pursuit') {
          protocolText.textContent = 'Bilateral Smooth Pursuit (EMDR)';
          ocularHudMsg.textContent = 'TRACK THE MOVING DOT WITHOUT MOVING HEAD';
          saccadeSpeedText.textContent = '1.45 rad/s (Smooth Tracking)';
        } else {
          protocolText.textContent = 'Panoramic Peripheral Expansion';
          ocularHudMsg.textContent = 'SOFTEN FOCUS TO ENTIRE HORIZONTAL FIELD';
          saccadeSpeedText.textContent = '0.00 rad/s (Wide Field)';
        }
      });
    });

    // 60 FPS Ocular Canvas Animation Loop
    let t = 0;
    function renderOcular() {
      t += 0.025;
      const w = ocularCanvas.width;
      const h = ocularCanvas.height;
      const dpr = window.devicePixelRatio || 1;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Subtle reticle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(w, cy);
      ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
      ctx.stroke();

      if (currentOcularMode === 'focal') {
        // Rotating concentric reticle circles
        const rings = [40, 80, 130];
        rings.forEach((r, idx) => {
          ctx.beginPath();
          ctx.arc(cx, cy, r * dpr, 0, Math.PI * 2);
          ctx.strokeStyle = idx === 0 ? 'rgba(0, 240, 255, 0.4)' : 'rgba(0, 240, 255, 0.12)';
          ctx.lineWidth = (1 + idx * 0.5) * dpr;
          ctx.setLineDash([8 * dpr, 12 * dpr]);
          ctx.stroke();
          ctx.setLineDash([]);
        });

        // Pulsating Center Focal Anchor
        const pulse = 1.0 + Math.sin(t * 3.0) * 0.25;
        const radius = (8 + (isTracking ? pulse * 3 : 0)) * dpr;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2.5);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, '#00f0ff');
        grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 4 * dpr, 0, Math.PI * 2);
        ctx.fill();

      } else if (currentOcularMode === 'pursuit') {
        // Smooth bilateral horizontal / Lissajous path
        const pathX = cx + Math.sin(t * 1.4) * (w * 0.38);
        const pathY = cy + Math.sin(t * 2.8) * (h * 0.18);

        // Faint trace path
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.15)';
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        for (let i = 0; i < Math.PI * 2; i += 0.1) {
          const px = cx + Math.sin(i) * (w * 0.38);
          const py = cy + Math.sin(i * 2.0) * (h * 0.18);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Glowing Tracking Dot
        const grad = ctx.createRadialGradient(pathX, pathY, 0, pathX, pathY, 22 * dpr);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#a78bfa');
        grad.addColorStop(1, 'rgba(167, 139, 250, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pathX, pathY, 22 * dpr, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pathX, pathY, 5 * dpr, 0, Math.PI * 2);
        ctx.fill();

      } else if (currentOcularMode === 'panoramic') {
        // Expanding panoramic horizon beam (relaxes ciliary eye muscles)
        const beamWidth = (w * 0.6) + Math.sin(t * 2.0) * (w * 0.15);
        const beamGrad = ctx.createLinearGradient(cx - beamWidth / 2, cy, cx + beamWidth / 2, cy);
        beamGrad.addColorStop(0, 'rgba(52, 211, 153, 0)');
        beamGrad.addColorStop(0.5, 'rgba(52, 211, 153, 0.7)');
        beamGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');

        ctx.fillStyle = beamGrad;
        ctx.fillRect(cx - beamWidth / 2, cy - 3 * dpr, beamWidth, 6 * dpr);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 6 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(renderOcular);
    }
    renderOcular();

    function startCalibration() {
      isTracking = true;
      ocularBtnText.textContent = 'Calibrating Focus... Hold Gaze';
      ocularActionBtn.classList.remove('btn-primary');
      ocularActionBtn.classList.add('btn-glass');
      ocularVignette.classList.add('tunnel-focus');

      neuroReadinessText.textContent = 'Acetylcholine Synthesizing (0-30s)';

      trackingTimer = setInterval(() => {
        trackingSeconds++;
        const pct = Math.min(Math.round((trackingSeconds / 30) * 100), 100);
        coherenceNum.textContent = `${pct}%`;
        coherenceFill.style.width = `${pct}%`;

        if (trackingSeconds >= 30) {
          completeCalibration();
        }
      }, 1000);
    }

    function completeCalibration() {
      clearInterval(trackingTimer);
      isTracking = false;
      ocularBtnText.textContent = 'Visual Anchor Locked (30s Complete)';
      neuroReadinessText.textContent = '✨ Peak Tunnel Focus Achieved! Prefrontal Cortex Primed';
      audioEngine.playZenBell();

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#00f0ff', '#38bdf8', '#34d399']
      });
    }

    function resetCalibration() {
      clearInterval(trackingTimer);
      isTracking = false;
      trackingSeconds = 0;
      coherenceNum.textContent = '0%';
      coherenceFill.style.width = '0%';
      ocularBtnText.textContent = 'Initiate 30s Focus Lock';
      ocularActionBtn.classList.add('btn-primary');
      ocularActionBtn.classList.remove('btn-glass');
      ocularVignette.classList.remove('tunnel-focus');
      neuroReadinessText.textContent = 'Awaiting Calibration';
    }

    ocularActionBtn.addEventListener('click', () => {
      if (isTracking) resetCalibration();
      else startCalibration();
    });

    ocularResetBtn.addEventListener('click', resetCalibration);
  }
  initOcularLab();

  // 9. Overthinking Dissolver (Cognitive Defusion Terminal)
  function initOverthinkingDissolver() {
    const thoughtInput = document.getElementById('thought-input');
    const dissolveBtn = document.getElementById('dissolve-btn');
    const thoughtInputContainer = document.getElementById('thought-input-container');
    const thoughtDissolvedCard = document.getElementById('thought-dissolved-card');
    const dissolveAnotherBtn = document.getElementById('dissolve-another-btn');
    const thoughtChips = document.querySelectorAll('.thought-chip');

    if (!dissolveBtn || !thoughtInput) return;

    thoughtChips.forEach(chip => {
      chip.addEventListener('click', () => {
        thoughtInput.value = chip.getAttribute('data-text');
        thoughtInput.focus();
      });
    });

    dissolveBtn.addEventListener('click', () => {
      const text = thoughtInput.value.trim();
      if (!text) {
        thoughtInput.placeholder = 'Please type a racing thought to vaporize...';
        thoughtInput.focus();
        return;
      }

      // Play cognitive release audio (sub drop + 396Hz release chime)
      audioEngine.playThoughtDissolved();

      // Trigger ember particle disintegration effect
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.7 },
        colors: ['#f43f5e', '#fb7185', '#ffffff', '#a855f7']
      });

      // Shift Portal Field into soothing 396Hz release mode temporarily
      threeScene.setColor('#ffffff', '#f43f5e');
      threeScene.setChaosFactor(0.2);

      // Transition terminal UI
      thoughtInputContainer.style.display = 'none';
      thoughtDissolvedCard.style.display = 'block';

      setTimeout(() => {
        threeScene.setChaosFactor(0.0);
      }, 1500);
    });

    dissolveAnotherBtn.addEventListener('click', () => {
      thoughtInput.value = '';
      thoughtDissolvedCard.style.display = 'none';
      thoughtInputContainer.style.display = 'block';
      thoughtInput.focus();
    });
  }
  initOverthinkingDissolver();

  // 10. Early Access Form Submission & Celebration
  const earlyAccessForm = document.getElementById('early-access-form');
  const formFeedback = document.getElementById('form-feedback');

  if (earlyAccessForm) {
    earlyAccessForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('student-email');
      const email = emailInput.value.trim();

      if (!email || !email.includes('@')) {
        formFeedback.className = 'form-feedback error';
        formFeedback.textContent = 'Please provide a valid student or personal email.';
        return;
      }

      formFeedback.className = 'form-feedback success';
      formFeedback.innerHTML = `✨ Synchronized! Welcome aboard <strong>${email}</strong>. Check your inbox for the Beta 2.4 download key.`;
      emailInput.value = '';

      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#00f0ff', '#38bdf8', '#a78bfa']
      });
      audioEngine.playZenBell();
    });
  }

  // 11. Smooth Section Reveal Stagger Animations with GSAP
  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out'
    });
  });
});

