/* global VT */
window.VT = window.VT || {};

VT.AppSortable = function (el, options) {
  var placeholder;
  var placeholderSource;
  var horizontal = options.direction === 'horizontal';
  var currentIndex = -1;

  el.addEventListener('draggableStart', function (e) {
    e.detail.image.addEventListener('draggableCancel', cleanUp);
  });

  el.addEventListener('draggableOver', function (e) {
    maybeDispatchUpdate(calculateIndex(e.detail.image), e);
  });

  el.addEventListener('draggableLeave', function (e) {
    maybeDispatchUpdate(-1, e);
  });

  el.addEventListener('draggableDrop', function (e) {
    el.dispatchEvent(
      new CustomEvent('sortableDrop', {
        detail: buildDetail(e),
        bubbles: true,
      })
    );
  });

  el.addEventListener('sortableUpdate', function (e) {
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
        })
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
    var detail = {
      data: e.detail.data,
      index: currentIndex,
      placeholder: placeholder,
      setPlaceholder: function (source) {
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
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }
  }

  function removeByKey(key) {
    for (var i = 0, l = el.children.length; i < l; ++i) {
      var child = el.children[i];

      if (child && child.dataset.key === key) {
        el.removeChild(child);
      }
    }
  }

  function calculateIndex(image) {
    if (el.children.length === 0) return 0;

    var isBefore = horizontal ? isLeft : isAbove;
    var rect = image.getBoundingClientRect();
    var p = 0;

    for (var i = 0, l = el.children.length; i < l; ++i) {
      var child = el.children[i];

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
};
