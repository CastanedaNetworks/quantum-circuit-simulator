import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CircuitElement } from '../types/quantum';

interface CircuitVisualization3DProps {
  circuit: CircuitElement[];
  numQubits: number;
}

export const CircuitVisualization3D: React.FC<CircuitVisualization3DProps> = ({ 
  circuit, 
  numQubits 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 5, 10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    for (let i = 0; i < numQubits; i++) {
      const wireGeometry = new THREE.CylinderGeometry(0.05, 0.05, 10, 8);
      const wireMaterial = new THREE.MeshPhongMaterial({ color: 0x4b5563 });
      const wire = new THREE.Mesh(wireGeometry, wireMaterial);
      wire.rotation.z = Math.PI / 2;
      wire.position.y = -i * 2;
      scene.add(wire);

      const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0x3b82f6 });
      const startQubit = new THREE.Mesh(sphereGeometry, sphereMaterial);
      startQubit.position.set(-5, -i * 2, 0);
      scene.add(startQubit);
    }

    circuit.forEach((element, idx) => {
      element.targetQubits.forEach((qubitIdx) => {
        const gateGeometry = new THREE.BoxGeometry(1, 1, 1);
        const gateMaterial = new THREE.MeshPhongMaterial({ 
          color: element.gate.qubits === 2 ? 0xef4444 : 0x10b981 
        });
        const gate = new THREE.Mesh(gateGeometry, gateMaterial);
        gate.position.set(-3 + idx * 1.5, -qubitIdx * 2, 0);
        scene.add(gate);

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = 'white';
          context.font = 'bold 48px Arial';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(element.gate.symbol, 64, 64);
        }

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.8, 0.8, 1);
        sprite.position.copy(gate.position);
        sprite.position.z += 0.6;
        scene.add(sprite);
      });

      if (element.gate.qubits === 2) {
        const lineGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2, 8);
        const lineMaterial = new THREE.MeshPhongMaterial({ color: 0xef4444 });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(
          -3 + idx * 1.5,
          -(element.targetQubits[0] + element.targetQubits[1]) / 2 * 2,
          0
        );
        scene.add(line);
      }
    });

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [circuit, numQubits]);

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4">3D Circuit Visualization</h2>
      <div ref={mountRef} className="w-full h-96 rounded-lg overflow-hidden" />
    </div>
  );
};