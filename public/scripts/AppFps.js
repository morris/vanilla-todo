export function AppFps(el) {
  const sampleSize = 20;
  let times = [];

  tick();

  function tick() {
    requestAnimationFrame(tick);

    times.push(performance.now());

    if (times.length <= sampleSize) return;

    let min = Infinity;
    let max = 0;
    let sum = 0;

    for (let i = 1; i < sampleSize + 1; ++i) {
      const delta = times[i] - times[i - 1];
      min = Math.min(min, delta);
      max = Math.max(max, delta);
      sum += delta;
    }

    const fps = (sampleSize / sum) * 1000;

    el.innerText = `${fps.toFixed(0)} fps (${min.toFixed(0)} ms - ${max.toFixed(
      0
    )} ms)`;

    times = [];
  }
}
