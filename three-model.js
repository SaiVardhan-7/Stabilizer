import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Setup full-screen canvas
const container = document.getElementById('canvas-container');
const width = container.clientWidth;
const height = container.clientHeight; 

const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
camera.position.set(-150, 50, 200);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(width, height);
// Soft shadows and lighting to match illustration style
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.0;
controls.target.set(-10, -25, 0); // Focus pivot beneath the model to visually lift the spoon higher onscreen

// Generate pristine reflection studio lighting mapped onto the environment
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

// Illustration-style soft lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(100, 200, 100);
dirLight.castShadow = true;
scene.add(dirLight);

const rimLight = new THREE.DirectionalLight(0xaad4ff, 0.5);
rimLight.position.set(-100, -50, -100);
scene.add(rimLight);

// Master group
const assembly = new THREE.Group();
scene.add(assembly);

// Materials (High-End Mechanical Aesthetics with Dynamic Emissive for Kinetic Visualization)
const matGrip = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.9,
    metalness: 0.2,
    emissive: new THREE.Color(0x000000) // Will pulse RED during chaos
});
const matHousing = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.30,
    roughness: 0.05,
    transmission: 0.6,
    emissive: new THREE.Color(0x000000),
    side: THREE.DoubleSide // More visible shell to show oscillation
});
const matOuterRing = new THREE.MeshStandardMaterial({
    color: 0xcc9933,
    roughness: 0.3,
    metalness: 0.8,
    emissive: new THREE.Color(0x000000) // Will glow AMBER while absorbing energy
});
const matInnerRing = new THREE.MeshStandardMaterial({
    color: 0x2288cc,
    roughness: 0.2,
    metalness: 0.7,
    emissive: new THREE.Color(0x000000) // Calmer blue glow while absorbing
});
const matSteel = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    roughness: 0.1,
    metalness: 0.95
});
const matSpoonBowl = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    roughness: 0.1,
    metalness: 0.95,
    emissive: new THREE.Color(0x000000), // Stays dark = perfectly stable output
    side: THREE.DoubleSide
});
const matPeas = new THREE.MeshStandardMaterial({
    color: 0x8bc34a,
    roughness: 0.9
});
const matPivot = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.5
});

// ==========================================
// 1. ERGONOMIC HANDLE (Matched Image Curves)
// ==========================================

// Create the main shaking housing right here so we can attach the handle directly to it.
const housingGroup = new THREE.Group();
assembly.add(housingGroup);

// Using a curved TubeGeometry to simulate the contoured ergonomic grip dropping down
const gripCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-25, 0, 0),     // Attaches to hub
    new THREE.Vector3(-60, 2, 0),   // Slight rise
    new THREE.Vector3(-100, -8, 0), // Dips down ergonomically
    new THREE.Vector3(-130, -20, 0) // Tail end
]);
const gripGeo = new THREE.TubeGeometry(gripCurve, 64, 16, 32, false);
const grip = new THREE.Mesh(gripGeo, matGrip);
grip.scale.set(0.9, 0.7, 0.8); // Flatten and reduce overall handle volume slightly
grip.castShadow = true;
// Attach to the vibrating housing, NOT the static assembly root!
housingGroup.add(grip);

// Make the grip look textured/segmented (the drawing has a rubber pattern)
// We add faint dark grey torus rings cutting into it.
for(let i=0.2; i<=0.9; i+=0.08) {
    const pt = gripCurve.getPoint(i);
    const tan = gripCurve.getTangent(i);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(16.5, 0.8, 8, 32), new THREE.MeshPhongMaterial({color: 0x607d8b}));
    ring.position.copy(pt);
    // Align ring to curve tangent
    const up = new THREE.Vector3(0,1,0); 
    if (Math.abs(tan.y) > 0.99) up.set(1,0,0);
    const axis = new THREE.Vector3().crossVectors(up, tan).normalize();
    const radians = Math.acos(up.dot(tan));
    ring.quaternion.setFromAxisAngle(axis, radians);
    ring.scale.set(0.9, 0.9, 0.9);
    grip.add(ring);
}

// ==========================================
// 2. TRANSPARENT HOUSING & COUNTERWEIGHT BOX
// ==========================================

// Main rounded capsule body encapsulating the gimbal
const shellGeo = new THREE.CapsuleGeometry(20, 36, 32, 32); // Thinner, slightly longer to fit rings snugly
const shell = new THREE.Mesh(shellGeo, matHousing);
shell.rotation.z = Math.PI / 2; // Lie horizontally along X
shell.position.set(0, 0, 0);
housingGroup.add(shell);

// Front Pivot Bearing (Solid metal/grey node on the nose of the shell)
const pivotGeo = new THREE.SphereGeometry(7, 32, 16);
const pivotNode = new THREE.Mesh(pivotGeo, matPivot);
pivotNode.position.set(38, 0, 0); // Front tip
housingGroup.add(pivotNode);



// Helper to create the exact machined flat ring structural pipes seen in the blueprint
function createFlatRing(innerRadius, outerRadius, depth, material) {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);
    const extrudeSettings = { depth: depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.15, bevelThickness: 0.15, curveSegments: 64 };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.translate(0, 0, -depth/2);
    return new THREE.Mesh(geo, material);
}

// Outer Ring: Yellow (Roll Axis). Follows housing. Spans YZ plane.
const rollAxisGroup = new THREE.Group();
housingGroup.add(rollAxisGroup);

const outerRing = createFlatRing(14.5, 18.5, 5.0, matOuterRing);
outerRing.rotation.y = Math.PI / 2; // Face X axis
outerRing.castShadow = true;
rollAxisGroup.add(outerRing);

// Connect Outer Ring to Housing Pivot natively with detailed Ball Bearings
const backShaft = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 20, 16), matSteel);
backShaft.rotation.z = Math.PI/2;
backShaft.position.set(-18, 0, 0);
housingGroup.add(backShaft); // Fixed to shell

const frontShaft = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 20, 16), matSteel);
frontShaft.rotation.z = Math.PI/2;
frontShaft.position.set(18, 0, 0);
housingGroup.add(frontShaft); // Fixed to shell

function createBearing() {
    const group = new THREE.Group();
    const matRace = new THREE.MeshStandardMaterial({color: 0x999999, metalness: 0.9, roughness: 0.2});
    const matBalls = new THREE.MeshStandardMaterial({color: 0xffffff, metalness: 1.0, roughness: 0.1});
    const outer = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.8, 16, 32), matRace);
    const inner = new THREE.Mesh(new THREE.TorusGeometry(2, 0.5, 16, 32), matRace);
    group.add(outer, inner);
    for(let i=0; i<8; i++) {
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), matBalls);
        const a = (i/8)*Math.PI*2;
        ball.position.set(2.75*Math.cos(a), 2.75*Math.sin(a), 0);
        group.add(ball);
    }
    return group;
}

const backBearing = createBearing();
backBearing.rotation.y = Math.PI/2;
backBearing.position.set(-26, 0, 0); // Nestled into the back wall of housing
housingGroup.add(backBearing);


// Middle Ring: Green (Pitch Axis). Spans XY plane.
const pitchAxisGroup = new THREE.Group();
rollAxisGroup.add(pitchAxisGroup); // Attaches to outer ring

const middleRing = createFlatRing(11.0, 13.5, 4.0, matInnerRing);
middleRing.castShadow = true;
pitchAxisGroup.add(middleRing);

// Connecting shafts (Yellow to Middle Green) along Z-axis (horizontal pins)
const zPin1 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 5, 16), matSteel);
zPin1.rotation.x = Math.PI/2; zPin1.position.set(0, 0, 14);
const zPin2 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 5, 16), matSteel);
zPin2.rotation.x = Math.PI/2; zPin2.position.set(0, 0, -14);
rollAxisGroup.add(zPin1, zPin2); // Outer ring holds the pins.

// Inner Ring: Green (Yaw Axis). Spans XY plane concentrically inside middle ring.
const yawAxisGroup = new THREE.Group();
pitchAxisGroup.add(yawAxisGroup);

const innerRing = createFlatRing(7.5, 10.0, 3.5, matInnerRing);
innerRing.rotation.y = Math.PI / 2; // Tilted parallel to the yellow outer ring
innerRing.castShadow = true;
yawAxisGroup.add(innerRing);

// Connecting shafts (Middle Green to Inner Green) along Y-axis (vertical pins)
const yPin1 = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 4, 16), matSteel);
yPin1.position.set(0, 10.5, 0);
const yPin2 = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 4, 16), matSteel);
yPin2.position.set(0, -10.5, 0);
pitchAxisGroup.add(yPin1, yPin2); // Middle ring holds the inner vertical pins.

// Rotational Indicator Decals (Arrows from visual blueprints)
const matBlackIndicator = new THREE.MeshBasicMaterial({color: 0x111111, side: THREE.DoubleSide});
// Overlay arc on the INNER face of the deeply nested Inner Green Ring
const blackArcGeo = new THREE.CylinderGeometry(7.4, 7.4, 0.8, 32, 1, true, 0, Math.PI / 4);
const blackArc = new THREE.Mesh(blackArcGeo, matBlackIndicator);
// Follow the tilted inner ring
blackArc.rotation.x = Math.PI / 2;
blackArc.rotation.y = Math.PI / 2;
blackArc.rotation.z = Math.PI / 6;
yawAxisGroup.add(blackArc);



// ==========================================
// 4. PAYLOAD: SPOON STEM, CORRUGATED ARM, FOOD
// ==========================================
// Stabilized Payload attached to innermost ring (Pitch / Green)
// Spoon Stem (Organic sweeping curve)
const spoonNeckCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),    // center
    new THREE.Vector3(30, 0, 0),   // out of hub
    new THREE.Vector3(60, -4, 0),  // dips down elegantly
    new THREE.Vector3(75, 2, 0)    // sweeps up into bowl base
]);
// Thicker flattened tube to match the robust plastic spoon stem
const stemGeo = new THREE.TubeGeometry(spoonNeckCurve, 32, 4.5, 16, false);
const stem = new THREE.Mesh(stemGeo, matSpoonBowl);
stem.scale.set(1, 0.4, 1.3); // Flatten height, widen heavily
stem.castShadow = true;
yawAxisGroup.add(stem); 

// Corrugated Arm Drop (Silver Bellows Hose) connecting Stem down into Counterweight
const bellowsCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(12, -2, 0), // Starts inside just past the rings
    new THREE.Vector3(18, -10, 0), // Curves towards front lower box
    new THREE.Vector3(18, -25, 0) // Sinks down into yellow CW box
);
const hoseGeo = new THREE.TubeGeometry(bellowsCurve, 32, 2.5, 16, false);
const hose = new THREE.Mesh(hoseGeo, matSteel);
hose.castShadow = true;
yawAxisGroup.add(hose);
// Add corrugated ribbing dynamically
for(let t=0.1; t<=0.95; t+=0.08) {
    const pt = bellowsCurve.getPoint(t);
    const tan = bellowsCurve.getTangent(t);
    const rib = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.4, 8, 16), new THREE.MeshPhongMaterial({color: 0x555555}));
    rib.position.copy(pt);
    const up = new THREE.Vector3(0,1,0); 
    if (Math.abs(tan.y) > 0.99) up.set(1,0,0);
    const axis = new THREE.Vector3().crossVectors(up, tan).normalize();
    const radians = Math.acos(up.dot(tan));
    rib.quaternion.setFromAxisAngle(axis, radians);
    yawAxisGroup.add(rib);
}

// Spoon Bowl (Rounded chunky shape matching the plastic spoon reference)
const bowlGeo = new THREE.SphereGeometry(18, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);

const bowl = new THREE.Mesh(bowlGeo, matSpoonBowl);
bowl.position.set(85, 2, 0); // Position at end of sweeping stem

// Flip concave side facing up
bowl.rotation.x = Math.PI; 
// Squish slightly to spoon shape (much rounder and steeper than the almond metal spoon)
bowl.scale.set(1.3, 0.45, 1.1); 
bowl.castShadow = true;
bowl.receiveShadow = true;
yawAxisGroup.add(bowl);

// The "Food" (Green peas) 
const peasGroup = new THREE.Group();
peasGroup.position.set(85, 4, 0); // slightly above bowl base
for(let i=0; i<8; i++) {
    const pea = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 16), matPeas);
    pea.position.set((Math.random()-0.5)*12, (Math.random()-0.5)*2, (Math.random()-0.5)*12);
    pea.castShadow = true;
    peasGroup.add(pea);
}
yawAxisGroup.add(peasGroup);

// Counterweight Box (Moved from housing to nested payload ring to act as gravity pendulum)
const cwBoxGeo = new THREE.BoxGeometry(18, 16, 20);
const cwBox = new THREE.Mesh(cwBoxGeo, matOuterRing);
cwBox.position.set(18, -25, 0); 
cwBox.castShadow = true;
yawAxisGroup.add(cwBox);

const iconPlateGeo = new THREE.PlaneGeometry(12, 12);
const matIcon = new THREE.MeshBasicMaterial({color: 0x333333});
const iconPlate = new THREE.Mesh(iconPlateGeo, matIcon);
iconPlate.position.set(18, -25, 10.1); 
yawAxisGroup.add(iconPlate);
const iconTextGeo = new THREE.PlaneGeometry(8, 4);
const matIconWT = new THREE.MeshBasicMaterial({color: 0xffd54f});
const iconText = new THREE.Mesh(iconTextGeo, matIconWT);
iconText.position.set(18, -25, 10.2); 
yawAxisGroup.add(iconText);

// Liquid Sim Disc
const liquidGeo = new THREE.CylinderGeometry(16, 16, 0.5, 32);
const matLiquid = new THREE.MeshPhongMaterial({color: 0x4488ff, transparent: true, opacity: 0.8, side: THREE.DoubleSide});
const liquidDisc = new THREE.Mesh(liquidGeo, matLiquid);
liquidDisc.position.set(85, 3, 0); 
yawAxisGroup.add(liquidDisc);

// Vector Flow Arrows (Kinematic Visualizers)
const inArrow = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(-60, 0, 0), 10, 0xff3366, 4, 3);
housingGroup.add(inArrow); // Aggressive Handle Arrow
const dampArrow = new THREE.ArrowHelper(new THREE.Vector3(0,0,1), new THREE.Vector3(0, 16, 0), 10, 0xffaa00, 4, 3);
rollAxisGroup.add(dampArrow); // Absorbing Pivot Arrow
const outArrow = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), 25, 0x00e5ff, 6, 4);
liquidDisc.add(outArrow); // Static Level Output (Tied to fluid horizon)

// Center globally perfectly inside the viewport
assembly.position.set(-10, 0, 0);

// ==========================================
// 5. PHYSICS & INTERACTION ENGINE
// ==========================================
let isSimulating = false;
let isExploded = false;
let isDragging = false;
let lastPointer = new THREE.Vector2();

let tremorIntensity = 50;
let tremorFreq = 5.0;
let cwMassObj = 35.0;  // Damping Gravity Anchor
let gFriction = 0.0;   // Transfer Drag

let velX = 0, velZ = 0, velY = 0;
let lastHouseX = 0, lastHouseZ = 0;

// UI Hooks
const btnSim = document.getElementById('btn-simulate');
const btnExp = document.getElementById('btn-explode');
const btnRst = document.getElementById('btn-reset');
const selPay = document.getElementById('select-payload');

if(btnSim) {
    btnSim.addEventListener('click', () => {
        isSimulating = !isSimulating;
        btnSim.innerText = isSimulating ? 'HALT TREMOR SIMULATION' : 'START TREMOR SIMULATION';
        btnSim.classList.toggle('active');
        if(!isSimulating) { housingGroup.rotation.set(0,0,0); }
    });
}
if(btnExp) {
    btnExp.addEventListener('click', () => {
        isExploded = !isExploded;
        btnExp.classList.toggle('active');
    });
}
if(btnRst) {
    btnRst.addEventListener('click', () => {
        isSimulating = false; if(btnSim) { btnSim.innerText='START TREMOR SIMULATION'; btnSim.classList.remove('active'); }
        isExploded = false; if(btnExp) btnExp.classList.remove('active');
        velX=velZ=velY=0;
        housingGroup.rotation.set(0,0,0);
        rollAxisGroup.rotation.set(0,0,0);
        pitchAxisGroup.rotation.set(0,0,0);
        yawAxisGroup.rotation.set(0,0,0);
    });
}
if(selPay) {
    selPay.addEventListener('change', (e) => {
        peasGroup.visible = (e.target.value === 'peas');
        liquidDisc.visible = (e.target.value === 'liquid');
        bowl.visible = (e.target.value !== 'empty'); // optionally hide food entirely
    });
    peasGroup.visible = true; liquidDisc.visible = false;
}

['intensity','frequency','mass','friction'].forEach(id => {
    const sld = document.getElementById('slider-'+id);
    const val = document.getElementById('val-'+id);
    if(sld) {
        sld.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            if(id==='intensity') { tremorIntensity = v; val.innerText=v+'%'; }
            if(id==='frequency') { tremorFreq = v; val.innerText=v.toFixed(1)+' Hz'; }
            if(id==='mass') { cwMassObj = v; val.innerText=v+'g'; }
            if(id==='friction') { gFriction = v; val.innerText=v+'%'; }
        });
    }
});

// Manual Hand Shake Interaction (Raycasted Drag Override)
const raycaster = new THREE.Raycaster();
const mouseVec = new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown', (e) => {
    mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouseVec, camera);
    const intersects = raycaster.intersectObject(grip, true);
    if(intersects.length > 0) {
        isDragging = true;
        isSimulating = false; // Override auto simulator
        if(btnSim) { btnSim.innerText = 'START TREMOR SIMULATION'; btnSim.classList.remove('active'); }
        controls.enabled = false;
        lastPointer.set(e.clientX, e.clientY);
    }
});
window.addEventListener('pointermove', (e) => {
    if(isDragging) {
        const dx = e.clientX - lastPointer.x;
        const dy = e.clientY - lastPointer.y;
        lastPointer.set(e.clientX, e.clientY);
        housingGroup.rotation.z -= dx * 0.015;
        housingGroup.rotation.x -= dy * 0.015;
    }
});
window.addEventListener('pointerup', () => { isDragging = false; controls.enabled = true; });

// Live Graphing Canvas Setup
const graphCanvas = document.getElementById('liveGraph');
const gCtx = graphCanvas ? graphCanvas.getContext('2d') : null;
const gw = 380, gh = 120;
let histIn = new Array(gw).fill(0);
let histOut = new Array(gw).fill(0);

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Exploded View Assembly
    const expT = isExploded ? 1.0 : 0.0;
    rollAxisGroup.position.x += ((expT * 40) - rollAxisGroup.position.x) * 0.1;
    pitchAxisGroup.position.z += ((expT * 25) - pitchAxisGroup.position.z) * 0.1;
    yawAxisGroup.position.z += ((expT * -25) - yawAxisGroup.position.z) * 0.1;

    let time = performance.now() * 0.001;
    let inChaosX = 0;
    
    if (isSimulating) {
        const f = tremorFreq;
        // Max amplitude: 0.65 rad (~37°) — genuinely violent, high-amplitude tremor
        const amp = (tremorIntensity / 100) * 0.65;

        // 4-harmonic irrational-ratio Parkinsonian tremor profile
        // Irrational ratios (1, 2.3, 5.7, 11.1) guarantee the signal NEVER repeats — perfectly erratic
        inChaosX = (
            Math.sin(time * f * 1.0)  * 0.50 +
            Math.sin(time * f * 2.3)  * 0.28 +
            Math.sin(time * f * 5.7)  * 0.14 +
            Math.sin(time * f * 11.1) * 0.08
        ) * amp;

        const inChaosZ = (
            Math.sin(time * f * 1.1 + 1.57) * 0.50 +
            Math.sin(time * f * 2.7 + 0.73) * 0.28 +
            Math.sin(time * f * 6.3 + 2.10) * 0.14 +
            Math.sin(time * f * 13.5 + 0.47) * 0.08
        ) * amp;

        // Small Yaw drift: makes the handle feel like it's being torqued in 3 axes
        const inChaosY = Math.sin(time * f * 0.7 + 1.0) * amp * 0.3;

        // Apply ALL chaos to the housing (handle + hub casing)
        housingGroup.rotation.x = inChaosX;
        housingGroup.rotation.z = inChaosZ;
        housingGroup.rotation.y = inChaosY;
        inChaosX = inChaosX; // keep reference for graph
    } else {
        if(!isDragging) {
            housingGroup.rotation.x += (0 - housingGroup.rotation.x) * 0.1;
            housingGroup.rotation.z += (0 - housingGroup.rotation.z) * 0.1;
        }
    }
    
    // =====================================================
    // PERFECT INSTANTANEOUS STABILIZATION
    // The gimbal rings compute the exact mathematical inverse
    // of the housing quaternion every frame, locking the payload
    // at absolute world-zero orientation.
    // =====================================================
    const invQ = housingGroup.quaternion.clone().invert();
    const tgtE = new THREE.Euler().setFromQuaternion(invQ, 'XZY');

    // Friction slider: blends between PERFECT (0%) and NO compensation (100%)
    // At 0% friction → head is perfectly locked (ideal bearings)
    // At 100% friction → rings seize and shake with the housing (degraded)
    const frictionBlend = (gFriction / 100.0);

    const hDx = housingGroup.rotation.x - lastHouseX;
    const hDz = housingGroup.rotation.z - lastHouseZ;
    lastHouseX = housingGroup.rotation.x;
    lastHouseZ = housingGroup.rotation.z;

    // Perfect target angles (absolute zero)
    const perfectX = tgtE.x;
    const perfectZ = tgtE.z;
    const perfectY = tgtE.y;

    // Degraded target (rings dragged by housing delta × friction)
    velX = velX * 0.7 + hDx * frictionBlend;
    velZ = velZ * 0.7 + hDz * frictionBlend;

    // Final angle = blend between perfect and degraded
    rollAxisGroup.rotation.x  = perfectX  + velX;
    pitchAxisGroup.rotation.z = perfectZ  + velZ;
    yawAxisGroup.rotation.y   = perfectY;

    // Fluid Meniscus Dynamics: Liquid plane always stays perfectly world-level to simulate real liquid settling!
    const worldLevelQ = new THREE.Quaternion();
    yawAxisGroup.getWorldQuaternion(worldLevelQ);
    liquidDisc.quaternion.copy(worldLevelQ.invert());

    // Arrow Visualization Scales
    inArrow.setLength( Math.max(10, Math.abs(hDx + hDz) * 1500) );
    dampArrow.setLength( Math.max(10, Math.abs(velX + velZ) * 800) );

    // =====================================================
    // KINETIC DISPARITY EMISSIVE VISUALIZATION
    // Handle/Housing = RED (chaos input)
    // Outer Ring     = AMBER (energy absorption at roll axis)
    // Inner Ring     = BLUE  (residual energy at pitch axis)
    // Spoon Bowl     = NONE  (zero energy, perfectly stable output)
    // =====================================================
    if (isSimulating || isDragging) {
        // Housing velocity magnitude — how violently it's shaking THIS frame
        const shakeIntensity = Math.min(1.0, Math.abs(hDx + hDz) * 40);
        // Ring correction magnitude — how hard the rings are working to counter
        const ringWork = Math.min(1.0, (Math.abs(perfectX) + Math.abs(perfectZ)) * 1.2);

        // Handle pulses RED ↔ brighter = faster shake
        matGrip.emissive.setRGB(shakeIntensity * 0.7, 0, 0);
        matHousing.emissive.setRGB(shakeIntensity * 0.4, 0, 0);

        // Outer ring glows AMBER — proportional to total rotation it's correcting
        matOuterRing.emissive.setRGB(ringWork * 0.35, ringWork * 0.18, 0);

        // Inner ring glows BLUE — calmer, smaller residual correction
        const innerWork = Math.min(1.0, Math.abs(velX + velZ) * 10);
        matInnerRing.emissive.setRGB(0, innerWork * 0.1, innerWork * 0.35);

        // Spoon bowl stays completely dark — zero energy output
        matSpoonBowl.emissive.setRGB(0, 0, 0);
    } else {
        // Fade all emissives back to zero at rest
        matGrip.emissive.lerp(new THREE.Color(0, 0, 0), 0.15);
        matHousing.emissive.lerp(new THREE.Color(0, 0, 0), 0.15);
        matOuterRing.emissive.lerp(new THREE.Color(0, 0, 0), 0.15);
        matInnerRing.emissive.lerp(new THREE.Color(0, 0, 0), 0.15);
    }

    // SPEED METER HUD — Live angular velocity readout
    const handleSpeedRad = Math.abs(hDx) + Math.abs(hDz);
    const ringSpeedRad   = Math.abs(velX) + Math.abs(velZ);
    const handleDegS = Math.round(handleSpeedRad * 60 * 180 / Math.PI); // convert to deg/s at 60fps
    const ringDegS   = Math.round(ringSpeedRad   * 60 * 180 / Math.PI);
    const maxExpected = 200; // degrees/s at max intensity

    const hudHandle    = document.getElementById('hud-handle');
    const hudRing      = document.getElementById('hud-ring');
    const hudHandleVal = document.getElementById('hud-handle-val');
    const hudRingVal   = document.getElementById('hud-ring-val');
    if (hudHandle)    hudHandle.style.width    = Math.min(100, (handleDegS / maxExpected) * 100) + '%';
    if (hudRing)      hudRing.style.width      = Math.min(100, (ringDegS   / maxExpected) * 100) + '%';
    if (hudHandleVal) hudHandleVal.textContent = handleDegS + '°/s';
    if (hudRingVal)   hudRingVal.textContent   = ringDegS   + '°/s';

    // Chart Data Collection
    histIn.push(inChaosX * 100); 
    
    // Authentically compute absolute horizon output of the innermost payload payload
    const trueWorldQ = new THREE.Quaternion();
    yawAxisGroup.getWorldQuaternion(trueWorldQ);
    const trueWorldEuler = new THREE.Euler().setFromQuaternion(trueWorldQ);
    
    // Map absolute X orientation to the output graph (Should be perfectly 0)
    histOut.push(trueWorldEuler.x * 100); 
    
    histIn.shift();
    histOut.shift();

    if (gCtx) {
        gCtx.clearRect(0,0,gw,gh);
        const midY = gh / 2;
        
        // Input plot (Red Noise)
        gCtx.beginPath();
        gCtx.strokeStyle = 'rgba(255, 51, 102, 0.8)';
        gCtx.lineWidth = 1.5;
        for(let i=0; i<gw; i++) gCtx.lineTo(i, midY - histIn[i]);
        gCtx.stroke();
        
        // Stabilized Output plot (Cyan Flatline)
        gCtx.beginPath();
        gCtx.strokeStyle = '#00e5ff';
        gCtx.lineWidth = 2.5;
        for(let i=0; i<gw; i++) gCtx.lineTo(i, midY - histOut[i]);
        gCtx.stroke();
    }

    renderer.render(scene, camera);
}

// Window resize elasticity
window.addEventListener('resize', () => {
    if(!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

animate();
