/* global VT */
window.VT = window.VT || {};

VT.TodoFrameCustom = function (el) {
  var state = {
    lists: [],
    items: [],
    at: 0,
    show: true,
  };

  el.innerHTML = [
    '<div class="leftcontrols">',
    '  <p><button class="app-button -circle -xl back"><i class="app-icon" data-id="chevron-left-24"></i></button></p>',
    '</div>',
    '<div class="container"></div>',
    '<div class="rightcontrols">',
    '  <p><button class="app-button -circle -xl forward"><i class="app-icon" data-id="chevron-right-24"></i></button></p>',
    '  <p><button class="app-button -circle -xl add"><i class="app-icon" data-id="plus-circle-24"></i></button></p>',
    '</div>',
  ].join('\n');

  VT.AppSortable(el.querySelector('.container'), { direction: 'horizontal' });

  setTimeout(function () {
    el.classList.add('-animated');
  }, 200);

  el.querySelectorAll('.app-icon').forEach(VT.AppIcon);

  el.querySelector('.back').addEventListener('click', function () {
    el.dispatchEvent(
      new CustomEvent('customSeek', { detail: -1, bubbles: true })
    );
  });

  el.querySelector('.forward').addEventListener('click', function () {
    el.dispatchEvent(
      new CustomEvent('customSeek', { detail: 1, bubbles: true })
    );
  });

  el.querySelector('.add').addEventListener('click', function () {
    el.dispatchEvent(new CustomEvent('addList', { detail: {}, bubbles: true }));
    // TODO seek if not at end
  });

  el.addEventListener('sortableDrop', function (e) {
    if (!e.detail.data.list) return;

    el.dispatchEvent(
      new CustomEvent('moveList', {
        detail: {
          list: e.detail.data.list,
          index: e.detail.index,
        },
        bubbles: true,
      })
    );
  });

  el.addEventListener('draggableOver', function (e) {
    if (!e.detail.data.list) return;

    updatePositions();
  });

  el.todoFrameCustom = {
    update: update,
  };

  function update(next) {
    Object.assign(state, next);

    var lists = getLists();
    var container = el.querySelector('.container');
    var obsolete = new Set(container.children);
    var childrenByKey = new Map();

    obsolete.forEach(function (child) {
      childrenByKey.set(child.dataset.key, child);
    });

    var children = lists.map(function (list) {
      var child = childrenByKey.get(list.id);

      if (child) {
        obsolete.delete(child);
      } else {
        child = document.createElement('div');
        child.className = 'card todo-custom-list';
        child.dataset.key = list.id;
        VT.TodoCustomList(child);
      }

      child.todoCustomList.update({ list: list });

      return child;
    });

    obsolete.forEach(function (child) {
      container.removeChild(child);
    });

    children.forEach(function (child, index) {
      if (child !== container.children[index]) {
        container.insertBefore(child, container.children[index]);
      }
    });

    updatePositions();
    updateHeight();
  }

  function updatePositions() {
    el.querySelectorAll('.container > *').forEach(function (child, index) {
      child.style.transform = 'translateX(' + (index - state.at) * 100 + '%)';
    });
  }

  function updateHeight() {
    var height = 280;
    var container = el.querySelector('.container');

    var i, l;

    for (i = 0, l = container.children.length; i < l; ++i) {
      height = Math.max(container.children[i].offsetHeight, height);
    }

    el.style.height = height + 50 + 'px';

    for (i = 0, l = container.children.length; i < l; ++i) {
      container.children[i].style.height = height + 'px';
    }
  }

  function getLists() {
    var lists = state.lists.map(function (list) {
      return {
        id: list.id,
        index: list.index,
        title: list.title,
        items: getItemsForList(list.id),
      };
    });

    lists.sort(function (a, b) {
      return a.index - b.index;
    });

    return lists;
  }

  function getItemsForList(listId) {
    var items = state.items.filter(function (item) {
      return item.listId === listId;
    });

    items.sort(function (a, b) {
      return a.index - b.index;
    });

    return items;
  }
};
