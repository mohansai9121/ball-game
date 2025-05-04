import React, { useEffect, useRef, useState } from "react";
import Game from "./Components/Game";
import { Canvas } from "@react-three/fiber";
//import { OrbitControls } from "@react-three/drei";
import "./App.css";

const App = () => {
  const [score, setScore] = useState(0);
  const musicRef = useRef(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [coinCount, setCoinCount] = useState(4);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [showStart, setShowStart] = useState(true);

  const toggleMusic = () => {
    if (!musicRef.current) return;
    if (isMusicPlaying) {
      musicRef.current.pause();
    } else {
      musicRef.current.play().catch((e) => console.log("play error", e));
    }
    setIsMusicPlaying((pre) => !pre);
  };

  useEffect(() => {
    if (!showStart) {
      musicRef.current = new Audio("/music/background.wav");
      musicRef.current.loop = true;
      musicRef.current.volume = 0.7;

      musicRef.current
        .play()
        .then(() => setIsMusicPlaying(true))
        .catch((e) => {
          console.log("Autoplay blocked, waiting for user interaction", e);

          const handleUserGesture = () => {
            musicRef.current?.play();
            window.removeEventListener("click", handleUserGesture);
            window.removeEventListener("keydown", handleUserGesture);
            window.removeEventListener("touchstart", handleUserGesture);
          };

          window.addEventListener("click", handleUserGesture);
          window.addEventListener("keydown", handleUserGesture);
          window.addEventListener("touchstart", handleUserGesture);
        });
    }

    return () => {
      musicRef.current?.pause();
      musicRef.current = null;
    };
  }, [showStart]);

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    };
    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) < 30) return;

      if (absDx > absDy) {
        if (dx > 0) handleMove("ArrowRight");
        else handleMove("ArrowLeft");
      } else {
        if (dy > 0) handleMove("ArrowDown");
        else handleMove("ArrowUp");
      }
    };
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    if (showStart || gameOver || won) return;
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
  }, [showStart, gameOver, won]);

  useEffect(() => {
    if (!showStart && score === coinCount) {
      setWon(true);
      setGameOver(true);
    }
  }, [score, coinCount, showStart]);

  const nextLevel = () => {
    setLevel((l) => l + 1);
    setCoinCount((c) => c + 1);
    setScore(0);
    setTimeLeft(30);
    setWon(false);
    setGameOver(false);
    setResetTrigger((pre) => !pre);
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setWon(false);
    setResetTrigger((pre) => !pre);
  };

  const handleMove = (key) => {
    const event = new KeyboardEvent("keydown", { code: key });
    window.dispatchEvent(event);
  };

  return (
    <div className="screen">
      {!showStart && (
        <Canvas
          camera={{ position: [0, 15, 10], fov: 60 }}
          style={{ width: "100vw", height: "100vh" }}
          shadows
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[15, 15, 15]} castShadow />
          <Game
            score={score}
            setScore={setScore}
            gameOver={gameOver}
            move={handleMove}
            reset={resetTrigger}
            totalCoins={coinCount}
            totalObstacles={coinCount}
          />
          {/*<OrbitControls
            minDistance={5}
            maxDistance={20}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.1}
            minPolarAngle={Math.PI / 4}
            maxAzimuthAngle={Math.PI / 8}
            minAzimuthAngle={Math.PI / 8}
          />*/}
        </Canvas>
      )}

      {showStart && (
        <div className="introduction">
          <h2>🎮 Welcome to the Ball Game!</h2>
          <p>Collect all the coins before time runs out.</p>
          <p>Use arrow keys or touch controls to move.</p>
          <p>
            Press <b>Space</b> or jump button to jump.
          </p>
          <button onClick={() => setShowStart(false)} className="start-button">
            Start
          </button>
        </div>
      )}

      {!showStart && (
        <div className="score-display">
          Score: {score}
          <br />
          Time: {timeLeft} s
          <br />
          Level: {level}
        </div>
      )}

      {!showStart && (
        <button onClick={toggleMusic} className="mute-music">
          {isMusicPlaying ? "🔈 Mute" : "🔇 Play Music"}
        </button>
      )}

      {!showStart && !gameOver && (
        <div className="control-buttons">
          <button
            onClick={() => handleMove("ArrowUp")}
            className="arrow-buttons"
          >
            ⬆️
          </button>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => handleMove("ArrowLeft")}
              className="arrow-buttons"
            >
              ⬅️
            </button>
            <button
              onClick={() => handleMove("Space")}
              className="space-button"
            >
              jump
            </button>
            <button
              onClick={() => handleMove("ArrowRight")}
              className="arrow-buttons"
            >
              ➡️
            </button>
          </div>
          <button
            onClick={() => handleMove("ArrowDown")}
            className="arrow-buttons"
          >
            ⬇️
          </button>
        </div>
      )}

      {!showStart && gameOver && (
        <div className="result-display">
          {won ? "🎉 You win" : "Time is Up"}
          <br />
          <button onClick={resetGame} style={{ marginTop: "10px" }}>
            Restart
          </button>
          <br />
          {won && (
            <button onClick={nextLevel} style={{ marginTop: "10px" }}>
              Next Level
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
