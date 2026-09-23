
/**
 * Sa Bàn Tác Chiến Điện Tử - Chiến Dịch Plei Me & Trận Đánh Ia Đrăng (1965)
 * Tái hiện tương tác 5 phân cảnh chiến thuật với Canvas và mô phỏng quân sự
 */

class TacticalSandtable {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.currentStep = 0;
    this.isPlaying = false;
    this.timer = null;
    this.animFrame = null;
    this.progress = 0; // 0 to 1 for animation in current step
    this.audioCtx = null;
    this.soundEnabled = true;

    this.initCanvasSize();
    window.addEventListener('resize', () => {
      this.initCanvasSize();
      this.render();
    });

    this.updateUI();
    this.render();
  }

  initCanvasSize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const width = rect.width || 800;
    const height = Math.min(width * 0.58, 540);
    this.canvas.width = width;
    this.canvas.height = height;
    this.w = width;
    this.h = height;
  }

  playTacticalSound(type) {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;
      if (type === 'step') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'conflict') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {}
  }

  setStep(stepIndex) {
    if (stepIndex < 0) stepIndex = 0;
    if (stepIndex >= MUSEUM_DATA.sandtable.stages.length) stepIndex = MUSEUM_DATA.sandtable.stages.length - 1;
    this.currentStep = stepIndex;
    this.progress = 0;
    this.playTacticalSound('step');
    this.updateUI();
    this.animateStep();
  }

  nextStep() {
    if (this.currentStep < MUSEUM_DATA.sandtable.stages.length - 1) {
      this.setStep(this.currentStep + 1);
    } else {
      this.setStep(0);
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.setStep(this.currentStep - 1);
    }
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    const playBtn = document.getElementById('sandtable-play-btn');
    if (playBtn) {
      playBtn.innerHTML = this.isPlaying ? '<i class="fas fa-pause"></i> Tạm dừng' : '<i class="fas fa-play"></i> Tự động chạy';
    }

    if (this.isPlaying) {
      this.autoPlayNext();
    } else {
      clearTimeout(this.timer);
    }
  }

  autoPlayNext() {
    if (!this.isPlaying) return;
    this.timer = setTimeout(() => {
      if (!this.isPlaying) return;
      if (this.currentStep < MUSEUM_DATA.sandtable.stages.length - 1) {
        this.nextStep();
        this.autoPlayNext();
      } else {
        this.currentStep = 0;
        this.updateUI();
        this.render();
        this.autoPlayNext();
      }
    }, 6000);
  }

  animateStep() {
    let start = null;
    const duration = 1200;

    const stepFn = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      this.progress = Math.min(elapsed / duration, 1);
      this.render();
      if (this.progress < 1) {
        this.animFrame = requestAnimationFrame(stepFn);
      }
    };
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.animFrame = requestAnimationFrame(stepFn);
  }

  render() {
    const ctx = this.ctx;
    const w = this.w;
    const h = this.h;

    // 1. Draw Military Topographic Map Background
    ctx.fillStyle = '#111a16'; // Deep jungle dark tone
    ctx.fillRect(0, 0, w, h);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(74, 110, 89, 0.18)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Topography contours: Chu Pong Massif (Left), Valley (Center), Route 21 (Right/Center)
    ctx.save();
    // Mountain massif (Chu Pong)
    ctx.fillStyle = 'rgba(34, 56, 42, 0.45)';
    ctx.beginPath();
    ctx.ellipse(w * 0.22, h * 0.55, w * 0.2, h * 0.4, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(44, 75, 56, 0.45)';
    ctx.beginPath();
    ctx.ellipse(w * 0.2, h * 0.58, w * 0.14, h * 0.26, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // River: Ia Drang river curving through
    ctx.strokeStyle = 'rgba(45, 125, 154, 0.65)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.85);
    ctx.bezierCurveTo(w * 0.25, h * 0.7, w * 0.4, h * 0.8, w * 0.6, h * 0.65);
    ctx.bezierCurveTo(w * 0.75, h * 0.55, w * 0.85, h * 0.6, w * 0.98, h * 0.45);
    ctx.stroke();

    ctx.fillStyle = 'rgba(75, 175, 214, 0.85)';
    ctx.font = 'italic 11px Inter, sans-serif';
    ctx.fillText('Sông Ia Đrăng', w * 0.35, h * 0.77);

    // Route 21 / 19B (Road from Phu My / Pleiku to Plei Me)
    ctx.strokeStyle = 'rgba(180, 145, 80, 0.7)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(w * 0.95, h * 0.15); // towards Pleiku
    ctx.quadraticCurveTo(w * 0.7, h * 0.25, w * 0.6, h * 0.42);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(212, 175, 55, 0.9)';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Đường 21 (19B) -> Pleiku', w * 0.73, h * 0.2);

    // 2. Fixed Landmark Nodes
    // Plei Me Post (x: 0.6*w, y: 0.42*h)
    this.drawLandmark(w * 0.6, h * 0.42, 'Trại Plâyme', '#d97706', 'camp');
    // Chu Pong Summit
    this.drawLandmark(w * 0.18, h * 0.55, 'Núi Chư Pông', '#10b981', 'mountain');
    // LZ X-Ray (x: 0.26*w, y: 0.65*h)
    this.drawLandmark(w * 0.26, h * 0.65, 'Bãi đáp LZ X-Ray', '#60a5fa', 'lz');
    // LZ Albany (x: 0.36*w, y: 0.52*h)
    this.drawLandmark(w * 0.36, h * 0.52, 'Bãi đáp LZ Albany', '#60a5fa', 'lz');
    // Diem cao 538 & Doi Blu (Ambush zone Route 21)
    this.drawLandmark(w * 0.68, h * 0.28, 'Đồi Blu / Đ.cao 538', '#9ca3af', 'hill');

    ctx.restore();

    // 3. Dynamic Military Maneuvers based on currentStep
    this.renderTacticalManeuvers(ctx, w, h, this.currentStep, this.progress);

    // 4. Tactical Map Overlay Info
    this.renderOverlayHUD(ctx, w, h);
  }

  drawLandmark(x, y, label, color, type) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    if (type === 'camp') {
      ctx.fillRect(x - 7, y - 7, 14, 14);
      ctx.strokeRect(x - 7, y - 7, 14, 14);
    } else if (type === 'lz') {
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(label, x + 10, y + 4);
    ctx.restore();
  }

  drawArrow(fromX, fromY, toX, toY, color, label, progress = 1, width = 4) {
    const ctx = this.ctx;
    const curToX = fromX + (toX - fromX) * progress;
    const curToY = fromY + (toY - fromY) * progress;

    const angle = Math.atan2(toY - fromY, toX - fromX);
    const headlen = 12;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(curToX, curToY);
    ctx.stroke();

    // Arrow Head
    ctx.beginPath();
    ctx.moveTo(curToX, curToY);
    ctx.lineTo(curToX - headlen * Math.cos(angle - Math.PI / 6), curToY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(curToX - headlen * Math.cos(angle + Math.PI / 6), curToY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    if (label && progress > 0.5) {
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      const midX = (fromX + curToX) / 2;
      const midY = (fromY + curToY) / 2 - 8;
      ctx.fillText(label, midX, midY);
    }
    ctx.restore();
  }

  drawEncirclement(cx, cy, radius, color, progress) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2 * progress);
    ctx.stroke();
    ctx.restore();
  }

  drawExplosion(x, y, radius = 18) {
    const ctx = this.ctx;
    ctx.save();
    const grad = ctx.createRadialGradient(x, y, 2, x, y, radius);
    grad.addColorStop(0, 'rgba(255, 240, 100, 0.95)');
    grad.addColorStop(0.4, 'rgba(239, 68, 68, 0.8)');
    grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderTacticalManeuvers(ctx, w, h, step, p) {
    const red = '#ef4444'; // QĐNDVN
    const blue = '#3b82f6'; // Mỹ / Sài Gòn

    if (step === 0) {
      this.drawArrow(w * 0.52, h * 0.5, w * 0.58, h * 0.44, red, 'e33 áp sát', p);
      this.drawEncirclement(w * 0.6, h * 0.42, 28, red, p);
      this.drawArrow(w * 0.72, h * 0.38, w * 0.68, h * 0.3, red, 'e320 phục kích', p);
    } else if (step === 1) {
      this.drawArrow(w * 0.88, h * 0.18, w * 0.7, h * 0.28, blue, 'Chiến đoàn giải tỏa', p);
      this.drawArrow(w * 0.64, h * 0.34, w * 0.69, h * 0.28, red, 'e320 đánh ngang sườn', p, 5);
      if (p > 0.6) {
        this.drawExplosion(w * 0.69, h * 0.28, 22);
      }
      this.drawArrow(w * 0.6, h * 0.45, w * 0.5, h * 0.52, red, 'e33 mở vây về Chư Pông', p);
    } else if (step === 2) {
      this.drawArrow(w * 0.65, h * 0.35, w * 0.35, h * 0.55, red, 'e320 về căn cứ', p);
      this.drawArrow(w * 0.5, h * 0.52, w * 0.24, h * 0.6, red, 'e33 & e66 bố trí', p);
      this.drawArrow(w * 0.6, h * 0.3, w * 0.3, h * 0.58, blue, 'Không kỵ Mỹ đổ bộ trinh sát', p);
    } else if (step === 3) {
      this.drawArrow(w * 0.45, h * 0.45, w * 0.28, h * 0.63, blue, '1/7 Không kỵ Mỹ đổ bộ', p);
      this.drawEncirclement(w * 0.26, h * 0.65, 32, blue, 1);
      this.drawArrow(w * 0.18, h * 0.68, w * 0.24, h * 0.66, red, 'd7, d9 (e66) áp sát', p, 5);
      this.drawArrow(w * 0.26, h * 0.75, w * 0.26, h * 0.68, red, 'd1 (e33)', p, 4);
      if (p > 0.5) {
        this.drawExplosion(w * 0.26, h * 0.65, 28);
      }
    } else if (step === 4) {
      this.drawArrow(w * 0.27, h * 0.62, w * 0.35, h * 0.54, blue, '2/7 Không kỵ rút bộ', p);
      this.drawArrow(w * 0.42, h * 0.48, w * 0.37, h * 0.52, red, 'd8/e66 thọc sườn', p, 5);
      this.drawArrow(w * 0.3, h * 0.56, w * 0.35, h * 0.53, red, 'e33 khép chặt', p, 5);
      if (p > 0.5) {
        this.drawExplosion(w * 0.36, h * 0.52, 32);
      }
    }
  }

  renderOverlayHUD(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 1;
    ctx.fillRect(10, h - 65, 230, 55);
    ctx.strokeRect(10, h - 65, 230, 55);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(20, h - 52, 12, 6);
    ctx.fillStyle = '#f3f4f6';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Quân Giải phóng B3 (Đỏ)', 40, h - 47);

    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(20, h - 32, 12, 6);
    ctx.fillStyle = '#f3f4f6';
    ctx.fillText('Quân Mỹ & Sài Gòn (Xanh)', 40, h - 27);

    ctx.fillStyle = 'rgba(185, 28, 28, 0.85)';
    ctx.fillRect(w - 180, 10, 170, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`GIAI ĐOẠN ${this.currentStep + 1}/5`, w - 165, 27);
    ctx.restore();
  }

  updateUI() {
    const stage = MUSEUM_DATA.sandtable.stages[this.currentStep];
    const nameEl = document.getElementById('sandtable-stage-name');
    const timeEl = document.getElementById('sandtable-stage-time');
    const descEl = document.getElementById('sandtable-stage-desc');
    const vnActEl = document.getElementById('sandtable-vn-action');
    const enActEl = document.getElementById('sandtable-en-action');

    if (nameEl) nameEl.textContent = stage.name;
    if (timeEl) timeEl.textContent = stage.time;
    if (descEl) descEl.textContent = stage.desc;
    if (vnActEl) vnActEl.textContent = stage.vietnamAction;
    if (enActEl) enActEl.textContent = stage.enemyAction;

    document.querySelectorAll('.sandtable-step-dot').forEach((dot, idx) => {
      if (idx === this.currentStep) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }
}

window.TacticalSandtable = TacticalSandtable;
