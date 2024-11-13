// ThreeDScene.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Core scene setup
const initializeMainScene = () => {
	const scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0x202020, 30, 80);
	addGridHelper(scene);
	addLighting(scene);
	return scene;
};

const initializeMainCamera = (aspectRatio) => {
	const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
	camera.position.set(0, 10, 20);
	return camera;
};

const initializeRenderer = (canvas, width, height, backgroundColor) => {
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
	renderer.setSize(width, height);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setClearColor(backgroundColor);
	return renderer;
};

export function createThreeDScene({
	canvas,
	width = window.innerWidth,
	height = window.innerHeight,
	backgroundColor = 0x202020
}) {
	if (!canvas) throw new Error('A canvas element must be provided');

	const mainScene = initializeMainScene();
	const mainCamera = initializeMainCamera(width / height);
	const renderer = initializeRenderer(canvas, width, height, backgroundColor);

	const { controlScene, controlCamera, controlRenderer, controlCube } =
		initializeControlComponents();
	const controls = setupOrbitControls(mainCamera, renderer);

	// Event listeners
	controlRenderer.domElement.addEventListener('click', (event) =>
		handleCubeClick(event, controlCamera, controlCube, mainCamera, controls)
	);
	window.addEventListener('resize', () => handleResize(mainCamera, renderer, width, height));

	// Start animation
	startAnimationLoop(
		renderer,
		mainScene,
		mainCamera,
		controls,
		controlRenderer,
		controlScene,
		controlCamera,
		controlCube
	);

	return canvas;
}

// Control components setup with duplicate check
const initializeControlComponents = () => {
	const controlScene = new THREE.Scene();
	const controlCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
	controlCamera.position.set(0, 0, 3);

	// Check if controlRenderer already exists to prevent duplicates
	let controlRenderer = document.querySelector('#control-renderer');
	if (!controlRenderer) {
		controlRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		controlRenderer.setSize(100, 100);
		controlRenderer.setPixelRatio(window.devicePixelRatio);
		controlRenderer.domElement.style.position = 'absolute';
		controlRenderer.domElement.style.top = '10px';
		controlRenderer.domElement.style.right = '10px';
		controlRenderer.domElement.id = 'control-renderer'; // Assign an ID to track duplicates
		document.body.appendChild(controlRenderer.domElement);
	} else {
		controlRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	}

	const controlCube = createControlCube();
	controlScene.add(controlCube);

	return { controlScene, controlCamera, controlRenderer, controlCube };
};
// Components
const addGridHelper = (scene) => {
	const gridHelper = new THREE.GridHelper(100, 100, 0x888888, 0x444444);
	scene.add(gridHelper);
};

const addLighting = (scene) => {
	scene.add(new THREE.AmbientLight(0xffffff, 0.5));
	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
	directionalLight.position.set(5, 10, 7.5);
	scene.add(directionalLight);
};

const createControlCube = () => {
	const materials = [
		new THREE.MeshBasicMaterial({ color: 0xff0000 }),
		new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
		new THREE.MeshBasicMaterial({ color: 0x0000ff }),
		new THREE.MeshBasicMaterial({ color: 0xffff00 }),
		new THREE.MeshBasicMaterial({ color: 0x00ffff }),
		new THREE.MeshBasicMaterial({ color: 0xff00ff })
	];
	const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materials);
	cube.scale.set(1.5, 1.5, 1.5);
	return cube;
};

const setupOrbitControls = (camera, renderer) => {
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	return controls;
};

// Event handling and animation
const handleCubeClick = (event, controlCamera, controlCube, mainCamera, controls) => {
	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2((event.offsetX / 100) * 2 - 1, -(event.offsetY / 100) * 2 + 1);
	raycaster.setFromCamera(mouse, controlCamera);

	const intersects = raycaster.intersectObject(controlCube);
	if (intersects.length > 0) {
		const directions = [
			{ x: 10, y: 0, z: 0 }, // X+
			{ x: -10, y: 0, z: 0 }, // X-
			{ x: 0, y: 10, z: 0 }, // Y+
			{ x: 0, y: -10, z: 0 }, // Y-
			{ x: 0, y: 0, z: 10 }, // Z+
			{ x: 0, y: 0, z: -10 } // Z-
		];
		const { x, y, z } = directions[intersects[0].face.materialIndex];
		mainCamera.position.set(x, y, z);
		mainCamera.lookAt(0, 0, 0);
		controls.update();
	}
};

const syncCubeWithCamera = (controlCube, mainCamera) => {
	controlCube.quaternion.copy(mainCamera.quaternion).invert();
};

const handleResize = (mainCamera, renderer, width, height) => {
	mainCamera.aspect = width / height;
	mainCamera.updateProjectionMatrix();
	renderer.setSize(width, height);
};

const startAnimationLoop = (
	renderer,
	mainScene,
	mainCamera,
	controls,
	controlRenderer,
	controlScene,
	controlCamera,
	controlCube
) => {
	const animate = () => {
		requestAnimationFrame(animate);
		controls.update();
		syncCubeWithCamera(controlCube, mainCamera);
		renderer.render(mainScene, mainCamera);
		controlRenderer.render(controlScene, controlCamera);
	};
	animate();
};
