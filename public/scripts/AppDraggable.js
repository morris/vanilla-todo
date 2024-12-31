/**
 * @param {HTMLElement} el
 * @param {{
 *  dropSelector: string;
 *  dragThreshold?: number;
 *  dropRange?: number;
 *  scrollThreshold?: number;
 *  scrollSpeed?: number;
 * }} options
 */
export function AppDraggable(el, options) {
  const dragThreshold = options.dragThreshold ?? 5;
  const dropRange = options.dropRange ?? 50;
  const dropRangeSquared = dropRange * dropRange;
  const scrollThreshold = options.scrollThreshold ?? 12;
  const scrollSpeed = options.scrollSpeed ?? 7;

  let originX, originY;
  let clientX, clientY;
  let startTime;
  let dragging = false;
  let data;
  let image;
  let imageSource;
  let imageX, imageY;
  let currentTarget;

  el.addEventListener('touchstart', start, { passive: true });
  el.addEventListener('mousedown', start, { passive: true });

  // Prevent click while dragging
  el.addEventListener(
    'click',
    (e) => {
      if (dragging) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true,
  );

  function start(e) {
    if (el.classList.contains('_nodrag')) return;
    if (e.type === 'mousedown' && e.button !== 0) return;
    if (e.touches && e.touches.length > 1) return;

    const p = getPositionHost(e);
    clientX = originX = p.clientX ?? p.pageX;
    clientY = originY = p.clientY ?? p.pageY;
    startTime = Date.now();

    startListening();
  }

  function move(e) {
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

    // Prevent unintentional dragging on touch devices
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
    autoScroll();
  }

  function end() {
    stopListening();

    requestAnimationFrame(() => {
      if (dragging) {
        dispatchTarget();
        dispatchEnd();

        dragging = false;
      }
    });
  }

  function startListening() {
    el.addEventListener('touchmove', move, { passive: true });
    el.addEventListener('touchend', end, { passive: true });
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseup', end, { passive: true });
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
      }),
    );
  }

  function dispatchDrag() {
    image.dispatchEvent(
      new CustomEvent('draggableDrag', {
        detail: buildDetail(),
        bubbles: true,
      }),
    );
  }

  function dispatchTarget() {
    const nextTarget = getTarget();

    if (nextTarget === currentTarget) return;

    if (currentTarget) {
      currentTarget.addEventListener('draggableLeave', removeDropClassOnce);
      currentTarget.dispatchEvent(
        new CustomEvent('draggableLeave', {
          detail: buildDetail(),
          bubbles: true,
        }),
      );
    }

    if (nextTarget) {
      nextTarget.addEventListener('draggableEnter', addDropClassOnce);
      nextTarget.dispatchEvent(
        new CustomEvent('draggableEnter', {
          detail: buildDetail(),
          bubbles: true,
        }),
      );
    }

    currentTarget = nextTarget;
  }

  function dispatchOverContinuously() {
    if (!dragging) return;

    if (currentTarget) {
      currentTarget.dispatchEvent(
        new CustomEvent('draggableOver', {
          detail: buildDetail(),
          bubbles: true,
        }),
      );
    }

    setTimeout(dispatchOverContinuously, 50);
  }

  function dispatchEnd() {
    if (currentTarget) {
      currentTarget.addEventListener('draggableDrop', cleanUpOnce);
      currentTarget.dispatchEvent(
        new CustomEvent('draggableDrop', {
          detail: buildDetail(),
          bubbles: true,
        }),
      );
    } else {
      image.dispatchEvent(
        new CustomEvent('draggableCancel', {
          detail: buildDetail(),
          bubbles: true,
        }),
      );
    }
  }

  function autoScroll() {
    if (!dragging) return;

    let x = 0;
    let y = 0;

    if (clientX < scrollThreshold) {
      if (window.scrollX > 0) {
        x = -1;
      }
    } else if (clientX > window.innerWidth - scrollThreshold) {
      x = 1;
    }

    if (clientY < scrollThreshold) {
      if (window.scrollY > 0) {
        y = -1;
      }
    } else if (clientY > window.innerHeight - scrollThreshold) {
      y = 1;
    }

    if (x !== 0 || y !== 0) {
      window.scrollBy(x * scrollSpeed, y * scrollSpeed);
    }

    requestAnimationFrame(autoScroll);
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
        rect,
      );

      if (distanceSquared > dropRangeSquared) return;

      candidates.push({
        el,
        distanceSquared,
      });
    });

    candidates.sort((a, b) => {
      if (a.distanceSquared === 0 && b.distanceSquared === 0) {
        // in this case, the client position is inside both rectangles
        // if A contains B, B is the correct target and vice versa
        // TODO sort by z-index somehow?
        return a.el.contains(b.el) ? -1 : b.el.contains(a.el) ? 1 : 0;
      }

      // sort by distance, ascending
      return a.distanceSquared - b.distanceSquared;
    });

    return candidates.length > 0 ? candidates[0].el : null;
  }
}

export function pointDistanceToRectSquared(x, y, rect) {
  let dx = 0;
  let dy = 0;

  if (x < rect.left) {
    dx = x - rect.left;
  } else if (x > rect.right) {
    dx = x - rect.right;
  }

  if (y < rect.top) {
    dy = y - rect.top;
  } else if (y > rect.bottom) {
    dy = y - rect.bottom;
  }

  return dx * dx + dy * dy;
}

export function getPositionHost(e) {
  if (e.targetTouches && e.targetTouches.length > 0) {
    return e.targetTouches[0];
  }

  if (e.changedTouches && e.changedTouches.length > 0) {
    return e.changedTouches[0];
  }

  return e;
}
