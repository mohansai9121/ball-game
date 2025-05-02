import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const boundary = 20;

const Game = () => {
  const ballRef = useRef();
  const obstacleRefs = useRef([]);
  const velocityRef = useRef([0, 0, 0]);
  const [onGround, setOnGround] = useState(true);

  const obstacles = [
    [2, 0.5, 2],
    [-3, 0.5, -1],
    [1, 0.5, -4],
    [-4, 0.5, 3],
  ];

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

  useFrame(() => {
    if (!ballRef.current) return;
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
