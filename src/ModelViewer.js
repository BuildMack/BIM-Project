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
  const [selectedObject, setSelectedObject] = useState(null); //curent object selected
  const [previousObject, setPreviousObject] = useState(null); //last object selected
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

      //Remove label
      setSelectedObject(null);

      // Reset Any Object Colors Back to Their Originals
      gltf.scene.traverse((object) => { //Go through each object
        if (object.material) { //Check if its a material
          if (Array.isArray(object.material)) {//If it's an array of materials
            object.material.forEach(mat => { //Then go through each material in the array
              if (mat.userData.originalColor) {//If it has an original color
                mat.color.set(mat.userData.originalColor); // Then change the original color back
              }
            });
          } else if (object.material.color && object.material.userData.originalColor) { //Need ot check if material has a color property because not all do and need to check if we have an original color stored
            object.material.color.set(object.material.userData.originalColor); // Then change the original color back
          }
        }
      });
        
    };
    
    //Changes color of each part of the house we interact with
    const colorChange = (e) => {
      console.log("Clicked object:", e.object.name); //Print out object name as test that we can view the names
      const objectName = e.object.name || "Unnamed Object"
      
      //If it's a different object selected remove hte highlight from the old one
      if (previousObject && previousObject !== e.object) {
        if (previousObject.material) {
          if (Array.isArray(previousObject.material)) {
            previousObject.material.forEach(mat => {
              if (mat.userData.originalColor) {
                mat.color.set(mat.userData.originalColor);
              }
            });
          } else if (previousObject.material.color && previousObject.material.userData.originalColor) {
            previousObject.material.color.set(previousObject.material.userData.originalColor);
          }
        }
      } 

      //REMOVE OLD LABEL // set new label
      if (selectedObject === objectName) {
        setSelectedObject(null);
        setPreviousObject(null);
      } else {
        setSelectedObject(objectName)
        setPreviousObject(e.object)
      } 

      if (e.object.material) {
        //Incase one object is composed of mutiple this just tells us to change the color of them all
        if (Array.isArray(e.object.material)) { 
          e.object.material.forEach(mat => {
            if (mat.color) {

              // save the original color
              if (!mat.userData.originalColor) {
                //Three.js adds userData to each material which is basically like temporary memory where we can store information 
                mat.userData.originalColor = mat.color.getHex();
              }
              //Toggle color on and off
              if (mat.color.getHex() === 0xFFA500) {
                mat.color.set(mat.userData.originalColor);
              } else {
                mat.color.set(0xFFA500);
              }
            }
          });
        } else if (e.object.material.color) { //otherwise it is a single object and we can just change the color of the one. 
            // save the original color
            if (!e.object.material.userData.originalColor) {
              e.object.material.userData.originalColor = e.object.material.color.getHex();
            }
            //Toggle color on and off
            if (e.object.material.color.getHex() === 0xFFA500) {
              e.object.material.color.set(e.object.material.userData.originalColor);
            } else {
              e.object.material.color.set(0xFFA500);
            }
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

      {selectedObject && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "10px 20px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "#fff",
            borderRadius: "5px",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Selected: {selectedObject}
        </div>
      )}

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
