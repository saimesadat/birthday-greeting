/* ==========================================================================
   Birthday Greeting - Meadow Walk Simulation
   - Parallax Flower Meadow (White Roses, Lilies, Bicolor Lilies, Violets)
   - Procedural Kinematic Walking Character with Flowing Fabric Physics
   - Interactive Ground Navigation (Tap to Walk, Arrow Keys, Auto-Stroll)
   - Ambient Harmonic Music Synthesizer & Floating Petals
   - Card Modal & Personalization URL Sharing
   ========================================================================== */

(function () {
  'use strict';

  // --- 1. Query Parameters & Personalization ---
  const urlParams = new URLSearchParams(window.location.search);
  const nameParam = urlParams.get('to') || urlParams.get('name') || urlParams.get('for');
  const recipientNameEl = document.getElementById('recipient-name-text');
  const toastEl = document.getElementById('toast');

  if (nameParam && recipientNameEl) {
    recipientNameEl.textContent = decodeURIComponent(nameParam.trim());
  }

  function showToast(message, duration = 3200) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, duration);
  }

  function getShareableUrl() {
    const currentName = recipientNameEl ? recipientNameEl.textContent.trim() : '';
    const baseUrl = window.location.origin + window.location.pathname;
    if (currentName && currentName !== 'An Exceptional Friend') {
      return `${baseUrl}?to=${encodeURIComponent(currentName)}`;
    }
    return baseUrl;
  }

  async function copyShareLink() {
    const shareUrl = getShareableUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('🔗 Personalized link copied to clipboard!');
      } catch (err) {
        window.prompt('Copy your personalized shareable link:', shareUrl);
      }
    } else {
      window.prompt('Copy your personalized shareable link:', shareUrl);
    }
  }

  const btnShare = document.getElementById('btn-share-link');
  if (btnShare) btnShare.addEventListener('click', copyShareLink);
  const btnCardShare = document.getElementById('btn-card-share');
  if (btnCardShare) btnCardShare.addEventListener('click', copyShareLink);

  // Editable recipient name badge
  const badgeEl = document.getElementById('name-display');
  if (badgeEl && recipientNameEl) {
    badgeEl.addEventListener('click', (e) => {
      if (e.target !== recipientNameEl) recipientNameEl.focus();
    });
    recipientNameEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        recipientNameEl.blur();
        showToast(`Personalized for ${recipientNameEl.textContent.trim()}! Ready to share.`);
      }
    });
  }

  // --- 2. Card Modal Controls ---
  const cardModal = document.getElementById('card-modal');
  const btnToggleCard = document.getElementById('btn-toggle-card');
  const btnCloseCard = document.getElementById('btn-close-card');
  const btnHudCard = document.getElementById('btn-hud-card');
  const btnResumeWalk = document.getElementById('btn-resume-walk');
  const cardToggleText = document.getElementById('card-toggle-text');

  function openCard() {
    if (cardModal) cardModal.classList.add('open');
    if (cardToggleText) cardToggleText.textContent = 'Close Card';
  }

  function closeCard() {
    if (cardModal) cardModal.classList.remove('open');
    if (cardToggleText) cardToggleText.textContent = 'Read Birthday Card';
  }

  if (btnToggleCard) {
    btnToggleCard.addEventListener('click', () => {
      if (cardModal.classList.contains('open')) closeCard();
      else openCard();
    });
  }
  if (btnCloseCard) btnCloseCard.addEventListener('click', closeCard);
  if (btnHudCard) btnHudCard.addEventListener('click', openCard);
  if (btnResumeWalk) btnResumeWalk.addEventListener('click', closeCard);

  // --- 3. Canvas Meadow & Character Simulation ---
  const canvas = document.getElementById('meadow-canvas');
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Load Meadow Background Image
  const meadowBg = new Image();
  meadowBg.src = 'meadow-background.jpg';
  let meadowLoaded = false;
  meadowBg.onload = () => {
    meadowLoaded = true;
  };

  // World Simulation State
  let cameraX = 0;
  let autoStroll = true;
  let moveDirection = 1; // 1 = right, -1 = left, 0 = still
  let targetWorldX = null;
  const WALK_SPEED = 2.2;
  let currentSpeed = 0;
  let walkPhase = 0;
  let facingRight = 1; // 1 or -1
  let windTime = 0;

  // Character World Position (ground plane is around 75% height)
  const char = {
    worldX: 0,
    y: 0,
    scale: 0.95,
  };

  // Particles (Petals & Fireflies)
  const particles = [];
  const MAX_PARTICLES = 50;

  class MeadowParticle {
    constructor(worldX, isFootstep = false) {
      this.reset(worldX, isFootstep);
    }

    reset(worldX, isFootstep = false) {
      this.isFootstep = isFootstep;
      if (isFootstep) {
        this.worldX = worldX + (Math.random() - 0.5) * 20;
        this.y = char.y - 10 + Math.random() * 15;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = -1.5 - Math.random() * 2.5;
        this.opacity = 1;
        this.decay = 0.015 + Math.random() * 0.015;
      } else {
        this.worldX = (worldX !== undefined ? worldX : cameraX) + (Math.random() - 0.5) * width * 1.5;
        this.y = Math.random() * height * 0.85;
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = 0.8 + Math.random() * 1.4;
        this.opacity = 0.5 + Math.random() * 0.5;
        this.decay = 0;
      }
      this.size = 5 + Math.random() * 8;
      this.rotation = Math.random() * 360;
      this.vRot = (Math.random() - 0.5) * 3;
      // 0 = White Rose Petal, 1 = Violet Petal, 2 = Variegated Lily, 3 = Golden Pollen
      this.type = Math.floor(Math.random() * 4);
    }

    update() {
      this.worldX += this.vx + Math.sin(windTime + this.y * 0.01) * 0.8;
      this.y += this.vy;
      this.rotation += this.vRot;

      if (this.decay > 0) {
        this.opacity -= this.decay;
      }

      if (this.y > height + 20 || this.opacity <= 0) {
        if (!this.isFootstep) this.reset(cameraX + (Math.random() - 0.5) * width);
      }
    }

    draw(ctx) {
      if (this.opacity <= 0) return;
      const screenX = this.worldX - cameraX + width * 0.5;
      if (screenX < -50 || screenX > width + 50) return;

      ctx.save();
      ctx.translate(screenX, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, this.opacity);

      if (this.type === 0) {
        // Pure White Rose Petal
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.6, this.size, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 1) {
        // Violet Petal
        ctx.fillStyle = '#9333EA';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.5, this.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 2) {
        // Variegated Lily Petal
        const grad = ctx.createLinearGradient(0, -this.size, 0, this.size);
        grad.addColorStop(0, '#A855F7');
        grad.addColorStop(0.6, '#FFFFFF');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.bezierCurveTo(this.size * 0.6, 0, this.size * 0.4, this.size * 0.6, 0, this.size);
        ctx.bezierCurveTo(-this.size * 0.4, this.size * 0.6, -this.size * 0.6, 0, 0, -this.size);
        ctx.fill();
      } else {
        // Golden Pollen Firefly
        ctx.fillStyle = '#FEF08A';
        ctx.shadowColor = '#FACC15';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(1.5, this.size * 0.2), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  for (let i = 0; i < MAX_PARTICLES; i++) {
    particles.push(new MeadowParticle(cameraX));
  }

  function triggerPetalBurst(count = 25) {
    for (let i = 0; i < count; i++) {
      particles.push(new MeadowParticle(char.worldX, true));
    }
  }

  // Procedural Foreground Flowers in Meadow
  // (White Roses, Lilies, Bicolor Lilies, and Carpets of Violets)
  const meadowFlowers = [];
  const FLOWER_SPAN = 4000;
  for (let fx = -FLOWER_SPAN; fx <= FLOWER_SPAN; fx += 35 + Math.random() * 45) {
    meadowFlowers.push({
      x: fx,
      yOffset: Math.sin(fx * 0.02) * 15 + Math.random() * 40,
      type: Math.floor(Math.random() * 4), // 0: violet, 1: white rose, 2: white lily, 3: bicolor lily
      scale: 0.6 + Math.random() * 0.5,
      swayOffset: Math.random() * Math.PI * 2,
    });
  }

  // --- 4. Kinematic Walking Character Drawing ---
  function drawWalkingCharacter(ctx, screenX, groundY, phase, facing, speed) {
    ctx.save();
    ctx.translate(screenX, groundY);
    ctx.scale(facing * char.scale, char.scale);

    const isMoving = Math.abs(speed) > 0.1;
    const p = isMoving ? phase : 0;

    // Torso bounce
    const bounce = Math.abs(Math.sin(p * 2)) * 5;
    const tilt = isMoving ? 0.08 : 0;

    // Hips
    const hipY = -95 + bounce;

    // Leg Kinematics (Left & Right)
    const legLength1 = 38;
    const legLength2 = 38;
    const legSwing = Math.sin(p) * 0.65;

    // Draw Back Leg
    drawLeg(ctx, -6, hipY, -legSwing, legLength1, legLength2, '#2D1B4E', '#1F1235');

    // Flowing Dress / Skirt Back Layer
    ctx.save();
    ctx.translate(0, hipY + 10);
    ctx.rotate(tilt);
    const skirtWave = Math.sin(p + windTime * 2) * 12;
    ctx.fillStyle = 'rgba(126, 34, 206, 0.4)';
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.bezierCurveTo(-25, 30, -35 - skirtWave, 60, -25 - skirtWave, 75);
    ctx.lineTo(20, 75);
    ctx.bezierCurveTo(15, 50, 10, 25, 12, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Draw Front Leg
    drawLeg(ctx, 4, hipY, legSwing, legLength1, legLength2, '#3E2468', '#2D1B4E');

    // Flowing Dress Front Layer
    ctx.save();
    ctx.translate(0, hipY + 8);
    ctx.rotate(tilt);
    const frontSkirtWave = Math.sin(p * 1.5 + windTime * 2) * 10;
    const dressGrad = ctx.createLinearGradient(-15, 0, 15, 75);
    dressGrad.addColorStop(0, '#FFFFFF');
    dressGrad.addColorStop(0.5, '#E9D5FF');
    dressGrad.addColorStop(1, '#A855F7');
    ctx.fillStyle = dressGrad;
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.bezierCurveTo(-22, 28, -28 - frontSkirtWave, 55, -20 - frontSkirtWave, 72);
    ctx.bezierCurveTo(0, 75, 12, 74, 18, 70);
    ctx.bezierCurveTo(15, 45, 12, 20, 10, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Torso / Bodice
    ctx.save();
    ctx.translate(0, hipY);
    ctx.rotate(tilt);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-7, -42);
    ctx.lineTo(8, -42);
    ctx.lineTo(9, 0);
    ctx.closePath();
    ctx.fill();

    // Violet Sash
    ctx.fillStyle = '#7E22CE';
    ctx.fillRect(-10, -5, 19, 8);

    // Flowing Back Hair
    const hairSway = Math.sin(p + windTime * 3) * 14;
    ctx.fillStyle = '#3E1C5E';
    ctx.beginPath();
    ctx.moveTo(-5, -45);
    ctx.bezierCurveTo(-20, -35, -30 - hairSway, -15, -22 - hairSway, 10);
    ctx.bezierCurveTo(-15, -10, -8, -25, -2, -35);
    ctx.closePath();
    ctx.fill();

    // Head
    const headY = -54;
    ctx.fillStyle = '#FDF2E9';
    ctx.beginPath();
    ctx.arc(0, headY, 11, 0, Math.PI * 2);
    ctx.fill();

    // Flower Crown in Hair (White Lily & Violet Blossom)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(4, headY - 8, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#A855F7';
    ctx.beginPath();
    ctx.arc(-2, headY - 9, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(-2, headY - 9, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Arm (Gentle Stride Swing)
    const armSwing = -legSwing * 0.7;
    ctx.save();
    ctx.translate(2, -38);
    ctx.rotate(armSwing + 0.1);
    ctx.strokeStyle = '#FDF2E9';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 24);
    ctx.lineTo(6, 40);
    ctx.stroke();

    // Flower held gently in hand
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(7, 42, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#A855F7';
    ctx.beginPath();
    ctx.arc(7, 42, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
    ctx.restore();
  }

  function drawLeg(ctx, hipX, hipY, angle, l1, l2, colorThigh, colorCalf) {
    ctx.save();
    ctx.translate(hipX, hipY);
    ctx.rotate(angle);

    // Thigh
    ctx.strokeStyle = colorThigh;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, l1);
    ctx.stroke();

    // Knee joint & Calf
    ctx.translate(0, l1);
    const kneeBend = Math.max(0, -angle * 0.9);
    ctx.rotate(kneeBend);
    ctx.strokeStyle = colorCalf;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, l2);
    // Foot
    ctx.lineTo(6, l2 + 3);
    ctx.stroke();

    ctx.restore();
  }

  // --- 5. Draw Meadow Flora on Canvas ---
  function drawMeadowFlower(ctx, screenX, screenY, flower) {
    if (screenX < -60 || screenX > width + 60) return;

    ctx.save();
    ctx.translate(screenX, screenY);
    const sway = Math.sin(windTime * 2 + flower.swayOffset) * 0.08;
    ctx.rotate(sway);
    ctx.scale(flower.scale, flower.scale);

    // Stem
    ctx.strokeStyle = '#3F6212';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 25);
    ctx.quadraticCurveTo(5, 10, 0, 0);
    ctx.stroke();

    if (flower.type === 0) {
      // Violet Flower (Clusters)
      ctx.fillStyle = '#7E22CE';
      for (let a = 0; a < 5; a++) {
        const ang = (a * (Math.PI * 2)) / 5;
        ctx.beginPath();
        ctx.ellipse(Math.cos(ang) * 9, Math.sin(ang) * 9, 6, 8, ang, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (flower.type === 1) {
      // Pure White Rose
      const roseGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
      roseGrad.addColorStop(0, '#FFFFFF');
      roseGrad.addColorStop(0.7, '#F7F5F0');
      roseGrad.addColorStop(1, '#E2DDD5');
      ctx.fillStyle = roseGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFDF7';
      ctx.beginPath();
      ctx.arc(-2, -2, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (flower.type === 2) {
      // Pure White Lily
      ctx.fillStyle = '#FFFFFF';
      for (let a = 0; a < 6; a++) {
        const ang = (a * (Math.PI * 2)) / 6;
        ctx.beginPath();
        ctx.ellipse(Math.cos(ang) * 14, Math.sin(ang) * 14, 5, 14, ang, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#84CC16';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Bicolor Lily (Violet & White)
      for (let a = 0; a < 6; a++) {
        const ang = (a * (Math.PI * 2)) / 6;
        const grad = ctx.createLinearGradient(0, 0, Math.cos(ang) * 18, Math.sin(ang) * 18);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.6, '#C084FC');
        grad.addColorStop(1, '#9333EA');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(Math.cos(ang) * 13, Math.sin(ang) * 13, 5, 13, ang, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // --- 6. Main Simulation Loop ---
  let lastTime = performance.now();
  let stepTimer = 0;

  function render(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    windTime += dt * 1.5;

    // Handle Movement Logic
    if (targetWorldX !== null) {
      const dist = targetWorldX - char.worldX;
      if (Math.abs(dist) > 8) {
        moveDirection = dist > 0 ? 1 : -1;
        facingRight = moveDirection;
        currentSpeed = WALK_SPEED * 1.3;
      } else {
        targetWorldX = null;
        if (!autoStroll) {
          moveDirection = 0;
          currentSpeed = 0;
        }
      }
    } else if (autoStroll) {
      moveDirection = facingRight;
      currentSpeed = WALK_SPEED;
    }

    // Update Character Position & Camera
    char.worldX += moveDirection * currentSpeed;
    if (moveDirection !== 0) {
      walkPhase += currentSpeed * 0.08;
      facingRight = moveDirection;

      // Footstep petal effect
      stepTimer += dt;
      if (stepTimer > 0.32) {
        stepTimer = 0;
        particles.push(new MeadowParticle(char.worldX, true));
      }
    }

    // Camera smoothly follows character with gentle lead
    const targetCameraX = char.worldX + facingRight * 40;
    cameraX += (targetCameraX - cameraX) * 0.06;

    char.y = height * 0.76;

    // Clear Screen
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Panoramic Meadow Background with Parallax
    if (meadowLoaded) {
      const bgAspect = meadowBg.width / meadowBg.height;
      const bgHeight = height * 1.05;
      const bgWidth = bgHeight * bgAspect;
      // Parallax scroll factor (moves at 0.35x speed of foreground)
      const parallaxX = -(cameraX * 0.35) % bgWidth;

      for (let x = parallaxX - bgWidth; x < width + bgWidth; x += bgWidth) {
        ctx.drawImage(meadowBg, x, 0, bgWidth, bgHeight);
      }
    } else {
      // Elegant fallback twilight gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#241438');
      skyGrad.addColorStop(0.5, '#4C1D95');
      skyGrad.addColorStop(0.75, '#1E3A1A');
      skyGrad.addColorStop(1, '#0F291E');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Draw Midground Floral Bed
    const groundY = char.y + 10;
    for (let i = 0; i < meadowFlowers.length; i++) {
      const fl = meadowFlowers[i];
      const screenX = fl.x - cameraX + width * 0.5;
      drawMeadowFlower(ctx, screenX, groundY + fl.yOffset - 15, fl);
    }

    // 3. Draw Walking Character
    const charScreenX = char.worldX - cameraX + width * 0.5;
    drawWalkingCharacter(ctx, charScreenX, char.y, walkPhase, facingRight, moveDirection * currentSpeed);

    // 4. Draw Foreground Grass Blades Swaying in Breeze
    ctx.strokeStyle = '#2D4A16';
    ctx.lineWidth = 2;
    for (let gx = -60; gx < width + 60; gx += 18) {
      const worldGx = cameraX - width * 0.5 + gx;
      const sway = Math.sin(windTime * 2.5 + worldGx * 0.05) * 12;
      ctx.beginPath();
      ctx.moveTo(gx, height);
      ctx.quadraticCurveTo(gx + sway * 0.5, height - 35, gx + sway, height - 65);
      ctx.stroke();
    }

    // 5. Update & Draw Floating Petals & Light Motifs
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(ctx);
      if (p.decay > 0 && p.opacity <= 0) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // --- 7. Interactive Meadow Controls ---
  const btnWalkLeft = document.getElementById('btn-walk-left');
  const btnWalkRight = document.getElementById('btn-walk-right');
  const btnAutoWalk = document.getElementById('btn-auto-walk');

  if (btnWalkLeft) {
    btnWalkLeft.addEventListener('click', () => {
      autoStroll = false;
      targetWorldX = null;
      moveDirection = -1;
      facingRight = -1;
      currentSpeed = WALK_SPEED;
      updateHudActiveState();
      showToast('Walking through the wildflowers 🌾');
    });
  }

  if (btnWalkRight) {
    btnWalkRight.addEventListener('click', () => {
      autoStroll = false;
      targetWorldX = null;
      moveDirection = 1;
      facingRight = 1;
      currentSpeed = WALK_SPEED;
      updateHudActiveState();
      showToast('Walking through the wildflowers 🌾');
    });
  }

  if (btnAutoWalk) {
    btnAutoWalk.addEventListener('click', () => {
      autoStroll = !autoStroll;
      if (autoStroll) {
        moveDirection = facingRight;
        currentSpeed = WALK_SPEED;
        targetWorldX = null;
        showToast('Auto-Stroll: ON 🚶');
      } else {
        moveDirection = 0;
        currentSpeed = 0;
        showToast('Stroll Paused. Tap anywhere to walk!');
      }
      updateHudActiveState();
    });
  }

  function updateHudActiveState() {
    if (btnAutoWalk) {
      if (autoStroll) {
        btnAutoWalk.classList.add('active');
        btnAutoWalk.textContent = 'Auto Stroll: ON 🚶';
      } else {
        btnAutoWalk.classList.remove('active');
        btnAutoWalk.textContent = 'Auto Stroll: OFF ❚❚';
      }
    }
  }

  // Keyboard navigation (Arrow keys / A / D)
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.isContentEditable) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      autoStroll = false;
      targetWorldX = null;
      moveDirection = -1;
      facingRight = -1;
      currentSpeed = WALK_SPEED;
      updateHudActiveState();
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      autoStroll = false;
      targetWorldX = null;
      moveDirection = 1;
      facingRight = 1;
      currentSpeed = WALK_SPEED;
      updateHudActiveState();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      autoStroll = !autoStroll;
      updateHudActiveState();
    }
  });

  // Tap / Click anywhere on meadow canvas to walk to that spot
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    autoStroll = false;
    updateHudActiveState();
    // Convert click screen coordinate to world coordinate
    targetWorldX = cameraX - width * 0.5 + clickX;
    triggerPetalBurst(15);
  });

  // Celebrate Shower
  const btnPetals = document.getElementById('btn-petals');
  if (btnPetals) {
    btnPetals.addEventListener('click', () => {
      triggerPetalBurst(40);
      showToast('🌸 Flowers of joy bloomed along the path!');
    });
  }

  // Wax Seal Tap
  const sealBtn = document.getElementById('seal-button');
  if (sealBtn) {
    sealBtn.addEventListener('click', () => {
      triggerPetalBurst(50);
      showToast('✦ Wishing you endless joy, peace, and triumph!');
    });
  }

  // --- 8. Ambient Harmonic Web Audio Synthesizer ---
  let audioCtx = null;
  let isMusicPlaying = false;
  let musicTimer = null;
  const btnMusic = document.getElementById('btn-music');
  const musicIcon = document.getElementById('music-icon');
  const musicText = document.getElementById('music-text');

  const peacefulNotes = [
    261.63, 293.66, 329.63, 392.00, 440.00,
    523.25, 587.33, 659.25, 783.99, 880.00
  ];

  function playAmbientTone(freq, duration = 2.8, gainLevel = 0.06) {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(gainLevel, audioCtx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio tone error', e);
    }
  }

  function scheduleNextMelody() {
    if (!isMusicPlaying) return;
    const randomNote = peacefulNotes[Math.floor(Math.random() * peacefulNotes.length)];
    playAmbientTone(randomNote, 2.5 + Math.random() * 1.5, 0.05);

    if (Math.random() > 0.55) {
      const chordNote = peacefulNotes[Math.floor(Math.random() * peacefulNotes.length)];
      setTimeout(() => {
        if (isMusicPlaying) playAmbientTone(chordNote, 3.2, 0.035);
      }, 250);
    }

    const nextDelay = 850 + Math.random() * 1200;
    musicTimer = setTimeout(scheduleNextMelody, nextDelay);
  }

  function toggleMusic() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isMusicPlaying = !isMusicPlaying;

    if (isMusicPlaying) {
      if (btnMusic) btnMusic.classList.add('active');
      if (musicIcon) musicIcon.textContent = '🔊';
      if (musicText) musicText.textContent = 'Pause Music';
      scheduleNextMelody();
      showToast('🎶 Peaceful meadow melody playing');
    } else {
      if (btnMusic) btnMusic.classList.remove('active');
      if (musicIcon) musicIcon.textContent = '🎵';
      if (musicText) musicText.textContent = 'Play Melody';
      clearTimeout(musicTimer);
    }
  }

  if (btnMusic) btnMusic.addEventListener('click', toggleMusic);

})();
