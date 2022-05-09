/* global VT */
window.VT = window.VT || {};

VT.AppFps = function (el) {
  var sampleSize = 20;
  var times = [];

  tick();

  function tick() {
    requestAnimationFrame(tick);

    times.push(performance.now());

    if (times.length <= sampleSize) return;

    var min = Infinity;
    var max = 0;
    var sum = 0;

    for (var i = 1; i < sampleSize + 1; ++i) {
      var delta = times[i] - times[i - 1];
      min = Math.min(min, delta);
      max = Math.max(max, delta);
      sum += delta;
    }

    var fps = (sampleSize / sum) * 1000;

    el.innerText =
      fps.toFixed(0) +
      ' fps (' +
      min.toFixed(0) +
      ' ms - ' +
      max.toFixed(0) +
      ' ms)';

    times = [];
  }
};
