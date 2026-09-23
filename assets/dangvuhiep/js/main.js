// Main JavaScript for general interactivity and content loading

const initApp = () => {
  // Base URL cho ảnh & dữ liệu. Khi nhúng trong ASP.NET MVC, trang đặt
  // window.ASSET_BASE = '/assets/dangvuhiep/'. Khi mở offline thì để rỗng.
  const ASSET_BASE = window.ASSET_BASE || '';

  // Global reference to the site data and lightbox items
  let siteData = null;
  let lightboxItems = [];
  let currentLightboxIndex = -1;

  // Preloader hide
  const hidePreloader = () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
    }
  };


  // 1. RENDER TIMELINE (Cuộc đời binh nghiệp)
  const renderTimeline = (timelineData) => {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    // Badge CSS classes mapping
    const badgeClassMap = {
      "Thiếu thời": "badge-thieuthoi",
      "Kháng Pháp": "badge-khangphap",
      "Chống Mỹ": "badge-chongmy",
      "Hòa bình": "badge-hoabinh"
    };

    container.innerHTML = timelineData.map((item, index) => {
      const badgeClass = badgeClassMap[item.badge] || "badge-hoabinh";
      const delayClass = `reveal-${(index % 4) + 1}`;
      
      return `
        <div class="timeline-item reveal ${delayClass}">
          <div class="timeline-content" data-index="${index}">
            <span class="timeline-badge ${badgeClass}">${item.badge}</span>
            <h3 class="timeline-title">${item.year} — ${item.title}</h3>
            <p class="timeline-text">${item.text}</p>
            <button class="timeline-expand" aria-label="Xem chi tiết sự kiện">
              <i class="fa-solid fa-angle-down"></i> Xem chi tiết
            </button>
          </div>
          <div class="timeline-center">
            <div class="timeline-dot"></div>
            <span class="timeline-year">${item.year}</span>
          </div>
          <div class="timeline-empty"></div>
        </div>
      `;
    }).join('');

    // Setup Timeline Expand Toggle
    container.addEventListener('click', (e) => {
      const content = e.target.closest('.timeline-content');
      if (!content) return;

      // Toggle expanded class
      content.classList.toggle('expanded');
      const expandBtn = content.querySelector('.timeline-expand');
      
      if (content.classList.contains('expanded')) {
        expandBtn.innerHTML = `<i class="fa-solid fa-angle-up"></i> Thu gọn`;
        // Scroll slightly into view if needed
        setTimeout(() => {
          content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 150);
      } else {
        expandBtn.innerHTML = `<i class="fa-solid fa-angle-down"></i> Xem chi tiết`;
      }
    });
  };

  // 2. RENDER MUSEUM (Di sản - Kỷ vật)
  const renderMuseum = (artifactsData) => {
    const grid = document.getElementById('museum-grid');
    if (!grid) return;

    grid.innerHTML = artifactsData.map((art, index) => {
      const delayClass = `reveal-${(index % 4) + 1}`;
      const isAI = art.isAI ? `<span class="ai-badge">Phục dựng AI</span>` : '';
      
      return `
        <div class="artifact-card room-${art.room} visible reveal ${delayClass}" data-art-index="${index}">
          <div class="artifact-img-wrap">
            <img src="${ASSET_BASE}assets/images/${art.image}" alt="${art.name}" loading="lazy" onerror="this.src='${ASSET_BASE}assets/images/1966.png'">
            ${isAI}
            <div class="artifact-overlay">
              <div class="artifact-overlay-text">
                <i class="fa-solid fa-maximize" style="font-size:1.1rem; margin-bottom:8px; display:block;"></i>
                Bấm để phóng to kỷ vật
              </div>
            </div>
          </div>
          <div class="artifact-info">
            <div class="artifact-year">${art.year}</div>
            <h3 class="artifact-name">${art.name}</h3>
            <p class="artifact-desc">${art.description}</p>
          </div>
        </div>
      `;
    }).join('');

    // Room Tabs Filtering Logic
    const roomTabs = document.getElementById('room-tabs');
    if (roomTabs) {
      roomTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.room-tab');
        if (!tab) return;

        // Active state update
        roomTabs.querySelectorAll('.room-tab').forEach(btn => btn.classList.remove('active'));
        tab.classList.add('active');

        const selectedRoom = tab.getAttribute('data-room');
        const cards = grid.querySelectorAll('.artifact-card');

        cards.forEach(card => {
          if (selectedRoom === 'all') {
            card.classList.add('visible');
            card.style.display = 'block';
          } else if (card.classList.contains(`room-${selectedRoom}`)) {
            card.classList.add('visible');
            card.style.display = 'block';
          } else {
            card.classList.remove('visible');
            card.style.display = 'none';
          }
        });
      });
    }

    // Attach Lightbox click on artifacts
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.artifact-card');
      if (!card) return;

      const artIndex = parseInt(card.getAttribute('data-art-index'));
      const artifact = artifactsData[artIndex];

      // Prepare lightbox item list for navigation (only visible ones)
      const visibleCards = Array.from(grid.querySelectorAll('.artifact-card.visible'));
      lightboxItems = visibleCards.map(c => {
        const idx = parseInt(c.getAttribute('data-art-index'));
        const art = artifactsData[idx];
        return {
          file: art.image,
          title: art.name,
          caption: `${art.year} • ${art.description}`
        };
      });

      // Find current index in navigation items
      currentLightboxIndex = lightboxItems.findIndex(item => item.file === artifact.image);
      openLightbox();
    });
  };

  // 3. RENDER BATTLES SIDEBAR (Danh sách trận đánh)
  const renderBattles = (battlesData) => {
    const list = document.getElementById('battle-list');
    if (!list) return;

    list.innerHTML = battlesData.map((battle, index) => {
      const isActive = index === 0 ? 'active' : '';
      const is3DTag = battle.id === 'pleime1965' ? `<span class="battle-highlight-tag">Sa bàn 3D</span>` : '';
      
      return `
        <div class="battle-item ${isActive}" data-id="${battle.id}" data-index="${index}">
          <div class="battle-item-year">${battle.year}</div>
          <h4 class="battle-item-name">${battle.name}</h4>
          <p class="battle-item-summary">${battle.summary}</p>
          ${is3DTag}
        </div>
      `;
    }).join('');

    // Switch active battle logic
    list.addEventListener('click', (e) => {
      const item = e.target.closest('.battle-item');
      if (!item) return;

      list.querySelectorAll('.battle-item').forEach(b => b.classList.remove('active'));
      item.classList.add('active');

      const battleId = item.getAttribute('data-id');
      const idx = parseInt(item.getAttribute('data-index'));
      const battle = battlesData[idx];

      // Update sidebar details
      document.getElementById('battle-info-title').textContent = battle.name;
      document.getElementById('battle-info-text').textContent = battle.detail;

      // Trigger 3D scene battle update
      if (window.selectBattle3D) {
        window.selectBattle3D(battleId);
      }
    });
  };

  // 4. RENDER GALLERY (Thư viện hình ảnh)
  const renderGallery = (galleryData) => {
    const masonry = document.getElementById('gallery-masonry');
    if (!masonry) return;

    // Helper to determine decades filter categories
    const getFilterCategory = (item) => {
      if (item.isAI) return 'ai';
      const yearStr = item.year || '';
      const yr = parseInt(yearStr);
      if (!isNaN(yr)) {
        if (yr >= 1945 && yr <= 1959) return '1945';
        if (yr >= 1960 && yr <= 1974) return '1960';
        if (yr === 1975 || yearStr.includes('1975')) return '1975';
        if (yr > 1975 || yearStr.includes('1976') || yearStr.includes('1977') || yearStr.includes('1979')) return 'post-1975';
      }
      return 'post-1975'; // default category for empty year or other family archive pics
    };

    masonry.innerHTML = galleryData.map((img, index) => {
      const cat = getFilterCategory(img);
      const isAIBadge = img.isAI ? `<span class="gallery-ai-badge">AI</span>` : '';
      const filterClass = `filter-${cat}`;
      // A special case: AI images from 1945 can match both
      const secondaryFilterClass = (img.isAI && img.year === '1945') ? 'filter-1945' : '';

      return `
        <div class="gallery-item ${filterClass} ${secondaryFilterClass}" data-gallery-index="${index}">
          <img src="${ASSET_BASE}assets/images/${img.file}" alt="${img.caption}" loading="lazy" onerror="this.src='${ASSET_BASE}assets/images/1966.png'">
          ${isAIBadge}
          <div class="gallery-item-overlay">
            <div class="gallery-item-year">${img.year || 'Kỷ niệm'}</div>
            <p class="gallery-item-caption">${img.caption}</p>
          </div>
        </div>
      `;
    }).join('');

    // Gallery Decade Filters Logic
    const filters = document.getElementById('gallery-filters');
    if (filters) {
      filters.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterVal = btn.getAttribute('data-filter');
        const items = masonry.querySelectorAll('.gallery-item');

        items.forEach(item => {
          if (filterVal === 'all') {
            item.style.display = 'block';
            item.classList.add('visible');
          } else if (item.classList.contains(`filter-${filterVal}`)) {
            item.style.display = 'block';
            item.classList.add('visible');
          } else {
            item.style.display = 'none';
            item.classList.remove('visible');
          }
        });
      });
    }

    // Attach Lightbox click on gallery
    masonry.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery-item');
      if (!item) return;

      const idx = parseInt(item.getAttribute('data-gallery-index'));
      const galleryItem = galleryData[idx];

      // Gather current active images in gallery for navigation
      const visibleItems = Array.from(masonry.querySelectorAll('.gallery-item')).filter(el => el.style.display !== 'none');
      lightboxItems = visibleItems.map(el => {
        const gIdx = parseInt(el.getAttribute('data-gallery-index'));
        const gImg = galleryData[gIdx];
        return {
          file: gImg.file,
          title: gImg.title || (gImg.year ? `Năm ${gImg.year}` : 'Ảnh kỷ niệm'),
          caption: gImg.caption
        };
      });

      // Find initial index
      currentLightboxIndex = lightboxItems.findIndex(item => item.file === galleryItem.file);
      openLightbox();
    });
  };

  // 5. LIGHTBOX OVERLAY LOGIC
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');

  const openLightbox = () => {
    if (currentLightboxIndex < 0 || currentLightboxIndex >= lightboxItems.length) return;
    updateLightboxContent();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden'; // stop scroll
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = ''; // restore scroll
  };

  const updateLightboxContent = () => {
    const item = lightboxItems[currentLightboxIndex];
    if (!item) return;
    
    lightboxImg.src = `${ASSET_BASE}assets/images/${item.file}`;
    lightboxTitle.textContent = item.title;
    lightboxDesc.textContent = item.caption;
  };

  const navigateLightbox = (direction) => {
    if (lightboxItems.length <= 1) return;
    currentLightboxIndex = (currentLightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
    updateLightboxContent();
  };

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', () => navigateLightbox(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigateLightbox(1));
  
  // Close lightbox on click outside the image
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Keyboard navigation for Lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });

  // 6. SCROLL OBSERVER FOR REVEAL ANIMATIONS
  const initScrollReveal = () => {
    const reveals = document.querySelectorAll('.reveal, .timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Once visible, we can stop observing it
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    });

    reveals.forEach(el => observer.observe(el));
  };

  // 7. NAVIGATION SCROLL ACTIONS & INTERACTIVE BACK-TO-TOP
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section, header');
  //const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    // Toggle sticky navbar style
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Scroll active link update
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop - 120) {
        current = section.getAttribute('id');
      }
    });

    // navLinks.forEach(link => {
    //   link.classList.remove('active');
    //   if (link.getAttribute('href') === `#${current}`) {
    //     link.classList.add('active');
    //   }
    // });
  });

  // Smooth scroll for nav anchor links
  // navLinks.forEach(link => {
  //   link.addEventListener('click', (e) => {
  //     e.preventDefault();
  //     const targetId = link.getAttribute('href');
  //     const targetSection = document.querySelector(targetId);
  //     if (targetSection) {
  //       window.scrollTo({
  //         top: targetSection.offsetTop - 70,
  //         behavior: 'smooth'
  //       });
  //     }
  //   });
  // });

  // Initialize with Site Data (supports local file double-clicking via window.siteData)
  const initializeWithData = (data) => {
    siteData = data;
    renderTimeline(data.timeline);
    renderMuseum(data.artifacts);
    renderBattles(data.battles);
    renderGallery(data.gallery);
    
    // Initialize scroll reveal on newly rendered items
    initScrollReveal();

    // Trigger 3D Battle Map initialization
    if (window.initBattle3D) {
      window.initBattle3D(data.battles);
    }

    hidePreloader();
  };

  if (window.siteData) {
    initializeWithData(window.siteData);
  } else {
    // Fallback: Fetch JSON Content if running on a standard web server
    fetch(`${ASSET_BASE}assets/data/content.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Không thể tải tệp dữ liệu di sản.');
        }
        return response.json();
      })
      .then(data => {
        initializeWithData(data);
      })
      .catch(error => {
        console.error('Lỗi khi tải dữ liệu:', error);
        hidePreloader();
        // Show warning in battles and timeline if load fails
        const timelineCont = document.getElementById('timeline-container');
        if (timelineCont) {
          timelineCont.innerHTML = 
            `<p style="text-align:center; color:var(--red-light); padding:40px;">Đã xảy ra lỗi khi tải dữ liệu lịch sử. Vui lòng làm mới trang.</p>`;
        }
      });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
