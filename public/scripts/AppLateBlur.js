/* global VT */
window.VT = window.VT || {};

/**
 * Enables `lateBlur` events on the target element.
 * After an actual `blur` event, subsequent interactions with the window
 * (e.g. focus, select, mouseup etc.) will dispatch a `lateBlur` event.
 */
VT.AppLateBlur = function (el) {
  el.addEventListener('blur', function () {
    window.addEventListener('focus', dispatch);
    window.addEventListener('select', dispatch);

    if (window.navigator.pointerEnabled) {
      window.addEventListener('pointerup', dispatch);
    } else if (window.navigator.msPointerEnabled) {
      window.addEventListener('MSPointerUp', dispatch);
    } else {
      window.addEventListener('mouseup', dispatch);
      window.addEventListener('touchend', dispatch);
    }
  });

  function dispatch() {
    window.removeEventListener('focus', dispatch);
    window.removeEventListener('select', dispatch);

    if (window.navigator.pointerEnabled) {
      window.removeEventListener('pointerup', dispatch);
    } else if (window.navigator.msPointerEnabled) {
      window.removeEventListener('MSPointerUp', dispatch);
    } else {
      window.removeEventListener('mouseup', dispatch);
      window.removeEventListener('touchend', dispatch);
    }

    el.dispatchEvent(new CustomEvent('lateBlur', { bubbles: true }));
  }
};
