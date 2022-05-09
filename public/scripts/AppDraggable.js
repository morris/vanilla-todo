export function AppDraggable(el, options) {
  const dragThreshold = options.dragThreshold ?? 5;
  const dropRange = options.dropRange ?? 50;
  const dropRangeSquared = dropRange * dropRange;

  let originX, originY;
  let clientX, clientY;
  let startTime;
  let dragging = false;
  let clicked = false;
  let data;
  let image;
  let imageSource;
  let imageX, imageY;
  let currentTarget;

  el.addEventListener('touchstart', start);
  el.addEventListener('mousedown', start);

  // maybe prevent click
  el.addEventListener(
    'click',
    (e) => {
      if (dragging || clicked) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true
  );

  function start(e) {
    if (el.classList.contains('_nodrag')) return;
    if (e.type === 'mousedown' && e.button !== 0) return;
    if (e.touches && e.touches.length > 1) return;

    e.preventDefault();

    const p = getPositionHost(e);
    clientX = originX = p.clientX ?? p.pageX;
    clientY = originY = p.clientY ?? p.pageY;
    startTime = Date.now();

    startListening();
  }

  function move(e) {
    e.preventDefault();

    const p = getPositionHost(e);
    clientX = p.clientX ?? p.pageX;
    clientY = p.clientY ?? p.pageY;

    if (dragging) {
      dispatchDrag();
      dispatchTarget();
      return;
    }

    const deltaX = clientX - originX;
    const deltaY = clientY - originY;

    if (Math.abs(deltaX) < dragThreshold && Math.abs(deltaY) < dragThreshold) {
      return;
    }

    // prevent unintentional dragging on touch devices
    if (e.touches && Date.now() - startTime < 50) {
      stopListening();
      return;
    }

    dragging = true;
    data = {};

    dispatchStart();
    dispatchDrag();
    dispatchTarget();
    dispatchOverContinuously();
  }

  function end(e) {
    e.preventDefault();

    if (!dragging) {
      e.target.click();
      clicked = true;
    }

    stopListening();

    requestAnimationFrame(() => {
      clicked = false;

      if (dragging) {
        dispatchTarget();
        dispatchEnd();
      }
    });
  }

  function startListening() {
    el.addEventListener('touchmove', move);
    el.addEventListener('touchend', end);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
  }

  function stopListening() {
    el.removeEventListener('touchmove', move);
    el.removeEventListener('touchend', end);
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', end);
  }

  //

  function dispatchStart() {
    setImage(el);

    el.dispatchEvent(
      new CustomEvent('draggableStart', {
        detail: buildDetail(),
        bubbles: true,
      })
    );
  }

  function dispatchDrag() {
    image.dispatchEvent(
      new CustomEvent('draggableDrag', {
        detail: buildDetail(),
        bubbles: true,
      })
    );
  }

  function dispatchTarget() {
    if (!dragging) return;

    const nextTarget = getTarget();

    if (nextTarget === currentTarget) return;

    if (currentTarget) {
      currentTarget.addEventListener('draggableLeave', removeDropClassOnce);
      currentTarget.dispatchEvent(
        new CustomEvent('draggableLeave', {
          detail: buildDetail(),
          bubbles: true,
        })
      );
    }

    if (nextTarget) {
      nextTarget.addEventListener('draggableEnter', addDropClassOnce);
      nextTarget.dispatchEvent(
        new CustomEvent('draggableEnter', {
          detail: buildDetail(),
          bubbles: true,
        })
      );
    }

    currentTarget = nextTarget;
  }

  function dispatchOverContinuously() {
    if (!dragging) return;

    dispatchOver();
    setTimeout(dispatchOver, 50);
  }

  function dispatchOver() {
    if (currentTarget) {
      currentTarget.dispatchEvent(
        new CustomEvent('draggableOver', {
          detail: buildDetail(),
          bubbles: true,
        })
      );
    }

    setTimeout(dispatchOver, 50);
  }

  function dispatchEnd() {
    if (currentTarget) {
      currentTarget.addEventListener('draggableDrop', cleanUpOnce);
      currentTarget.dispatchEvent(
        new CustomEvent('draggableDrop', {
          detail: buildDetail(),
          bubbles: true,
        })
      );
    } else {
      image.dispatchEvent(
        new CustomEvent('draggableCancel', {
          detail: buildDetail(),
          bubbles: true,
        })
      );
    }
  }

  //

  function buildDetail() {
    const detail = {
      el,
      data,
      image,
      imageSource,
      originX,
      originY,
      clientX,
      clientY,
      imageX,
      imageY,
      setImage: (source) => {
        setImage(source);
        detail.image = image;
      },
    };

    return detail;
  }

  function setImage(source) {
    if (imageSource === source) return;
    imageSource = source;

    removeImage();

    image = imageSource.cloneNode(true);
    image.style.position = 'fixed';
    image.style.left = '0';
    image.style.top = '0';
    image.style.width = `${imageSource.offsetWidth}px`;
    image.style.height = `${imageSource.offsetHeight}px`;
    image.style.margin = '0';
    image.style.zIndex = 9999;
    image.classList.add('-dragging');

    const rect = source.getBoundingClientRect();
    imageX = originX - rect.left;
    imageY = originY - rect.top;

    image.addEventListener('draggableDrag', (e) => {
      const x = e.detail.clientX - e.detail.imageX;
      const y = e.detail.clientY - e.detail.imageY;
      image.style.transition = 'none';
      image.style.transform = `translate(${x}px, ${y}px)`;
    });

    image.addEventListener('draggableCancel', cleanUp);

    document.body.appendChild(image);
  }

  function addDropClassOnce(e) {
    e.target.removeEventListener(e.type, addDropClassOnce);
    e.target.classList.add('-drop');
  }

  function removeDropClassOnce(e) {
    e.target.removeEventListener(e.type, addDropClassOnce);
    e.target.classList.remove('-drop');
  }

  function cleanUpOnce(e) {
    e.target.removeEventListener(e.type, cleanUpOnce);
    cleanUp();
  }

  function cleanUp() {
    currentTarget?.classList.remove('-drop');

    removeImage();

    data = null;
    image = null;
    imageSource = null;
    currentTarget = null;
  }

  function removeImage() {
    image?.parentNode?.removeChild(image);
  }

  function getTarget() {
    const candidates = [];

    document.querySelectorAll(options.dropSelector).forEach((el) => {
      const rect = el.getBoundingClientRect();
      const distanceSquared = pointDistanceToRectSquared(
        clientX,
        clientY,
        rect
      );

      if (distanceSquared > dropRangeSquared) return;

      candidates.push({
        el,
        distance2: distanceSquared,
      });
    });

    candidates.sort((a, b) => {
      if (a.distance2 === 0 && b.distance2 === 0) {
        // in this case, the client position is inside both rectangles
        // if A contains B, B is the correct target and vice versa
        // TODO sort by z-index somehow?
        return a.el.contains(b.el) ? -1 : b.el.contains(a.el) ? 1 : 0;
      }

      // sort by distance, ascending
      return a.distance2 - b.distance2;
    });

    return candidates.length > 0 ? candidates[0].el : null;
  }

  function pointDistanceToRectSquared(x, y, rect) {
    const dx =
      x < rect.left ? x - rect.left : x > rect.right ? x - rect.right : 0;
    const dy =
      y < rect.top ? y - rect.top : y > rect.bottom ? y - rect.bottom : 0;

    return dx * dx + dy * dy;
  }

  function getPositionHost(e) {
    if (e.targetTouches && e.targetTouches.length > 0) {
      return e.targetTouches[0];
    }

    if (e.changedTouches && e.changedTouches.length > 0) {
      return e.changedTouches[0];
    }

    return e;
  }
}
