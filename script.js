(function () {
  // 1. Canvas Frame Animation Engine
  const TOTAL_FRAMES = 192;
  const FRAME_PATH_PREFIX = 'frames_24fps/frames/frame_';
  const FRAME_PATH_SUFFIX = '.png';

  const canvas = document.getElementById('canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const preloader = document.getElementById('preloader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderText = document.getElementById('loader-text');

  const images = [];
  let loadedCount = 0;
  let targetFrame = 0;
  let currentFrame = 0;
  const ease = 0.16;

  function getFramePath(index) {
    const paddedNum = String(index).padStart(4, '0');
    return `${FRAME_PATH_PREFIX}${paddedNum}${FRAME_PATH_SUFFIX}`;
  }

  function preloadImages() {
    return new Promise((resolve) => {
      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        img.src = getFramePath(i);

        img.onload = () => {
          loadedCount++;
          updateProgress();
          if (loadedCount === TOTAL_FRAMES) resolve();
        };

        img.onerror = () => {
          loadedCount++;
          updateProgress();
          if (loadedCount === TOTAL_FRAMES) resolve();
        };

        images.push(img);
      }
    });
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

  function drawFrame(index) {
    if (!canvas || !ctx) return;
    const img = images[index];
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
    preloadImages().then(() => {
      if (preloader) preloader.classList.add('hidden');
      resizeCanvas();
      updateTargetFrame();
      currentFrame = targetFrame;
      animate();
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
