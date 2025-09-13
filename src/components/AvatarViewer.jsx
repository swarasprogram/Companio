import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const AvatarViewer = forwardRef(({ modelUrl }, ref) => {
  const mountRef = useRef(null);
  const avatarMeshRef = useRef(null);

  useEffect(() => {
  const mount = mountRef.current; // ✅ safe snapshot
  if (!mount) return;

  let width = mount.clientWidth;
  let height = mount.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
  camera.position.set(0, 1.6, 2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  mount.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.target.set(0, 1.6, 0);
  controls.update();

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(light);

  const loader = new GLTFLoader();
  loader.load(
    modelUrl,
    (gltf) => {
      scene.add(gltf.scene);
    },
    undefined,
    (error) => {
      console.error('GLTF load error:', error);
    }
  );

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };
  animate();

  return () => {
    if (mount && renderer.domElement) {
      mount.removeChild(renderer.domElement);
    }
  };
}, [modelUrl]);

  // Expose mouth movement function
  useImperativeHandle(ref, () => ({
    setMouthOpen(value) {
      const mesh = avatarMeshRef.current;
      if (mesh && mesh.morphTargetInfluences && mesh.morphTargetDictionary['viseme_aa'] !== undefined) {
        mesh.morphTargetInfluences[mesh.morphTargetDictionary['viseme_aa']] = value;
      }
    }
  }));

  return <div ref={mountRef} style={{ width: '100%', height: '500px' }} />;
});

export default AvatarViewer;
