import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PerspectiveCamera, Vector3 } from "three";

gsap.registerPlugin(ScrollTrigger);

let isScrolling = false;
let cameraTarget = new Vector3(0, 0, 0);
let currentCamera = null;
let cofreModel = null;
let animationState = 'closed';

// Track scroll state
window.addEventListener("scroll", function() {
    let scrollDistanceY = window.scrollY;
    isScrolling = scrollDistanceY > 0;
});

// Function to trigger cofre animation based on scroll
function triggerCofreAnimation(state) {
    if (window.toggleCofreAnimation && animationState !== state) {
        window.toggleCofreAnimation();
        animationState = state;
    }
}

function aboutCameraAnimation(camera = new PerspectiveCamera(), cofre = null) {
    currentCamera = camera;
    cofreModel = cofre;
    
    const tl = gsap.timeline();

    // SEÇÃO 1 (Hero) - Posição inicial: Cofre à direita
    tl.set(camera.position, { x: 9, y: 1, z: -6 })
    .set(cameraTarget, { x: 0, y: 0, z: 0 })

    // SEÇÃO 1 para SEÇÃO 2 - Transição e abrir o cofre
    .fromTo(
        camera.position,
        { x: 9, y: 1, z: -6 },
        {
            x: 7, y: 2, z: 1, // Posição final da câmera
            ease: "power1.inOut",
            duration: 1,
            scrollTrigger: {
                trigger: ".section-about-2",
                start: "top bottom",
                end: "top center",
                scrub: 0.5,
                onEnter: () => {
                    // Abrir cofre quando chegar na seção 2
                    if (animationState === 'closed') {
                        setTimeout(() => triggerCofreAnimation('opening'), 700);
                    }
                },
            },
        }
    )
    .fromTo(
        cameraTarget,
        { x: 0, y: 0, z: 0 },
        {
            x: -1, y: 0.5, z: -6, // Focar no cofre
            ease: "power1.inOut",
            duration: 1,
            scrollTrigger: {
                trigger: ".section-about-2",
                start: "top bottom",
                end: "top center",
                scrub: 0.5,
            },
        },
        "<" // Executar ao mesmo tempo que a animação da câmera
    )
    .fromTo(
        cameraTarget,
        { x: -1, y: 0.5, z: -6 },
        {
            x: 0, y: 0, z: 0, // Voltar ao foco original
            ease: "power1.inOut",
            duration: 1,
            scrollTrigger: {
                trigger: ".section-about-4",
                start: "top center",
                end: "top top",
                scrub: 0.5,
                onLeaveBack: () => {
                    // Fechar cofre quando voltar para a seção 1
                    if (animationState === 'opening') {
                        setTimeout(() => triggerCofreAnimation('closing'), 700);
                    }
                },
            },
        }
    )
    .fromTo(
        camera.position,
        { x: 7, y: 2, z: 1 },
        {
            x: 9, y: 1, z: -6, // Voltar para a posição inicial
            ease: "power1.inOut",
            duration: 1,
            scrollTrigger: {
                trigger: ".section-about-4",
                start: "top center",
                end: "top top",
                scrub: 0.5,
            },
        }
    )

    // Fade out da seção 1
    .to(
        ".section-about-1 .wrapper-about-1",
        {
            opacity: 0,
            y: -50,
            scrollTrigger: {
                trigger: ".section-about-2",
                start: "top 80%",
                end: "top 60%",
                scrub: 0.5,
            },
        }
    )

    // Fade in da seção 2
    .fromTo(
        ".section-about-2 .wrapper",
        { opacity: 0, y: 50 },
        {
            opacity: 1,
            y: 0,
            scrollTrigger: {
                trigger: ".section-about-2",
                start: "top 70%",
                end: "top 50%",
                scrub: 0.5,
            },
        }
    );

    return tl;
}

export { aboutCameraAnimation, cameraTarget, isScrolling };