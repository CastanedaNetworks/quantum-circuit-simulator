declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, MOUSE, TOUCH, EventDispatcher } from 'three';
  
  export class OrbitControls extends EventDispatcher {
    constructor(object: Camera, domElement?: HTMLElement);
    
    object: Camera;
    domElement: HTMLElement | Document;
    
    enabled: boolean;
    target: THREE.Vector3;
    
    minDistance: number;
    maxDistance: number;
    
    minZoom: number;
    maxZoom: number;
    
    minPolarAngle: number;
    maxPolarAngle: number;
    
    minAzimuthAngle: number;
    maxAzimuthAngle: number;
    
    enableDamping: boolean;
    dampingFactor: number;
    
    enableZoom: boolean;
    zoomSpeed: number;
    
    enableRotate: boolean;
    rotateSpeed: number;
    
    enablePan: boolean;
    panSpeed: number;
    screenSpacePanning: boolean;
    keyPanSpeed: number;
    
    autoRotate: boolean;
    autoRotateSpeed: number;
    
    enableKeys: boolean;
    keys: { LEFT: number; UP: number; RIGHT: number; BOTTOM: number };
    
    mouseButtons: { LEFT: MOUSE; MIDDLE: MOUSE; RIGHT: MOUSE };
    touches: { ONE: TOUCH; TWO: TOUCH };
    
    update(): void;
    
    saveState(): void;
    reset(): void;
    
    dispose(): void;
    
    getPolarAngle(): number;
    getAzimuthalAngle(): number;
    
    setPolarAngle(angle: number): void;
    setAzimuthalAngle(angle: number): void;
    
    getDistance(): number;
    
    listenToKeyEvents(domElement: HTMLElement | Document): void;
    stopListenToKeyEvents(): void;
  }
}