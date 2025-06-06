import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { initResizeEventListener } from './system/resize.js';
import { createParticles } from './particles';
import Float from './Float';

let scene, camera, renderer, composer;
let mainModel;
let isScrolling = false;
let cameraTarget = new THREE.Vector3(0, 0, 0);
let mixer; // Animation mixer for Blender animations
let actions = []; // Store animation actions
let animationState = 'closed'; // Track animation state: 'closed', 'opening', 'open', 'closing'
let cofreModel; // Store cofre model for click detection
let raycaster, mouse; // For click detection

// Add these variables at the top with your other declarations
let interiorLight; // Light inside the cofre
let coinSpotlight; // Light to illuminate falling coins
let coinMeshes = []; // Store coin meshes for special effects
let coinGlowMeshes = []; // Store glow meshes for coins

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
                
                // Find and enhance coin meshes
                model.traverse((child) => {
                    if (child.isMesh) {
                        // Check if this is a coin mesh (by name or material)
                        const name = child.name.toLowerCase();
                        if (name.includes('bitcoin') || 
                            name.includes('etherium') || 
                            name.includes('coin') ||
                            name.includes('curve')) {
                            
                            // Store reference to original coin meshes
                            coinMeshes.push(child);
                            
                            // Keep original material unchanged
                            if (child.material) {
                                child.material.metalness = 0.9;
                                child.material.roughness = 0.1;
                                // DON'T change color or emissive - keep original
                            }
                            
                            // Create a glow mesh around the coin (outline effect)
                            const glowGeometry = child.geometry.clone();
                            const glowMaterial = new THREE.MeshBasicMaterial({
                                color: 0x00ffff,
                                transparent: true,
                                opacity: 0, // Start invisible
                                side: THREE.BackSide, // Render from inside out for glow effect
                            });
                            
                            const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
                            glowMesh.scale.setScalar(1.05); // Slightly bigger than original
                            glowMesh.position.copy(child.position);
                            glowMesh.rotation.copy(child.rotation);
                            
                            // Add glow mesh to the same parent as the coin
                            child.parent.add(glowMesh);
                            coinGlowMeshes.push(glowMesh);
                            
                        } else {
                            // Regular cofre materials
                            if (child.material) {
                                child.material.metalness = 0.9;
                                child.material.roughness = 0.1;
                                if (child.material.color) {
                                    child.material.color.multiplyScalar(1.2);
                                }
                            }
                        }
                    }
                });
                
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
                
                resolve(model);
            },
            undefined,
            reject
        );
    });
}

// Function to animate coin glow effect (neon outline)
function animateCoinsGlow(intensity = 1.0) {
    coinGlowMeshes.forEach(glowMesh => {
        if (glowMesh.material) {
            glowMesh.material.opacity = intensity * 0.3; // Max opacity of 30%
            
            // Add pulsing effect during animation
            if (intensity > 0) {
                const pulseAnimation = () => {
                    const time = Date.now() * 0.003; // Slower pulse
                    const pulse = (Math.sin(time) + 1) * 0.5; // 0 to 1
                    
                    // Pulse the opacity and scale
                    const finalOpacity = intensity * 0.3 * (0.5 + pulse * 0.5);
                    const finalScale = 1.05 + (pulse * 0.02); // Scale between 1.05 and 1.07
                    
                    glowMesh.material.opacity = finalOpacity;
                    glowMesh.scale.setScalar(finalScale);
                    
                    if (animationState === 'opening' || animationState === 'closing') {
                        requestAnimationFrame(pulseAnimation);
                    }
                };
                pulseAnimation();
            } else {
                // Turn off glow
                glowMesh.material.opacity = 0;
                glowMesh.scale.setScalar(1.05);
            }
        }
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

        // TURN ON INTERIOR LIGHTS AND COIN GLOW when opening
        setTimeout(() => {
            // Gradually increase interior lighting
            const lightTween = setInterval(() => {
                if (interiorLight.intensity < 1.5) {
                    interiorLight.intensity += 0.1;
                    coinSpotlight.intensity += 0.08;
                    window.treasureGlow.intensity += 0.06;
                } else {
                    clearInterval(lightTween);
                }
            }, 50);
            
            // Make coins start glowing when they begin to fall
            animateCoinsGlow(0.8); // Reduced intensity for subtle glow
        }, 800);
        
        // Set state to 'open' when animation finishes
        setTimeout(() => {
            if (animationState === 'opening') {
                animationState = 'open';
                // Keep coins glowing while open
                animateCoinsGlow(0.5); // Gentle glow when open
            }
        }, getMaxAnimationDuration() * 1000);
        
    } else if (animationState === 'open') {
        // Play animation backward with PROPER SEQUENCING
        animationState = 'closing';

        // TURN OFF INTERIOR LIGHTS AND COIN GLOW when closing starts
        const lightFadeOut = setInterval(() => {
            if (interiorLight.intensity > 0.1) {
                interiorLight.intensity -= 0.1;
                coinSpotlight.intensity -= 0.08;
                window.treasureGlow.intensity -= 0.06;
            } else {
                interiorLight.intensity = 0;
                coinSpotlight.intensity = 0;
                window.treasureGlow.intensity = 0;
                clearInterval(lightFadeOut);
            }
        }, 30);
        
        // Make coins glow brighter as they "return" to cofre
        animateCoinsGlow(1.0); // Slightly brighter when closing
        
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
        }, coinDuration * 850);
        
        // Set state to 'closed' when all animations finish
        setTimeout(() => {
            if (animationState === 'closing') {
                animationState = 'closed';
                // Turn off coin glow when fully closed
                animateCoinsGlow(0);
            }
        }, getMaxAnimationDuration() * 850);
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

    // Camera setup - POSIÇÃO FIXA
    camera = new THREE.PerspectiveCamera(
        32,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(9, 1, -6);
    camera.lookAt(0, 0, 0); // Olhar sempre para o centro

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

    // REMOVIDO: Todos os controles OrbitControls

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x4290c8, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x4290c8, 0.5);
    directionalLight.position.set(6, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1084;
    directionalLight.shadow.mapSize.height = 1084;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x00d4ff, 1.5, 0.5);
    pointLight1.position.set(-10, 5, -10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4290c8, 1.2, 0.5);
    pointLight2.position.set(10, -5, 10);
    scene.add(pointLight2);

    // ========== INTERIOR COFRE LIGHTING ==========
    
    // Interior light - starts OFF, turns ON when cofre opens
    interiorLight = new THREE.PointLight(0x4290c8, 0, 1); // Changed to blue instead of cyan for contrast
    interiorLight.position.set(-1, 1, -2); // Position inside the cofre
    interiorLight.castShadow = true;
    scene.add(interiorLight);

    // Coin spotlight - illuminates falling coins specifically
    coinSpotlight = new THREE.SpotLight(0x00ffff, 0, 25, Math.PI * 0.3, 0.5); // Cyan spotlight for coins
    coinSpotlight.position.set(-1, 4, -2); // Above the cofre
    coinSpotlight.target.position.set(-1, 0, -2); // Target where coins fall
    coinSpotlight.castShadow = true;
    scene.add(coinSpotlight);
    scene.add(coinSpotlight.target);

    // Additional coin glow light
    const coinGlow = new THREE.PointLight(0x00ffff, 0, 3); // Cyan glow for coins
    coinGlow.position.set(-1, 1.5, -2); // Inside cofre, focused on coin area
    scene.add(coinGlow);

    // Store reference for animation control
    window.treasureGlow = coinGlow; // Make it accessible

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

    // Click event listener - SEM MUDANÇA DE CURSOR
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
                }
            }
        }
    });

    // REMOVIDO: Hover effect que mudava o cursor

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
        // REMOVIDO: controls.update();

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