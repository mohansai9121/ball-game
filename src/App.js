import React, { useEffect, useRef, useState } from "react";
import Game from "./Components/Game";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
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
          <OrbitControls
            minDistance={5}
            maxDistance={20}
            enableRotate={false}
          />
        </Canvas>
      )}

      {showStart && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0, 0, 0, 1)",
            zIndex: "1",
            padding: "30px 40px",
            borderRadius: "10px",
            textAlign: "center",
            color: "white",
            fontSize: "20px",
          }}
        >
          <h2>🎮 Welcome to the Ball Game!</h2>
          <p>Collect all the coins before time runs out.</p>
          <p>Use arrow keys or touch controls to move.</p>
          <p>
            Press <b>Space</b> or jump button to jump.
          </p>
          <button
            onClick={() => setShowStart(false)}
            style={{
              marginTop: "20px",
              fontSize: "20px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Start
          </button>
        </div>
      )}

      {!showStart && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            padding: "10px 20px",
            background: "rgba(0, 0, 0, 0.5)",
            color: "white",
            fontSize: "24px",
            borderRadius: "8px",
          }}
        >
          Score: {score}
          <br />
          Time: {timeLeft} s
          <br />
          Level: {level}
        </div>
      )}

      {!showStart && (
        <button
          onClick={toggleMusic}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            padding: "10px 16px",
            fontSize: "16px",
            borderRadius: "6px",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            border: "none",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          {isMusicPlaying ? "🔈 Mute" : "🔇 Play Music"}
        </button>
      )}

      {!showStart && !gameOver && (
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "35%",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
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
              className="arrow-buttons"
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
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "45%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0, 0, 0, 0.5)",
            padding: "30px 40px",
            fontSize: "32px",
            color: "white",
            textAlign: "center",
            borderRadius: "10px",
          }}
        >
          {won ? "🎉 You win" : "Time is Up"}
          <br />
          <button onClick={resetGame} style={{ marginTop: "10px" }}>
            Restart
          </button>
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
