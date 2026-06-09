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

  // Refs that mirror props/state so callbacks can stay referentially stable
  // (depending on currentVector here previously caused an infinite render loop).
  const currentVectorRef = useRef<BlochVector>({ x: 0, y: 0, z: 1 });
  const quantumStateRef = useRef<QuantumState>(quantumState);
  quantumStateRef.current = quantumState;

  // Initialize Three.js scene
  const initializeScene = useCallback((): { scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer; controls: OrbitControls } | undefined => {
    
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


      if (width === 0 || height === 0) {
        console.warn('[BlochSphere] Invalid canvas dimensions');
        return undefined;
      }

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf1f5f9); // slate-100
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(2.2, 2.2, 2.2);
      cameraRef.current = camera;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      // Safely append renderer to DOM
      if (mountRef.current && renderer.domElement) {
        mountRef.current.appendChild(renderer.domElement);
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

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      const pointLight = new THREE.PointLight(0xffffff, 0.3);
      pointLight.position.set(-3, -3, -3);
      scene.add(pointLight);

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
      color: 0x94a3b8, // slate-400
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // Solid sphere (for depth reference)
    const solidSphereMaterial = new THREE.MeshPhongMaterial({
      color: 0xe2e8f0, // slate-200
      transparent: true,
      opacity: 0.35,
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
    const xGeometry = new THREE.CylinderGeometry(0.012, 0.012, axisLength * 2, 8);
    const xMaterial = new THREE.MeshPhongMaterial({ color: 0xdc2626 });
    const xAxis = new THREE.Mesh(xGeometry, xMaterial);
    xAxis.rotation.z = Math.PI / 2;
    axes.add(xAxis);

    // Y-axis (green)
    const yMaterial = new THREE.MeshPhongMaterial({ color: 0x16a34a });
    const yAxis = new THREE.Mesh(xGeometry, yMaterial);
    axes.add(yAxis);

    // Z-axis (blue)
    const zMaterial = new THREE.MeshPhongMaterial({ color: 0x2563eb });
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

      createAxisLabel('X', new THREE.Vector3(1.4, 0, 0), 0xdc2626);
      createAxisLabel('Y', new THREE.Vector3(0, 1.4, 0), 0x16a34a);
      createAxisLabel('Z', new THREE.Vector3(0, 0, 1.4), 0x2563eb);
      createAxisLabel('-X', new THREE.Vector3(-1.4, 0, 0), 0xdc2626);
      createAxisLabel('-Y', new THREE.Vector3(0, -1.4, 0), 0x16a34a);
      createAxisLabel('-Z', new THREE.Vector3(0, 0, -1.4), 0x2563eb);
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
        color: 0x94a3b8,
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
        color: 0x94a3b8,
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
      0x0f172a,
      length * 0.2,
      length * 0.1
    );

    // Dark "instrument needle" — stands out against the light sphere
    arrowHelper.setColor(0x0f172a);
    
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

  // Animate between states. Reads the start vector from a ref so this callback
  // stays stable across renders (otherwise it re-triggers the update effect and
  // loops forever).
  const animateToState = useCallback((newVector: BlochVector) => {
    setIsAnimating(true);

    const startTime = performance.now();
    const startVector = { ...currentVectorRef.current };

    const animateFrame = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Easing function (ease-out cubic)
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const interpolatedVector = BlochSphereUtils.slerp(startVector, newVector, easedProgress);
      currentVectorRef.current = interpolatedVector;
      setCurrentVector(interpolatedVector);
      updateStateVector(interpolatedVector);

      if (progress < 1) {
        requestAnimationFrame(animateFrame);
      } else {
        currentVectorRef.current = newVector;
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animateFrame);
  }, [animationDuration, updateStateVector]);

  // Initialize scene on mount
  useEffect(() => {
    const initialState = quantumStateRef.current;
    // Captured for cleanup: mountRef.current may already be null when the
    // effect's destructor runs on unmount.
    const mountNode = mountRef.current;

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

      if (initialState.getNumQubits() === 1) {
        initialVector = BlochSphereUtils.stateToBlochVector(initialState);
      } else {
        // For multi-qubit states, show a default |0⟩ vector
        initialVector = { x: 0, y: 0, z: 1 }; // |0⟩ state
      }
      const stateVector = createStateVector(scene, initialVector);
      stateVectorRef.current = stateVector;
      currentVectorRef.current = initialVector;
      setCurrentVector(initialVector);

      animate();
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
        if (mountNode && rendererRef.current.domElement) {
          mountNode.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }
    };
  }, [initializeScene, createBlochSphere, createAxes, createGrid, createStateVector, animate]);

  // Target vector derived from the current quantum state. Computed in render so
  // the update effect can depend on its primitive values rather than the
  // quantumState object identity (which changes every parent render).
  const targetVector =
    quantumState.getNumQubits() === 1
      ? BlochSphereUtils.stateToBlochVector(quantumState)
      : null;

  // Update when the quantum state actually changes (by value, not identity).
  useEffect(() => {
    if (!isInitialized || !targetVector) return;
    animateToState(targetVector);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, targetVector?.x, targetVector?.y, targetVector?.z, animateToState]);

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="bg-white border border-slate-200 rounded-md shadow-sm">
        <div className="flex justify-between items-center px-5 py-3 border-b border-slate-200">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bloch Sphere</h2>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-red-50 text-red-700 border border-red-200">
            Error
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-center h-80 bg-slate-50 border border-slate-200 rounded">
            <div className="text-center px-6">
              <div className="w-10 h-10 border border-red-300 bg-red-50 text-red-700 rounded flex items-center justify-center mx-auto mb-3 font-mono text-lg">
                !
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Visualization Error</h3>
              <p className="text-slate-500 text-xs font-mono mb-3">{initError}</p>
              <p className="text-slate-400 text-xs">
                {quantumState.getNumQubits() > 1
                  ? 'Note: the Bloch sphere only supports single-qubit states'
                  : 'Three.js initialization failed'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const status = !isInitialized ? 'Loading' : isAnimating ? 'Animating' : 'Ready';

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-sm">
      <div className="flex justify-between items-center px-5 py-3 border-b border-slate-200">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bloch Sphere</h2>
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
            isAnimating
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}
        >
          {status}
        </span>
      </div>

      <div className="p-5">
        <div
          ref={mountRef}
          className="w-full h-96 rounded overflow-hidden bg-slate-100 border border-slate-200"
        />

        {/* State readout */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {(
            [
              ['X', currentVector.x, 'text-red-600'],
              ['Y', currentVector.y, 'text-green-600'],
              ['Z', currentVector.z, 'text-blue-600'],
            ] as const
          ).map(([label, value, color]) => (
            <div key={label} className="border border-slate-200 rounded px-3 py-2">
              <div className={`text-[11px] font-semibold ${color}`}>{label}</div>
              <div className="font-mono text-sm text-slate-800">{value.toFixed(3)}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 text-[11px] text-slate-400 leading-relaxed">
          Drag to rotate · scroll to zoom · the dark arrow marks the current qubit state.
        </div>
      </div>
    </div>
  );
};
