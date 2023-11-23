/**
 * @param {HTMLElement} el
 * @param {{
 *  initialDelay?: number;
 *  removeTimeout: number;
 *  selector: string;
 * }} options
 */
export function AppFlip(el, options) {
  let enabled = options.initialDelay === 0;
  let first;
  let level = 0;

  // enable animations only after an initial delay
  setTimeout(() => {
    enabled = true;
  }, options.initialDelay ?? 100);

  // take a snapshot before any HTML changes
  // do this only for the first beforeFlip event in the current cycle
  el.addEventListener('beforeFlip', () => {
    if (!enabled) return;
    if (++level > 1) return;

    first = snapshot();
  });

  // take a snapshot after HTML changes, calculate and play animations
  // do this only for the last flip event in the current cycle
  el.addEventListener('flip', () => {
    if (!enabled) return;
    if (--level > 0) return;

    const last = snapshot();
    const toRemove = invertForRemoval(first, last);
    const toAnimate = invertForAnimation(first, last);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        remove(toRemove);
        animate(toAnimate);

        first = null;
      });
    });
  });

  // build a snapshot of the current HTML's client rectangles
  // includes original transforms and hierarchy
  function snapshot() {
    const map = new Map();

    el.querySelectorAll(options.selector).forEach((el) => {
      const key = el.dataset.key ?? el;

      // parse original transform
      // i.e. strip inverse transform using "scale(1)" marker
      const transform = el.style.transform
        ? el.style.transform.replace(/^.*scale\(1\)/, '')
        : '';

      map.set(key, {
        key,
        el,
        rect: el.getBoundingClientRect(),
        ancestor: null,
        transform,
      });
    });

    resolveAncestors(map);

    return map;
  }

  function resolveAncestors(map) {
    map.forEach((entry) => {
      let current = entry.el.parentNode;

      while (current && current !== el) {
        const ancestor = map.get(current.dataset.key ?? current);

        if (ancestor) {
          entry.ancestor = ancestor;
          return;
        }

        current = current.parentNode;
      }
    });
  }

  // reinsert removed elements at their original position
  function invertForRemoval(first, last) {
    const toRemove = [];

    first.forEach((entry) => {
      if (entry.el.classList.contains('_noflip')) return;
      if (!needsRemoval(entry)) return;

      entry.el.style.position = 'fixed';
      entry.el.style.left = `${entry.rect.left}px`;
      entry.el.style.top = `${entry.rect.top}px`;
      entry.el.style.width = `${entry.rect.right - entry.rect.left}px`;
      entry.el.style.transition = 'none';
      entry.el.style.transform = '';

      el.appendChild(entry.el);
      toRemove.push(entry);
    });

    return toRemove;

    function needsRemoval(entry) {
      if (entry.ancestor && needsRemoval(entry.ancestor)) {
        return false;
      }

      return !last.has(entry.key);
    }
  }

  // set position of moved elements to their original position
  // or set opacity to zero for new elements to appear nicely
  function invertForAnimation(first, last) {
    const toAnimate = [];

    last.forEach((entry) => {
      if (entry.el.classList.contains('_noflip')) return;

      calculate(entry);

      if (entry.appear) {
        entry.el.style.transition = 'none';
        entry.el.style.opacity = '0';
        toAnimate.push(entry);
      } else if (entry.deltaX !== 0 || entry.deltaY !== 0) {
        // set inverted transform with "scale(1)" marker, see above
        entry.el.style.transition = 'none';
        entry.el.style.transform = `translate(${entry.deltaX}px, ${entry.deltaY}px) scale(1) ${entry.transform}`;
        toAnimate.push(entry);
      }
    });

    return toAnimate;

    // calculate inverse transform relative to any animated ancestors
    function calculate(entry) {
      if (entry.calculated) return;
      entry.calculated = true;

      const b = first.get(entry.key);

      if (b) {
        entry.deltaX = b.rect.left - entry.rect.left;
        entry.deltaY = b.rect.top - entry.rect.top;

        if (entry.ancestor) {
          calculate(entry.ancestor);

          entry.deltaX -= entry.ancestor.deltaX;
          entry.deltaY -= entry.ancestor.deltaY;
        }
      } else {
        entry.appear = true;
        entry.deltaX = 0;
        entry.deltaY = 0;
      }
    }
  }

  // play remove animations and remove elements after timeout
  function remove(entries) {
    entries.forEach((entry) => {
      entry.el.style.transition = '';
      entry.el.style.opacity = '0';
    });

    setTimeout(() => {
      entries.forEach((entry) => {
        if (entry.el.parentNode) {
          entry.el.parentNode.removeChild(entry.el);
        }
      });
    }, options.removeTimeout);
  }

  // play move/appear animations
  function animate(entries) {
    entries.forEach((entry) => {
      entry.el.style.transition = '';
      entry.el.style.transform = entry.transform;
      entry.el.style.opacity = '';
    });
  }
}
