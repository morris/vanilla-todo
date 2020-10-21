/* global VT */
window.VT = window.VT || {};

VT.AppFps = function (el) {
  var times = [];

  tick();

  function tick() {
    requestAnimationFrame(tick);

    times.push(performance.now());

    if (times.length < 60) return;

    var min = Infinity;
    var max = 0;
    var sum = 0;

    for (var i = 1; i < 60; ++i) {
      var delta = times[i] - times[i - 1];
      min = Math.min(min, delta);
      max = Math.max(max, delta);
      sum += delta;
    }

    var fps = (60 / sum) * 1000;

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
