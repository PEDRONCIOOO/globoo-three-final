import { initAboutScene } from './src/aboutScene.js';

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the 3D scene (which will also initialize crypto display)
    initAboutScene();
});