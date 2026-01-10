import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import HeroBackground from "../HeroSection/HeroBG";
import AirplaneModel from "./Model3d";
export default function Hero() {
  const [loadedModel, setLoadedModel] = useState(null);
  const cameraRef = useRef();
  const controlsRef = useRef();

  // When model is loaded, compute bounding box and frame the camera
  useEffect(() => {
    if (!loadedModel || !cameraRef.current) return;

    try {
      const bbox = new THREE.Box3().setFromObject(loadedModel);
      const sphere = bbox.getBoundingSphere(new THREE.Sphere());
      const center = sphere.center;
      const radius = sphere.radius || Math.max(bbox.getSize(new THREE.Vector3()).length() / 2, 0.1);

      const cam = cameraRef.current;
      const fov = (cam.fov * Math.PI) / 180;

      let distance;
      if (Math.abs(Math.sin(fov / 2)) > 1e-6) {
        distance = radius / Math.sin(fov / 2);
      } else {
        distance = radius * 2.5;
      }

      const margin = 1.25; // small margin so model isn't flush to edges

      // Use current camera direction from center to camera, fallback to diagonal
      const camPos = cam.position.clone();
      let dir = new THREE.Vector3().subVectors(camPos, center);
      if (dir.lengthSq() < 1e-6) dir = new THREE.Vector3(1, 1, 1);
      dir.normalize();

      cam.position.copy(center.clone().add(dir.multiplyScalar(distance * margin)));
      cam.near = Math.max(0.1, distance - radius * 2);
      cam.far = Math.max(1000, distance + radius * 4);
      cam.updateProjectionMatrix();

      if (controlsRef.current) {
        controlsRef.current.target.copy(center);
        controlsRef.current.update();
      }
    } catch (e) {
      console.error("Error framing camera:", e);
    }
  }, [loadedModel]);

  return (
    <section className="relative w-full h-[90vh] overflow-hidden">
      {/* Background Slideshow */}
      <HeroBackground />

      {/* Dark Overlay for text clarity */}
      <div className="absolute inset-0 bg-black/20 z-[5]" />

      {/* TEXT CONTENT */}
      <div className="relative z-[10] h-full flex flex-col justify-center items-start px-10 md:px-20">
        <h1 className="text-white text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-xl">
          Discover Your Next Adventure
        </h1>

        <p className="mt-4 text-white/90 text-lg md:text-xl max-w-xl drop-shadow-lg">
          Explore mountains, beaches, cities, and everything in between with
          TripFusion.
        </p>

        <button className="mt-8 px-8 py-3 bg-[#4A90E2] text-white font-semibold rounded-full text-lg hover:bg-[#3a7ccc] transition-all shadow-lg">
          Explore Now
        </button>
      </div>

      {/* 3D MODEL SECTION */}
      <div className="absolute right-0 bottom-0 w-[500px] h-[500px] z-[10] pointer-events-none select-none">
        <Canvas camera={{ position: [5, 2, 5], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1} />

            <AirplaneModel scale={2.5} position={[0, -0.6, 0]} />

            {/* <Environment preset="city" /> */} //TODO: Add environment preset
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableRotate={false}
            />
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
}

