// For loading and displaying GLTF models in the browser
//Trying and learning to work with funcitonal components and hooks

import React, { useEffect, useState, useRef} from "react";
import { Canvas, useLoader } from "@react-three/fiber"; // A 3D canvas for rendering the model and loader
import { OrbitControls } from "@react-three/drei"; //Allows for rotation and zoom
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"; //Loads the .glb (GLTF) files
import * as THREE from "three";


const ModelViewer = ({file}) => {
  const gltf = useLoader(GLTFLoader, file);  //load the model
  const [cameraPosition, setCameraPosition] = useState([0, 0, 0]); //get state and setter for camera position
  const resetPosition = useRef([0, 0, 0]);
  const controlsRef = useRef();

  //Set Camera position based on model provided
  useEffect(() => {
    if (gltf.scene) {

        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3()); //Box of the model
        gltf.scene.position.sub(center); // center the model in the view
        const cameraDistance = Math.max(size.x, size.y, size.z) * 1.5; //Getting dimensions of the model
        setCameraPosition([center.x, center.y, center.z + cameraDistance]); //Setting the camera position an appropriate distance away from model center
        resetPosition.current = [center.x, center.y, center.z + cameraDistance];
        }
    }, [gltf]);

    const resetView = () => {
      setCameraPosition(resetPosition.current); 
      if (controlsRef.current) {
        controlsRef.current.reset();
      }  
    };
    
    //Changes color of each part of the house we interact with
    const colorChange = (e) => {
      console.log("Clicked object:", e.object.name); //Print out object name as test that we can view the names
      if (e.object.material) {
        //Incase one object is composed of mutiple this just tells us to change the color of them all
        if (Array.isArray(e.object.material)) { 
          e.object.material.forEach(mat => {
            if (mat.color) {
              mat.color.set(0xffcc99);
            }
          });
        } else if (e.object.material.color) { //otherwise it is a single object and we can just change the color of the one. 
          e.object.material.color.set(0xffcc99);
        }
      }
      e.stopPropagation(); //prevents click from impacting parent elements
    };    

  return ( //return the information for making a 3D scene
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: cameraPosition,near: 0.1, far: 10000000, fov: 100 }} style={{ width: "100%", height: "100%" }}>
        <ambientLight intensity={2} />
        <directionalLight position={[5, 10, 5]} intensity={2} />
        
        <group onClick={colorChange}>  // To implement on click it is necessary to wrap the scene object so that the colorChange applies to any part of the object
          <primitive object={gltf.scene} />
        </group>

        <OrbitControls ref={controlsRef} />
      </Canvas>

      <button
        onClick={resetView}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "10px 20px",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          zIndex: 10
        }}
        >
        Reset View
      </button>
  </div>
  );
};

export default ModelViewer;
