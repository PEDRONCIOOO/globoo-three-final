// Dropdown Menu Animation (versão sem GSAP)
class DropdownAnimation {
  constructor() {
    this.dropdownContainer = document.querySelector('.dropdown-container');
    this.dropdownTrigger = document.querySelector('.dropdown-trigger');
    this.dropdownMenu = document.querySelector('.dropdown-menu');
    this.dropdownItems = document.querySelectorAll('.dropdown-item');
    this.dropdownArrow = document.querySelector('.dropdown-arrow');
    this.overlay = null;
    
    this.isOpen = false;
    
    this.init();
  }

  init() {
    if (!this.dropdownContainer || !this.dropdownTrigger || !this.dropdownMenu) {
      console.warn('Dropdown elements not found');
      return;
    }

    this.createOverlay();
    this.setupEventListeners();
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'dropdown-overlay';
    document.body.appendChild(this.overlay);
  }

  setupEventListeners() {
    // Toggle dropdown on click
    this.dropdownTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });

    // Close dropdown when clicking overlay
    this.overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });

    // Close dropdown on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.dropdownContainer.contains(e.target) && this.isOpen) {
        this.close();
      }
    });

    // Prevent dropdown from closing when clicking inside menu
    this.dropdownMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Handle dropdown item clicks
    this.dropdownItems.forEach(item => {
      item.addEventListener('click', (e) => {
        // Permitir navegação normal
        console.log('Navigating to:', item.href);
        // Fechar o dropdown após click
        setTimeout(() => {
          this.close();
        }, 100);
      });
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.dropdownContainer.classList.add('active');
    this.overlay.classList.add('active');

    // Stagger animation for items
    this.dropdownItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0) translateX(0)';
      }, index * 50);
    });
  }

  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.dropdownContainer.classList.remove('active');
    this.overlay.classList.remove('active');

    // Reset items
    this.dropdownItems.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(10px) translateX(-10px)';
    });
  }

  // Clean up method
  destroy() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}

// Auto-initialize when DOM is ready
let dropdownInstance = null;

export function initDropdownAnimation() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      dropdownInstance = new DropdownAnimation();
    });
  } else {
    dropdownInstance = new DropdownAnimation();
  }
  
  return dropdownInstance;
}

// Export for manual control
export { DropdownAnimation };