import * as THREE from 'three';
import { sizes, initSizes } from './system/sizes';
import { initResizeEventListener } from './system/resize';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer, RenderPass } from 'postprocessing';
import { Billboard, Text } from '@pmndrs/vanilla';
import { MeshTransmissionMaterial } from './MeshTransmissionMaterial';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Float from './Float';
import { cameraRig } from './camreaRig';
import { cameraAnimation,cameraTarget, isScrolling } from './cameraAnimation';
import { initEffect } from './effect';
import { createParticles } from './particles';

// Add loading manager like in dna.js
const manager = new THREE.LoadingManager();
manager.onLoad = () => {
    setTimeout(() => {
        const loaderContainer = document.querySelector(".loader-container");
        if (loaderContainer) {
            loaderContainer.classList.add("loaded");
        }
    }, 200);
}

function loadPillModel() {
    return new Promise((resolve, reject) => {
        const gltfLoader = new GLTFLoader(manager); // Use the manager here
        const modelUrl = "/G-3D.glb";
        
        gltfLoader.load(modelUrl, (gltf) => {
            const pillModel = gltf.scene;
            // Scale and position the model as needed
            pillModel.scale.set(15, 15, 15); // Adjust scale as needed
            pillModel.position.set(-2.2, -2, 0); // Adjust position as needed
            
            resolve(pillModel);
        }, undefined, reject);
    });
}

function initScene() {
    console.log('initScene');

    const canvas = document.getElementById('webgl');
    initSizes(canvas);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#307275')
    const envMapUrl = '/royal_esplanade_1k.hdr'
    new RGBELoader().load(envMapUrl, (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.environmentIntensity = 2;
        // scene.background = texture;
    })

    const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 500);
    camera.position.set(0, -0.1, 6);
    const { update: updateCameraRig } = cameraRig(camera)
    cameraAnimation(camera)

    const controls = new OrbitControls(camera, canvas);
    controls.enabled = false;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    
    // Replace or modify the existing blue light
    const light = new THREE.DirectionalLight(0x00ffff, 1); // Cyan directional light
    light.position.set(0, 2, 2);
    scene.add(light);
    
    const cyanLight2 = new THREE.PointLight(0x00ffff, 1.5, 8); // Another cyan point light
    cyanLight2.position.set(-1, -1, 1);
    scene.add(cyanLight2);
    

    const renderer = new THREE.WebGLRenderer({
        canvas,
        powerPreference: "high-performance",
        antialias: false,
        stencil: false,
        depth: false,
        alpha: false
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // postprocessing
    const composer = new EffectComposer(renderer, {
        multisampling: 0
    })
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    // effect
    initEffect(composer, camera)

    // Main model (your GLB model)
    let mainModel = new THREE.Group();
    
    // Load the GLB model as the main object
    loadPillModel().then((pillModel) => {
        console.log('main model loaded', pillModel);
        mainModel.add(pillModel);
    }).catch((error) => {
        console.error('Error loading main model:', error);
        // Fallback to original capsule with basic material
        const fallbackCapsule = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.9, 2.5, 4, 32),
            new THREE.MeshStandardMaterial({ 
                color: 0x87a8c3,
                roughness: 0.1,
                metalness: 0.8
            })
        );
        mainModel.add(fallbackCapsule);
    });

    const floatMainModel = new Float({
        floatIntensity: 4,
    });
    floatMainModel.position.set(0, 0.1, 0);
    floatMainModel.add(mainModel); 
    scene.add(floatMainModel);

    // character
    const billBoard = Billboard({lockX: true});
    scene.add(billBoard.group);

    // particles
    const particles = createParticles({ 
        particlesCount: 1000,
        size: 30,
        scale: 1
    });
    scene.add(particles.group);

    initResizeEventListener([camera], [renderer, composer]);

    const clock = new THREE.Clock();
    let delta = 0;
    const render = (t) => {
        delta = clock.getDelta();

        billBoard.update(camera);
        floatMainModel.update();
        particles.update();

        isScrolling && camera.lookAt(cameraTarget);
        !isScrolling && updateCameraRig(delta);
        
        composer.render();
        requestAnimationFrame(render);
    }

    render();
}

export { initScene };
