import React, { useEffect, useRef, useState } from 'react';

export default function InteractiveHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [scrollScale, setScrollScale] = useState(1);

  useEffect(() => {
    // Scroll interaction
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newScale = Math.max(0.4, 1 - scrollY / 1000);
      setScrollScale(newScale);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let dpr = window.devicePixelRatio || 1;
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas) return;
      dpr = window.devicePixelRatio || 1;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', handleResize);

    // Mouse tracker
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / height - 0.5; // -0.5 to 0.5
      setMouse((prev) => ({ ...prev, targetX: x, targetY: y }));
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Dynamic rotation parameters
    let angleX = 0.5; // Pitch
    let angleY = 0.0; // Yaw
    let angleZ = 0.0; // Roll

    // Silicon grid segments (wafer)
    const waferRadius = 240;
    const radialLinesCount = 32;
    const ringCount = 6;

    // Floating IC specs
    const chipSize = 100;
    const chipHeight = 12;

    // Particle class (electrons flowing along circuit traces)
    interface Electron {
      x: number;
      y: number;
      z: number;
      speed: number;
      length: number;
      radius: number;
      opacity: number;
      color: string;
      trail: { x: number; y: number; z: number }[];
    }

    const electrons: Electron[] = [];
    for (let i = 0; i < 40; i++) {
      // Pick random path (either circular on wafer or coming from outside to IC)
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * waferRadius;
      electrons.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        z: (Math.random() - 0.5) * 20,
        speed: 1 + Math.random() * 2,
        length: 5 + Math.random() * 15,
        radius: 1 + Math.random() * 2,
        opacity: 0.2 + Math.random() * 0.6,
        color: Math.random() > 0.3 ? '#a78bfa' : '#c084fc',
        trail: []
      });
    }

    // Mathematical 3D Projection
    const cameraDistance = 600;

    const project = (x: number, y: number, z: number) => {
      // 1. Rotate Y (Yaw)
      let x1 = x * Math.cos(angleY) - z * Math.sin(angleY);
      let z1 = x * Math.sin(angleY) + z * Math.cos(angleY);

      // 2. Rotate X (Pitch)
      let y2 = y * Math.cos(angleX) - z1 * Math.sin(angleX);
      let z2 = y * Math.sin(angleX) + z1 * Math.cos(angleX);

      // 3. Perspective Projection
      const scale = (cameraDistance / (cameraDistance + z2)) * scrollScale;
      const screenX = width / 2 + x1 * scale;
      const screenY = height / 2 + y2 * scale;

      return { x: screenX, y: screenY, visible: z2 > -cameraDistance, scale };
    };

    // Render loop
    const render = (time: number) => {
      // Clear with deepest slate background & subtle space gradient
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      // Draw cybernet grid background
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Smooth interpolation (LERP) of mouse tilt angles
      angleX += (0.5 + mouse.targetY * 0.4 - angleX) * 0.08;
      angleY += (time * 0.00015 + mouse.targetX * 0.6 - angleY) * 0.08;
      angleZ = time * 0.00005;

      // 1. Draw Silicon Wafer Concentric Rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1.2;

      for (let r = 1; r <= ringCount; r++) {
        const radius = (waferRadius / ringCount) * r;
        ctx.beginPath();
        for (let a = 0; a <= 64; a++) {
          const theta = (a / 64) * Math.PI * 2;
          const wx = Math.cos(theta) * radius;
          const wy = Math.sin(theta) * radius;
          const p = project(wx, wy, 0);
          if (a === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // 2. Draw Silicon Wafer Radial Divisions
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      for (let i = 0; i < radialLinesCount; i++) {
        const theta = (i / radialLinesCount) * Math.PI * 2;
        ctx.beginPath();
        const pStart = project(0, 0, 0);
        const pEnd = project(Math.cos(theta) * waferRadius, Math.sin(theta) * waferRadius, 0);
        ctx.moveTo(pStart.x, pStart.y);
        ctx.lineTo(pEnd.x, pEnd.y);
        ctx.stroke();
      }

      // 3. Draw Wafer Edge notches / flat boundary
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let a = 0; a <= 128; a++) {
        const theta = (a / 128) * Math.PI * 2;
        // Introduce a subtle "flat" notch in silicon geometry
        let radius = waferRadius;
        if (theta > Math.PI * 1.9 || theta < Math.PI * 0.1) {
          radius = waferRadius - 8;
        }
        const wx = Math.cos(theta) * radius;
        const wy = Math.sin(theta) * radius;
        const p = project(wx, wy, 0);
        if (a === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();

      // 4. Draw Floating Integrated Circuit (IC) Package in 3D
      // Draw Bottom plate
      const hHalf = chipHeight / 2;
      const sHalf = chipSize / 2;

      const corners = [
        { x: -sHalf, y: -sHalf, z: hHalf },
        { x: sHalf, y: -sHalf, z: hHalf },
        { x: sHalf, y: sHalf, z: hHalf },
        { x: -sHalf, y: sHalf, z: hHalf },
        { x: -sHalf, y: -sHalf, z: -hHalf },
        { x: sHalf, y: -sHalf, z: -hHalf },
        { x: sHalf, y: sHalf, z: -hHalf },
        { x: -sHalf, y: sHalf, z: -hHalf }
      ];

      // Offset the chip upward (floating above wafer)
      const chipFloatY = -35 + Math.sin(time * 0.002) * 8;
      const shiftedCorners = corners.map(c => ({
        x: c.x,
        y: c.y + chipFloatY,
        z: c.z
      }));

      const projectedCorners = shiftedCorners.map(c => project(c.x, c.y, c.z));

      // Draw bottom face
      ctx.fillStyle = '#121212';
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(projectedCorners[4].x, projectedCorners[4].y);
      for (let idx of [5, 6, 7]) {
        ctx.lineTo(projectedCorners[idx].x, projectedCorners[idx].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw dynamic bonding wires (pins from chip package to silicon wafer base)
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.1)';
      ctx.lineWidth = 0.8;
      const pinCount = 10;
      for (let side = 0; side < 4; side++) {
        for (let p = 0; p < pinCount; p++) {
          const ratio = (p / (pinCount - 1)) * 2 - 1; // -1 to 1
          let cx = 0, cy = 0;
          if (side === 0) { cx = -sHalf; cy = ratio * sHalf; }
          else if (side === 1) { cx = sHalf; cy = ratio * sHalf; }
          else if (side === 2) { cx = ratio * sHalf; cy = -sHalf; }
          else { cx = ratio * sHalf; cy = sHalf; }

          const pChip = project(cx, cy + chipFloatY, hHalf);
          const pWafer = project(cx * 1.8, cy * 1.8, 0);

          ctx.beginPath();
          ctx.moveTo(pChip.x, pChip.y);
          // Curve bounding wire slightly upward
          const pMid = project(cx * 1.4, cy * 1.4 + chipFloatY * 0.4, hHalf * 1.5);
          ctx.quadraticCurveTo(pMid.x, pMid.y, pWafer.x, pWafer.y);
          ctx.stroke();
        }
      }

      // Draw Top Face (Die Layout Heatmap)
      ctx.fillStyle = '#181818';
      ctx.beginPath();
      ctx.moveTo(projectedCorners[0].x, projectedCorners[0].y);
      for (let idx of [1, 2, 3]) {
        ctx.lineTo(projectedCorners[idx].x, projectedCorners[idx].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw Die sub-cores (CPU clusters, SRAM, NPU blocks)
      const subBlocks = [
        { x: -0.3, y: -0.3, w: 0.25, h: 0.25, color: 'rgba(167, 139, 250, 0.4)', name: 'CPU0' },
        { x: 0.05, y: -0.3, w: 0.25, h: 0.25, color: 'rgba(167, 139, 250, 0.4)', name: 'CPU1' },
        { x: -0.3, y: 0.05, w: 0.25, h: 0.25, color: 'rgba(167, 139, 250, 0.4)', name: 'CPU2' },
        { x: 0.05, y: 0.05, w: 0.25, h: 0.25, color: 'rgba(167, 139, 250, 0.4)', name: 'CPU3' },
        { x: -0.35, y: -0.4, w: 0.7, h: 0.06, color: 'rgba(255, 255, 255, 0.2)', name: 'SRAM L2' },
        { x: 0.35, y: -0.3, w: 0.1, h: 0.6, color: 'rgba(192, 132, 252, 0.4)', name: 'NPU' }
      ];

      subBlocks.forEach((block) => {
        const p0 = project((block.x) * chipSize, (block.y) * chipSize + chipFloatY, -hHalf);
        const p1 = project((block.x + block.w) * chipSize, (block.y) * chipSize + chipFloatY, -hHalf);
        const p2 = project((block.x + block.w) * chipSize, (block.y + block.h) * chipSize + chipFloatY, -hHalf);
        const p3 = project((block.x) * chipSize, (block.y + block.h) * chipSize + chipFloatY, -hHalf);

        ctx.fillStyle = block.color;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.stroke();
      });

      // Draw solid bounding pillars
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.3)';
      const sideEdges = [
        [0, 4], [1, 5], [2, 6], [3, 7]
      ];
      sideEdges.forEach(([iA, iB]) => {
        ctx.beginPath();
        ctx.moveTo(projectedCorners[iA].x, projectedCorners[iA].y);
        ctx.lineTo(projectedCorners[iB].x, projectedCorners[iB].y);
        ctx.stroke();
      });

      // 5. Draw flowing electrons along orbits/tracks
      electrons.forEach((electron) => {
        // Move electron in 3D orbit
        const theta = (time * 0.001 * electron.speed) + (electron.opacity * 10);
        // Track radius fluctuates with time
        const curR = waferRadius * (0.1 + 0.8 * Math.sin(theta * 0.3 + electron.speed));
        
        electron.x = Math.cos(theta) * curR;
        electron.y = Math.sin(theta) * curR;
        electron.z = Math.sin(theta * 5) * 15;

        // Add to history trail
        electron.trail.push({ x: electron.x, y: electron.y, z: electron.z });
        if (electron.trail.length > 8) electron.trail.shift();

        // Draw trail
        if (electron.trail.length > 1) {
          ctx.beginPath();
          const pStart = project(electron.trail[0].x, electron.trail[0].y, electron.trail[0].z);
          ctx.moveTo(pStart.x, pStart.y);
          for (let j = 1; j < electron.trail.length; j++) {
            const pNext = project(electron.trail[j].x, electron.trail[j].y, electron.trail[j].z);
            ctx.lineTo(pNext.x, pNext.y);
          }
          ctx.strokeStyle = electron.color;
          ctx.lineWidth = electron.radius * 0.8;
          ctx.globalAlpha = electron.opacity * 0.3;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }

        // Draw electron core
        const pCore = project(electron.x, electron.y, electron.z);
        if (pCore.visible) {
          ctx.beginPath();
          ctx.arc(pCore.x, pCore.y, electron.radius * pCore.scale, 0, Math.PI * 2);
          ctx.fillStyle = electron.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = electron.color;
          ctx.fill();
          ctx.shadowBlur = 0; // Reset
        }
      });

      // Draw technical HUD overlay on the canvas
      ctx.fillStyle = 'rgba(167, 139, 250, 0.4)';
      ctx.font = '10px monospace';
      ctx.fillText(`YAW: ${angleY.toFixed(2)} RAD`, 24, height - 60);
      ctx.fillText(`PITCH: ${angleX.toFixed(2)} RAD`, 24, height - 44);
      ctx.fillText(`PPA_MESH: TSMC_N7_7NM`, 24, height - 28);
      ctx.fillText(`SIMULATED_TRANSISTORS: 28.4M`, 24, height - 12);

      ctx.fillText(`GRID_ACCURACY: 99.8% (PASS)`, width - 180, height - 28);
      ctx.fillText(`CLOCK_LOCK_FREQ: 1.20GHz`, width - 180, height - 12);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [scrollScale, mouse.targetX, mouse.targetY]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 h-full w-full overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full opacity-85" />
    </div>
  );
}
