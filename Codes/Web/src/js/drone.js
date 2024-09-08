// Custom Shader Material for Particles
const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
        color: { value: new THREE.Color(0x00aaff) }
    },
    vertexShader: `
        uniform float time;
        varying vec3 vPosition;
        void main() {
            vPosition = position;
            gl_PointSize = 2.0;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 color;
        void main() {
            float distanceToCenter = length(gl_PointCoord - vec2(0.5, 0.5));
            if (distanceToCenter > 0.5) {
                discard;
            }
            gl_FragColor = vec4(1,0.588,0.07, 1.0);
        }
    `,
    transparent: true
});
const modelInitialX = 0;
const modelInitialY = -90;
const modelInitialZ = 20;

const loader = new THREE.GLTFLoader();
let particles;
loader.load('https://ewenmorvan.fr/other/Proiect_Flying_wing.glb', function (gltf) {
    const model = gltf.scene;
    model.traverse(function (child) {
        if (child.isMesh) {
            const geometry = child.geometry;
            particles = new THREE.Points(geometry, particleMaterial);
            particles.scale.set(0.0002, 0.0002, 0.0002);
            particles.position.set(0,0,1.5);
            // particles.rotation.set(THREE.MathUtils.degToRad(modelInitialX),THREE.MathUtils.degToRad(modelInitialY),THREE.MathUtils.degToRad(modelInitialZ));
            scene.add(particles);
        }
    });
});

function setRotation(pitch, roll, yaw) {
    scene.rotation.x = pitch;
    scene.rotation.z = roll;
    scene.rotation.y = yaw;
}

function handleOrientation(event) {
    const alpha = event.alpha ? THREE.MathUtils.degToRad(event.alpha) : 0; // Z-axis
    const beta = event.beta ? THREE.MathUtils.degToRad(event.beta) : 0; // X-axis
    const gamma = event.gamma ? THREE.MathUtils.degToRad(event.gamma) : 0; // Y-axis

    // Convert to quaternion
    const euler = new THREE.Euler(beta, gamma, alpha, 'YZX');
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(euler);

    // Apply quaternion rotation to particles
    if(particles){
        particles.quaternion.copy(quaternion);
    }
}

window.addEventListener('deviceorientation', handleOrientation, true);