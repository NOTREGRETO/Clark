import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);
lucide.createIcons();

// 1. Smooth Scroll Setup with Lenis
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. Three.js 3D Background Setup (Financial / Abstract Geometry)
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2('#0f172a', 0.02);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

// Camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 15;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Add abstract, premium geometric representations
const objectsDistance = 4;
const sectionMeshes = [];

// Elegant dark/gold materials
const solidMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.7,
    roughness: 0.1,
    flatShading: true
});

const wireframeMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37, // Gold
    wireframe: true,
    transparent: true,
    opacity: 0.4
});

// Texture Generation for Indian Rupee Theme
function createRupeeCoinTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Background dark for depth
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 512, 512);

    // Inner details - Rupee Symbol
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 280px "Outfit", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('₹', 256, 276);

    // Border Rings
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 12;
    ctx.beginPath(); ctx.arc(256, 256, 240, 0, Math.PI * 2); ctx.stroke();

    ctx.setLineDash([12, 15]);
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(256, 256, 215, 0, Math.PI * 2); ctx.stroke();

    return new THREE.CanvasTexture(canvas);
}

function createRupeeNoteTexture(bgColor, denomination) {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor; ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 8; ctx.strokeRect(15, 15, 482, 226);

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath(); ctx.arc(380, 128, 70, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 70px Arial, sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('₹ ' + denomination, 40, 128);

    ctx.font = '22px Arial';
    ctx.fillText('RESERVE BANK OF INDIA', 40, 60);

    return new THREE.CanvasTexture(canvas);
}

const rupeeCoinMat = new THREE.MeshStandardMaterial({ map: createRupeeCoinTexture(), metalness: 0.9, roughness: 0.2 });
const note500Mat = new THREE.MeshStandardMaterial({ map: createRupeeNoteTexture('#545b57', '500'), roughness: 0.9, metalness: 0.1 });
const note200Mat = new THREE.MeshStandardMaterial({ map: createRupeeNoteTexture('#a87532', '200'), roughness: 0.9, metalness: 0.1 });
const paperSideMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });

const note500Materials = [paperSideMat, paperSideMat, paperSideMat, paperSideMat, note500Mat, note500Mat];
const note200Materials = [paperSideMat, paperSideMat, paperSideMat, paperSideMat, note200Mat, note200Mat];
const rupeeCoinMaterials = [solidMaterial, rupeeCoinMat, rupeeCoinMat];


// 1. Central Hero Element: Giant Stylized Gold Coin
const globeGroup = new THREE.Group();

const giantCoinGeom = new THREE.CylinderGeometry(2.5, 2.5, 0.4, 32);
const globeSolid = new THREE.Mesh(giantCoinGeom, rupeeCoinMaterials);
const globeWire = new THREE.Mesh(giantCoinGeom, wireframeMaterial);
globeWire.scale.set(1.02, 1.05, 1.02);

// Inner decorative ring of the coin
const innerRingGeom = new THREE.CylinderGeometry(2.1, 2.1, 0.42, 32);
const innerRing = new THREE.Mesh(innerRingGeom, wireframeMaterial);

globeGroup.add(globeSolid);
globeGroup.add(globeWire);
globeGroup.add(innerRing);

// Rotate coin to face partially forward
globeGroup.rotation.x = Math.PI / 2;
globeGroup.rotation.z = Math.PI / 6;

globeGroup.position.set(4, -objectsDistance * 0.5, -4);
scene.add(globeGroup);
sectionMeshes.push(globeGroup);

// 2. Floating Money Elements (Coins, Cheques, Gold Bars)
const allNodes = []; // Store nodes for financial constellation lines

const coinGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32);
const chequeGeom = new THREE.BoxGeometry(1.4, 0.6, 0.01);
const goldBarGeom = new THREE.BoxGeometry(0.8, 0.3, 0.4);

const moneyGeometries = [coinGeom, chequeGeom, goldBarGeom];

for (let i = 0; i < 45; i++) {
    const geoType = Math.floor(Math.random() * 3);
    const geometry = moneyGeometries[geoType];

    let material;
    if (geoType === 1) {
        // Indian Notes (500 or 200)
        material = Math.random() > 0.5 ? note500Materials : note200Materials;
    } else if (geoType === 0) {
        // Rupee Coins
        material = Math.random() > 0.3 ? rupeeCoinMaterials : wireframeMaterial;
    } else {
        // Gold bars
        material = solidMaterial;
    }

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = (Math.random() - 0.5) * 25;
    mesh.position.y = (Math.random() - 0.5) * 45 - 2;
    mesh.position.z = (Math.random() - 0.5) * 15 - 8;

    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;

    // Slight random scaling for variety
    const scale = (geoType === 1) ? (Math.random() * 0.4 + 0.6) : (Math.random() * 0.8 + 0.4);
    mesh.scale.set(scale, scale, scale);

    scene.add(mesh);
    sectionMeshes.push(mesh);
    allNodes.push(mesh);
}

// Network Lines (Constellation Effect)
const MAX_LINES = 1500;
const linesMaterial = new THREE.LineBasicMaterial({
    color: 0xd4af37,
    transparent: true,
    opacity: 0.12
});
const linesGeometry = new THREE.BufferGeometry();
const linePositions = new Float32Array(MAX_LINES * 2 * 3);
linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
scene.add(linesMesh);
sectionMeshes.push(linesMesh);

// 4. Gold Dust Particles
const particlesCount = 800;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 25; // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40 - 10; // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5; // z
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particlesMaterial = new THREE.PointsMaterial({
    color: 0xd4af37,
    sizeAttenuation: true,
    size: 0.04,
    transparent: true,
    opacity: 0.6
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Lighting
const ambientLight = new THREE.AmbientLight('#ffffff', 1.5); // brightened
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('#ffffff', 4);
directionalLight.position.set(2, 4, 3);
scene.add(directionalLight);

const pointLight = new THREE.PointLight('#ffdb58', 12, 40);
scene.add(pointLight);

const secondPointLight = new THREE.PointLight('#3b82f6', 8, 30); // Professional blue light instead of purple
secondPointLight.position.set(-5, -2, -2);
scene.add(secondPointLight);

// Handle Resize
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Scroll & Mouse Interactivity for 3D Camera/Lighting
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

const cursor = { x: 0, y: 0 };
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5;
    cursor.y = event.clientY / sizes.height - 0.5;
});

const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Animate objects slowly floating
    for (const mesh of sectionMeshes) {
        mesh.rotation.x += deltaTime * 0.1;
        mesh.rotation.y += deltaTime * 0.12;
    }

    // Animate Particles slowly falling
    particles.rotation.y = -scrollY * 0.0002;
    particles.position.y = -scrollY * 0.0005;

    // Camera movement based on scroll
    camera.position.y = -scrollY / sizes.height * objectsDistance;

    // Parallax / subtle movement based on mouse
    const parallaxX = cursor.x * 2;
    const parallaxY = -cursor.y * 2;
    camera.position.x += (parallaxX - camera.position.x) * 2 * deltaTime;

    // Make pointLight follow mouse loosely
    pointLight.position.x = cursor.x * 15;
    pointLight.position.y = -scrollY / sizes.height * objectsDistance - cursor.y * 15;
    pointLight.position.z = 2;

    // Animate secondary light
    secondPointLight.position.y = Math.sin(elapsedTime) * 3 - scrollY / sizes.height * objectsDistance;
    secondPointLight.position.x = Math.cos(elapsedTime * 0.5) * 5;

    // Update Constellation Lines dynamically based on Node proximity
    let lineIndex = 0;
    for (let i = 0; i < allNodes.length; i++) {
        for (let j = i + 1; j < allNodes.length; j++) {
            const dist = allNodes[i].position.distanceTo(allNodes[j].position);
            if (dist < 10) {
                linePositions[lineIndex++] = allNodes[i].position.x;
                linePositions[lineIndex++] = allNodes[i].position.y;
                linePositions[lineIndex++] = allNodes[i].position.z;

                linePositions[lineIndex++] = allNodes[j].position.x;
                linePositions[lineIndex++] = allNodes[j].position.y;
                linePositions[lineIndex++] = allNodes[j].position.z;
                if (lineIndex >= MAX_LINES * 2 * 3) break;
            }
        }
        if (lineIndex >= MAX_LINES * 2 * 3) break;
    }
    // Set rest to zero so they don't stretch into space
    for (let i = lineIndex; i < MAX_LINES * 2 * 3; i++) {
        linePositions[i] = 0;
    }
    linesMesh.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();

// 3. Preloader & Initial Animations
const tl = gsap.timeline();
document.body.style.overflow = 'hidden'; // Prevent scroll during load

// Elegant Split Loader Animation
tl.to(".loader-split-text", {
    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
    duration: 0.8,
    ease: "power4.out"
})
    .to(".loader-split-line", { width: "100px", duration: 0.6, ease: "power3.out" }, "-=0.4")
    .to(".loader-split-sub", { opacity: 1, y: -10, duration: 0.5, ease: "power2.out" }, "-=0.2")
    .to([".loader-split-text", ".loader-split-line", ".loader-split-sub"], {
        y: -30,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.in",
        delay: 0.5
    })
    .add("loaderSplit")
    .to(".loader-curtain-top", { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, "loaderSplit")
    .to(".loader-curtain-bottom", { yPercent: 100, duration: 0.8, ease: "power4.inOut" }, "loaderSplit")
    .to(".preloader", { autoAlpha: 0, duration: 0.1 })
    .call(() => { document.body.style.overflow = ''; }, null, "-=0.5")
    .fromTo(".nav-links li", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out' }, "-=0.5")
    .fromTo(".logo", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, "-=0.6")
    .fromTo(".stagger-text", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, "-=0.6");

// Advanced ScrollTrigger Animations
// --- Section Titles ---
gsap.utils.toArray('.marquee-container').forEach(title => {
    gsap.fromTo(title,
        { opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' },
        {
            opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out',
            scrollTrigger: {
                trigger: title,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });
});

// --- Service Cards (Staggered 3D Roll-in) ---
gsap.fromTo('.service-card',
    { opacity: 0, y: 100, rotationX: 25, scale: 0.9 },
    {
        opacity: 1,
        y: 0,
        rotationX: 0,
        scale: 1,
        duration: 1.2,
        stagger: 0.15,
        ease: 'back.out(1.5)',
        scrollTrigger: {
            trigger: ".services-grid",
            start: "top 80%",
            toggleActions: "play none none reverse"
        }
    }
);

// --- Timeline Items (Alternating Slide-in & Parallax Dots) ---
gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    const isOdd = i % 2 === 0; // Since flex/grid order
    const xOffset = isOdd ? -100 : 100;

    // Animate the actual card content
    gsap.fromTo(item.querySelector('.timeline-content'),
        { opacity: 0, x: xOffset, filter: 'blur(5px)' },
        {
            opacity: 1, x: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out',
            scrollTrigger: {
                trigger: item,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        }
    );

    // Parallax the timeline dot
    const dot = item.querySelector('.timeline-dot');
    if (dot) {
        gsap.fromTo(dot,
            { y: -30, scale: 0 },
            {
                y: 30, scale: 1, ease: 'none',
                scrollTrigger: {
                    trigger: item,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
    }
});

// --- Expertise Section Lists Stagger ---
gsap.fromTo(".expertise-content",
    { opacity: 0, x: -50 },
    {
        opacity: 1, x: 0, duration: 1.2,
        scrollTrigger: { trigger: ".expertise", start: "top 75%", toggleActions: "play none none reverse" }
    }
);

gsap.utils.toArray('.expertise-list li').forEach((li, i) => {
    gsap.fromTo(li,
        { opacity: 0, x: -20 },
        {
            opacity: 1, x: 0, duration: 0.8, delay: i * 0.1, ease: 'back.out(2)',
            scrollTrigger: {
                trigger: ".expertise-list",
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        }
    );
});

// --- Footer Parallax Reveal ---
gsap.fromTo(".footer h2",
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: ".footer", start: "top 90%" } }
);
gsap.fromTo(".footer p, .footer a",
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out', scrollTrigger: { trigger: ".footer", start: "top 90%" } }
);

// 3D Tilt Effect on Service Cards (Vanilla JS mapping)
const cards = document.querySelectorAll('[data-tilt]');
cards.forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;

        // Dynamic glare position
        card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
});


// 5. Scroll Progress Bar Update
const scrollProgress = document.querySelector('.scroll-progress');
window.addEventListener('scroll', () => {
    const totalScroll = document.documentElement.scrollTop;
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scroll = `${totalScroll / windowHeight * 100}%`;
    scrollProgress.style.width = scroll;
});

// 6. Magnetic Button Effects
const magneticBtns = document.querySelectorAll('.magnetic-btn');
magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.5, ease: 'power2.out' });
        const span = btn.querySelector('span');
        if (span) gsap.to(span, { x: x * 0.15, y: y * 0.15, duration: 0.5, ease: 'power2.out' });
    });

    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
        const span = btn.querySelector('span');
        if (span) gsap.to(span, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    });
});

// 7. Interactive Testimonial Cards
const testCards = document.querySelectorAll('.testimonial-card');
const testWrapper = document.querySelector('.testimonials-cards-wrapper');

if (testWrapper && testCards.length === 2) {
    let positions = ['card-1', 'card-2'];
    let isScrolling = false;

    const rotateCardsNext = () => {
        positions.unshift(positions.pop());
        testCards.forEach((card, index) => {
            card.className = `testimonial-card ${positions[index]}`;
        });
    };

    const rotateCardsPrev = () => {
        positions.push(positions.shift());
        testCards.forEach((card, index) => {
            card.className = `testimonial-card ${positions[index]}`;
        });
    };

    testWrapper.addEventListener('click', () => {
        rotateCardsNext();
    });

    testWrapper.addEventListener('mouseenter', () => {
        lenis.stop();
    });

    testWrapper.addEventListener('mouseleave', () => {
        lenis.start();
    });

    testWrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isScrolling) return;

        isScrolling = true;
        if (e.deltaY > 0) {
            rotateCardsNext(); // Scroll down -> next card
        } else {
            rotateCardsPrev(); // Scroll up -> previous card
        }

        setTimeout(() => {
            isScrolling = false;
        }, 500); // Debounce duration based on css transition
    }, { passive: false });
}
