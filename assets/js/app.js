
/**
 * Main Application Script for Bảo Tàng Số Thượng Tướng Đặng Vũ Hiệp
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher();
  initThemeExhibits();
  initTimeline();
  initSandtable();
  initGallery();
  initWitnesses();
  initMemorialAndGuestbook();
  initQuiz();
  initAudioPlayer();
  initLightbox();
  initNavScroll();
});

/* ============================================================
   1. THEME TOGGLE (DARK / LIGHT)
   ============================================================ */
function initThemeSwitcher() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (!toggleBtn) return;

  const savedTheme = localStorage.getItem('bts_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('bts_theme', next);
    updateThemeIcon(next);
  });

  function updateThemeIcon(theme) {
    toggleBtn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }
}

/* ============================================================
   2. 06 EXHIBITION THEMES
   ============================================================ */
let currentThemeIndex = 0;

function initThemeExhibits() {
  const navContainer = document.getElementById('themes-nav-container');
  if (!navContainer || !MUSEUM_DATA.themes.length) return;

  navContainer.innerHTML = '';
  MUSEUM_DATA.themes.forEach((t, idx) => {
    const btn = document.createElement('button');
    btn.className = `theme-tab-btn ${idx === 0 ? 'active' : ''}`;
    btn.innerHTML = `<span class="theme-idx">${t.number}</span> <i class="fas ${t.icon}"></i> ${t.title}`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderThemeContent(idx);
    });
    navContainer.appendChild(btn);
  });

  renderThemeContent(0);
}

function renderThemeContent(idx) {
  currentThemeIndex = idx;
  const theme = MUSEUM_DATA.themes[idx];
  const container = document.getElementById('theme-display-container');
  if (!container) return;

  let detailsHtml = '';
  theme.details.forEach(d => {
    detailsHtml += `
      <div class="accordion-item">
        <div class="accordion-header">
          <i class="fas fa-caret-right"></i>
          <span>${d.heading}</span>
        </div>
        <div class="accordion-body">${d.content}</div>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="theme-display-card">
      <div class="theme-card-media">
        <img src="${theme.image}" alt="${theme.title}" onerror="this.src='assets/images/Chân dung Đặng Vũ Hiệp.png'">
        <div class="theme-badge-overlay">CHUYÊN ĐỀ ${theme.number} / 06</div>
      </div>
      <div class="theme-card-body">
        <div class="theme-tagline">${theme.tagline}</div>
        <h3>${theme.title}</h3>
        <div class="theme-subtitle">${theme.subtitle}</div>
        <p class="theme-summary">${theme.summary}</p>
        <div class="theme-details-accordion">
          ${detailsHtml}
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
   3. TIMELINE OF LIFE
   ============================================================ */
function initTimeline() {
  const container = document.getElementById('timeline-items-container');
  if (!container || !MUSEUM_DATA.timeline.length) return;

  container.innerHTML = '';
  MUSEUM_DATA.timeline.forEach((item, idx) => {
    const isLeft = idx % 2 === 0;
    const div = document.createElement('div');
    div.className = `timeline-item ${isLeft ? 'left' : 'right'}`;
    div.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-card">
        <div class="timeline-year">${item.year}</div>
        <div class="timeline-title">${item.title}</div>
        <div class="timeline-desc">${item.desc}</div>
      </div>
    `;
    container.appendChild(div);
  });
}

/* ============================================================
   4. TACTICAL SANDTABLE
   ============================================================ */
let sandtableInstance = null;

function initSandtable() {
  sandtableInstance = new TacticalSandtable('tactical-canvas');

  // Next & Prev Buttons
  const nextBtn = document.getElementById('sandtable-next-btn');
  const prevBtn = document.getElementById('sandtable-prev-btn');
  const playBtn = document.getElementById('sandtable-play-btn');

  if (nextBtn) nextBtn.addEventListener('click', () => sandtableInstance.nextStep());
  if (prevBtn) prevBtn.addEventListener('click', () => sandtableInstance.prevStep());
  if (playBtn) playBtn.addEventListener('click', () => sandtableInstance.togglePlay());

  // Step dots
  const dotsContainer = document.getElementById('sandtable-dots-container');
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    MUSEUM_DATA.sandtable.stages.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `sandtable-step-dot ${idx === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => sandtableInstance.setStep(idx));
      dotsContainer.appendChild(dot);
    });
  }

  // Toggle Canvas vs Video mode
  const tabCanvas = document.getElementById('tab-sandtable-canvas');
  const tabVideo = document.getElementById('tab-sandtable-video');
  const canvasArea = document.getElementById('sandtable-canvas-wrap');
  const videoArea = document.getElementById('sandtable-video-wrap');
  const videoEl = document.getElementById('sandtable-video-el');

  if (tabCanvas && tabVideo) {
    tabCanvas.addEventListener('click', () => {
      tabCanvas.classList.add('active');
      tabVideo.classList.remove('active');
      canvasArea.style.display = 'block';
      videoArea.classList.remove('active');
      if (videoEl) videoEl.pause();
    });

    tabVideo.addEventListener('click', () => {
      tabVideo.classList.add('active');
      tabCanvas.classList.remove('active');
      canvasArea.style.display = 'none';
      videoArea.classList.add('active');
      if (videoEl) videoEl.play();
    });
  }
}

/* ============================================================
   5. ARTIFACTS GALLERY
   ============================================================ */
function initGallery() {
  const grid = document.getElementById('gallery-grid-container');
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (!grid || !MUSEUM_DATA.artifacts.length) return;

  function render(category = 'all') {
    grid.innerHTML = '';
    const filtered = category === 'all'
      ? MUSEUM_DATA.artifacts
      : MUSEUM_DATA.artifacts.filter(a => a.category === category);

    filtered.forEach(art => {
      const card = document.createElement('div');
      card.className = 'artifact-card';
      card.innerHTML = `
        <div class="artifact-img-wrap">
          <img src="${art.image}" alt="${art.title}" onerror="this.src='assets/images/Chân dung Đặng Vũ Hiệp.png'">
          <div class="artifact-badge">${art.year}</div>
        </div>
        <div class="artifact-body">
          <div class="artifact-title">${art.title}</div>
          <div class="artifact-desc">${art.desc}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        openLightbox(art.image, art.title, art.desc);
      });
      grid.appendChild(card);
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render(btn.dataset.category);
    });
  });

  render('all');
}

/* ============================================================
   6. WITNESSES
   ============================================================ */
function initWitnesses() {
  const container = document.getElementById('witnesses-container');
  if (!container || !MUSEUM_DATA.witnesses.length) return;

  container.innerHTML = '';
  MUSEUM_DATA.witnesses.forEach(w => {
    const card = document.createElement('div');
    card.className = 'witness-card';
    card.innerHTML = `
      <div class="witness-quote">${w.quote}</div>
      <div class="witness-author">
        <div class="witness-name">${w.name}</div>
        <div class="witness-role">${w.role}</div>
      </div>
    `;
    container.appendChild(card);
  });
}

/* ============================================================
   7. MEMORIAL CEREMONY & GUESTBOOK
   ============================================================ */
function initMemorialAndGuestbook() {
  let flowers = parseInt(localStorage.getItem('bts_flowers') || '1256');
  let candles = parseInt(localStorage.getItem('bts_candles') || '3428');

  const flowerNumEl = document.getElementById('flower-count');
  const candleNumEl = document.getElementById('candle-count');
  if (flowerNumEl) flowerNumEl.textContent = flowers;
  if (candleNumEl) candleNumEl.textContent = candles;

  const btnFlower = document.getElementById('btn-offer-flower');
  const btnCandle = document.getElementById('btn-light-candle');

  if (btnFlower) {
    btnFlower.addEventListener('click', () => {
      flowers++;
      localStorage.setItem('bts_flowers', flowers);
      if (flowerNumEl) flowerNumEl.textContent = flowers;
      showToast('🌹 Đã dâng hoa tri ân Thượng tướng!');
    });
  }

  if (btnCandle) {
    btnCandle.addEventListener('click', () => {
      candles++;
      localStorage.setItem('bts_candles', candles);
      if (candleNumEl) candleNumEl.textContent = candles;
      showToast('🕯️ Đã thắp nến tưởng nhớ Thượng tướng!');
    });
  }

  // Guestbook
  const initialEntries = [
    {
      name: 'Nguyễn Văn Minh (Hà Nội)',
      time: '02/09/2026',
      msg: 'Kính cẩn nghiêng mình trước anh linh Thượng tướng. Tấm gương trọn đời vì nước vì dân của Bác mãi soi đường cho thế hệ trẻ chúng cháu!'
    },
    {
      name: 'Trần Thị Hoài (Gia Lai)',
      time: '28/08/2026',
      msg: 'Đồng bào Tây Nguyên luôn ghi nhớ công ơn Bác Hiệp - người con ưu tú gắn bó máu thịt với cao nguyên đại ngàn.'
    },
    {
      name: 'Lê Tuấn Dũng (Đại học Quốc gia)',
      time: '19/08/2026',
      msg: 'Một website bảo tàng số vô cùng sinh động, xúc động và đầy tự hào. Cảm ơn Ban xây dựng dự án!'
    }
  ];

  let entries = JSON.parse(localStorage.getItem('bts_guestbook') || 'null');
  if (!entries || !entries.length) {
    entries = initialEntries;
    localStorage.setItem('bts_guestbook', JSON.stringify(entries));
  }

  const listEl = document.getElementById('guestbook-list');
  function renderGuestbook() {
    if (!listEl) return;
    listEl.innerHTML = '';
    entries.forEach(e => {
      const item = document.createElement('div');
      item.className = 'guestbook-entry';
      item.innerHTML = `
        <div class="guestbook-header">
          <span class="guest-name"><i class="fas fa-user-circle"></i> ${e.name}</span>
          <span class="guest-time">${e.time}</span>
        </div>
        <div class="guest-msg">${e.msg}</div>
      `;
      listEl.appendChild(item);
    });
  }
  renderGuestbook();

  const form = document.getElementById('guestbook-form');
  if (form) {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const name = document.getElementById('guest-name-input').value.trim();
      const msg = document.getElementById('guest-msg-input').value.trim();
      if (!name || !msg) return;

      const dateStr = new Date().toLocaleDateString('vi-VN');
      entries.unshift({ name, time: dateStr, msg });
      localStorage.setItem('bts_guestbook', JSON.stringify(entries));
      renderGuestbook();

      form.reset();
      showToast('✍️ Đã gửi lời tri ân vào Sổ Lưu Niệm thành công!');
    });
  }
}

/* ============================================================
   8. QUIZ
   ============================================================ */
let currentQuizIndex = 0;
let quizScore = 0;
let answered = false;

function initQuiz() {
  renderQuizQuestion();

  const nextBtn = document.getElementById('quiz-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentQuizIndex < MUSEUM_DATA.quiz.length - 1) {
        currentQuizIndex++;
        renderQuizQuestion();
      } else {
        renderQuizResult();
      }
    });
  }
}

function renderQuizQuestion() {
  answered = false;
  const qData = MUSEUM_DATA.quiz[currentQuizIndex];
  const qTitleEl = document.getElementById('quiz-question-title');
  const qProgressEl = document.getElementById('quiz-progress-text');
  const optionsEl = document.getElementById('quiz-options-list');
  const explainEl = document.getElementById('quiz-explain-box');
  const nextBtn = document.getElementById('quiz-next-btn');

  if (!qTitleEl || !optionsEl) return;

  qProgressEl.textContent = `CÂU HỎI ${currentQuizIndex + 1} / ${MUSEUM_DATA.quiz.length}`;
  qTitleEl.textContent = qData.q;
  explainEl.style.display = 'none';
  nextBtn.style.display = 'none';
  optionsEl.innerHTML = '';

  qData.options.forEach((opt, idx) => {
    const btn = document.createElement('div');
    btn.className = 'quiz-option';
    btn.innerHTML = `<span class="opt-letter"><strong>${String.fromCharCode(65 + idx)}.</strong></span> <span>${opt}</span>`;
    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      if (idx === qData.answer) {
        btn.classList.add('correct');
        quizScore++;
      } else {
        btn.classList.add('wrong');
        // Highlight correct option
        optionsEl.children[qData.answer].classList.add('correct');
      }

      explainEl.innerHTML = `<strong>Giải thích:</strong> ${qData.explain}`;
      explainEl.style.display = 'block';
      nextBtn.style.display = 'inline-flex';
      nextBtn.textContent = currentQuizIndex === MUSEUM_DATA.quiz.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo';
    });
    optionsEl.appendChild(btn);
  });
}

function renderQuizResult() {
  const box = document.getElementById('quiz-box-inner');
  if (!box) return;

  const total = MUSEUM_DATA.quiz.length;
  const percent = Math.round((quizScore / total) * 100);

  box.innerHTML = `
    <div style="text-align: center; padding: 2rem 1rem;">
      <i class="fas fa-award" style="font-size: 3.5rem; color: #d4af37; margin-bottom: 1rem;"></i>
      <h3 style="font-size: 2rem; margin-bottom: 0.5rem;">KẾT QUẢ TRẮC NGHIỆM</h3>
      <p style="font-size: 1.25rem; color: #fef08a; margin-bottom: 1.5rem;">
        Bạn đã trả lời đúng <strong>${quizScore}/${total}</strong> câu (${percent}%)
      </p>
      <p style="color: #9ca3af; max-width: 500px; margin: 0 auto 2rem;">
        ${percent >= 80 ? 'Xuất sắc! Bạn có kiến thức lịch sử rất sâu sắc về Thượng tướng Đặng Vũ Hiệp và Mặt trận Tây Nguyên anh hùng!' : 'Cảm ơn bạn đã tham gia thử thách! Hãy khám phá thêm các chuyên đề để hiểu rõ hơn về cuộc đời Thượng tướng nhé.'}
      </p>
      <button class="btn-primary" onclick="restartQuiz()">
        <i class="fas fa-redo"></i> Làm lại bài trắc nghiệm
      </button>
    </div>
  `;
}

window.restartQuiz = function() {
  currentQuizIndex = 0;
  quizScore = 0;
  const box = document.getElementById('quiz-box-inner');
  box.innerHTML = `
    <div class="quiz-progress" id="quiz-progress-text"></div>
    <div class="quiz-question" id="quiz-question-title"></div>
    <div class="quiz-options" id="quiz-options-list"></div>
    <div class="quiz-explain" id="quiz-explain-box"></div>
    <div style="text-align: right;">
      <button class="btn-primary" id="quiz-next-btn" style="display: none;">Câu tiếp theo</button>
    </div>
  `;
  initQuiz();
};

/* ============================================================
   9. AUDIO PLAYER
   ============================================================ */
function initAudioPlayer() {
  const audioEl = document.getElementById('bg-audio');
  const playBtn = document.getElementById('audio-play-toggle');
  const titleEl = document.getElementById('audio-current-title');
  if (!audioEl || !playBtn) return;

  let isPlaying = false;
  const playlist = [
    { title: 'Nhạc hào hùng Trailer', src: 'assets/media/trailer V5.mp3' },
    { title: 'Thuyết minh Cuộc đời & Sự nghiệp', src: 'assets/media/thuong_tuong_dang_vu_hiep_19282008_la_mot_vi_0e1902ae-20bd-42b8-bd29-505c100234e9.mp3' },
    { title: 'Podcast Ký ức Tây Nguyên', src: 'assets/media/Voice Podcast DVH.mp3' }
  ];
  let curIndex = 0;

  playBtn.addEventListener('click', () => {
    if (isPlaying) {
      audioEl.pause();
      playBtn.innerHTML = '<i class="fas fa-play"></i>';
      isPlaying = false;
    } else {
      audioEl.src = playlist[curIndex].src;
      audioEl.play().then(() => {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        isPlaying = true;
        if (titleEl) titleEl.textContent = playlist[curIndex].title;
      }).catch(e => console.log('Audio autoplay prevented:', e));
    }
  });

  const nextTrackBtn = document.getElementById('audio-next-track');
  if (nextTrackBtn) {
    nextTrackBtn.addEventListener('click', () => {
      curIndex = (curIndex + 1) % playlist.length;
      audioEl.src = playlist[curIndex].src;
      if (titleEl) titleEl.textContent = playlist[curIndex].title;
      audioEl.play().then(() => {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        isPlaying = true;
      }).catch(() => {});
    });
  }
}

/* ============================================================
   10. LIGHTBOX MODAL
   ============================================================ */
function initLightbox() {
  const backdrop = document.getElementById('lightbox-modal');
  const closeBtn = document.getElementById('lightbox-close-btn');

  if (closeBtn && backdrop) {
    closeBtn.addEventListener('click', () => backdrop.classList.remove('active'));
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.classList.remove('active');
    });
  }
}

function openLightbox(src, title, desc) {
  const backdrop = document.getElementById('lightbox-modal');
  const imgEl = document.getElementById('lightbox-img');
  const titleEl = document.getElementById('lightbox-title');
  const descEl = document.getElementById('lightbox-desc');

  if (!backdrop) return;
  imgEl.src = src;
  titleEl.textContent = title;
  descEl.textContent = desc;
  backdrop.classList.add('active');
}

/* ============================================================
   11. NAVIGATION & SMOOTH SCROLL
   ============================================================ */
function initNavScroll() {
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 70,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(185, 28, 28, 0.95);
    border: 1px solid #fef08a;
    color: #fff;
    padding: 0.75rem 1.5rem;
    border-radius: 30px;
    font-size: 0.95rem;
    font-weight: 600;
    z-index: 9999;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    transition: opacity 0.4s ease;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 2600);
}
