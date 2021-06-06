import "./style.css";
import * as dat from "dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import {
  MeshStandardMaterial,
  MeshBasicMaterial,
  SphereGeometry,
  GridHelper,
  AxesHelper,
  DirectionalLight,
  PointLight,
  Vector3,
  PointLightHelper,
} from "three";

const bubbles = [];
let frameCount = 1;
const cauldronPosition = new THREE.Vector3(2, 0.2, 2.15);

/**
 * Base
 */
// Debug
const gui = new dat.GUI({
  width: 400,
});

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper(3);
// scene.add(axesHelper);
axesHelper.position.y += 2;
const resources_chairs = {
  texture: "chairs/baked.jpg",
  modelPath: "/chairs/chairs_scene.glb",
};
const resources_witches_den = {
  texture: "/witches_den/baked_img.jpg",
  modelPath: "/witches_den/witches_cauldron_diorama_unwrapping.glb",
};
const resources_barrels = {
  texture: "/barrels/mytexture.001.jpg",
  modelPath: "/barrels/barrels.glb",
};
const resources = resources_witches_den;
/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();
const bakedTexture = textureLoader.load(resources.texture);
bakedTexture.flipY = false;
// bakedTexture.encoding = THREE.sRGBEncoding;
//const bakedMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });
// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
let portalScene;
gltfLoader.load(
  resources.modelPath,
  (gltf) => {
    portalScene = gltf.scene;

    gltf.scene.traverse((child) => {
      child.material = bakedMaterial;
    });

    scene.add(portalScene);
  },
  () => {
    console.log("progress...");
  },
  (errEvent) => {
    console.error(errEvent);
  }
);
gltfLoader.setDRACOLoader(dracoLoader);
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 10;
scene.add(camera);

const cauldronLight = new PointLight(0x68ff3c, 1);
cauldronLight.position.copy(cauldronPosition);
scene.add(cauldronLight);
const torchLight = new PointLight("orange", 0.3);
torchLight.position.x = -3;
torchLight.position.y = 3;
torchLight.position.z = 2;
scene.add(torchLight);
//scene.add(new PointLightHelper(cauldronLight));
// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();
  // console.log(camera.position);
  // Render
  renderer.render(scene, camera);

  updateBubbles();
  if (frameCount % 30 === 0 && bubbles.length < 5) {
    createBubble();
  }
  frameCount++;
  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

function createBubble() {
  const colour = randomBubbleColour();
  const bubble = new THREE.Mesh(
    new SphereGeometry(1, 8, 8),
    // new MeshBasicMaterial({ color: 0xaaff00, wireframe: true })
    new MeshStandardMaterial({
      color: colour,
      wireframe: false,
    })
  );

  const xOffset = randBetween(-0.3, 0.3);
  const zOffset = 0; //randBetween(-0.3, 0.3);

  bubble.position.copy(cauldronPosition.add(new Vector3(xOffset, 0, zOffset)));
  //piggy-back some more info on the mesh object
  bubble.velocity = new THREE.Vector3(0, 0.01 + Math.random() * 0.02, 0);
  bubble.maxHeight = 2 + Math.random() * 2;

  const sz = 0.05 + Math.random() * 0.2;
  bubble.scale.set(sz, sz, sz);

  scene.add(bubble);
  bubbles.push(bubble);
}

function updateBubbles() {
  for (let b of bubbles) {
    b.position.add(b.velocity);
    if (b.position.y > b.maxHeight) {
      b.position.y = 0;
      b.maxHeight = 2 + Math.random() * 2;
      b.material.color.set(randomBubbleColour());
    }
  }
}

function randBetween(mn, mx) {
  return mn + Math.random() * (mx - mn);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBubbleColour() {
  //  return pick([0x68ff3c, 0x6f00ff]);
  return pick([0xffffff]);
}
