// Obtenir la hauteur initiale de la fenêtre
let initialHeight = window.innerHeight;

// Create Label Renderer
let labelRenderer = new THREE.CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, initialHeight );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild( labelRenderer.domElement );


let globalUniforms = {
    time: { value: 0 }
};
let label;

// Create a sphere geometry to represent the globe
const geometry = new THREE.SphereGeometry(1, 64, 64);

// Load a texture for the globe
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('https://raw.githubusercontent.com/EwenMorvan/test/main/Codes/Web/src/img/earth/plani.png');
const bumpMap = textureLoader.load('https://raw.githubusercontent.com/EwenMorvan/test/main/Codes/Web/src/img/earth/bump.png');
const cloudsMap = textureLoader.load('https://raw.githubusercontent.com/EwenMorvan/test/main/Codes/Web/src/img/earth/cloud.jpg');
// const texture = textureLoader.load('../Images/earth/plani.png');
// const bumpMap = textureLoader.load('../Images/earth/bump.png');
// const cloudsMap = textureLoader.load('../Images/earth/cloud.jpg');
// Create a material using the loaded texture and bump map
const material = new THREE.MeshPhongMaterial({ 
    map: texture,
    bumpMap: bumpMap,
    bumpScale: 0.02
});

// Create a material for the clouds
const material2 = new THREE.MeshStandardMaterial({ 
    alphaMap: cloudsMap,
    transparent: true // Ajustez cette valeur selon vos besoins
});

// Create a mesh with the geometry and material, then add it to the scene
const globe = new THREE.Mesh(geometry, material);
const globe2 = new THREE.Mesh(geometry, material2);
globe.scale.set(1, 1, 1);
globe2.scale.set(1.005, 1.005, 1.005);

scene.add(globe);
scene.add(globe2);

let galaxyGeometry = new THREE.SphereGeometry(10, 32, 32);
let galaxyMaterial = new THREE.MeshBasicMaterial({
side: THREE.BackSide
});
let galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);

// Load Galaxy Textures
textureLoader.crossOrigin = true;
textureLoader.load(
'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/starfield.png',
function(texture) {
    galaxyMaterial.map = texture;
    scene.add(galaxy);
}
);

// Add a halo to represent the atmosphere using shaders
const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
        vNormal = normalize(normalMatrix * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform vec3 lightDirection;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
        float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        float lightIntensity = max(dot(normalize(vWorldPosition), lightDirection), 0.0);
        gl_FragColor = vec4(0.0, 0.4, 1.0, 1.0) * intensity * lightIntensity;
    }
`;

const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true, // Rendre le matériau transparent
    depthWrite: false, // Empêcher l'écriture dans le tampon de profondeur
    uniforms: {
        lightDirection: { value: new THREE.Vector3(0.8, 1.5, 1).normalize() }
    }
});


const atmosphere = new THREE.Mesh(geometry, atmosphereMaterial);
atmosphere.scale.set(1.25, 1.25, 1.25);
scene.add(atmosphere);


// Initial position of the light (behind the globe)
const initialLightPosition = { x: 0, y: 0, z: -2 };
const finalLightPosition = { x: 1.5, y: 1.5, z: 1 };

const pointLight = new THREE.PointLight(0xffffff, 1.2);
pointLight.position.set(initialLightPosition.x, initialLightPosition.y, initialLightPosition.z);
scene.add(pointLight);

// Convert cartesian coordinates to spherical coordinates
function cartesianToSpherical(x, y, z) {
    const radius = Math.sqrt(x * x + y * y + z * z);
    const theta = Math.acos(z / radius);
    const phi = Math.atan2(y, x);
    return { radius, theta, phi };
}
// Convert latitude and longitude to spherical coordinates
function latLongToSpherical(lat, lon) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return { phi,theta};
}
// Convert spherical coordinates to cartesian coordinates
function sphericalToCartesian(radius, phi, theta,alt) {
    const x = -(radius+alt) * Math.sin(phi) * Math.cos(theta);
    const y = (radius+alt) * Math.cos(phi);
    const z = (radius+alt) * Math.sin(phi) * Math.sin(theta);
    return { x, y, z };
}

// Convert latitude and longitude to cartesian coordinates
function latLongToCartesian(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        return sphericalToCartesian(radius, phi, theta);
}

function animateLight(initialPosition, finalPosition, duration) {
    const startTime = Date.now();
    const initialSpherical = cartesianToSpherical(initialPosition.x, initialPosition.y, initialPosition.z);
    const finalSpherical = cartesianToSpherical(finalPosition.x, finalPosition.y, finalPosition.z);

    function updateLightPosition() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        const t = elapsedTime / (duration * 1000);

        if (t < 1) {
            // Interpolate in spherical coordinates
            const radius = initialSpherical.radius + t * (finalSpherical.radius - initialSpherical.radius);
            const theta = initialSpherical.theta + t * (finalSpherical.theta - initialSpherical.theta);
            const phi = initialSpherical.phi + t * (finalSpherical.phi - initialSpherical.phi);

            const x = radius * Math.sin(theta) * Math.cos(phi);
            const y = radius * Math.sin(theta) * Math.sin(phi);
            const z = radius * Math.cos(theta);

            pointLight.position.set(x, y, z);

            // Update the light direction uniform
            atmosphereMaterial.uniforms.lightDirection.value.set(pointLight.position.x, pointLight.position.y, pointLight.position.z).normalize();

            requestAnimationFrame(updateLightPosition);
        } else {
            // Ensure the final position is exact
            pointLight.position.set(finalPosition.x, finalPosition.y, finalPosition.z);
            atmosphereMaterial.uniforms.lightDirection.value.set(finalPosition.x, finalPosition.y, finalPosition.z).normalize();

            // Ad a maker with the psotion
            addMarker(19.6, -74.6, 0.005); 
        }
    }

    updateLightPosition();
}

// Add lens flare effect when light is in front of the camera
function addLensFlare() {
    const textureLoader = new THREE.TextureLoader();
    const textureFlare = textureLoader.load('https://threejs.org/examples/textures/lensflare/lensflare0.png');

    const flareMaterial = new THREE.SpriteMaterial({ map: textureFlare, transparent: true, blending: THREE.AdditiveBlending });
    const flare = new THREE.Sprite(flareMaterial);
    flare.scale.set(1, 1, 1); // Adjust the scale of the flare
    pointLight.add(flare);
}

addLensFlare();

// Fonction pour ajouter un marqueur et un label
function addMarker(lat, lon, alt) {

    let {phi,theta} = latLongToSpherical(lat, lon)
    let {x,y,z} = sphericalToCartesian(1,phi,theta,alt);

    let markerGeometry = new THREE.PlaneGeometry(0.05, 0.05);
    let markerMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: globalUniforms.time
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            void main() {
                vec2 uv = vUv;
                uv -= 0.5;
                float dist = length(uv);
                float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
                float ripple = 0.5 + 0.5 * cos(20.0 * dist - time * 2.0);
                alpha *= ripple;
                gl_FragColor = vec4(1.0, 0.588, 0.07, alpha);
            }
        `,
        transparent: true
    });

    let marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(x, y, z);

    // Orienter le marqueur perpendiculairement à la surface de la sphère
    marker.lookAt(x * 2, y * 2, z * 2);
    scene.add(marker);

    // Créer un label HTML
    // Créer une div wrapper invisible
    let wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'wrapper';

    let labelDiv = document.createElement('div');
    labelDiv.className = 'label';
    // Ajouter l'icône
    let iconDiv = document.createElement('div');
    iconDiv.className = 'icon';
    let iconImg = document.createElement('img');
    iconImg.src = 'Images/septentrioPin.svg'; // Remplacez par le chemin de votre icône
    iconImg.alt = 'Icon';
    iconDiv.appendChild(iconImg);
    labelDiv.appendChild(iconDiv);

    // Ajouter le contenu
    let contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    let titleDiv = document.createElement('div');
    titleDiv.className = 'title_pos_label';
    titleDiv.textContent = 'Position';
    contentDiv.appendChild(titleDiv);

    let latDiv = document.createElement('div');
    latDiv.className = 'coordinate';
    latDiv.innerHTML = `Lat: <strong>${lat.toFixed(6)}</strong>`;
    contentDiv.appendChild(latDiv);


    let lonDiv = document.createElement('div');
    lonDiv.className = 'coordinate';
    lonDiv.innerHTML = `Lon: <strong>${lon.toFixed(6)}</strong>`;
    contentDiv.appendChild(lonDiv);

    let hgtDiv = document.createElement('div');
    hgtDiv.className = 'coordinate';
    hgtDiv.innerHTML = `Hgt: <strong>${alt.toFixed(3)}</strong>`;
    contentDiv.appendChild(hgtDiv);

    labelDiv.appendChild(contentDiv);

    // Ajouter le label à la div wrapper
    wrapperDiv.appendChild(labelDiv);

    label = new THREE.CSS2DObject(wrapperDiv);
    console.log(label);
    label.element.style.position='fixed';
    label.position.set(x, y, z);
    label.userData = {
    cNormal: new THREE.Vector3(),
    cPosition: new THREE.Vector3(),
    mat4: new THREE.Matrix4(),
    trackVisibility: () => { // the closer to the edge, the less opacity
        let ud = label.userData;
        ud.cNormal.copy(label.position).normalize().applyMatrix3(globe.normalMatrix);
        ud.cPosition.copy(label.position).applyMatrix4(ud.mat4.multiplyMatrices(camera.matrixWorldInverse, globe.matrixWorld));
        let d = ud.cPosition.negate().normalize().dot(ud.cNormal);
        d = smoothstep(0.2, 0.7, d);
        label.element.style.opacity = d;
        // console.log(d);
        
        function smoothstep (min, max, value) {
            var x = Math.max(0, Math.min(1, (value-min)/(max-min)));
            return x*x*(3 - 2*x);
        };
    }
    }
    scene.add(label);

}


function animate() {
    requestAnimationFrame(animate);

    // Rotate the globe

    // globe.rotation.y += 0.0002;
    globe2.rotation.y -= 0.0002;
    galaxy.rotation.y +=0.00005; 
    galaxy.rotation.x +=0.00005; 


    // Update controls
    controls.update();

    globalUniforms.time.value += 0.05;
    if(label){
        labelRenderer.render(scene, camera);  // Render labels with CSS2DRenderer
        label.userData.trackVisibility();
    }

    renderer.render(scene, camera);
}

animate();

// Example of using the light animation function
animateLight(initialLightPosition, finalLightPosition, 10); // Animer la lumière en 10 secondes

// Handle window resize
// window.addEventListener('resize', () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// });
// Écouter l'événement de redimensionnement
window.addEventListener('resize', () => {
    const currentHeight = window.innerHeight;

    // Ajuster la largeur et permettre le redimensionnement en hauteur si la fenêtre s'agrandit
    if (currentHeight > initialHeight) {
        initialHeight = currentHeight; // Mettre à jour la hauteur initiale
    }

    if(label){
        labelRenderer.setSize(window.innerWidth, initialHeight);
    }

    camera.aspect = window.innerWidth / initialHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, initialHeight);
});
