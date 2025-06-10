export function initCardsAnimation() {
  function handleStickyCardsAnimation() {
    const cards = document.querySelectorAll('.section-3 .card');
    const section3 = document.querySelector('.section-3');
    
    if (!section3 || cards.length === 0) return;
    
    const sectionRect = section3.getBoundingClientRect();
    const sectionTop = sectionRect.top;
    const sectionHeight = sectionRect.height;
    const windowHeight = window.innerHeight;
    
    // Progresso simples
    const scrollProgress = Math.max(0, Math.min(1, -sectionTop / (sectionHeight - windowHeight)));
    
    cards.forEach((card, index) => {
      // Cards diminuem altura em sequência
      const cardStart = index * 0.01;
      const cardEnd = cardStart + 0.25;
      
      const cardProgress = Math.max(0, Math.min(1, (scrollProgress - cardStart) / (cardEnd - cardStart)));
      
      if (cardProgress > 0) {
        // Apenas diminuir altura
        const heightScale = 1 - (cardProgress * 0.7); // Reduz até 30% da altura
        const newHeight = 400 * heightScale; // Altura base de 400px
        
        card.style.transform = `translate(-50%, -50%)`;
        card.style.height = `${newHeight}px`;
        card.style.opacity = '1';
        card.style.filter = 'none';
      } else {
        // Reset - altura normal
        card.style.transform = 'translate(-50%, -50%)';
        card.style.height = '400px';
        card.style.opacity = '1';
        card.style.filter = 'none';
      }
    });
  }

  // Event listeners
  window.addEventListener('scroll', handleStickyCardsAnimation);
  window.addEventListener('load', handleStickyCardsAnimation);
}