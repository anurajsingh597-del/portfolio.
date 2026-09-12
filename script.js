(function () {
  // 1. Optimized Canvas Frame Animation Engine
  const TOTAL_FRAMES = 192;
  const INITIAL_BATCH_SIZE = 10; // Load first 10 frames instantly for immediate render
  const FRAME_PATH_PREFIX = 'frames_24fps/frames/frame_';
  const FRAME_PATH_SUFFIX = '.png';

  const canvas = document.getElementById('canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const preloader = document.getElementById('preloader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderText = document.getElementById('loader-text');

  const images = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let targetFrame = 0;
  let currentFrame = 0;
  const ease = 0.16;

  function getFramePath(index) {
    const paddedNum = String(index).padStart(4, '0');
    return `${FRAME_PATH_PREFIX}${paddedNum}${FRAME_PATH_SUFFIX}`;
  }

  // Preload an individual frame
  function loadSingleFrame(i) {
    return new Promise((resolve) => {
      if (images[i - 1]) return resolve();
      const img = new Image();
      img.src = getFramePath(i);

      img.onload = () => {
        images[i - 1] = img;
        loadedCount++;
        updateProgress();
        resolve();
      };

      img.onerror = () => {
        images[i - 1] = null;
        loadedCount++;
        updateProgress();
        resolve();
      };
    });
  }

  // Preload initial batch for instant page interactive state
  function preloadInitialBatch() {
    const promises = [];
    for (let i = 1; i <= INITIAL_BATCH_SIZE; i++) {
      promises.push(loadSingleFrame(i));
    }
    return Promise.all(promises);
  }

  // Load remaining frames in background idle chunks
  function loadRemainingFrames() {
    let currentIdx = INITIAL_BATCH_SIZE + 1;
    function loadChunk() {
      if (currentIdx > TOTAL_FRAMES) return;
      const end = Math.min(currentIdx + 5, TOTAL_FRAMES + 1);
      const promises = [];
      for (let i = currentIdx; i < end; i++) {
        promises.push(loadSingleFrame(i));
      }
      currentIdx = end;
      Promise.all(promises).then(() => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(loadChunk, { timeout: 1000 });
        } else {
          setTimeout(loadChunk, 50);
        }
      });
    }
    loadChunk();
  }

  function updateProgress() {
    if (!loaderBar || !loaderText) return;
    const percent = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
    loaderBar.style.width = percent + '%';
    loaderText.textContent = `LOADING ${percent}%`;
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    drawFrame(Math.round(currentFrame));
  }

  // Draw frame with fallback to nearest available loaded frame
  function drawFrame(index) {
    if (!canvas || !ctx) return;
    
    let img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) {
      // Find nearest loaded frame as fallback
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        if (index - offset >= 0 && images[index - offset] && images[index - offset].complete) {
          img = images[index - offset];
          break;
        }
        if (index + offset < TOTAL_FRAMES && images[index + offset] && images[index + offset].complete) {
          img = images[index + offset];
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    const scale = Math.max(screenWidth / imgWidth, screenHeight / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    const x = (screenWidth - drawWidth) / 2;
    const y = (screenHeight - drawHeight) / 2;

    ctx.clearRect(0, 0, screenWidth, screenHeight);
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  }

  function updateTargetFrame() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    if (maxScroll <= 0) return;

    const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScroll));
    targetFrame = scrollFraction * (TOTAL_FRAMES - 1);
  }

  function animate() {
    currentFrame += (targetFrame - currentFrame) * ease;
    const frameIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(currentFrame)));
    drawFrame(frameIndex);
    requestAnimationFrame(animate);
  }

  window.addEventListener('scroll', updateTargetFrame, { passive: true });
  window.addEventListener('resize', resizeCanvas);

  if (canvas) {
    preloadInitialBatch().then(() => {
      if (preloader) preloader.classList.add('hidden');
      resizeCanvas();
      updateTargetFrame();
      currentFrame = targetFrame;
      animate();
      loadRemainingFrames();
    });
  }

  // 2. Mobile Navigation Drawer Toggle
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

  if (hamburgerBtn && mobileNav) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.contains('open');
      if (isOpen) {
        mobileNav.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      } else {
        mobileNav.classList.add('open');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
      }
    });

    mobileNavItems.forEach((item) => {
      item.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 3. Contact Form Validation & Submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');

    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');
    const formSuccess = document.getElementById('form-success');

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      if (nameError) nameError.classList.remove('visible');
      if (emailError) emailError.classList.remove('visible');
      if (messageError) messageError.classList.remove('visible');
      if (formSuccess) formSuccess.classList.remove('visible');

      if (!nameInput.value.trim()) {
        if (nameError) nameError.classList.add('visible');
        valid = false;
      }

      if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) {
        if (emailError) emailError.classList.add('visible');
        valid = false;
      }

      if (!messageInput.value.trim()) {
        if (messageError) messageError.classList.add('visible');
        valid = false;
      }

      if (valid) {
        if (formSuccess) formSuccess.classList.add('visible');
        contactForm.reset();
      }
    });
  }
})();
