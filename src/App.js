import React from "react";
import Game from "./Components/Game";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const App = () => {
  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 60 }}
      style={{ width: "100vw", height: "100vh" }}
      shadows
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[15, 15, 15]} castShadow />
      <Game />
      <OrbitControls minDistance={5} maxDistance={20} />
    </Canvas>
  );
};

export default App;
