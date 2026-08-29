"use client";

import { useRef, useState } from "react";

export default function SignaturePad({ value, onChange }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [mode, setMode] = useState("draw");

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  }

  function start(e) {
    e.preventDefault();
    drawingRef.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function move(e) {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  function end() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    onChange(canvasRef.current.toDataURL("image/png"));
  }

  function clearPad() {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onChange("");
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex bg-surfacealt rounded-xl p-1 gap-1">
        <button
          type="button"
          onClick={() => setMode("draw")}
          className={`flex-1 rounded-lg py-2 text-[12.5px] font-semibold ${
            mode === "draw" ? "bg-white text-primary shadow-sm" : "text-ink2"
          }`}
        >
          วาดลายเซ็น
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex-1 rounded-lg py-2 text-[12.5px] font-semibold ${
            mode === "upload" ? "bg-white text-primary shadow-sm" : "text-ink2"
          }`}
        >
          อัปโหลดไฟล์ภาพ
        </button>
      </div>

      {mode === "draw" ? (
        <div className="flex flex-col gap-2 items-center">
          <canvas
            ref={canvasRef}
            width={320}
            height={140}
            className="rounded-xl border border-border bg-white touch-none"
            onMouseDown={start}
            onMouseMove={move}
            onMouseUp={end}
            onMouseLeave={end}
            onTouchStart={start}
            onTouchMove={move}
            onTouchEnd={end}
          />
          <button type="button" onClick={clearPad} className="self-start text-[12px] font-semibold text-ink3">
            ล้างลายเซ็น
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input type="file" accept="image/*" onChange={handleFile} className="text-[12.5px]" />
          <div className="text-[11.5px] text-ink3">แนะนำไฟล์ PNG พื้นหลังโปร่งใส</div>
        </div>
      )}

      {value ? (
        <div className="flex flex-col gap-1.5">
          <div className="text-[11.5px] text-ink3">ตัวอย่างลายเซ็นปัจจุบัน</div>
          <div className="border border-border rounded-xl bg-white p-2 flex items-center justify-center h-[80px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="ลายเซ็น" className="max-h-full max-w-full object-contain" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
