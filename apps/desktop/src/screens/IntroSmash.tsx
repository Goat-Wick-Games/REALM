import React, { useRef, useEffect, useState } from "react";
import { useTheme } from "../theme/ThemeContext";
import "./IntroSmash.css";

type IntroSmashProps = { onDone: () => void };

type Shard = {
  img: HTMLCanvasElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  va: number;
};

const IntroSmash: React.FC<IntroSmashProps> = ({ onDone }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shardsRef = useRef<Shard[]>([]);
  const clickedRef = useRef(false);
  const [covered, setCovered] = useState(true);
  const { theme } = useTheme();

  const createShards = (
    canvas: HTMLCanvasElement,
    cols: number,
    rows: number
  ) => {
    const shards: Shard[] = [];
    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;

    // Precompute a vertex grid
    const vertices: [number, number][][] = [];
    for (let y = 0; y <= rows; y++) {
      vertices[y] = [];
      for (let x = 0; x <= cols; x++) {
        const jitterX = cellW * 0.2 * (Math.random() - 0.5);
        const jitterY = cellH * 0.2 * (Math.random() - 0.5);
        vertices[y][x] = [x * cellW + jitterX, y * cellH + jitterY];
      }
    }

    // Build shards from quads
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const tl = vertices[y][x];
        const tr = vertices[y][x + 1];
        const bl = vertices[y + 1][x];
        const br = vertices[y + 1][x + 1];

        const quadPoints = [tl, tr, br, bl];

        // Decide if shard will have 3 or 5 points
        const numPoints = Math.random() < 0.5 ? 3 : 5;

        const shardPoints: [number, number][] = [];
        if (numPoints === 3) {
          // pick a random corner as starting point and take next 3 points
          const start = Math.floor(Math.random() * 4);
          for (let i = 0; i < 3; i++) {
            shardPoints.push(quadPoints[(start + i) % 4]);
          }
        } else {
          // For 5 points, repeat one corner to get 5 vertices for slightly irregular shape
          const start = Math.floor(Math.random() * 4);
          for (let i = 0; i < 4; i++) {
            shardPoints.push(quadPoints[(start + i) % 4]);
          }
          // Repeat a random corner to make 5 points
          const repeatIndex = Math.floor(Math.random() * 4);
          shardPoints.push(quadPoints[(start + repeatIndex) % 4]);
        }

        shards.push(makeShard(shardPoints));
      }
    }

    return shards;
  };

  const makeShard = (points: [number, number][]): Shard => {
    // Find bounding box
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const w = maxX - minX;
    const h = maxY - minY;

    // Offscreen canvas
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = theme === "light" ? "#ffffff" : "#1e1e1e";
    ctx.beginPath();
    ctx.moveTo(points[0][0] - minX, points[0][1] - minY);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0] - minX, points[i][1] - minY);
    }
    ctx.closePath();
    ctx.fill();

    return {
      img: c,
      x: minX,
      y: minY,
      vx: 0,
      vy: 0,
      angle: 0,
      va: 0,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    shardsRef.current = createShards(canvas, 12, 10); // smaller grid = smoother

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      shardsRef.current.forEach((s) => {
        if (clickedRef.current) {
          s.vy += 0.3; // gravity
          s.x += s.vx;
          s.y += s.vy;
          s.angle += s.va;
        }
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.drawImage(s.img, 0, 0);
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    setCovered(false);
    if (clickedRef.current) return;
    clickedRef.current = true;

    const clickX = e.clientX;
    const clickY = e.clientY;

    shardsRef.current.forEach((s) => {
      const cx = s.x + s.img.width / 2;
      const cy = s.y + s.img.height / 2;
      const dx = cx - clickX;
      const dy = cy - clickY;
      const dist = Math.hypot(dx, dy) + 1;
      const force = 40 / dist ** 1.2;
      s.vx = dx * force;
      s.vy = dy * force;
      s.va = (Math.random() - 0.5) * 0.1;
    });

    setTimeout(onDone, 200);
  };

  return (
    <main className="Intro">
      {covered && (
        <div onClick={handleClick} className={`Overlay ${theme}`}>
          click anywhere to start...
        </div>
      )}

      <canvas ref={canvasRef} className="Canvas" />
    </main>
  );
};

export default IntroSmash;
