import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function Splash({ onEnter, isMobile }) {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });

  // Generate a new random hue on every site load
  const [snakeColor] = useState(() => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 85%, 60%)`;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const CELL_SIZE = 30; // 30x30px square size
    const TICK_INTERVAL = 160; // 160ms movement speed
    const MARGIN_CELLS = 4; // Keeps pixels away from outer screen edges
    const DIM_DURATION = 2000; // 2 seconds dim-on glow duration
    const HOLD_DURATION = 1000; // 1 second sitting still at full brightness
    const INTRO_DURATION = DIM_DURATION + HOLD_DURATION;

    let animationFrameId;
    let lastTime = 0;
    let animStartTime = null;
    let spawnProgress = 0;

    // --- MANUAL CONTROL STATE ---
    let isManualControl = false;
    let inputQueue = []; // Fixed: Queues rapid inputs so no keystrokes are dropped

    let cols = Math.floor(window.innerWidth / CELL_SIZE);
    let rows = Math.floor(window.innerHeight / CELL_SIZE);

    canvas.width = cols * CELL_SIZE;
    canvas.height = rows * CELL_SIZE;

    // Calculate midpoint between 'E' in "THE" and 'C' in "COMPENDIUM"
    const calculateSpawnCol = () => {
      const padding = isMobile ? 20 : 40;
      // MATCHES THE NEW TYPOGRAPHY EXACTLY FOR PRECISE MATH
      const fontSize = isMobile ? "28px" : "38px";
      ctx.font = `400 ${fontSize} "Instrument Serif", serif`;

      const widthTHE = ctx.measureText("The").width;
      const widthCOMPENDIUM = ctx.measureText("Compendium").width;

      const posX_E = padding + widthTHE;
      const posX_C = window.innerWidth - padding - widthCOMPENDIUM;
      const midX = (posX_E + posX_C) / 2;

      return Math.floor(midX / CELL_SIZE);
    };

    let startCol = calculateSpawnCol();
    let startRow = Math.floor(rows / 2);

    const handleResize = () => {
      cols = Math.floor(window.innerWidth / CELL_SIZE);
      rows = Math.floor(window.innerHeight / CELL_SIZE);
      canvas.width = cols * CELL_SIZE;
      canvas.height = rows * CELL_SIZE;
      startCol = calculateSpawnCol();
      startRow = Math.floor(rows / 2);
    };
    window.addEventListener("resize", handleResize);

    // Initial Snake position
    let snake = [{ x: startCol, y: startRow }];
    let dir = { x: 1, y: 0 };
    let waveCount = 1;
    let foods = generateFoods(waveCount);

    // --- KEYBOARD LISTENER FOR MANUAL OVERRIDE ---
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault(); // Prevents the browser window from scrolling
        isManualControl = true;

        // Compare against the last queued direction, not the current one, to prevent self-collisions on rapid double-taps
        const lastQueuedDir = inputQueue.length > 0 ? inputQueue[inputQueue.length - 1] : dir;
        
        let newDir = null;
        if (e.key === "ArrowUp" && lastQueuedDir.y !== 1) newDir = { x: 0, y: -1 };
        else if (e.key === "ArrowDown" && lastQueuedDir.y !== -1) newDir = { x: 0, y: 1 };
        else if (e.key === "ArrowLeft" && lastQueuedDir.x !== 1) newDir = { x: -1, y: 0 };
        else if (e.key === "ArrowRight" && lastQueuedDir.x !== -1) newDir = { x: 1, y: 0 };

        // Add to queue (cap at 3 to prevent weird input spamming)
        if (newDir && inputQueue.length < 3) {
          inputQueue.push(newDir);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown, { passive: false });

    function generateFoods(count) {
      const list = [];
      const minX = MARGIN_CELLS;
      const maxX = Math.max(minX + 1, cols - MARGIN_CELLS);
      const minY = MARGIN_CELLS;
      const maxY = Math.max(minY + 1, rows - MARGIN_CELLS);

      let attempts = 0;
      while (list.length < count && attempts < 500) {
        attempts++;
        const fx = Math.floor(Math.random() * (maxX - minX)) + minX;
        const fy = Math.floor(Math.random() * (maxY - minY)) + minY;

        const onSnake = snake.some((s) => s.x === fx && s.y === fy);
        const inList = list.some((f) => f.x === fx && f.y === fy);

        if (!onSnake && !inList) {
          list.push({ x: fx, y: fy });
        }
      }
      return list;
    }

    function getClosestFood(head, foodList) {
      if (!foodList.length) return { x: head.x + 1, y: head.y };
      let closest = foodList[0];
      let minDist = Math.hypot(head.x - closest.x, head.y - closest.y);

      for (let i = 1; i < foodList.length; i++) {
        const d = Math.hypot(head.x - foodList[i].x, head.y - foodList[i].y);
        if (d < minDist) {
          minDist = d;
          closest = foodList[i];
        }
      }
      return closest;
    }

    function getNextDirection(head, target, currentDir) {
      const dirs = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
      ];

      const validDirs = dirs.filter(
        (d) => !(d.x === -currentDir.x && d.y === -currentDir.y)
      );

      validDirs.sort((a, b) => {
        const distA = Math.hypot(
          head.x + a.x - target.x,
          head.y + a.y - target.y
        );
        const distB = Math.hypot(
          head.x + b.x - target.x,
          head.y + b.y - target.y
        );
        return distA - distB;
      });

      for (let d of validDirs) {
        const nextX = head.x + d.x;
        const nextY = head.y + d.y;

        const hitsWall =
          nextX < MARGIN_CELLS ||
          nextX >= cols - MARGIN_CELLS ||
          nextY < MARGIN_CELLS ||
          nextY >= rows - MARGIN_CELLS;

        const hitsSelf = snake.some((s) => s.x === nextX && s.y === nextY);

        if (!hitsWall && !hitsSelf) {
          return d;
        }
      }

      return validDirs[0] || currentDir;
    }

    function update() {
      const head = snake[0];

      // --- LOGIC SWITCH ---
      if (!isManualControl) {
        // Autopilot calculations
        const currentTarget = getClosestFood(head, foods);
        dir = getNextDirection(head, currentTarget, dir);
      } else {
        // Apply queued user input
        if (inputQueue.length > 0) {
          dir = inputQueue.shift();
        }
      }

      const newHead = { x: head.x + dir.x, y: head.y + dir.y };

      // Reset upon collision
      if (
        newHead.x < MARGIN_CELLS ||
        newHead.x >= cols - MARGIN_CELLS ||
        newHead.y < MARGIN_CELLS ||
        newHead.y >= rows - MARGIN_CELLS ||
        snake.some((s) => s.x === newHead.x && s.y === newHead.y)
      ) {
        snake = [{ x: startCol, y: startRow }];
        dir = { x: 1, y: 0 };
        inputQueue = []; // Clear the input buffer on crash
        waveCount = 1;
        foods = generateFoods(waveCount);
        spawnProgress = 0;
        animStartTime = null;
        isManualControl = false; // Hand back to Autopilot after a crash
        return;
      }

      snake.unshift(newHead);

      const eatenIndex = foods.findIndex(
        (f) => f.x === newHead.x && f.y === newHead.y
      );

      if (eatenIndex !== -1) {
        foods.splice(eatenIndex, 1);

        if (foods.length === 0) {
          waveCount += 1;
          foods = generateFoods(waveCount);
        }
      } else {
        snake.pop();
      }
    }

    function draw(isMoving = false) {
      ctx.fillStyle = "#0A0A0A";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Only draw target food pixels once movement begins
      if (isMoving) {
        ctx.fillStyle = snakeColor;
        foods.forEach((food) => {
          ctx.fillRect(
            food.x * CELL_SIZE,
            food.y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
          );
        });
      }

      // Draw Snake Body & Head
      snake.forEach((segment, index) => {
        const isHead = index === 0;

        if (isHead && spawnProgress < 1) {
          const size = CELL_SIZE * spawnProgress;
          const offset = (CELL_SIZE - size) / 2;

          ctx.fillStyle = "#FFFFFF";
          ctx.globalAlpha = spawnProgress;
          ctx.fillRect(
            segment.x * CELL_SIZE + offset,
            segment.y * CELL_SIZE + offset,
            size,
            size
          );
          ctx.globalAlpha = 1.0;
        } else {
          ctx.fillStyle = isHead ? "#FFFFFF" : snakeColor;
          ctx.fillRect(
            segment.x * CELL_SIZE,
            segment.y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
          );
        }
      });
    }

    function loop(time) {
      if (!animStartTime) animStartTime = time;
      const elapsed = time - animStartTime;

      // 2s Dim-On + 1s Hold Phase
      if (elapsed < INTRO_DURATION) {
        spawnProgress = Math.min(1, elapsed / DIM_DURATION);
        draw(false);
      }
      // Movement Phase
      else {
        spawnProgress = 1;
        if (time - lastTime > TICK_INTERVAL) {
          update();
          draw(true);
          lastTime = time;
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    }

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [snakeColor]);

  return (
    <motion.main
      key="level0"
      exit={{ opacity: 0 }}
      onClick={onEnter}
      onPointerMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#0A0A0A",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Geist", sans-serif',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: "-5%",
          left: "-5%",
          width: "110vw",
          height: "110vh",
          filter: "blur(14px) brightness(0.95)",
          transform: "scale(1.05)",
          zIndex: 1,
        }}
      />

      {/* BRANDING LAYER */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: isMobile ? "0 20px" : "0 40px",
          boxSizing: "border-box",
          color: "#FFF",
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontSize: isMobile ? "28px" : "38px", // MATCHES TOPBAR EXACTLY
            fontWeight: "400",
            margin: 0,
            letterSpacing: "normal", // MATCHES TOPBAR EXACTLY
            lineHeight: 1,
          }}
        >
          The
        </h1>

        <h1
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontSize: isMobile ? "28px" : "38px", // MATCHES TOPBAR EXACTLY
            fontWeight: "400",
            margin: 0,
            letterSpacing: "normal", // MATCHES TOPBAR EXACTLY
            lineHeight: 1,
          }}
        >
          Compendium
        </h1>
      </div>

      {/* FLOATING CURSOR LABEL */}
      {mousePos.x > 0 && (
        <div
          style={{
            position: "fixed",
            top: mousePos.y + 16,
            left: mousePos.x + 16,
            zIndex: 10,
            color: "rgba(255, 255, 255, 0.75)",
            fontSize: isMobile ? "9px" : "11px",
            fontWeight: "700",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          [ CLICK TO ENTER ]
        </div>
      )}
    </motion.main>
  );
}