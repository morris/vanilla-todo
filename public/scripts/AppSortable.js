/**
 * @param {HTMLElement} el
 * @param {{
 *  direction?: 'horizontal' | 'vertical';
 * }} options
 */
export function AppSortable(el, options) {
  let placeholder;
  let placeholderSource;
  const horizontal = options.direction === 'horizontal';
  let currentIndex = -1;

  el.addEventListener('draggableStart', (e) =>
    e.detail.image.addEventListener('draggableCancel', cleanUp),
  );

  el.addEventListener('draggableOver', (e) =>
    maybeDispatchUpdate(calculateIndex(e.detail.image), e),
  );

  el.addEventListener('draggableLeave', (e) => maybeDispatchUpdate(-1, e));

  el.addEventListener('draggableDrop', (e) =>
    el.dispatchEvent(
      new CustomEvent('sortableDrop', {
        detail: buildDetail(e),
        bubbles: true,
      }),
    ),
  );

  el.addEventListener('sortableUpdate', (e) => {
    if (!placeholder) {
      e.detail.setPlaceholder(e.detail.originalEvent.detail.imageSource);
    }

    if (e.detail.index >= 0) {
      insertPlaceholder(e.detail.index);
    } else {
      removePlaceholder();
    }

    removeByKey(e.detail.data.key);
  });

  el.addEventListener('sortableDrop', cleanUp);

  function maybeDispatchUpdate(index, originalEvent) {
    if (index !== currentIndex) {
      currentIndex = index;

      el.dispatchEvent(
        new CustomEvent('sortableUpdate', {
          detail: buildDetail(originalEvent),
          bubbles: true,
        }),
      );
    }
  }

  function cleanUp() {
    removePlaceholder();
    placeholder = null;
    placeholderSource = null;
    currentIndex = -1;
  }

  function buildDetail(e) {
    const detail = {
      data: e.detail.data,
      index: currentIndex,
      placeholder,
      setPlaceholder: (source) => {
        setPlaceholder(source);
        detail.placeholder = placeholder;
      },
      originalEvent: e,
    };

    return detail;
  }

  function setPlaceholder(source) {
    if (placeholderSource === source) return;
    placeholderSource = source;

    removePlaceholder();

    placeholder = placeholderSource.cloneNode(true);
    placeholder.classList.add('-placeholder');
    placeholder.removeAttribute('data-key');
  }

  function insertPlaceholder(index) {
    if (placeholder && el.children[index] !== placeholder) {
      if (placeholder.parentNode === el) el.removeChild(placeholder);
      el.insertBefore(placeholder, el.children[index]);
    }
  }

  function removePlaceholder() {
    placeholder?.parentNode?.removeChild(placeholder);
  }

  function removeByKey(key) {
    for (let i = 0, l = el.children.length; i < l; ++i) {
      const child = el.children[i];

      if (child && child.dataset.key === key) {
        el.removeChild(child);
      }
    }
  }

  function calculateIndex(image) {
    if (el.children.length === 0) return 0;

    const isBefore = horizontal ? isLeft : isAbove;
    const rect = image.getBoundingClientRect();
    let p = 0;

    for (let i = 0, l = el.children.length; i < l; ++i) {
      const child = el.children[i];

      if (isBefore(rect, child.getBoundingClientRect())) return i - p;
      if (child === placeholder) p = 1;
    }

    return el.children.length - p;
  }

  function isAbove(rectA, rectB) {
    return (
      rectA.top + (rectA.bottom - rectA.top) / 2 <=
      rectB.top + (rectB.bottom - rectB.top) / 2
    );
  }

  function isLeft(rectA, rectB) {
    return (
      rectA.left + (rectA.right - rectA.left) / 2 <=
      rectB.left + (rectB.right - rectB.left) / 2
    );
  }
}
