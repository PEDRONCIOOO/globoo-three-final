import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { initResizeEventListener } from './system/resize.js';
import { createParticles } from './particles';
import Float from './Float';

let scene, camera, renderer, composer, controls;
let mainModel;
let isScrolling = false;
let cameraTarget = new THREE.Vector3(0, 0, 0);
let mixer; // Animation mixer for Blender animations
let actions = []; // Store animation actions
let animationState = 'closed'; // Track animation state: 'closed', 'opening', 'open', 'closing'
let cofreModel; // Store cofre model for click detection
let raycaster, mouse; // For click detection

// Crypto safe model loader with animation support
function loadCriptoModel() {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
            '/cofre.glb',
            (gltf) => {
                const model = gltf.scene;
                model.scale.setScalar(1.2);
                model.position.set(-1, 0, -2)
                
                // Store model reference for click detection
                cofreModel = model;
                
                // Check for animations
                if (gltf.animations && gltf.animations.length > 0) {
                    // Create animation mixer
                    mixer = new THREE.AnimationMixer(model);
                    
                    // Setup animations
                    gltf.animations.forEach((clip) => {
                        const action = mixer.clipAction(clip);
                        
                        // Animation settings for reversible animation
                        action.setLoop(THREE.LoopOnce);
                        action.clampWhenFinished = true;
                        action.enable = true;
                        
                        actions.push(action);
                    });
                }
                
                // Enhance materials
                model.traverse((child) => {
                    if (child.isMesh) {
                        if (child.material) {
                            child.material.metalness = 0.9;
                            child.material.roughness = 0.1;
                            if (child.material.color) {
                                child.material.color.multiplyScalar(1.2);
                            }
                        }
                    }
                });
                
                resolve(model);
            },
            undefined,
            reject
        );
    });
}

// Function to play animation forward or backward with proper sequencing
function toggleCofreAnimation() {
    if (actions.length === 0) return;
    
    if (animationState === 'closed') {
        // Play animation forward (open the cofre)
        animationState = 'opening';
        actions.forEach(action => {
            action.reset();
            action.timeScale = 1; // Normal speed
            action.play();
        });
        
        // Set state to 'open' when animation finishes
        setTimeout(() => {
            if (animationState === 'opening') {
                animationState = 'open';
            }
        }, getMaxAnimationDuration() * 1000);
        
    } else if (animationState === 'open') {
        // Play animation backward with PROPER SEQUENCING
        animationState = 'closing';
        
        // First: Play coin animations (make coins go inside)
        const coinAnimations = actions.filter(action => {
            const name = action.getClip().name.toLowerCase();
            return name.includes('bitcoin') || 
                   name.includes('etherium') || 
                   name.includes('curve') ||
                   name.includes('coin');
        });
        
        // Second: Play door animations (after coins are inside)
        const doorAnimations = actions.filter(action => {
            const name = action.getClip().name.toLowerCase();
            return name.includes('door') || 
                   name.includes('manivela') ||
                   name.includes('handle');
        });
        
        console.log('Coin animations:', coinAnimations.length);
        console.log('Door animations:', doorAnimations.length);
        
        // Start coin animations first
        coinAnimations.forEach(action => {
            action.timeScale = -1; // Reverse speed
            action.paused = false;
            action.play();
        });
        
        // Start door animations after a delay (let coins go in first)
        const coinDuration = Math.max(...coinAnimations.map(action => action.getClip().duration));
        setTimeout(() => {
            doorAnimations.forEach(action => {
                action.timeScale = -1; // Reverse speed
                action.paused = false;
                action.play();
            });
        }, coinDuration * 800); // Start door closing when coins are 80% done
        
        // Set state to 'closed' when all animations finish
        setTimeout(() => {
            if (animationState === 'closing') {
                animationState = 'closed';
            }
        }, getMaxAnimationDuration() * 1000);
    }
    
    // Visual feedback - NO FLASH, just scale effect
    if (cofreModel) {
        // Subtle scale pulse instead of color flash
        const originalScale = mainModel.scale.clone();
        const pulseScale = originalScale.clone().multiplyScalar(1.02); // 2% bigger
        
        mainModel.scale.copy(pulseScale);
        
        // Scale back to normal
        setTimeout(() => {
            mainModel.scale.copy(originalScale);
        }, 200);
    }
}

// Helper function to get the longest animation duration
function getMaxAnimationDuration() {
    if (actions.length === 0) return 1;
    return Math.max(...actions.map(action => action.getClip().duration));
}

// Hide loader function
function hideLoader() {
    const loader = document.querySelector('.loader-container');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
}

export function initAboutScene() {
    const canvas = document.querySelector('#webgl');
    const container = document.querySelector('#webgl-container');

    // Setup raycaster for click detection
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#000');

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        32,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(7, -2, -3);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Controls
    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x4290c8, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x4290c8, 1.2);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1084;
    directionalLight.shadow.mapSize.height = 1084;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x00d4ff, 1.5, 20);
    pointLight1.position.set(-10, 5, -10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4290c8, 1.2, 20);
    pointLight2.position.set(10, -5, 10);
    scene.add(pointLight2);

    // Post-processing
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.8,
        0.6,
        0.7
    );
    bloomPass.threshold = 0.1;
    bloomPass.strength = 2.5;
    bloomPass.radius = 0.8;
    composer.addPass(bloomPass);

    // Main model container
    mainModel = new THREE.Group();

    // Load the crypto safe model
    loadCriptoModel().then((criptoModel) => {
        mainModel.add(criptoModel);
        hideLoader();
    }).catch((error) => {
        console.error('Error loading crypto model:', error);
        // Fallback
        const fallbackGeometry = new THREE.BoxGeometry(2, 2.5, 1.5);
        const fallbackMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4290c8,
            roughness: 0.1,
            metalness: 0.9,
            emissive: 0x001122
        });
        const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
        fallbackMesh.castShadow = true;
        mainModel.add(fallbackMesh);
        cofreModel = fallbackMesh;
        hideLoader();
    });

    // Gentle float animation
    const floatMainModel = new Float({
        floatIntensity: 1,
    });
    floatMainModel.position.set(0, 0, 0);
    floatMainModel.add(mainModel); 
    scene.add(floatMainModel);

    // Particles
    const particles = createParticles({ 
        particlesCount: 1200,
        size: 20,
        scale: 0.8,
        color: 0x4290c8
    });
    scene.add(particles.group);

    // Click event listener
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        if (cofreModel) {
            const intersects = raycaster.intersectObject(cofreModel, true);
            if (intersects.length > 0) {
                // Only allow clicking if not currently animating
                if (animationState === 'closed' || animationState === 'open') {
                    toggleCofreAnimation();
                    
                    // Change cursor temporarily
                    canvas.style.cursor = 'pointer';
                    setTimeout(() => {
                        canvas.style.cursor = 'grab';
                    }, 1000);
                }
            }
        }
    });

    // Hover effect for cofre
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        if (cofreModel) {
            const intersects = raycaster.intersectObject(cofreModel, true);
            canvas.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
        }
    });

    // Resize listener
    initResizeEventListener([camera], [renderer, composer]);

    // Animation loop
    const clock = new THREE.Clock();
    let delta = 0;
    
    const render = (t) => {
        delta = clock.getDelta();

        // Update Blender animations
        if (mixer) {
            mixer.update(delta);
        }

        floatMainModel.update();
        particles.update();
        controls.update();

        // Subtle breathing effect
        const breathe = Math.sin(clock.elapsedTime * 0.3) * 0.01 + 1;
        mainModel.scale.setScalar(breathe);

        isScrolling && camera.lookAt(cameraTarget);
        
        composer.render();
        requestAnimationFrame(render);
    };

    render();

    // Backup loader hide
    setTimeout(() => {
        hideLoader();
    }, 3000);
}