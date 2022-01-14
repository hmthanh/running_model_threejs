import "regenerator-runtime/runtime";
import * as THREE from "./three.module.js";
import { GLTFLoader } from "./GLTFLoader.js";

import Stats from "./stats.module.js";
import { GUI } from "./lil-gui.module.min.js";
import { OrbitControls } from "./OrbitControls.js";
import LeePerrySmith from "../assets/models/LeePerrySmith.glb";

import mapCOL from "../assets/images/Map-COL.jpg";
import mapSPEC from "../assets/images/Map-SPEC.jpg";
import smoothUV from "../assets/images/Infinite-Level_02_Tangent_SmoothUV.jpg";

const container = document.getElementById("container");

let renderer, scene, camera, stats;
let mesh;
let line;

const mouse = new THREE.Vector2();

const textureLoader = new THREE.TextureLoader();

const params = {
  minScale: 10,
  maxScale: 20,
  rotate: true
};

window.addEventListener("load", init);

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  stats = new Stats();
  container.appendChild(stats.dom);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 120;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 50;
  controls.maxDistance = 200;

  scene.add(new THREE.AmbientLight(0x443333));

  const dirLight1 = new THREE.DirectionalLight(0xffddcc, 1);
  dirLight1.position.set(1, 0.3, 0.5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xccccff, 1);
  dirLight2.position.set(-1, 0.75, -0.5);
  scene.add(dirLight2);

  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);

  line = new THREE.Line(geometry, new THREE.LineBasicMaterial());
  scene.add(line);

  loadLeePerrySmith();

  window.addEventListener("resize", onWindowResize);


  const gui = new GUI();

  gui.add(params, "minScale", 1, 30);
  gui.add(params, "maxScale", 1, 30);
  gui.add(params, "rotate");
  gui.open();

  onWindowResize();
  animate();
}

function loadLeePerrySmith() {
  const loader = new GLTFLoader();

  loader.load(LeePerrySmith, function (gltf) {
    mesh = gltf.scene.children[0];
    mesh.material = new THREE.MeshPhongMaterial({
      specular: 0x111111,
      map: textureLoader.load(mapCOL),
      specularMap: textureLoader.load(mapSPEC),
      normalMap: textureLoader.load(smoothUV),
      shininess: 25,
    });

    scene.add(mesh);
    mesh.scale.set(10, 10, 10);
  });
}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);

  stats.update();
}
