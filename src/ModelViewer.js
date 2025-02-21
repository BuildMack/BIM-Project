// For loading and displaying GLTF models in the browser
//Trying and learning to work with funcitonal components and hooks

import React, { useEffect, useState} from "react";
import { Canvas } from "@react-three/fiber"; // A 3D canvas for rendering the model
import { OrbitControls } from "@react-three/drei"; //Allows for rotation and zoom
import { useLoader } from "@react-three/fiber"; // loads e
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"; //Loads the .glb (GLTF) files
import * as THREE from "three";


const ModelViewer = ({file}) => {
  const gltf = useLoader(GLTFLoader, file);  //load the model
  const [cameraPosition, setCameraPosition] = useState([0, 0, 0]); //get state and setter for camera position

  //Set Camera position based on model provided
  useEffect(() => {
    if (gltf.scene) {

        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3()); //Box of the model

        const cameraDistance = Math.max(size.x, size.y, size.z) * 1.5; //Getting dimensions of the model
        setCameraPosition([center.x, center.y, center.z + cameraDistance]); //Setting the camera position an appropriate distance away from model center
        }
    }, [gltf]);

  return ( //return the information for making a 3D scene
    <Canvas camera={{ position: cameraPosition,near: 0.1, far: 10000, fov: 50 }}>
      <ambientLight intensity={2} />
      <directionalLight position={[5, 10, 5]} intensity={2} />
      <primitive object={gltf.scene} />
      <OrbitControls />
    </Canvas>
  );
};

export default ModelViewer;
