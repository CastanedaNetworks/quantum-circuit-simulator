import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { BlochVector, BlochSphereUtils } from '../utils/blochSphere';
import { QuantumState } from '../quantum/state';

interface BlochSphereProps {
  quantumState: QuantumState;
  showMeasurementAxes?: boolean;
  showGrid?: boolean;
  animationDuration?: number;
}

export const BlochSphere: React.FC<BlochSphereProps> = ({
  quantumState,
  showMeasurementAxes = true,
  showGrid = true,
  animationDuration = 1000,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const stateVectorRef = useRef<THREE.ArrowHelper | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [currentVector, setCurrentVector] = useState<BlochVector>({ x: 0, y: 0, z: 1 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize Three.js scene
  const initializeScene = useCallback((): { scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer; controls: OrbitControls } | undefined => {
    console.log('[BlochSphere] Initializing Three.js scene...');
    
    if (!mountRef.current) {
      console.warn('[BlochSphere] Mount ref not available');
      return undefined;
    }

    try {
      // Check if THREE is available
      if (!THREE) {
        console.error('[BlochSphere] THREE.js not available');
        return undefined;
      }

      const width = mountRef.current.clientWidth || 400;
      const height = mountRef.current.clientHeight || 400;

      console.log('[BlochSphere] Canvas dimensions:', width, 'x', height);

      if (width === 0 || height === 0) {
        console.warn('[BlochSphere] Invalid canvas dimensions');
        return undefined;
      }

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);
      sceneRef.current = scene;
      console.log('[BlochSphere] Scene created');

      // Camera
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(3, 3, 3);
      cameraRef.current = camera;
      console.log('[BlochSphere] Camera created');

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      // Safely append renderer to DOM
      if (mountRef.current && renderer.domElement) {
        mountRef.current.appendChild(renderer.domElement);
        console.log('[BlochSphere] Renderer DOM element attached');
      } else {
        console.error('[BlochSphere] Failed to attach renderer to DOM');
        renderer.dispose();
        return undefined;
      }
      
      rendererRef.current = renderer;

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 2;
      controls.maxDistance = 8;
      controlsRef.current = controls;
      console.log('[BlochSphere] Controls created');

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      const pointLight = new THREE.PointLight(0x4080ff, 0.4);
      pointLight.position.set(-3, -3, -3);
      scene.add(pointLight);

      console.log('[BlochSphere] Scene initialization completed successfully');
      return { scene, camera, renderer, controls };
      
    } catch (error) {
      console.error('[BlochSphere] Error during scene initialization:', error);
      
      // Cleanup any partially created objects
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      
      return undefined;
    }
  }, []);

  // Create Bloch sphere geometry
  const createBlochSphere = useCallback((scene: THREE.Scene) => {
    // Main sphere (wireframe)
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x333333,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // Solid sphere (for depth reference)
    const solidSphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide
    });
    const solidSphere = new THREE.Mesh(sphereGeometry, solidSphereMaterial);
    scene.add(solidSphere);

    return { sphere, solidSphere };
  }, []);

  // Create coordinate axes
  const createAxes = useCallback((scene: THREE.Scene) => {
    const axisLength = 1.2;
    const axes = new THREE.Group();

    // X-axis (red)
    const xGeometry = new THREE.CylinderGeometry(0.02, 0.02, axisLength * 2, 8);
    const xMaterial = new THREE.MeshPhongMaterial({ color: 0xff4444 });
    const xAxis = new THREE.Mesh(xGeometry, xMaterial);
    xAxis.rotation.z = Math.PI / 2;
    axes.add(xAxis);

    // Y-axis (green)
    const yMaterial = new THREE.MeshPhongMaterial({ color: 0x44ff44 });
    const yAxis = new THREE.Mesh(xGeometry, yMaterial);
    axes.add(yAxis);

    // Z-axis (blue)
    const zMaterial = new THREE.MeshPhongMaterial({ color: 0x4444ff });
    const zAxis = new THREE.Mesh(xGeometry, zMaterial);
    zAxis.rotation.x = Math.PI / 2;
    axes.add(zAxis);

    scene.add(axes);

    // Axis labels
    if (showMeasurementAxes) {
      const createAxisLabel = (text: string, position: THREE.Vector3, color: number) => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
          context.font = 'bold 24px Arial';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(text, 32, 32);
        }

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.copy(position);
        sprite.scale.set(0.3, 0.3, 1);
        scene.add(sprite);
        return sprite;
      };

      createAxisLabel('X', new THREE.Vector3(1.4, 0, 0), 0xff4444);
      createAxisLabel('Y', new THREE.Vector3(0, 1.4, 0), 0x44ff44);
      createAxisLabel('Z', new THREE.Vector3(0, 0, 1.4), 0x4444ff);
      createAxisLabel('-X', new THREE.Vector3(-1.4, 0, 0), 0xff4444);
      createAxisLabel('-Y', new THREE.Vector3(0, -1.4, 0), 0x44ff44);
      createAxisLabel('-Z', new THREE.Vector3(0, 0, -1.4), 0x4444ff);
    }

    return axes;
  }, [showMeasurementAxes]);

  // Create coordinate grid
  const createGrid = useCallback((scene: THREE.Scene) => {
    if (!showGrid) return;

    const gridGroup = new THREE.Group();

    // Create latitude lines
    for (let i = 1; i < 6; i++) {
      const phi = (i * Math.PI) / 6;
      const radius = Math.sin(phi);
      const y = Math.cos(phi);

      const geometry = new THREE.RingGeometry(radius - 0.005, radius + 0.005, 32);
      const material = new THREE.MeshBasicMaterial({
        color: 0x555555,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y;
      gridGroup.add(ring);

      // Negative hemisphere
      const ringNeg = ring.clone();
      ringNeg.position.y = -y;
      gridGroup.add(ringNeg);
    }

    // Create longitude lines
    for (let i = 0; i < 8; i++) {
      const theta = (i * Math.PI) / 4;
      const curve = new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2, false, 0);
      const points = curve.getPoints(32);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      
      const material = new THREE.LineBasicMaterial({
        color: 0x555555,
        transparent: true,
        opacity: 0.3
      });
      const ellipse = new THREE.Line(geometry, material);
      ellipse.rotation.y = theta;
      ellipse.rotation.x = Math.PI / 2;
      gridGroup.add(ellipse);
    }

    scene.add(gridGroup);
    return gridGroup;
  }, [showGrid]);

  // Create state vector arrow
  const createStateVector = useCallback((scene: THREE.Scene, vector: BlochVector) => {
    const direction = new THREE.Vector3(vector.x, vector.z, -vector.y); // Convert to Three.js coordinates
    const origin = new THREE.Vector3(0, 0, 0);
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    
    const arrowHelper = new THREE.ArrowHelper(
      direction.normalize(),
      origin,
      length,
      0xffaa00,
      length * 0.2,
      length * 0.1
    );
    
    // Make arrow thicker and more visible
    arrowHelper.setColor(0xffaa00);
    
    scene.add(arrowHelper);
    return arrowHelper;
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) {
      return;
    }

    controlsRef.current.update();
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Update state vector
  const updateStateVector = useCallback((vector: BlochVector) => {
    if (!sceneRef.current || !stateVectorRef.current) return;

    const direction = new THREE.Vector3(vector.x, vector.z, -vector.y);
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    
    stateVectorRef.current.setDirection(direction.normalize());
    stateVectorRef.current.setLength(length, length * 0.2, length * 0.1);
  }, []);

  // Animate between states
  const animateToState = useCallback((newVector: BlochVector) => {
    setIsAnimating(true);
    setCurrentVector(newVector);

    const startTime = Date.now();
    const startVector = { ...currentVector };

    const animateFrame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Easing function (ease-out cubic)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      const interpolatedVector = BlochSphereUtils.slerp(startVector, newVector, easedProgress);
      setCurrentVector(interpolatedVector);
      updateStateVector(interpolatedVector);

      if (progress < 1) {
        requestAnimationFrame(animateFrame);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animateFrame);
  }, [currentVector, animationDuration, updateStateVector]);

  // Initialize scene on mount
  useEffect(() => {
    console.log('[BlochSphere] Initializing component, quantumState qubits:', quantumState.getNumQubits());
    
    try {
      const result = initializeScene();
      if (!result) {
        console.warn('[BlochSphere] Failed to initialize scene');
        return;
      }
      
      const { scene } = result;
      
      createBlochSphere(scene);
      createAxes(scene);
      createGrid(scene);
      
      // Create initial state vector - only for single-qubit states
      let initialVector: BlochVector;
      
      if (quantumState.getNumQubits() === 1) {
        initialVector = BlochSphereUtils.stateToBlochVector(quantumState);
        console.log('[BlochSphere] Using quantum state vector:', initialVector);
      } else {
        // For multi-qubit states, show the first qubit's reduced state or a default vector
        console.warn('[BlochSphere] Multi-qubit state detected, using default |0⟩ state');
        initialVector = { x: 0, y: 0, z: 1 }; // |0⟩ state
      }
      const stateVector = createStateVector(scene, initialVector);
      stateVectorRef.current = stateVector;
      setCurrentVector(initialVector);

      animate();
      console.log('[BlochSphere] Component initialization completed successfully');
      setIsInitialized(true);
      setInitError(null);
    } catch (error) {
      console.error('[BlochSphere] Error during component initialization:', error);
      setInitError(error instanceof Error ? error.message : 'Unknown error');
      setIsInitialized(false);
    }

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        if (mountRef.current && rendererRef.current.domElement) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }
    };
  }, [initializeScene, createBlochSphere, createAxes, createGrid, createStateVector, animate, quantumState]);

  // Update when quantum state changes
  useEffect(() => {
    console.log('[BlochSphere] Quantum state updated, qubits:', quantumState.getNumQubits());
    
    try {
      if (quantumState.getNumQubits() === 1) {
        const newVector = BlochSphereUtils.stateToBlochVector(quantumState);
        console.log('[BlochSphere] New vector from quantum state:', newVector);
        animateToState(newVector);
      } else {
        console.log('[BlochSphere] Multi-qubit state, keeping current visualization');
      }
    } catch (error) {
      console.error('[BlochSphere] Error updating from quantum state:', error);
    }
  }, [quantumState, animateToState]);

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Bloch Sphere</h2>
          <div className="px-2 py-1 rounded text-xs bg-red-600 text-white">
            Error
          </div>
        </div>
        
        <div className="flex items-center justify-center h-96 bg-red-900/20 border border-red-700 rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">!</span>
            </div>
            <h3 className="text-lg font-semibold text-red-400 mb-2">Visualization Error</h3>
            <p className="text-gray-300 text-sm mb-4">{initError}</p>
            <p className="text-gray-400 text-xs">
              {quantumState.getNumQubits() > 1 ? 
                'Note: Bloch sphere only supports single-qubit states' : 
                'Three.js initialization failed'
              }
            </p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <p className="text-gray-400 text-sm">
            Current quantum state: {quantumState.getNumQubits()} qubit{quantumState.getNumQubits() !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Bloch Sphere</h2>
        <div className="flex space-x-2">
          <div className={`px-2 py-1 rounded text-xs ${
            !isInitialized ? 'bg-blue-600 text-white' :
            isAnimating ? 'bg-yellow-600 text-white' : 'bg-green-700 text-white'
          }`}>
            {!isInitialized ? 'Loading...' : isAnimating ? 'Animating...' : 'Ready'}
          </div>
        </div>
      </div>
      
      <div ref={mountRef} className="w-full h-96 rounded-lg overflow-hidden bg-gray-800" />
      
      {/* State information */}
      <div className="mt-4 p-3 bg-gray-800 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">X:</span>
            <span className="text-red-400 ml-2 font-mono">
              {currentVector.x.toFixed(3)}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Y:</span>
            <span className="text-green-400 ml-2 font-mono">
              {currentVector.y.toFixed(3)}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Z:</span>
            <span className="text-blue-400 ml-2 font-mono">
              {currentVector.z.toFixed(3)}
            </span>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-400">
          <p>• Drag to rotate the sphere</p>
          <p>• Scroll to zoom in/out</p>
          <p>• The orange arrow shows the current qubit state</p>
        </div>
      </div>
    </div>
  );
};