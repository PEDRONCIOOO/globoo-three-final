import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PerspectiveCamera, Vector3 } from "three";

gsap.registerPlugin(ScrollTrigger);
const cameraTarget = new Vector3(0, -0.1, 0)

let isScrolling = false;
window.addEventListener("scroll", function() {
    let scrollDistanceY = window.scrollY;
    if(scrollDistanceY > 0) {
        isScrolling = true;
    } else {
        isScrolling = false;
    }
});

function cameraAnimation(camera = new PerspectiveCamera()) {
    const tl = gsap.timeline();

    // Section 1 to Section 2 transition
    tl.fromTo(
        camera.position,
        { x: 0, y: -0.1, z: 6 },
        {
            x: 2.56,
            y: -1.01,
            z: 2,
            ease: "power1.inOut",
            scrollTrigger: {
                trigger: ".section-2",
                start: "top bottom",
                end: "bottom bottom",
                scrub: 0.5,
            },
        }
    );
    
    tl.fromTo(
        cameraTarget,
        {
            x: 0,
            y: -0.1,
            z: 0,
        },
        {
            x: -4,
            y: 0,
            z: 0,
            ease: "power1.inOut",
            scrollTrigger: {
                trigger: ".section-2",
                start: "top bottom",
                end: "bottom bottom",
                scrub: 0.5,
            },
        },
        "<"
    )
    // Fade out section-1 when entering section-2
    .to(
        ".section-1 .wrapper",
        {
            opacity: 0,
            scrollTrigger: {
                trigger: ".section-2",
                start: "top bottom",
                end: "top 70%",
                scrub: 0.5,
            },
        },
        "<"
    )
    
    // Section 2 to Section 3 transition
    .fromTo(
        camera.position,
        { x: 2.56, y: -1.01, z: 2 },
        {
            x: 0,
            y: -1.01,
            z: 5,
            ease: "power2.inOut",
            immediateRender: false,
            scrollTrigger: {
                trigger: ".section-3",
                start: "top bottom",
                end: "bottom bottom",
                scrub: 0.5,
            },
        }
    )
    .fromTo(
        cameraTarget,
        { x: -4, y: 0, z: 0 },
        {
            x: 4,
            y: 0,
            z: 0,
            ease: "power2.inOut",
            immediateRender: false,
            scrollTrigger: {
                trigger: ".section-3",
                start: "top bottom",
                end: "bottom bottom",
                scrub: 0.5,
            },
        }
    )
    // Fade out section-2 when entering section-3
    .to(
        ".section-2",
        {
            opacity: 0.3,
            scrollTrigger: {
                trigger: ".section-3",
                start: "top 80%",
                end: "top 60%",
                scrub: 0.5,
            },
        }
    )
    
    // Section 3 to Section 4 transition
    .fromTo(
        camera.position,
        { x: 0, y: -1.01, z: 5 },
        {
            x: -3,
            y: 0.5,
            z: 4,
            ease: "power2.inOut",
            immediateRender: false,
            scrollTrigger: {
                trigger: ".section-4",
                start: "top bottom",
                end: "bottom bottom",
                scrub: 0.5,
            },
        }
    )
    .fromTo(
        cameraTarget,
        { x: 4, y: 0, z: 0 },
        {
            x: 13,
            y: 0.5,
            z: 0,
            ease: "power2.inOut",
            immediateRender: false,
            scrollTrigger: {
                trigger: ".section-4",
                start: "top bottom",
                end: "bottom bottom",
                scrub: 0.5,
            },
        }
    )
    // Fade out section-3 when entering section-4
    .to(
        ".section-3",
        {
            opacity: 0.3,
            scrollTrigger: {
                trigger: ".section-4",
                start: "top 80%",
                end: "top 60%",
                scrub: 0.5,
            },
        }
    )
    // Animate section-4 content in
    .fromTo(
        ".section-4 .wrapper",
        {
            opacity: 0,
            y: 50,
        },
        {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".section-4",
                start: "top 70%",
                end: "top 50%",
                scrub: 0.5,
            },
        }
    );

    return tl;
}

export { cameraAnimation, cameraTarget, isScrolling };
