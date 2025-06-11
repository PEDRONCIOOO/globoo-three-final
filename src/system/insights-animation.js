import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initInsightsAnimation() {
  const cards = document.querySelectorAll('.insight-card');
  
  // GSAP reveal animation
  gsap.from('.insight-title', {
    scrollTrigger: {
      trigger: '.section-3',
      start: 'top center',
      toggleActions: 'play none none reverse'
    },
    y: 50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });

  // Cards stagger reveal
  gsap.from(cards, {
    scrollTrigger: {
      trigger: '.insights-grid',
      start: 'top center+=100',
      toggleActions: 'play none none reverse'
    },
    y: 100,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out'
  });

  // Optimized card hover effect using transforms
  cards.forEach(card => {
    let rect = card.getBoundingClientRect();
    let mouseX = 0;
    let mouseY = 0;
    let rafId = null;

    function updateCardTransform() {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateY = ((mouseX - centerX) / centerX) * 10;
      const rotateX = -((mouseY - centerY) / centerY) * 10;

      card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(1.02, 1.02, 1.02)
      `;

      rafId = null;
    }

    card.addEventListener('mousemove', (e) => {
      rect = card.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      // Throttle transform updates
      if (!rafId) {
        rafId = requestAnimationFrame(updateCardTransform);
      }

      // Update gradient position less frequently
      card.style.setProperty('--x', `${(mouseX / rect.width) * 100}%`);
      card.style.setProperty('--y', `${(mouseY / rect.height) * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      
      gsap.to(card, {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  });

  // Animate numbers when in view
  cards.forEach(card => {
    const numberElement = card.querySelector('.stat-number');
    const finalNumber = parseFloat(numberElement.textContent);
    
    ScrollTrigger.create({
      trigger: card,
      start: 'top center+=100',
      onEnter: () => {
        gsap.fromTo(numberElement, {
          textContent: 0
        }, {
          duration: 2,
          textContent: finalNumber,
          roundProps: 'textContent',
          ease: 'power1.inOut',
          snap: { textContent: 0.1 }
        });
      }
    });
  });
}