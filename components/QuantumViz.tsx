import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VizParams } from '../types';

// Shader for the Quantum Wave
const vertexShader = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uAmplitude;
  uniform float uNoise;
  
  varying vec2 vUv;
  varying float vElevation;

  // Simple pseudo-random function
  float random (in vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // 2D Noise
  float noise (in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);

      // Four corners in 2D of a tile
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));

      vec2 u = f * f * (3.0 - 2.0 * f);

      return mix(a, b, u.x) +
              (c - a)* u.y * (1.0 - u.x) +
              (d - b) * u.x * u.y;
  }

  void main() {
    vUv = uv;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    float elevation = sin(modelPosition.x * 2.0 + uTime * uSpeed) * 
                      sin(modelPosition.z * 1.5 + uTime * uSpeed * 0.5) * 
                      uAmplitude;
                      
    float n = noise(modelPosition.xz * 2.0 + uTime * 0.2) * uNoise;
    
    modelPosition.y += elevation + n;
    
    vElevation = elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    gl_PointSize = 4.0; 
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  varying float vElevation;

  void main() {
    float alpha = 1.0 - smoothstep(0.45, 0.5, distance(gl_PointCoord, vec2(0.5)));
    
    // Mix white at peaks for energy effect
    vec3 finalColor = mix(uColor, vec3(1.0, 1.0, 1.0), smoothstep(0.0, 0.8, vElevation));
    
    gl_FragColor = vec4(finalColor, alpha * 0.8);
  }
`;

interface WaveProps {
  params: VizParams;
}

const Wave: React.FC<WaveProps> = ({ params }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  // Uniforms reference to update efficiently
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(params.color) },
      uSpeed: { value: params.speed },
      uAmplitude: { value: params.amplitude },
      uNoise: { value: params.noise },
    }),
    [] // Initialize once
  );

  // Smoothly interpolate parameters for "Vibe" transition
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Time
      meshRef.current.material.uniforms.uTime.value += delta;
      
      // Lerp visual parameters for smooth transition
      const mat = meshRef.current.material.uniforms;
      mat.uSpeed.value = THREE.MathUtils.lerp(mat.uSpeed.value, params.speed, delta * 2);
      mat.uAmplitude.value = THREE.MathUtils.lerp(mat.uAmplitude.value, params.amplitude, delta * 2);
      mat.uNoise.value = THREE.MathUtils.lerp(mat.uNoise.value, params.noise, delta * 2);
      
      const targetColor = new THREE.Color(params.color);
      mat.uColor.value.lerp(targetColor, delta * 2);
    }
  });

  return (
    <points ref={meshRef} rotation={[-Math.PI / 3, 0, 0]}>
      <planeGeometry args={[12, 12, 128, 128]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
      />
    </points>
  );
};

export const QuantumViz: React.FC<{ params: VizParams }> = ({ params }) => {
  return (
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-stone-900 to-stone-950">
      <Canvas camera={{ position: [0, 5, 8], fov: 45 }}>
        <Wave params={params} />
      </Canvas>
    </div>
  );
};
