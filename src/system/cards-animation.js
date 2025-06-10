export function initCardsAnimation() {
  function handleCardAnimation() {
    const cards = document.querySelectorAll('.section-3 .card');
    const section3 = document.querySelector('.section-3');
    
    if (!section3 || cards.length === 0) return;
    
    const sectionRect = section3.getBoundingClientRect();
    const sectionTop = sectionRect.top;
    const sectionHeight = sectionRect.height;
    const windowHeight = window.innerHeight;
    
    const sectionInView = sectionTop < windowHeight && (sectionTop + sectionHeight) > 0;
    
    if (!sectionInView) return;
    
    const scrollProgress = Math.max(0, Math.min(1, (windowHeight - sectionTop) / (windowHeight * 2)));
    
    cards.forEach((card, index) => {
      const delay = index * 0.15;
      const cardProgress = Math.max(0, Math.min(1, (scrollProgress - delay) / (1 - delay)));
      
      if (cardProgress > 0) {
        card.classList.add('visible');
      }
      
      if (scrollProgress > 0.4 + (index * 0.1)) {
        card.classList.add('compressed');
      } else {
        card.classList.remove('compressed');
      }
      
      const scale = 1 - (cardProgress * 0.02);
      const rotateY = cardProgress * 2;
      
      card.style.transform = `
        translateY(${(1 - cardProgress) * 40}px) 
        scale(${scale}) 
        rotateY(${rotateY}deg)
      `;
    });
  }

  let animationFrame;
  function throttledCardAnimation() {
    if (animationFrame) return;
    animationFrame = requestAnimationFrame(() => {
      handleCardAnimation();
      animationFrame = null;
    });
  }

  window.addEventListener('scroll', throttledCardAnimation);
  window.addEventListener('load', handleCardAnimation);
  window.addEventListener('resize', handleCardAnimation);
}