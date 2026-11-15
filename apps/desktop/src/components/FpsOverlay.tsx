import { useEffect, useRef, useState } from "react";
import { createFpsMeter } from "@realm/core";

type Props = {
  enabled: boolean;
};

export function FpsOverlay({ enabled }: Props) {
  const [fps, setFps] = useState<number | null>(null);
  const meterRef = useRef<ReturnType<typeof createFpsMeter> | null>(null);

  useEffect(() => {
    if (!enabled) {
      meterRef.current?.stop();
      meterRef.current = null;
      setFps(null);
      return;
    }

    const meter = createFpsMeter(setFps, 45);
    meterRef.current = meter;
    meter.start();

    return () => {
      meter.stop();
      meterRef.current = null;
    };
  }, [enabled]);

  if (!enabled || fps === null) return null;

  const color = fps < 30 ? "#ff6666" : fps < 50 ? "#ffcc66" : "#99ff99";

  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        right: 8,
        padding: "2px 8px",
        font: "12px/1.4 ui-monospace, monospace",
        color,
        background: "rgba(0,0,0,0.55)",
        borderRadius: 4,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 9999,
      }}
    >
      {fps} FPS
    </div>
  );
}
