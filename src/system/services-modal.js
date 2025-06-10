export function initServicesModal() {
  const servicesTrigger = document.getElementById('services-trigger');
  const servicesModal = document.getElementById('services-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const servicesDropdown = document.querySelector('.services-dropdown');
  
  let isModalOpen = false;

  // Função para abrir modal
  function openModal() {
    if (!isModalOpen) {
      isModalOpen = true;
      servicesDropdown.classList.add('active');
      servicesModal.classList.add('active');
      modalOverlay.classList.add('active');
      
      // Animar cards individualmente
      const serviceCards = document.querySelectorAll('.service-card');
      serviceCards.forEach((card, index) => {
        setTimeout(() => {
          card.style.transitionDelay = `${index * 0.1}s`;
        }, 0);
      });
    }
  }

  // Função para fechar modal
  function closeModal() {
    if (isModalOpen) {
      isModalOpen = false;
      servicesDropdown.classList.remove('active');
      servicesModal.classList.remove('active');
      modalOverlay.classList.remove('active');
      
      // Reset transition delays
      const serviceCards = document.querySelectorAll('.service-card');
      serviceCards.forEach(card => {
        card.style.transitionDelay = '0s';
      });
    }
  }

  // Event listeners
  servicesTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    if (isModalOpen) {
      closeModal();
    } else {
      openModal();
    }
  });

  // Fechar ao clicar no overlay
  modalOverlay.addEventListener('click', closeModal);

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) {
      closeModal();
    }
  });

  // Fechar ao clicar fora do modal
  document.addEventListener('click', (e) => {
    if (isModalOpen && 
        !servicesModal.contains(e.target) && 
        !servicesTrigger.contains(e.target)) {
      closeModal();
    }
  });

  // Prevenir fechamento ao clicar dentro do modal
  servicesModal.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}