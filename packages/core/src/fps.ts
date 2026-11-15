export type FpsMeter = {
  start(): void;
  stop(): void;
};

export function createFpsMeter(
  onSample: (fps: number) => void,
  windowSize = 45
): FpsMeter {
  let last = 0;
  let raf = 0;
  let running = false;
  const samples: number[] = [];

  const tick = (now: number) => {
    if (last !== 0) {
      const delta = now - last;
      if (delta > 0) {
        samples.push(1000 / delta);
        if (samples.length > windowSize) samples.shift();
        if (samples.length === windowSize) {
          const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
          onSample(Math.round(avg));
        }
      }
    }
    last = now;
    if (running) raf = requestAnimationFrame(tick);
  };

  return {
    start() {
      if (running) return;
      running = true;
      last = 0;
      samples.length = 0;
      raf = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
  };
}
