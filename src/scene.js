import * as THREE from 'three';
import { sizes, initSizes } from './system/sizes';
import { initResizeEventListener } from './system/resize';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer, RenderPass } from 'postprocessing';
import { Billboard, Text } from '@pmndrs/vanilla';
import { MeshTransmissionMaterial } from './MeshTransmissionMaterial';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { loadDNAModel } from './dna';
import Float from './Float';
import { cameraRig } from './camreaRig';
import { cameraAnimation,cameraTarget, isScrolling } from './cameraAnimation';
import { initEffect } from './effect';
import { createParticles } from './particles';

function initScene() {
    console.log('initScene');

    const canvas = document.getElementById('webgl');
    initSizes(canvas);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#cee7ff')
    const envMapUrl = '/royal_esplanade_1k.hdr' // 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/equirectangular/royal_esplanade_1k.hdr'
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
    // scene.add(ambientLight);
    const light = new THREE.DirectionalLight(0x0000ff, 1);
    light.position.set(0, 2, 4);
    scene.add(light);

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

    // capsule
    const capsule = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.9, 2.5, 4, 32),
    )
    capsule.material = Object.assign(new MeshTransmissionMaterial(10), {
        clearcoat: 1,
        clearcoatRoughness: 0,
        transmission: 0.95,
        chromaticAberration: 0.03,
        anisotrophicBlur: 0.1,
        // Set to > 0 for diffuse roughness
        roughness: 0.05,
        thickness: 1.2,
        ior: 1.35,
        // Set to > 0 for animation
        distortion: 0.1,
        distortionScale: 0.2,
        temporalDistortion: 0.2
    })
    // dna
    let dna = new THREE.Group();
    loadDNAModel().then((model) => {
        console.log('dna', model);
        dna.add(model);
        dna.scale.set(0.105, 0.105, 0.105)
        dna.position.set(0, -1.7, 0.0)
    })
    const floatCapusle = new Float({
        floatIntensity: 4,
        rotationIntensity: 4
    });
    floatCapusle.position.set(0, 0.1, 0);
    floatCapusle.rotation.set(0, 0, Math.PI / 3);
    floatCapusle.add(capsule, dna);
    scene.add(floatCapusle);

    // character
    const billBoard = Billboard({lockX: true});
    const text = Text({
        font:"BigShouldersDisplay-Light.ttf",
        fontSize: 10,
        color: 0x87a8c3,
        fillOpacity: 0.1,
        letterSpacing: -0.05,
        text: "HEALTHY",
    })
    text.mesh.position.set(0, 0, -2)
    billBoard.group.add(text.mesh);
    scene.add(billBoard.group);

    // particles
    const particles = createParticles({ particlesCount: 100 });
    scene.add(particles.group);

    initResizeEventListener([camera], [renderer, composer]);

    const clock = new THREE.Clock();
    let delta = 0;
    const render = (t) => {
        delta = clock.getDelta();

        dna.rotation.y += delta;
        dna.rotation.y %= Math.PI * 2;

        // capsule.material.time = t / 1000;
        billBoard.update(camera);
        floatCapusle.update();
        particles.update();

        isScrolling && camera.lookAt(cameraTarget);
        !isScrolling && updateCameraRig(delta);
        
        // renderer.render(scene, camera);
        composer.render();

        requestAnimationFrame(render);
    }

    render();
}

export { initScene };
