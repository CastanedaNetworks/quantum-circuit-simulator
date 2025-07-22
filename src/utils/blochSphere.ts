import { complex, abs } from 'mathjs';
import { QuantumState } from '../quantum/state';

export interface BlochVector {
  x: number;
  y: number;
  z: number;
}

export interface SphericalCoordinates {
  theta: number; // polar angle (0 to π)
  phi: number;   // azimuthal angle (0 to 2π)
  r: number;     // radius (should be 1 for pure states)
}

export class BlochSphereUtils {
  
  /**
   * Convert a single-qubit quantum state to Bloch sphere coordinates
   * For a state α|0⟩ + β|1⟩, the Bloch vector is:
   * x = 2*Re(α*β*)
   * y = 2*Im(α*β*)
   * z = |α|² - |β|²
   */
  static stateToBlochVector(state: QuantumState): BlochVector {
    if (state.getNumQubits() !== 1) {
      throw new Error('Bloch sphere visualization only supports single-qubit states');
    }

    const alpha = state.getAmplitude(0); // |0⟩ amplitude
    const beta = state.getAmplitude(1);  // |1⟩ amplitude

    // Calculate Bloch vector components
    const alphaBetaConj = complex(
      alpha.re * beta.re + alpha.im * beta.im,
      alpha.im * beta.re - alpha.re * beta.im
    );

    const x = 2 * alphaBetaConj.re;
    const y = 2 * alphaBetaConj.im;
    const z = Math.pow(Number(abs(alpha)), 2) - Math.pow(Number(abs(beta)), 2);

    return { x, y, z };
  }

  /**
   * Convert Bloch vector to spherical coordinates
   */
  static blochVectorToSpherical(vector: BlochVector): SphericalCoordinates {
    const r = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    const theta = Math.acos(vector.z / (r || 1)); // Avoid division by zero
    const phi = Math.atan2(vector.y, vector.x);

    return {
      theta: isNaN(theta) ? 0 : theta,
      phi: isNaN(phi) ? 0 : phi,
      r: r
    };
  }

  /**
   * Convert spherical coordinates to Cartesian Bloch vector
   */
  static sphericalToBlochVector(coords: SphericalCoordinates): BlochVector {
    return {
      x: coords.r * Math.sin(coords.theta) * Math.cos(coords.phi),
      y: coords.r * Math.sin(coords.theta) * Math.sin(coords.phi),
      z: coords.r * Math.cos(coords.theta)
    };
  }

  /**
   * Create a quantum state from Bloch vector
   */
  static blochVectorToState(vector: BlochVector): QuantumState {
    const spherical = this.blochVectorToSpherical(vector);
    
    // Convert spherical coordinates to quantum state amplitudes
    const alpha = complex(Math.cos(spherical.theta / 2));
    const beta = complex(
      Math.sin(spherical.theta / 2) * Math.cos(spherical.phi),
      Math.sin(spherical.theta / 2) * Math.sin(spherical.phi)
    );

    return new QuantumState(1, [alpha, beta]);
  }

  /**
   * Get common quantum states as Bloch vectors
   */
  static getCommonStates(): Record<string, BlochVector> {
    return {
      '|0⟩': { x: 0, y: 0, z: 1 },
      '|1⟩': { x: 0, y: 0, z: -1 },
      '|+⟩': { x: 1, y: 0, z: 0 }, // (|0⟩ + |1⟩)/√2
      '|-⟩': { x: -1, y: 0, z: 0 }, // (|0⟩ - |1⟩)/√2
      '|+i⟩': { x: 0, y: 1, z: 0 }, // (|0⟩ + i|1⟩)/√2
      '|-i⟩': { x: 0, y: -1, z: 0 }, // (|0⟩ - i|1⟩)/√2
    };
  }

  /**
   * Calculate the rotation axis and angle between two Bloch vectors
   */
  static getRotationBetweenVectors(from: BlochVector, to: BlochVector): {
    axis: BlochVector;
    angle: number;
  } {
    // Cross product to get rotation axis
    const axis = {
      x: from.y * to.z - from.z * to.y,
      y: from.z * to.x - from.x * to.z,
      z: from.x * to.y - from.y * to.x
    };

    // Normalize axis
    const axisLength = Math.sqrt(axis.x * axis.x + axis.y * axis.y + axis.z * axis.z);
    if (axisLength > 0) {
      axis.x /= axisLength;
      axis.y /= axisLength;
      axis.z /= axisLength;
    }

    // Dot product to get angle
    const dot = from.x * to.x + from.y * to.y + from.z * to.z;
    const fromLength = Math.sqrt(from.x * from.x + from.y * from.y + from.z * from.z);
    const toLength = Math.sqrt(to.x * to.x + to.y * to.y + to.z * to.z);
    
    const angle = Math.acos(Math.max(-1, Math.min(1, dot / (fromLength * toLength))));

    return { axis, angle };
  }

  /**
   * Interpolate between two Bloch vectors using spherical interpolation
   */
  static slerp(from: BlochVector, to: BlochVector, t: number): BlochVector {
    const rotation = this.getRotationBetweenVectors(from, to);
    const angle = rotation.angle * t;
    
    if (rotation.angle < 0.001) {
      // Vectors are nearly identical, use linear interpolation
      return {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
        z: from.z + (to.z - from.z) * t
      };
    }

    // Rodrigues' rotation formula
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const oneMinusCos = 1 - cos;
    const axis = rotation.axis;

    return {
      x: from.x * cos + 
         (axis.y * from.z - axis.z * from.y) * sin + 
         axis.x * (axis.x * from.x + axis.y * from.y + axis.z * from.z) * oneMinusCos,
      y: from.y * cos + 
         (axis.z * from.x - axis.x * from.z) * sin + 
         axis.y * (axis.x * from.x + axis.y * from.y + axis.z * from.z) * oneMinusCos,
      z: from.z * cos + 
         (axis.x * from.y - axis.y * from.x) * sin + 
         axis.z * (axis.x * from.x + axis.y * from.y + axis.z * from.z) * oneMinusCos
    };
  }

  /**
   * Get measurement probability for a given axis
   */
  static getMeasurementProbability(vector: BlochVector, axis: BlochVector): {
    probUp: number;
    probDown: number;
  } {
    // Normalize the axis
    const axisLength = Math.sqrt(axis.x * axis.x + axis.y * axis.y + axis.z * axis.z);
    const normalizedAxis = {
      x: axis.x / axisLength,
      y: axis.y / axisLength,
      z: axis.z / axisLength
    };

    // Dot product gives the projection
    const projection = vector.x * normalizedAxis.x + 
                      vector.y * normalizedAxis.y + 
                      vector.z * normalizedAxis.z;

    const probUp = (1 + projection) / 2;
    const probDown = (1 - projection) / 2;

    return { probUp, probDown };
  }
}