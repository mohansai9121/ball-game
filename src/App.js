import React, { useEffect, useState } from "react";
import Game from "./Components/Game";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const App = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const totalCoins = 4;

  useEffect(() => {
    if (gameOver || won) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, won]);

  useEffect(() => {
    if (score === totalCoins) {
      setWon(true);
      setGameOver(true);
    }
  }, [score]);

  const resetGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setWon(false);
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ width: "100vw", height: "100vh" }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[15, 15, 15]} castShadow />
        <Game score={score} setScore={setScore} gameOver={gameOver} />
        <OrbitControls minDistance={5} maxDistance={20} />
      </Canvas>
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          padding: "10px 20px",
          background: "rgba(0, 0, 0, 0.5",
          color: "white",
          fontSize: "24px",
          borderRadius: "8px",
        }}
      >
        Score: {score}
        Time: {timeLeft} s
      </div>
      {gameOver && (
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "45%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0, 0, 0, 0.5",
            padding: "30px 40px",
            fontSize: "32px",
            color: "white",
            textAlign: "center",
            borderRadius: "10px",
          }}
        >
          {" "}
          {won ? "🎉 You win" : "Time is Up"}
          <br />
          <button onClick={resetGame}>Restart</button>
        </div>
      )}
    </div>
  );
};

export default App;
