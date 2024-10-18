import * as THREE from 'three';
import { Noise } from 'noisejs';

const noise = new Noise(Math.random());

function createParticles({ particlesCount = 50, size = 75, scale = 40, color = '#ffffff' }) {
    const particles = {
        group: new THREE.Group(),
        update: () => { }
    };

    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const speeds = new Float32Array(particlesCount);
    for (let i = 0; i < particlesCount; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 10.5
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10.5
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10.5

        speeds[i] = 1.25 + Math.random() * 4.2
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));

    const particlesMaterial = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        uniforms: {
            size: { value: size },
            scale: { value: scale },
            color: { value: new THREE.Color(color) }
        },
        vertexShader: THREE.ShaderLib.points.vertexShader,
        fragmentShader: `
            uniform vec3 color;
            void main() {
              vec2 xy = gl_PointCoord.xy - vec2(0.5);
              float ll = length(xy);
              gl_FragColor = vec4(color, step(ll, 0.5) * 0.25); // 边缘半透明化精灵点
            }
          `
    })



    const points = new THREE.Points(particlesGeometry, particlesMaterial);
    particles.group.add(points);

    const clock = new THREE.Clock();
    particles.update = () => {
        const positions = particlesGeometry.attributes.position.array;
        const speeds = particlesGeometry.attributes.speed.array;

        for (let i = 0; i < particlesCount; i++) {
            const index = i * 3
            const time = clock.getElapsedTime()

            const noiseValueX = noise.simplex3(
                positions[index] * 0.5,
                positions[index + 1] * 0.5,
                time * 0.2
            )
            const noiseValueY = noise.simplex3(
                positions[index + 1] * 0.5,
                positions[index + 2] * 0.5,
                time * 0.2
            )
            const noiseValueZ = noise.simplex3(
                positions[index + 2] * 0.5,
                positions[index] * 0.5,
                time * 0.2
            )

            positions[index + 0] += noiseValueX * 0.01 * speeds[i]
            positions[index + 1] += noiseValueY * 0.01 * speeds[i]
            positions[index + 2] += noiseValueZ * 0.01 * speeds[i]
        }

        particlesGeometry.attributes.position.needsUpdate = true;
    }

    return particles;
}

export { createParticles };