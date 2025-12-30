import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { lazyLoadGLB } from "../../utils/Lazyload.utils.js";

const MODEL_URL = "/models/aeroplane.glb";

export default function AirplaneModel(props) {
  const { scale: propScale = 1, onLoaded } = props;
  const [model, setModel] = useState(null);
  const ref = useRef();
  const [autoScale, setAutoScale] = useState(1);

  // Mouse position normalized (-1 to 1)
  const mouse = useRef({ x: 0, y: 0 });

  // -----------------------------
  // Load + center model + auto scale
  // -----------------------------
  useEffect(() => {
    let isMounted = true;
    console.log("🔵 AirplaneModel mounted");

    lazyLoadGLB(MODEL_URL)
      .then((scene) => {
        if (!isMounted || !scene) return;

        const bbox = new THREE.Box3().setFromObject(scene);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const sphere = bbox.getBoundingSphere(new THREE.Sphere());

        console.log("📦 MODEL SIZE:", {
          width: size.x.toFixed(3),
          height: size.y.toFixed(3),
          depth: size.z.toFixed(3),
        });
        console.log("🟣 BOUNDING SPHERE:", {
          radius: sphere.radius.toFixed(3),
          center: sphere.center,
        });

        // Auto scale to fit nicely
        const desiredSize = 1; // tweak if needed
        const scaleFactor = desiredSize / sphere.radius;
        setAutoScale(scaleFactor);

        // Center model
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        scene.position.set(-center.x, -center.y, -center.z);

        // Initial Y position below screen for entry animation
        scene.position.y -= 2;

        setModel(scene);

        // Callback to parent
        if (typeof onLoaded === "function") {
          try {
            onLoaded(scene);
          } catch (err) {
            console.error("onLoaded callback error:", err);
          }
        }

        // Entry animation: rise from below to final position
        gsap.to(scene.position, {
          y: scene.position.y + 2, // move up 2 units
          duration: 2.5,
          ease: "power2.out",
        });
      })
      .catch((err) => console.error("❌ Failed to load model:", err));

    return () => (isMounted = false);
  }, [propScale]);

  // -----------------------------
  // Subtle tilt animation
  // -----------------------------
  useEffect(() => {
    if (!model || !ref.current) return;
    ref.current.rotation.z = -0.03;

    const tl = gsap.to(ref.current.rotation, {
      z: 0.03,
      duration: 2.2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    return () => tl.kill();
  }, [model]);

  // -----------------------------
  // Mouse movement for rotation
  // -----------------------------
  useEffect(() => {
    if (!model || !ref.current) return;

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      // normalized mouse position from -1 to 1
      mouse.current.x = (e.clientX / innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / innerHeight) * 2 - 1;
    };

    const animate = () => {
      if (ref.current) {
        // Smoothly rotate Y axis toward mouse X
        const targetY = mouse.current.x * Math.PI * 0.25; // limit rotation to ±45°
        ref.current.rotation.y = THREE.MathUtils.lerp(
          ref.current.rotation.y,
          targetY,
          0.05
        );

        // Optional: small tilt for mouse Y movement (look up/down)
        const targetX = mouse.current.y * Math.PI * 0.1; // ±18° max
        ref.current.rotation.x = THREE.MathUtils.lerp(
          ref.current.rotation.x,
          targetX,
          0.05
        );
      }
      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [model]);

  return model ? (
    <primitive
      ref={ref}
      object={model}
      {...props}
      scale={[
        propScale * autoScale,
        propScale * autoScale,
        propScale * autoScale,
      ]}
    />
  ) : null;
}
