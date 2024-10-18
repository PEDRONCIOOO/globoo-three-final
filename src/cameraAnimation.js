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
    );

    return tl;
}

export { cameraAnimation, cameraTarget, isScrolling };
