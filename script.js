/* ==========================================================================
   Birthday Greeting - Custom Interactive Logic
   - Falling Petals Physics (Roses, Lilies, Violets)
   - Soothing Web Audio Harmonic Synthesizer
   - URL Query Parameter Parsing for Sharing (?to=Name or ?name=Name)
   - Dynamic Link Generator and Clipboard Sharing
   - Wax Seal Celebration Bloom
   ========================================================================== */

(function () {
  'use strict';

  // --- 1. Query Parameter & Personalization Handling ---
  const urlParams = new URLSearchParams(window.location.search);
  const nameParam = urlParams.get('to') || urlParams.get('name') || urlParams.get('for');
  const recipientNameEl = document.getElementById('recipient-name-text');
  const shareBtn = document.getElementById('btn-share-link');
  const toastEl = document.getElementById('toast');

  if (nameParam && recipientNameEl) {
    recipientNameEl.textContent = decodeURIComponent(nameParam.trim());
  }

  // Toast Helper
  function showToast(message, duration = 3200) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, duration);
  }

  // --- 2. Shareable Link Generator ---
  function getShareableUrl() {
    const currentName = recipientNameEl ? recipientNameEl.textContent.trim() : '';
    const baseUrl = window.location.origin + window.location.pathname;
    if (currentName && currentName !== 'An Exceptional Friend') {
      return `${baseUrl}?to=${encodeURIComponent(currentName)}`;
    }
    return baseUrl;
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareUrl = getShareableUrl();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          showToast('🔗 Link copied to clipboard! Ready to share.');
        } catch (err) {
          promptCopyFallback(shareUrl);
        }
      } else {
        promptCopyFallback(shareUrl);
      }
    });
  }

  function promptCopyFallback(url) {
    window.prompt('Copy your personalized shareable link:', url);
  }

  // Allow clicking badge to focus and edit name
  const badgeEl = document.getElementById('name-display');
  if (badgeEl && recipientNameEl) {
    badgeEl.addEventListener('click', (e) => {
      if (e.target !== recipientNameEl) {
        recipientNameEl.focus();
      }
    });
    recipientNameEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        recipientNameEl.blur();
        showToast(`Personalized for ${recipientNameEl.textContent.trim()}! Click "Share Link" to copy.`);
      }
    });
  }

  // --- 3. Falling Petals Physics Canvas ---
  const canvas = document.getElementById('petals-canvas');
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Petal Types:
  // 0: White Rose Petal
  // 1: Violet Petal
  // 2: Variegated Lily Petal (Violet & White)
  // 3: Golden Shimmer Particle
  const PETAL_TYPES = ['rose', 'violet', 'bicolor', 'gold'];

  class Petal {
    constructor(x, y, isBurst = false) {
      this.reset(x, y, isBurst);
    }

    reset(x, y, isBurst = false) {
      this.x = x !== undefined ? x : Math.random() * width;
      this.y = y !== undefined ? y : (isBurst ? height * 0.5 : -20 - Math.random() * 50);
      this.size = 10 + Math.random() * 14;
      this.type = PETAL_TYPES[Math.floor(Math.random() * PETAL_TYPES.length)];

      if (isBurst) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 7;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 2;
      } else {
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = 1 + Math.random() * 2;
      }

      this.rotation = Math.random() * 360;
      this.vRot = (Math.random() - 0.5) * 2;
      this.swing = Math.random() * Math.PI * 2;
      this.swingSpeed = 0.02 + Math.random() * 0.03;
      this.opacity = 0.7 + Math.random() * 0.3;
      this.alphaDecay = isBurst ? 0.006 + Math.random() * 0.008 : 0;
    }

    update() {
      this.swing += this.swingSpeed;
      this.x += this.vx + Math.sin(this.swing) * 0.8;
      this.y += this.vy;
      this.rotation += this.vRot;

      if (this.alphaDecay > 0) {
        this.opacity -= this.alphaDecay;
      }

      // Wrap around or remove
      if (this.opacity <= 0 || this.y > height + 30 || this.x < -50 || this.x > width + 50) {
        if (this.alphaDecay > 0) {
          // Remove burst particle by recycling to inactive
          this.opacity = 0;
        } else {
          this.reset();
        }
      }
    }

    draw(ctx) {
      if (this.opacity <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, this.opacity);

      if (this.type === 'rose') {
        // Pure White Rose Petal
        const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, this.size);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.7, '#F7F5F0');
        grad.addColorStop(1, '#E6DFD3');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.6, this.size, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'violet') {
        // Vibrant Violet Petal
        const grad = ctx.createLinearGradient(0, -this.size, 0, this.size);
        grad.addColorStop(0, '#A855F7');
        grad.addColorStop(0.6, '#7E22CE');
        grad.addColorStop(1, '#581C87');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.5, this.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'bicolor') {
        // Violet & White Mixed Lily Petal
        const grad = ctx.createLinearGradient(0, -this.size, 0, this.size);
        grad.addColorStop(0, '#9333EA'); // Violet edge
        grad.addColorStop(0.4, '#C084FC');
        grad.addColorStop(0.7, '#FFFFFF'); // White core
        grad.addColorStop(1, '#F0FDF4');
        ctx.fillStyle = grad;
        ctx.beginPath();
        // Pointed lily petal contour
        ctx.moveTo(0, -this.size * 1.1);
        ctx.bezierCurveTo(this.size * 0.6, -this.size * 0.5, this.size * 0.5, this.size * 0.5, 0, this.size * 0.9);
        ctx.bezierCurveTo(-this.size * 0.5, this.size * 0.5, -this.size * 0.6, -this.size * 0.5, 0, -this.size * 1.1);
        ctx.fill();
      } else {
        // Golden Fairy Shimmer
        ctx.fillStyle = '#FEF08A';
        ctx.shadowColor = '#FACC15';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(1.5, this.size * 0.18), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Create initial petals pool
  const PETAL_COUNT = 38;
  const petals = [];
  for (let i = 0; i < PETAL_COUNT; i++) {
    petals.push(new Petal(Math.random() * width, Math.random() * height));
  }

  function triggerBurst(x, y, count = 28) {
    for (let i = 0; i < count; i++) {
      petals.push(new Petal(x, y, true));
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.update();
      p.draw(ctx);
      if (p.alphaDecay > 0 && p.opacity <= 0) {
        petals.splice(i, 1);
      }
    }
    requestAnimationFrame(animate);
  }
  animate();

  // Celebrate Button
  const btnPetals = document.getElementById('btn-petals');
  if (btnPetals) {
    btnPetals.addEventListener('click', (e) => {
      const rect = btnPetals.getBoundingClientRect();
      triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);
      showToast('🌸 Flowers of joy released in celebration!');
    });
  }

  // Wax Seal Tap Bloom
  const sealBtn = document.getElementById('seal-button');
  if (sealBtn) {
    sealBtn.addEventListener('click', (e) => {
      const rect = sealBtn.getBoundingClientRect();
      triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);
      showToast('✦ Wishing you enduring strength, joy, and peace!');
    });
  }

  // Print Action
  const btnPrint = document.getElementById('btn-print');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // --- 4. Peaceful Ambient Music Synthesizer (Web Audio API) ---
  // Completely self-contained: no external mp3 files required!
  let audioCtx = null;
  let isPlaying = false;
  let musicTimer = null;
  const btnMusic = document.getElementById('btn-music');
  const musicIcon = document.getElementById('music-icon');
  const musicText = document.getElementById('music-text');

  // Pentatonic serene scale frequencies (C major / A minor pentatonic: C, D, E, G, A)
  const notes = [
    261.63, 293.66, 329.63, 392.00, 440.00,
    523.25, 587.33, 659.25, 783.99, 880.00
  ];

  function playTone(freq, duration = 2.4, gainLevel = 0.08) {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      // Warm sound: sine wave mixed with gentle harmonics
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(gainLevel, audioCtx.currentTime + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  function scheduleNextNote() {
    if (!isPlaying) return;
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    playTone(randomNote, 2.5 + Math.random() * 1.5, 0.05);

    // Occasional gentle chord
    if (Math.random() > 0.6) {
      const harmonyNote = notes[Math.floor(Math.random() * notes.length)];
      setTimeout(() => {
        if (isPlaying) playTone(harmonyNote, 3.0, 0.035);
      }, 250);
    }

    const nextInterval = 900 + Math.random() * 1200;
    musicTimer = setTimeout(scheduleNextNote, nextInterval);
  }

  function toggleMusic() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isPlaying = !isPlaying;

    if (isPlaying) {
      btnMusic.classList.add('active');
      musicIcon.textContent = '🔊';
      musicText.textContent = 'Pause Music';
      scheduleNextNote();
      showToast('🎶 Playing peaceful ambient melody');
    } else {
      btnMusic.classList.remove('active');
      musicIcon.textContent = '🎵';
      musicText.textContent = 'Play Melody';
      clearTimeout(musicTimer);
    }
  }

  if (btnMusic) {
    btnMusic.addEventListener('click', toggleMusic);
  }

})();
