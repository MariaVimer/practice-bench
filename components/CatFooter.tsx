"use client";
import { useEffect, useRef } from "react";

// "Huh?" — the last thing on every page: the cat, with space rushing past made of math.
// Equations and stars fly out of a vanishing point behind the cat, growing as they near.
// Canvas, runs only while on screen, device ratio capped at 1.5, one still frame under reduced motion.

const FORMULAS = [
  "a ÷ b = a × 1/b", "πr²", "3x + 4 = 19", "|−5| = 5", "2/3 ÷ 1/12 = 8", "70% of 80", "x ≤ 56", "LCM(6, 8) = 24",
  "√9 = 3", "2³ = 8", "A = ½bh", "−3 > −8", "24 : 3", "x̄ = Σx / n", "V = lwh", "5 : 3", "(x, y)", "y = 2x",
  "GCF(36, 48) = 12", "3/4 = 0.75", "45% · 60 = 27", "4(x + y)", "−7 < −2", "9⁴ = 6561", "1 3/4", "b + 4b = 25",
];

interface Item { x: number; y: number; z: number; text: string | null; px?: number; py?: number }

export function CatFooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const box = boxRef.current!;
    const ctx = canvas.getContext("2d")!;
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    const serif = getComputedStyle(document.body).getPropertyValue("--font-serif").trim() || "Georgia";
    let w = 0, h = 0, dpr = 1, frame = 0, last = 0, visible = false;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const spawn = (far = true): Item => ({
      x: rand(-1.4, 1.4),
      y: rand(-0.9, 0.9),
      z: far ? rand(0.85, 1) : rand(0.1, 1),
      text: Math.random() < 0.34 ? FORMULAS[Math.floor(Math.random() * FORMULAS.length)] : null,
    });
    let items: Item[] = [];

    const resize = () => {
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      w = box.clientWidth;
      h = box.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      // fewer things to fly past on a small screen
      const want = Math.round(Math.max(55, Math.min(150, (w * h) / 6500)));
      while (items.length < want) items.push(spawn(false));
      items.length = want;
    };

    const draw = (dt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h * 0.42; // vanishing point: just above the cat's head
      const scale = Math.min(w, h * 1.6) * 0.32;
      const speed = 0.16; // depth units per second
      for (const it of items) {
        it.z -= speed * dt * (0.6 + (1 - it.z));
        const sx = cx + (it.x / it.z) * scale;
        const sy = cy + (it.y / it.z) * scale;
        if (it.z < 0.06 || sx < -200 || sx > w + 200 || sy < -80 || sy > h + 80) {
          Object.assign(it, spawn(true), { px: undefined, py: undefined });
          continue;
        }
        // fade in from the far distance, and out again as it rushes past
        const near = it.z < 0.22 ? it.z / 0.22 : 1;
        const a = Math.min(1, (1 - it.z) * 2.2) * 0.9 * near;
        if (it.text) {
          const k = Math.max(0.55, Math.min(1, w / 1000));
          const size = Math.max(5, Math.min(34 * k, (11 * k) / it.z));
          ctx.font = `italic ${size}px ${serif}`;
          ctx.fillStyle = `rgba(240,240,248,${(a * 0.75).toFixed(3)})`;
          ctx.textAlign = "center";
          ctx.fillText(it.text, sx, sy);
        } else {
          const r = Math.max(0.4, Math.min(2.2, 0.5 / it.z));
          if (it.px !== undefined && it.py !== undefined && dt > 0) {
            ctx.strokeStyle = `rgba(255,255,255,${(a * 0.55).toFixed(3)})`;
            ctx.lineWidth = r;
            ctx.beginPath();
            ctx.moveTo(it.px, it.py);
            ctx.lineTo(sx, sy);
            ctx.stroke();
          }
          ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        }
        it.px = sx;
        it.py = sy;
      }
    };

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      draw(dt);
      frame = visible && !still.matches ? requestAnimationFrame(tick) : 0;
    };
    const run = () => {
      if (!frame && visible && !still.matches) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    resize();
    draw(0); // a still frame right away (and the only one under reduced motion)
    const io = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) run();
    }, { rootMargin: "120px 0px" });
    io.observe(box);
    const ro = new ResizeObserver(() => { resize(); draw(0); });
    ro.observe(box);
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="space" ref={boxRef} aria-hidden="true">
      <canvas ref={canvasRef} className="space-canvas" />
      <img className="space-cat" src="/cat.webp" alt="" width={440} height={568} loading="lazy" decoding="async" />
    </div>
  );
}
