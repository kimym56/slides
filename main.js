document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const counter = document.getElementById('slide-counter');
  const progressFill = document.getElementById('progress-indicator');
  const sectionLabel = document.getElementById('current-section');
  
  let currentSlide = 0;
  const totalSlides = slides.length;

  function updateSlides() {
    slides.forEach((slide, index) => {
      if (index === currentSlide) {
        slide.classList.add('active');
        sectionLabel.textContent = slide.getAttribute('data-title') || '';
        // Manage z-index logic if we want fancy overlapping
      } else {
        slide.classList.remove('active');
      }
    });

    counter.textContent = `${currentSlide + 1} / ${totalSlides}`;
    const progress = ((currentSlide) / (totalSlides - 1)) * 100;
    progressFill.style.width = `${progress}%`;

    btnPrev.disabled = currentSlide === 0;
    btnNext.disabled = currentSlide === totalSlides - 1;
  }

  function nextSlide() {
    if (currentSlide < totalSlides - 1) {
      currentSlide++;
      updateSlides();
    }
  }

  function prevSlide() {
    if (currentSlide > 0) {
      currentSlide--;
      updateSlides();
    }
  }

  btnNext.addEventListener('click', nextSlide);
  btnPrev.addEventListener('click', prevSlide);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'Space') {
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
    }
  });

  // Mouse wheel navigation (with throttle to prevent fast scroll)
  let isScrolling = false;
  document.addEventListener('wheel', (e) => {
    if (isScrolling) return;
    
    // Some small threshold to avoid sensitive magic mouse triggers
    if (Math.abs(e.deltaY) > 20) {
      isScrolling = true;
      if (e.deltaY > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      setTimeout(() => {
        isScrolling = false;
      }, 1000); // 1s throttle matches CSS transition time
    }
  });

  // Init
  updateSlides();
});
