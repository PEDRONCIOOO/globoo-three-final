import * as THREE from 'three';

function createParticles({ particlesCount = 1000, size = 3, scale = 1 }) {
    const particles = {
        group: new THREE.Group(),
        update: () => { }
    };

    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const scales = new Float32Array(particlesCount);
    const randomness = new Float32Array(particlesCount);
    
    // Galaxy parameters
    const radius = 8;
    const branches = 8;
    const spin = 1;
    const randomnessPower = 3;
    
    for (let i = 0; i < particlesCount; i++) {
        // Position
        const i3 = i * 3;
        
        const galaxyRadius = Math.random() * radius;
        const spinAngle = galaxyRadius * spin;
        const branchAngle = (i % branches) / branches * Math.PI * 2;
        
        const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * 0.3 * galaxyRadius;
        const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * 0.3 * galaxyRadius;
        const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * 0.3 * galaxyRadius;
        
        positions[i3] = Math.cos(branchAngle + spinAngle) * galaxyRadius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * galaxyRadius + randomZ;
        
        // Scale
        scales[i] = Math.random();
        
        // Randomness for color variation
        randomness[i] = Math.random();
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    particlesGeometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 1));

    const particlesMaterial = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        transparent: true,
        uniforms: {
            uTime: { value: 0 },
            uSize: { value: size * window.devicePixelRatio }
        },
        vertexShader: `
            uniform float uTime;
            uniform float uSize;
            
            attribute float aScale;
            attribute float aRandomness;
            
            varying vec3 vColor;
            
            void main() {
                /**
                 * Position
                 */
                vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                
                // Rotate
                float angle = atan(modelPosition.x, modelPosition.z);
                float distanceToCenter = length(modelPosition.xz);
                float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
                angle += angleOffset;
                modelPosition.x = cos(angle) * distanceToCenter;
                modelPosition.z = sin(angle) * distanceToCenter;
                
                vec4 viewPosition = viewMatrix * modelPosition;
                vec4 projectedPosition = projectionMatrix * viewPosition;
                gl_Position = projectedPosition;
                
                /**
                 * Size
                 */
                gl_PointSize = uSize * aScale;
                gl_PointSize *= (1.0 / - viewPosition.z);
                
                /**
                 * Color
                 */
                vec3 color = mix(vec3(0.0, 1.0, 1.0), vec3(0.0, 0.5, 1.0), aRandomness);
                vColor = color;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                // Light point pattern
                float strength = distance(gl_PointCoord, vec2(0.5));
                strength = 1.0 - strength;
                strength = pow(strength, 10.0);
                
                // Final color
                vec3 color = mix(vec3(0.0), vColor, strength);
                gl_FragColor = vec4(color, 1.0);
            }
        `
    });

    const points = new THREE.Points(particlesGeometry, particlesMaterial);
    particles.group.add(points);

    // Animation
    const clock = new THREE.Clock();
    particles.update = () => {
        const elapsedTime = clock.getElapsedTime();
        particlesMaterial.uniforms.uTime.value = elapsedTime;
    };

    return particles;
}

export { createParticles };