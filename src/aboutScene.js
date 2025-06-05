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
let isAnimationPlayed = false; // Track if animation has been played
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
                
                // Store model reference for click detection
                cofreModel = model;
                
                // Check for animations but DON'T play them yet
                if (gltf.animations && gltf.animations.length > 0) {
                    console.log('Found animations:', gltf.animations.length);
                    
                    // Create animation mixer
                    mixer = new THREE.AnimationMixer(model);
                    
                    // Setup animations but don't play them
                    gltf.animations.forEach((clip, index) => {
                        console.log(`Animation ${index}:`, clip.name, 'Duration:', clip.duration);
                        
                        const action = mixer.clipAction(clip);
                        
                        // Animation settings - play only once
                        action.setLoop(THREE.LoopOnce); // Play only once
                        action.clampWhenFinished = true; // Stay at final frame
                        action.enable = true;
                        
                        // DON'T start the animation yet
                        // action.play(); <- Remove this
                        
                        actions.push(action);
                    });
                    
                    console.log('Animations prepared (not started yet)');
                } else {
                    console.log('No animations found in the GLB model');
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
            (progress) => {
                console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
            },
            reject
        );
    });
}

// Function to play animation once
function playCofreAnimation() {
    if (!isAnimationPlayed && actions.length > 0) {
        console.log('Playing cofre animation...');
        
        actions.forEach(action => {
            action.reset(); // Reset to beginning
            action.play(); // Start animation
        });
        
        isAnimationPlayed = true;
        
        // Optional: Add visual feedback
        if (cofreModel) {
            // Flash effect
            const originalEmissive = new THREE.Color();
            cofreModel.traverse((child) => {
                if (child.isMesh && child.material) {
                    originalEmissive.copy(child.material.emissive);
                    child.material.emissive.setHex(0x4290c8);
                    
                    // Fade back to normal
                    setTimeout(() => {
                        child.material.emissive.copy(originalEmissive);
                    }, 200);
                }
            });
        }
    } else if (isAnimationPlayed) {
        console.log('Animation already played!');
    }
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

    console.log('Criptomoedas scene initialization started...');

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
    camera.position.set(10, 3, 8);

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
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x4290c8, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x4290c8, 1.2);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x00d4ff, 1.5, 50);
    pointLight1.position.set(-10, 5, -10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4290c8, 1.2, 50);
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
        console.log('Crypto safe model loaded', criptoModel);
        mainModel.add(criptoModel);
        
        // DEBUG: Add bounding box helper to visualize clickable area
        const box = new THREE.Box3().setFromObject(cofreModel);
        const helper = new THREE.Box3Helper(box, 0xff0000);
        scene.add(helper);
        console.log('Bounding box added for debugging');
        
        console.log('CofreModel ready for clicking:', cofreModel);
        console.log('Model children count:', cofreModel.children.length);
        
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
        cofreModel = fallbackMesh; // Set fallback as clickable
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
        size: 25,
        scale: 0.8,
        color: 0x4290c8
    });
    scene.add(particles.group);

    // Click event listener with debugging
    canvas.addEventListener('click', (event) => {
        console.log('Canvas clicked!'); // First check - is the canvas receiving clicks?
        
        // Calculate mouse position in normalized device coordinates
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        console.log('Mouse position:', mouse.x, mouse.y); // Check mouse coordinates
        
        // Cast ray from camera through mouse position
        raycaster.setFromCamera(mouse, camera);
        console.log('Raycaster set up'); // Check if raycaster is working
        
        // Check for intersections with the cofre
        if (cofreModel) {
            console.log('CofreModel exists:', cofreModel); // Check if model is loaded
            
            const intersects = raycaster.intersectObject(cofreModel, true);
            console.log('Intersections found:', intersects.length); // Check intersections
            
            if (intersects.length > 0) {
                console.log('Cofre clicked! Intersection details:', intersects[0]);
                playCofreAnimation();
                
                // Change cursor temporarily
                canvas.style.cursor = 'pointer';
                setTimeout(() => {
                    canvas.style.cursor = 'grab';
                }, 1000);
            } else {
                console.log('No intersections with cofre');
            }
        } else {
            console.log('CofreModel not loaded yet or is null');
        }
    });

    // Add this simple test right after the canvas addEventListener
    // This should fire regardless of 3D intersections
    canvas.addEventListener('click', (event) => {
        console.log('🔥 CANVAS CLICKED! Event:', event);
        console.log('🔥 Event target:', event.target);
        console.log('🔥 Canvas element:', canvas);
        
        // Rest of your existing click code...
        console.log('Canvas clicked!');
        // ... existing code
    });

    // Also add this to test if the canvas is properly set up
    console.log('🔥 Canvas element found:', canvas);
    console.log('🔥 Canvas dimensions:', canvas.width, 'x', canvas.height);
    console.log('🔥 Canvas style:', canvas.style.cssText);

    // Hover effect for cofre
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        if (cofreModel) {
            const intersects = raycaster.intersectObject(cofreModel, true);
            
            if (intersects.length > 0) {
                canvas.style.cursor = 'pointer';
            } else {
                canvas.style.cursor = 'grab';
            }
        }
    });

    // Resize listener
    initResizeEventListener([camera], [renderer, composer]);

    // Animation loop
    const clock = new THREE.Clock();
    let delta = 0;
    
    const render = (t) => {
        delta = clock.getDelta();

        // Update Blender animations (only if playing)
        if (mixer) {
            mixer.update(delta);
        }

        floatMainModel.update();
        particles.update();
        controls.update();

        // Reduced breathing effect
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