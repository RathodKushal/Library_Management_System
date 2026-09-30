import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const BOOK_COUNT = 80; // Fewer books, but much larger and crystal clear

function BrightFloatingBooks() {
  const coverRef = useRef();
  const pagesRef = useRef();

  const bookData = useMemo(() => {
    const data = [];
    
    // Extremely vibrant, attractive, modern solid colors
    const colors = [
      '#FF3366', // Vibrant Pink/Red
      '#00C9B1', // Bright Teal
      '#FFD166', // Sunny Yellow
      '#4361EE', // Bright Royal Blue
      '#F72585', // Neon Magenta
      '#4CC9F0', // Sky Blue
      '#7209B7', // Deep Violet (for contrast)
      '#FF9F1C', // Bright Orange
      '#06D6A0', // Mint Green
    ];

    for (let i = 0; i < BOOK_COUNT; i++) {
      const scale = 0.8 + Math.random() * 0.7; // Large, clearly visible books
      
      data.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 25, // Wide X spread
          (Math.random() - 0.5) * 15, // Wide Y spread
          (Math.random() - 0.5) * 8 - 2  // Depth (closer to camera)
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
        scale: new THREE.Vector3(0.25 * scale, 1.2 * scale, 0.9 * scale), // Realistic book proportions
        color: colors[Math.floor(Math.random() * colors.length)],
        // Smooth, relaxing floating animation speeds
        floatSpeed: 0.5 + Math.random() * 1.5,
        rotSpeedX: (Math.random() - 0.5) * 0.4,
        rotSpeedY: (Math.random() - 0.5) * 0.4,
        rotSpeedZ: (Math.random() - 0.5) * 0.2,
      });
    }
    return data;
  }, []);

  const colorArray = useMemo(() => {
    const array = new Float32Array(bookData.length * 3);
    const color = new THREE.Color();
    bookData.forEach((book, i) => {
      color.set(book.color);
      color.toArray(array, i * 3);
    });
    return array;
  }, [bookData]);

  useFrame((state) => {
    if (!coverRef.current || !pagesRef.current) return;
    const time = state.clock.elapsedTime;
    
    const dummyCover = new THREE.Object3D();
    const dummyPages = new THREE.Object3D();
    
    bookData.forEach((data, i) => {
      // 1. Calculate new floating position and rotation
      const floatY = Math.sin(time * data.floatSpeed + i) * 0.8;
      
      dummyCover.position.set(
        data.position.x, 
        data.position.y + floatY, 
        data.position.z
      );
      
      dummyCover.rotation.set(
        data.rotation.x + time * data.rotSpeedX,
        data.rotation.y + time * data.rotSpeedY,
        data.rotation.z + time * data.rotSpeedZ
      );
      
      dummyCover.scale.copy(data.scale);
      dummyCover.updateMatrix();
      
      // Apply to Cover Mesh
      coverRef.current.setMatrixAt(i, dummyCover.matrix);

      // 2. Position the Pages (inset slightly inside the cover)
      dummyPages.copy(dummyCover);
      dummyPages.scale.set(data.scale.x * 0.85, data.scale.y * 0.95, data.scale.z * 0.92);
      // Translate pages so the spine is solid cover, and pages show on the other 3 sides
      dummyPages.translateX(0.015); 
      dummyPages.updateMatrix();
      
      // Apply to Pages Mesh
      pagesRef.current.setMatrixAt(i, dummyPages.matrix);
    });
    
    coverRef.current.instanceMatrix.needsUpdate = true;
    pagesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Colorful, glossy book covers */}
      <instancedMesh ref={coverRef} args={[null, null, BOOK_COUNT]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]}>
          <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
        </boxGeometry>
        {/* Highly polished, attractive material that reflects the environment */}
        <meshStandardMaterial 
          vertexColors 
          roughness={0.15} 
          metalness={0.1}
          envMapIntensity={1.5}
        />
      </instancedMesh>
      
      {/* Crisp white/cream pages */}
      <instancedMesh ref={pagesRef} args={[null, null, BOOK_COUNT]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} metalness={0} />
      </instancedMesh>
    </group>
  );
}

// A large hero book in the center that is perfectly in focus and floating majestically
function CenterHeroBook() {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.3 + 0.5;
    groupRef.current.rotation.z = Math.cos(time * 0.4) * 0.1;
    groupRef.current.position.y = Math.sin(time * 1.5) * 0.2;
  });

  return (
    <group ref={groupRef} position={[-4, 0, 2]} scale={1.5}>
      {/* Cover */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.3, 1.8, 1.4]} />
        <meshStandardMaterial color="#4361EE" roughness={0.1} metalness={0.2} envMapIntensity={2} />
      </mesh>
      {/* Gold Foil Accent */}
      <mesh position={[-0.16, 0, 0]}>
        <boxGeometry args={[0.02, 1.6, 0.1]} />
        <meshStandardMaterial color="#FFD166" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Pages */}
      <mesh position={[0.02, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.26, 1.7, 1.3]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
    </group>
  );
}

export default function FloatingBooks() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 45 }}
      dpr={[1, 2]}
      shadows
      gl={{ 
        antialias: true, 
        powerPreference: 'high-performance',
        alpha: true // Allow CSS background to show through
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        // GORGEOUS, BRIGHT, COLORFUL PASTEL GRADIENT BACKGROUND
        background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
      }}
    >
      {/* Soft, extremely bright and attractive studio lighting */}
      <ambientLight intensity={1.5} color="#ffffff" />
      
      {/* Main bright directional light */}
      <directionalLight 
        position={[10, 20, 15]} 
        intensity={2.5} 
        color="#ffffff" 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      
      {/* Colorful fill lights to make the books pop */}
      <pointLight position={[-10, -10, 10]} intensity={2} color="#FF3366" />
      <pointLight position={[10, -10, -10]} intensity={2} color="#4CC9F0" />

      {/* Provides gorgeous realistic reflections on the glossy book covers */}
      <Environment preset="city" />

      <CenterHeroBook />
      <BrightFloatingBooks />

      {/* A soft shadow catcher on the "floor" for extra depth and realism */}
      <ContactShadows 
        position={[0, -6, 0]} 
        opacity={0.4} 
        scale={30} 
        blur={2} 
        far={10} 
        color="#7209B7" 
      />
    </Canvas>
  );
}
