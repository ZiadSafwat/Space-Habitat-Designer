// Enhanced Space Habitats Design Tool with Correct Asset Paths
let scene, camera, renderer, controls, transformControls, pmremGenerator;
let habitatMesh, gridHelper, wireframeMode = false, gridVisible = true;
let selectedObject = null;
let modules = [];
let moduleVolumes = {};
let currentEnvMap = null;

// Correct HDRI paths based on your file structure
const hdriUrls = {
    'moon': 'hdri/HDR_asteroid_field.hdr',
    'mars': 'hdri/HDR_marslike_planet_close.hdr',
    'earth-orbit': 'hdri/earthlike_planet.hdr',
    'deep-space': 'hdri/HDR_galactic_plane_no_nebulae.hdr'
};

// Correct habitat GLB paths based on your file structure
const habitatPaths = {
    'cylindrical': '1111.glb',
    'spherical': '2222.glb',
    'toroidal': 'space+habitat+3d+model.glb',
    'modular': 'space+habitat+3d+model2.glb'
};

// Module data with correct paths and images
const moduleData = [
    {
        name: 'باب الغرفة الضغطية',
        glbPath: 'models/Airlock Door - Habitat Entrance/Airlock Door - Habitat Entrance1.glb',
        imagePath: 'models/Airlock Door - Habitat Entrance/Airlock Door - Habitat Entrance.png',
        volume: 10,
        icon: '🚪'
    },
    {
        name: 'لوحة التحكم',
        glbPath: 'models/Command - Control Console/Command - Control Console.glb',
        imagePath: 'models/Command - Control Console/Command - Control Console.png',
        volume: 5,
        icon: '🎛️'
    },
    {
        name: 'وحدة تخزين عامة',
        glbPath: 'models/General Storage Module/General Storage Module1.glb',
        imagePath: 'models/General Storage Module/General Storage Module.png',
        volume: 20,
        icon: '📦'
    },
    {
        name: 'معدات التمارين',
        glbPath: 'models/Gym - Exercise Equipment/Gym - Exercise Equipment1.glb',
        imagePath: 'models/Gym - Exercise Equipment/Gym - Exercise Equipment.png',
        volume: 15,
        icon: '🏋️'
    },
    {
        name: 'وحدة الزراعة المائية',
        glbPath: 'models/Hydroponics - Agriculture Module/Hydroponics - Agriculture Module.glb',
        imagePath: 'models/Hydroponics - Agriculture Module/Hydroponics - Agriculture Module.png',
        volume: 30,
        icon: '🌱'
    },
    {
        name: 'محطة البحث',
        glbPath: 'models/Laboratory -Research Workstation/Laboratory -Research Workstation.glb',
        imagePath: 'models/Laboratory -Research Workstation/Laboratory -Research Workstation.png',
        volume: 10,
        icon: '🔬'
    },
    {
        name: 'كبسولة النوم',
        glbPath: 'models/Sleeping Pod -Quarters/Sleeping Pod -Quarters1.glb',
        imagePath: 'models/Sleeping Pod -Quarters/Sleeping Pod -Quarters.png',
        volume: 5,
        icon: '🛏️'
    },
    {
        name: 'وحدة إدارة النفايات',
        glbPath: 'models/Waste Management - Recycling Unit/Waste Management - Recycling Unit1.glb',
        imagePath: 'models/Waste Management - Recycling Unit/Waste Management - Recycling Unit.png',
        volume: 10,
        icon: '♻️'
    }
];

const loader = new THREE.GLTFLoader();
const rgbeLoader = new THREE.RGBELoader();
const textureLoader = new THREE.TextureLoader();

function init() {
    // Initialize scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a2a);

    // Initialize camera
    camera = new THREE.PerspectiveCamera(75, (window.innerWidth - 350) / (window.innerHeight - 100), 0.1, 1000);
    camera.position.set(0, 5, 20);

    // Initialize renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('canvas'), 
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth - 350, window.innerHeight - 100);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Initialize PMREM generator for environment maps
    pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // Initialize orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    // Initialize transform controls
    transformControls = new THREE.TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('dragging-changed', (event) => {
        controls.enabled = !event.value;
    });
    scene.add(transformControls);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // Add grid helper
    gridHelper = new THREE.GridHelper(30, 30, 0x444444, 0x222222);
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    // Create module buttons with images
    createModuleButtons();

    // Initialize habitat and environment
    updateHabitat();
    updateEnvironment();

    // Set up event listeners
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('dblclick', onDoubleClick);

    // Link UI controls
    document.getElementById('shape').addEventListener('change', updateHabitat);
    document.getElementById('diameter-range').addEventListener('input', updateDiameter);
    document.getElementById('diameter').addEventListener('input', updateDiameterFromInput);
    document.getElementById('total-volume').addEventListener('input', updateVolumeFromInput);
    document.getElementById('volume-range').addEventListener('input', updateVolume);
    document.getElementById('floors').addEventListener('input', updateHabitat);
    document.getElementById('lighting-intensity').addEventListener('input', updateLighting);
    document.getElementById('lighting-color').addEventListener('input', updateLighting);
    document.getElementById('astronauts-range').addEventListener('input', updateAstronauts);
    document.getElementById('astronauts').addEventListener('input', updateAstronautsFromInput);
    document.getElementById('environment').addEventListener('change', updateEnvironment);

    // Initialize range values
    updateRangeValues();

    // Start animation loop
    animate();
}

function createModuleButtons() {
    const modulesList = document.getElementById('modules-list');
    modulesList.innerHTML = '';
    
    moduleData.forEach(module => {
        const button = document.createElement('button');
        button.className = 'module-button';
        button.onclick = () => addModule(module.glbPath, module.volume, module.name);
        
        // Create preview container
        const preview = document.createElement('div');
        preview.className = 'module-preview';
        
        // Try to load image, fallback to icon if image fails
        const img = document.createElement('img');
        img.src = module.imagePath;
        img.alt = module.name;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.onerror = () => {
            // If image fails to load, show icon instead
            preview.innerHTML = `<span style="font-size: 2rem;">${module.icon}</span>`;
        };
        
        preview.appendChild(img);
        button.appendChild(preview);
        
        // Add module name
        const name = document.createElement('div');
        name.className = 'module-name';
        name.textContent = module.name;
        button.appendChild(name);
        
        modulesList.appendChild(button);
    });
}

function onWindowResize() {
    const sidebarWidth = document.getElementById('sidebar').classList.contains('sidebar-collapsed') ? 60 : 350;
    camera.aspect = (window.innerWidth - sidebarWidth) / (window.innerHeight - 100);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth - sidebarWidth, window.innerHeight - 100);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function updateHabitat() {
    if (habitatMesh) scene.remove(habitatMesh);

    const shape = document.getElementById('shape').value;
    const path = habitatPaths[shape];
    const diameter = parseFloat(document.getElementById('diameter').value);
    const radius = diameter / 2;
    const totalVolume = parseFloat(document.getElementById('total-volume').value);

    if (path) {
        loader.load(path, (gltf) => {
            habitatMesh = gltf.scene;
            // Compute bounding box
            const box = new THREE.Box3().setFromObject(habitatMesh);
            const currentSize = box.getSize(new THREE.Vector3());
            let currentDiameter = Math.max(currentSize.x, currentSize.z);
            let currentHeight = currentSize.y;

            // Scale to match diameter
            const scaleFactor = diameter / currentDiameter;
            habitatMesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

            // Adjust for volume if cylindrical
            if (shape === 'cylindrical') {
                // Recalculate box after scale
                box.setFromObject(habitatMesh);
                currentHeight = box.getSize(new THREE.Vector3()).y;
                const desiredHeight = totalVolume / (Math.PI * radius * radius);
                const heightScale = desiredHeight / currentHeight;
                habitatMesh.scale.y *= heightScale;
            } else {
                // For other shapes, uniform scale to approximate volume (simplified)
                const currentVolumeApprox = (4/3) * Math.PI * (currentDiameter/2)**3;
                const desiredRadius = Math.pow((3 * totalVolume) / (4 * Math.PI), 1/3);
                const volumeScale = (desiredRadius * 2) / currentDiameter;
                habitatMesh.scale.set(volumeScale, volumeScale, volumeScale);
            }

            const material = new THREE.MeshStandardMaterial({
                color: 0xaaaaaa,
                metalness: 0.8,
                roughness: 0.2,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide,
                envMapIntensity: 1.0
            });
            habitatMesh.traverse((child) => {
                if (child.isMesh) {
                    child.material = material;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            scene.add(habitatMesh);
            updateFeedback();
            updateStats();
        }, undefined, function(error) {
            console.error('Error loading habitat model:', error);
            // Fallback to primitive geometry if GLB fails to load
            createFallbackHabitat(shape, diameter, totalVolume);
        });
    } else {
        // Fallback to primitive geometry if no path specified
        createFallbackHabitat(shape, diameter, totalVolume);
    }
}

function createFallbackHabitat(shape, diameter, totalVolume) {
    const radius = diameter / 2;
    let geometry;
    
    switch(shape) {
        case 'cylindrical':
            const height = totalVolume / (Math.PI * radius * radius);
            geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
            break;
        case 'spherical':
            const sphereRadius = Math.pow((3 * totalVolume) / (4 * Math.PI), 1/3);
            geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
            break;
        case 'toroidal':
            geometry = new THREE.TorusGeometry(radius, radius/3, 16, 100);
            break;
        case 'modular':
            // Create a cluster of boxes for modular design
            const group = new THREE.Group();
            const moduleSize = Math.cbrt(totalVolume / 10) * 0.8;
            
            for (let i = 0; i < 10; i++) {
                const boxGeometry = new THREE.BoxGeometry(moduleSize, moduleSize, moduleSize);
                const material = new THREE.MeshStandardMaterial({
                    color: 0xaaaaaa,
                    metalness: 0.8,
                    roughness: 0.2,
                    transparent: true,
                    opacity: 0.7
                });
                const box = new THREE.Mesh(boxGeometry, material);
                box.position.set(
                    (Math.random() - 0.5) * diameter,
                    (Math.random() - 0.5) * diameter/2,
                    (Math.random() - 0.5) * diameter
                );
                box.castShadow = true;
                box.receiveShadow = true;
                group.add(box);
            }
            
            habitatMesh = group;
            scene.add(habitatMesh);
            updateFeedback();
            updateStats();
            return;
    }

    const material = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    
    habitatMesh = new THREE.Mesh(geometry, material);
    habitatMesh.castShadow = true;
    habitatMesh.receiveShadow = true;
    scene.add(habitatMesh);
    updateFeedback();
    updateStats();
}

function addModule(path, volume, name) {
    loader.load(path, (gltf) => {
        const model = gltf.scene;
        model.userData.volume = volume;
        model.userData.path = path;
        model.userData.name = name;
        
        const index = modules.length;
        const angle = (index / 8) * Math.PI * 2;
        const dist = parseFloat(document.getElementById('diameter').value) / 3;
        model.position.set(Math.cos(angle) * dist, 2, Math.sin(angle) * dist);
        
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        scene.add(model);
        modules.push(model);
        moduleVolumes[path] = (moduleVolumes[path] || 0) + volume;
        
        updateFeedback();
        updateStats();
        showNotification(`تمت إضافة ${name} بنجاح`);
    }, undefined, function(error) {
        console.error('Error loading module:', error);
        // Fallback to primitive geometry if GLB fails to load
        createFallbackModule(path, volume, name);
    });
}

function createFallbackModule(path, volume, name) {
    // Create a simple 3D box as a fallback for the module
    const size = Math.cbrt(volume) * 0.8;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshStandardMaterial({ 
        color: Math.random() * 0xffffff,
        metalness: 0.7,
        roughness: 0.3
    });
    
    const model = new THREE.Mesh(geometry, material);
    model.userData.volume = volume;
    model.userData.path = path;
    model.userData.name = name;
    
    // Position the module
    const index = modules.length;
    const angle = (index / 8) * Math.PI * 2;
    const dist = parseFloat(document.getElementById('diameter').value) / 3;
    model.position.set(Math.cos(angle) * dist, 2, Math.sin(angle) * dist);
    
    model.castShadow = true;
    model.receiveShadow = true;
    
    scene.add(model);
    modules.push(model);
    moduleVolumes[path] = (moduleVolumes[path] || 0) + volume;
    
    updateFeedback();
    updateStats();
    showNotification(`تمت إضافة ${name} بنجاح (بديل)`);
}

function updateEnvironment() {
    const env = document.getElementById('environment').value;
    const url = hdriUrls[env];

    if (url) {
        rgbeLoader.load(url, (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;
            scene.background = texture;
            scene.environment = envMap;
            texture.dispose();
        }, undefined, function(error) {
            console.error('Error loading HDRI:', error);
            // Fallback to color background if HDRI fails to load
            scene.background = new THREE.Color(0x0a0a2a);
            scene.environment = null;
        });
    }
}

function onClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const intersects = raycaster.intersectObjects(modules, true);

    if (intersects.length > 0) {
        selectedObject = intersects[0].object;
        while (selectedObject.parent && !modules.includes(selectedObject)) {
            selectedObject = selectedObject.parent;
        }
        transformControls.attach(selectedObject);
        showControlsPanel(selectedObject);
    } else {
        transformControls.detach();
        hideControlsPanel();
        selectedObject = null;
    }
}

function onDoubleClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const intersects = raycaster.intersectObjects(modules, true);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        while (object.parent && !modules.includes(object)) {
            object = object.parent;
        }
        
        // Focus camera on the selected object
        controls.target.copy(object.position);
        camera.position.sub(controls.target);
        controls.target.copy(object.position);
        camera.position.add(object.position);
        camera.position.y += 5;
        camera.position.z += 5;
        controls.update();
    }
}

function showControlsPanel(obj) {
    const panel = document.getElementById('controls-panel');
    panel.style.display = 'block';
    document.getElementById('pos-x').value = obj.position.x.toFixed(1);
    document.getElementById('pos-y').value = obj.position.y.toFixed(1);
    document.getElementById('pos-z').value = obj.position.z.toFixed(1);
    
    const euler = new THREE.Euler().setFromQuaternion(obj.quaternion);
    document.getElementById('rot-x').value = THREE.MathUtils.radToDeg(euler.x).toFixed(0);
    document.getElementById('rot-y').value = THREE.MathUtils.radToDeg(euler.y).toFixed(0);
    document.getElementById('rot-z').value = THREE.MathUtils.radToDeg(euler.z).toFixed(0);
}

function hideControlsPanel() {
    document.getElementById('controls-panel').style.display = 'none';
}

function applyControls() {
    if (selectedObject) {
        selectedObject.position.set(
            parseFloat(document.getElementById('pos-x').value),
            parseFloat(document.getElementById('pos-y').value),
            parseFloat(document.getElementById('pos-z').value)
        );
        
        const rotation = new THREE.Euler(
            THREE.MathUtils.degToRad(parseFloat(document.getElementById('rot-x').value)),
            THREE.MathUtils.degToRad(parseFloat(document.getElementById('rot-y').value)),
            THREE.MathUtils.degToRad(parseFloat(document.getElementById('rot-z').value))
        );
        
        selectedObject.setRotationFromEuler(rotation);
        updateStats();
    }
}

function deleteSelected() {
    if (selectedObject) {
        scene.remove(selectedObject);
        modules = modules.filter(m => m !== selectedObject);
        const path = selectedObject.userData.path;
        if (path) moduleVolumes[path] -= selectedObject.userData.volume;
        updateFeedback();
        updateStats();
        transformControls.detach();
        hideControlsPanel();
        showNotification('تم حذف الوحدة بنجاح');
    }
}

function duplicateSelected() {
    if (selectedObject) {
        let duplicate;
        
        if (selectedObject.isMesh) {
            const geometry = selectedObject.geometry.clone();
            const material = selectedObject.material.clone();
            duplicate = new THREE.Mesh(geometry, material);
        } else {
            // For GLTF models, we need to clone the entire scene
            duplicate = selectedObject.clone();
        }
        
        duplicate.position.copy(selectedObject.position);
        duplicate.position.x += 2; // Offset slightly
        duplicate.rotation.copy(selectedObject.rotation);
        duplicate.userData = {...selectedObject.userData};
        
        scene.add(duplicate);
        modules.push(duplicate);
        moduleVolumes[duplicate.userData.path] += duplicate.userData.volume;
        
        updateFeedback();
        updateStats();
        showNotification('تم نسخ الوحدة بنجاح');
    }
}

function snapToSurface() {
    if (selectedObject && habitatMesh) {
        // Improved snapping: cast rays in multiple directions to find the closest surface
        const directions = [
            new THREE.Vector3(0, -1, 0),  // Down
            new THREE.Vector3(0, 1, 0),   // Up
            new THREE.Vector3(-1, 0, 0),  // Left
            new THREE.Vector3(1, 0, 0),   // Right
            new THREE.Vector3(0, 0, -1),  // Back
            new THREE.Vector3(0, 0, 1)    // Front
        ];
        
        let closestIntersection = null;
        let minDistance = Infinity;
        
        // Calculate the bounding box of the selected object to find its size
        const bbox = new THREE.Box3().setFromObject(selectedObject);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const objectHeight = size.y;
        
        directions.forEach(direction => {
            const raycaster = new THREE.Raycaster(
                selectedObject.position.clone(),
                direction.clone().normalize()
            );
            
            const intersects = raycaster.intersectObject(habitatMesh, true);
            
            if (intersects.length > 0) {
                const intersection = intersects[0];
                const distance = intersection.distance;
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIntersection = intersection;
                }
            }
        });
        
        if (closestIntersection) {
            // Position the object on the surface
            selectedObject.position.copy(closestIntersection.point);
            
            // Offset by half the object's height to place it on the surface, not inside it
            selectedObject.position.add(
                closestIntersection.face.normal.clone().multiplyScalar(objectHeight / 2)
            );
            
            // Align the object with the surface normal
            selectedObject.up.copy(closestIntersection.face.normal);
            selectedObject.lookAt(
                selectedObject.position.x + closestIntersection.face.normal.x,
                selectedObject.position.y + closestIntersection.face.normal.y,
                selectedObject.position.z + closestIntersection.face.normal.z
            );
            
            showControlsPanel(selectedObject);
            showNotification('تم التصاق الوحدة بالسطح');
        } else {
            showNotification('لم يتم العثور على سطح قريب');
        }
    }
}

function updateLighting() {
    const intensity = parseFloat(document.getElementById('lighting-intensity').value);
    const color = new THREE.Color(document.getElementById('lighting-color').value);
    
    document.getElementById('lighting-value').textContent = intensity.toFixed(1);
    
    scene.children.forEach(child => {
        if (child.type === 'DirectionalLight') {
            child.intensity = intensity;
            child.color = color;
        }
    });
}

function updateFeedback() {
    const totalVolume = parseFloat(document.getElementById('total-volume').value);
    const astronauts = parseInt(document.getElementById('astronauts').value);
    let usedVolume = 0;
    modules.forEach(mod => usedVolume += mod.userData.volume || 0);
    const remaining = totalVolume - usedVolume;
    const perAstronaut = totalVolume / astronauts;

    document.getElementById('used-volume').textContent = `الحجم المستخدم: ${usedVolume} م³`;
    document.getElementById('remaining-volume').textContent = `الحجم المتبقي: ${remaining} م³`;
    document.getElementById('per-astronaut').textContent = `م³ لكل رائد: ${perAstronaut.toFixed(1)}`;

    let status = 'جيد';
    let statusClass = 'good';
    if (perAstronaut < 10) {
        status = 'غير كافٍ';
        statusClass = 'bad';
    } else if (perAstronaut < 20) {
        status = 'مقبول';
        statusClass = 'warning';
    }
    
    const statusSpan = document.getElementById('status');
    statusSpan.textContent = `حالة: ${status}`;
    statusSpan.className = statusClass;
}

function updateStats() {
    document.getElementById('modules-count').textContent = modules.length;
    
    const diameter = parseFloat(document.getElementById('diameter').value);
    const floorArea = Math.PI * Math.pow(diameter/2, 2);
    document.getElementById('floor-area').textContent = `${floorArea.toFixed(1)} م²`;
    
    const totalVolume = parseFloat(document.getElementById('total-volume').value);
    let usedVolume = 0;
    modules.forEach(mod => usedVolume += mod.userData.volume || 0);
    const efficiency = Math.min(100, (usedVolume / totalVolume) * 100);
    
    document.getElementById('space-efficiency').textContent = `${efficiency.toFixed(1)}%`;
    document.getElementById('efficiency-bar').style.width = `${efficiency}%`;
}

function resetDesign() {
    modules.forEach(mod => scene.remove(mod));
    modules = [];
    moduleVolumes = {};
    updateHabitat();
    updateFeedback();
    updateStats();
    showNotification('تم إعادة تعيين التصميم');
}

function optimizeDesign() {
    modules.forEach((mod, index) => {
        const angle = (index / modules.length) * Math.PI * 2;
        const dist = parseFloat(document.getElementById('diameter').value) / 4;
        mod.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist / 2, 0);
    });
    showNotification('تم تحسين توزيع الوحدات');
}

function exportDesign() {
    showNotification('تم تصدير التصميم بنجاح!');
    // In a real application, this would save the design data
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const icon = document.getElementById('sidebar-icon');
    
    sidebar.classList.toggle('sidebar-collapsed');
    
    if (sidebar.classList.contains('sidebar-collapsed')) {
        icon.className = 'fas fa-chevron-left';
    } else {
        icon.className = 'fas fa-chevron-right';
    }
    
    onWindowResize();
}

function toggleStatsPanel() {
    const panel = document.querySelector('.stats-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function toggleGrid() {
    gridVisible = !gridVisible;
    gridHelper.visible = gridVisible;
}

function toggleWireframe() {
    wireframeMode = !wireframeMode;
    
    scene.traverse((child) => {
        if (child.isMesh) {
            child.material.wireframe = wireframeMode;
        }
    });
}

function resetCamera() {
    controls.reset();
    showNotification('تم إعادة ضبط الكاميرا');
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notification-text');
    
    text.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function toggleHelp() {
    showNotification('استخدم زر الفأرة الأيسر لتحريك الكاميرا، الأيمن للتدوير، عجلة التكبير/التصغير');
}

function updateRangeValues() {
    updateDiameter();
    updateVolume();
    updateAstronauts();
}

function updateDiameter() {
    const value = document.getElementById('diameter-range').value;
    document.getElementById('diameter-value').textContent = value;
    document.getElementById('diameter').value = value;
    updateHabitat();
}

function updateDiameterFromInput() {
    const value = document.getElementById('diameter').value;
    document.getElementById('diameter-range').value = value;
    document.getElementById('diameter-value').textContent = value;
    updateHabitat();
}

function updateVolume() {
    const value = document.getElementById('volume-range').value;
    document.getElementById('volume-value').textContent = value;
    document.getElementById('total-volume').value = value;
    updateHabitat();
}

function updateVolumeFromInput() {
    const value = document.getElementById('total-volume').value;
    document.getElementById('volume-range').value = value;
    document.getElementById('volume-value').textContent = value;
    updateHabitat();
}

function updateAstronauts() {
    const value = document.getElementById('astronauts-range').value;
    document.getElementById('astronauts-value').textContent = value;
    document.getElementById('astronauts').value = value;
    updateFeedback();
}

function updateAstronautsFromInput() {
    const value = document.getElementById('astronauts').value;
    document.getElementById('astronauts-range').value = value;
    document.getElementById('astronauts-value').textContent = value;
    updateFeedback();
}

// Initialize the application
init();
 