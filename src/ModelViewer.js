// For loading and displaying GLTF models in the browser
//Trying and learning to work with functional components and hooks

import React, { useEffect, useState, useRef } from "react";
import { Canvas, useLoader } from "@react-three/fiber"; // A 3D canvas for rendering the model and loader
import { OrbitControls } from "@react-three/drei"; //Allows for rotation and zoom
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"; //Loads the .glb (GLTF) files
import * as THREE from "three";

const ModelViewer = ({ file }) => {
  const gltf = useLoader(GLTFLoader, file); // Load the model
  const [cameraPosition, setCameraPosition] = useState([0, 0, 0]); // Get state and setter for camera position
  const resetPosition = useRef([0, 0, 0]);
  const controlsRef = useRef();
  const [selectedObject, setSelectedObject] = useState(null); // Current object selected
  const [previousObject, setPreviousObject] = useState(null); // Last object selected
  const [objectData, setObjectData] = useState({});
  const [selectedInfo, setSelectedInfo] = useState({ name: "", material: "", cost: "", dimensions: "" });
  const [isEditing, setIsEditing] = useState(false);

  //Set Camera position based on model provided
  useEffect(() => {
    if (gltf.scene) {
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3()); //Box of the model
      gltf.scene.position.sub(center); // Center the model in the view
      const cameraDistance = Math.max(size.x, size.y, size.z) * 1.5; // Getting dimensions of the model
      setCameraPosition([center.x, center.y, center.z + cameraDistance]); // Setting the camera position an appropriate distance away from model center
      resetPosition.current = [center.x, center.y, center.z + cameraDistance];
    }
  }, [gltf]);

  const resetView = () => {
    setCameraPosition(resetPosition.current);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }

    setSelectedObject(null);
    setSelectedInfo({ name: "", material: "", cost: "", dimensions: "" });
    setIsEditing(false);
  };

  //Changes color of each part of the house we interact with
  const colorChange = (e) => {
    console.log("Clicked object:", e.object.name); // Print out object name as test that we can view the names
    const objectName = e.object.name || "Unnamed Object";

    const existingData = objectData[objectName] || {
      name: objectName, // Copy the object name to our metadata
      material: "",
      cost: "",
      dimensions: ""
    };

    if (previousObject && previousObject !== e.object) {
      if (previousObject.material) {
        if (Array.isArray(previousObject.material)) {
          previousObject.material.forEach((mat) => {
            if (mat.userData.originalColor) {
              mat.color.set(mat.userData.originalColor);
            }
          });
        } else if (previousObject.material.color && previousObject.material.userData.originalColor) {
          previousObject.material.color.set(previousObject.material.userData.originalColor);
        }
      }
    }

    // REMOVE OLD LABEL // set new label
    if (selectedObject === objectName) {
      setSelectedObject(null);
      setSelectedInfo({ name: "", material: "", cost: "", dimensions: "" });
      setPreviousObject(null);
      setIsEditing(false);
    } else {
      setSelectedObject(objectName);
      setPreviousObject(e.object);
      setSelectedInfo(existingData);
      setIsEditing(false);
    }

    if (e.object.material) {
      if (Array.isArray(e.object.material)) {
        e.object.material.forEach((mat) => {
          if (mat.color) {
            if (!mat.userData.originalColor) {
              mat.userData.originalColor = mat.color.getHex();
            }
            mat.color.set(mat.color.getHex() === 0xffa500 ? mat.userData.originalColor : 0xffa500);
          }
        });
      } else if (e.object.material.color) {
        if (!e.object.material.userData.originalColor) {
          e.object.material.userData.originalColor = e.object.material.color.getHex();
        }
        e.object.material.color.set(e.object.material.color.getHex() === 0xffa500 ? e.object.material.userData.originalColor : 0xffa500);
      }
    }

    e.stopPropagation();// Prevents click from impacting parent elements
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedInfo((prev) => ({ ...prev, [name]: value }));
  };

  const saveMetadata = () => {
    setObjectData((prevData) => ({
      ...prevData,
      [selectedObject]: selectedInfo,
    }));

    setIsEditing(false);
  };

  return ( // Return the information for making a 3D scene
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: cameraPosition, near: 0.1, far: 10000000, fov: 100 }} style={{ width: "100%", height: "100%" }}>
        <ambientLight intensity={2} />
        <directionalLight position={[5, 10, 5]} intensity={2} />
        <group onClick={colorChange}>
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
            padding: "15px",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "350px", // Increased width to add more black space around text fields
            paddingRight: "20px", // Added extra padding to ensure right spacing
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label>Object:</label>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: "none",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                textDecoration: "underline"
              }}
            >
              Edit
            </button>
          </div>
          <input type="text" name="name" value={selectedInfo.name} onChange={handleInputChange} disabled={!isEditing} style={inputStyle} />

          <label>Material:</label>
          <input type="text" name="material" value={selectedInfo.material} onChange={handleInputChange} disabled={!isEditing} style={inputStyle} />

          <label>Dimensions:</label>
          <input type="text" name="dimensions" value={selectedInfo.dimensions} onChange={handleInputChange} disabled={!isEditing} style={inputStyle} />

          <label>Cost:</label>
          <input type="text" name="cost" value={selectedInfo.cost} onChange={handleInputChange} disabled={!isEditing} style={inputStyle} />

          {isEditing && (
            <button onClick={saveMetadata} style={saveButtonStyle}>
              Save
            </button>
          )}
        </div>
      )}

      <button onClick={resetView} style={resetButtonStyle}>
        Reset View
      </button>
    </div>
  );
};

// **Styles**
const inputStyle = {
  backgroundColor: "#ddd",
  border: "1px solid #ccc",
  padding: "5px",
  borderRadius: "5px",
  fontWeight: "bold",
  fontSize: "14px",
  width: "calc(100% - 10px)" 
};

const saveButtonStyle = {
  marginTop: "10px",
  padding: "8px",
  cursor: "pointer",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "5px",
  fontWeight: "bold"
};

const resetButtonStyle = {
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
};

export default ModelViewer;
