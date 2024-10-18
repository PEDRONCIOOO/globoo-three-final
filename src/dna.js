import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const manager = new THREE.LoadingManager();
manager.onLoad = () => {
    setTimeout(() => {
        document.querySelector(".loader-container").classList.add("loaded")
    }, 200);
}
const gltfLoader = new GLTFLoader(manager);

const modelUrl = "/dna_vr_interactive_animation.glb"

function loadDNAModel() {
    return new Promise((resolve, reject) => {
        gltfLoader.load(modelUrl, (gltf) => {
            const dna = gltf.scene;
            dna.position.set(0, 0, -4.5)
            dna.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (['polySurface56_Base_Material_0', 'polySurface56_Fita_Material_0'].includes(child.name)) {
                        child.material = new THREE.MeshPhysicalMaterial({
                            metalness: 0.2,
                            color: "#38c0ea",
                            roughness: 0.35
                        })
                    }
                }
            })
            resolve(dna)
        }, undefined, reject)
    })
}

export { loadDNAModel };