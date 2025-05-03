import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const boundary = 20;
const coinSound = new Audio("/music/coin.wav");

const Game = ({ score, setScore, gameOver }) => {
  const ballRef = useRef();
  const obstacleRefs = useRef([]);
  const coinRefs = useRef([]);
  const velocityRef = useRef([0, 0, 0]);
  const [onGround, setOnGround] = useState(true);

  const obstacles = [
    [2, 0.5, 2],
    [-3, 0.5, -1],
    [1, 0.5, -4],
    [-4, 0.5, 3],
  ];

  const [coins, setCoins] = useState([
    [5, 0.5, 0],
    [-5, 0.5, -5],
    [0, 0.5, 5],
    [-7, 0.5, 7],
  ]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const [vx, vy, vz] = velocityRef.current;
      switch (e.code) {
        case "ArrowUp":
          velocityRef.current = [vx, vy, vz - 0.1];
          break;
        case "ArrowDown":
          velocityRef.current = [vx, vy, vz + 0.1];
          break;
        case "ArrowLeft":
          velocityRef.current = [vx - 0.1, vy, vz];
          break;
        case "ArrowRight":
          velocityRef.current = [vx + 0.1, vy, vz];
          break;
        case "Space":
          if (onGround) velocityRef.current = [vx, 0.3, vy];
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onGround]);

  const checkCollision = (nextPosition) => {
    const ballBox = new THREE.Box3().setFromCenterAndSize(
      nextPosition,
      new THREE.Vector3(1, 1, 1)
    );
    for (let ref of obstacleRefs.current) {
      if (ref) {
        const obstacleBox = new THREE.Box3().setFromObject(ref);
        if (ballBox.intersectsBox(obstacleBox)) return true;
      }
    }
    return false;
  };

  const checkCoinCollision = (position) => {
    const ballBox = new THREE.Box3().setFromCenterAndSize(
      position,
      new THREE.Vector3(1, 1, 1)
    );
    coins.forEach((coin, index) => {
      const coinRef = coinRefs.current[index];
      if (!coinRef || gameOver) return;
      if (coinRef) {
        const coinBox = new THREE.Box3().setFromObject(coinRef);
        if (coinBox && ballBox.intersectsBox(coinBox)) {
          setCoins((prev) => prev.filter((_, i) => i !== index));
          coinSound.currentTime = 0;
          coinSound.volume = 0.5;
          coinSound.play().catch((e) => console.log("soundblocked", e));
          setScore((s) => s + 1);
        }
      }
    });
  };

  useFrame(() => {
    if (!ballRef.current || gameOver) return;
    const [vx, vy, vz] = velocityRef.current;
    let [x, y, z] = ballRef.current.position.toArray();

    const newVy = vy - 0.01;
    const newX = x + vx;
    const newY = y + newVy;
    const newZ = z + vz;

    let nextY = newY;
    if (newY <= 0.5) {
      nextY = 0.5;
      setOnGround(true);
    } else {
      setOnGround(false);
    }

    const nextPosition = new THREE.Vector3(newX, nextY, newZ);
    if (checkCollision(nextPosition)) velocityRef.current = [0, 0, 0];
    else {
      x = Math.max(-boundary, Math.min(boundary, newX));
      y = nextY;
      z = Math.max(-boundary, Math.min(boundary, newZ));
      checkCoinCollision(new THREE.Vector3(x, y, z));
      ballRef.current.position.set(x, y, z);
      if (y <= 0.5) {
        y = 0.5;
        setOnGround(true);
        velocityRef.current = [vx * 0.9, 0, vz * 0.9];
      } else {
        setOnGround(false);
        velocityRef.current = [vx * 0.99, newVy, vz * 0.99];
      }
    }
  });

  return (
    <>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="lightgreen" />
      </mesh>
      <mesh castShadow ref={ballRef} position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      {obstacles.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => (obstacleRefs.current[i] = el)}
          position={pos}
          castShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="brown" />
        </mesh>
      ))}

      {coins.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => (coinRefs.current[i] = el)}
          position={pos}
          castShadow
        >
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
          <meshStandardMaterial color="gold" />
        </mesh>
      ))}

      <mesh position={[0, 1, -boundary - 0.5]}>
        <boxGeometry args={[2 * boundary, 2, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <mesh position={[0, 1, boundary + 0.5]}>
        <boxGeometry args={[2 * boundary, 2, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <mesh position={[-boundary - 0.5, 1, 0]}>
        <boxGeometry args={[1, 2, 2 * boundary]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <mesh position={[boundary + 0.5, 1, 0]}>
        <boxGeometry args={[1, 2, 2 * boundary]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    </>
  );
};

export default Game;
