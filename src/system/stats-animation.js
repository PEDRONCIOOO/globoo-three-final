export function initStatsAnimation() {
  function animateCounter(element, target, suffix = '') {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current) + suffix;
    }, 30);
  }

  function handleStatsAnimation() {
    const statsSection = document.querySelector('.section-4');
    const statBoxes = document.querySelectorAll('.stat-box');
    
    if (!statsSection || statBoxes.length === 0) return;
    
    const sectionRect = statsSection.getBoundingClientRect();
    const sectionTop = sectionRect.top;
    const windowHeight = window.innerHeight;
    
    if (sectionTop < windowHeight * 0.6) {
      statBoxes.forEach((box, index) => {
        setTimeout(() => {
          if (!box.classList.contains('animate')) {
            box.classList.add('animate');
            
            const numberElement = box.querySelector('.stat-number');
            const target = parseInt(box.dataset.target);
            const suffix = box.dataset.suffix || '';
            
            animateCounter(numberElement, target, suffix);
          }
        }, index * 200);
      });
    }
  }

  let statsAnimationFrame;
  function throttledStatsAnimation() {
    if (statsAnimationFrame) return;
    statsAnimationFrame = requestAnimationFrame(() => {
      handleStatsAnimation();
      statsAnimationFrame = null;
    });
  }

  window.addEventListener('scroll', throttledStatsAnimation);
  window.addEventListener('load', handleStatsAnimation);
  window.addEventListener('resize', handleStatsAnimation);
}