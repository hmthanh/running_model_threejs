// import { GLTFLoader } from "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/loaders/GLTFLoader.js";
// import * as SkeletonUtils from "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/utils/SkeletonUtils.js";
// import Soldier from "https://github.com/mrdoob/three.js/blob/5346f4ec18eeaa7359ae0da64cd3ec12a8eb9599/examples/models/gltf/Soldier.glb";
import { Clock, Fog, Scene } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils.js";
import { PerspectiveCamera } from "three/src/Three";
import { Color } from "three/src/Three";
import { DirectionalLight } from "three/src/Three";
import { HemisphereLight } from "three/src/Three";
import { Mesh } from "three/src/Three";
import { PlaneGeometry } from "three/src/Three";
import { MeshPhongMaterial } from "three/src/Three";
import { WebGLRenderer } from "three/src/Three";
import { AnimationMixer } from "three/src/Three";
import { sRGBEncoding } from "three/src/constants";
import Soldier from "./models/Soldier.glb";

let camera, scene, renderer;
let clock;

const mixers = [];

init();
animate();

function init() {
  camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(2, 3, -6);
  camera.lookAt(0, 1, 0);

  clock = new Clock();

  scene = new Scene();
  scene.background = new Color(0xa0a0a0);
  scene.fog = new Fog(0xa0a0a0, 10, 50);

  const hemiLight = new HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new DirectionalLight(0xffffff);
  dirLight.position.set(-3, 10, -10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 4;
  dirLight.shadow.camera.bottom = -4;
  dirLight.shadow.camera.left = -4;
  dirLight.shadow.camera.right = 4;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 40;
  scene.add(dirLight);

  // scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

  // ground

  const mesh = new Mesh(
    new PlaneGeometry(200, 200),
    new MeshPhongMaterial({ color: 0x999999, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);
  const loader = new GLTFLoader();
  loader.load(Soldier, function (gltf) {
    gltf.scene.traverse(function (object) {
      if (object.isMesh) object.castShadow = true;
    });

    const model1 = SkeletonUtils.clone(gltf.scene);
    const model2 = SkeletonUtils.clone(gltf.scene);
    const model3 = SkeletonUtils.clone(gltf.scene);

    const mixer1 = new AnimationMixer(model1);
    const mixer2 = new AnimationMixer(model2);
    const mixer3 = new AnimationMixer(model3);

    mixer1.clipAction(gltf.animations[0]).play(); // idle
    mixer2.clipAction(gltf.animations[1]).play(); // run
    mixer3.clipAction(gltf.animations[3]).play(); // walk

    model1.position.x = -2;
    model2.position.x = 0;
    model3.position.x = 2;

    scene.add(model1, model2, model3);
    scene.add(model1);
    mixers.push(mixer1, mixer2, mixer3);

    animate();
  });

  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = sRGBEncoding;
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  for (const mixer of mixers) mixer.update(delta);

  renderer.render(scene, camera);
}
