import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

const gltfCache = new Map();
const loader = new GLTFLoader();

/**
 * Loads a GLB model with caching & progress tracking.
 * @param {string} url - Path to the .glb model
 * @param {(progress: number) => void} onProgress - Optional progress callback (0–100)
 * @returns {Promise<THREE.Group>} Loaded GLTF.scene
 */
export function lazyLoadGLB(url, onProgress = null) {
  // ✔ Return cached model instantly
  if (gltfCache.has(url)) {
    return Promise.resolve(gltfCache.get(url).clone());
  }

  return new Promise((resolve, reject) => {
    let hasRetried = false;
    let timeoutId;

    const loadModel = () => {
      timeoutId = setTimeout(() => {
        reject(new Error("Model loading timeout (30s)."));
      }, 30000);

      loader.load(
        url,
        (gltf) => {
          clearTimeout(timeoutId);

          gltfCache.set(url, gltf.scene);

          resolve(gltf.scene.clone());
        },
        (event) => {
          if (onProgress && event.total) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        },
        (err) => {
          clearTimeout(timeoutId);

          // ✔ Retry once
          if (!hasRetried) {
            hasRetried = true;
            loadModel();
          } else {
            reject(err);
          }
        }
      );
    };

    loadModel();
  });
}
