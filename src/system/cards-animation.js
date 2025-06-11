export function initCardsAnimation() {
  function handleCardsAnimation() {
    const section = document.querySelector('.section-3');
    const cards = document.querySelectorAll('.section-3 .card');
    
    if (!section || cards.length === 0) return;

    const sectionRect = section.getBoundingClientRect();
    const sectionTop = sectionRect.top;
    const windowHeight = window.innerHeight;
    
    // Calculate overall scroll progress through section
    const scrollProgress = Math.max(0, Math.min(1, 
      (windowHeight - sectionTop) / (sectionRect.height)
    ));

    // Animate each card sequentially
    cards.forEach((card, index) => {
      // Each card animation takes 25% of the total scroll
      const cardStartProgress = index * 0.25;
      const cardEndProgress = cardStartProgress + 0.25;
      
      // Calculate this card's progress
      const cardProgress = Math.max(0, Math.min(1,
        (scrollProgress - cardStartProgress) / (cardEndProgress - cardStartProgress)
      ));
      
      // Initial and final heights
      const maxHeight = 400;
      const minHeight = 200;
      
      // Calculate current height
      const currentHeight = maxHeight - (cardProgress * (maxHeight - minHeight));
      
      // Apply height
      card.style.height = `${currentHeight}px`;
    });
  }

  // Add event listeners
  window.addEventListener('scroll', handleCardsAnimation, { passive: true });
  window.addEventListener('resize', handleCardsAnimation);
  window.addEventListener('load', handleCardsAnimation);
}