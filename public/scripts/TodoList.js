/* global VT */
window.VT = window.VT || {};

VT.TodoList = function (el) {
  var state = {
    items: [],
  };

  el.innerHTML = [
    '<div class="items"></div>',
    '<div class="todo-item-input"></div>',
  ].join('\n');

  VT.AppSortable(el.querySelector('.items'), {});
  VT.TodoItemInput(el.querySelector('.todo-item-input'));

  el.addEventListener('sortableDrop', function (e) {
    el.dispatchEvent(
      new CustomEvent('moveItem', {
        detail: {
          item: e.detail.data.item,
          index: e.detail.index,
        },
        bubbles: true,
      })
    );
  });

  function update(next) {
    Object.assign(state, next);

    var container = el.querySelector('.items');
    var obsolete = new Set(container.children);
    var childrenByKey = new Map();

    obsolete.forEach(function (child) {
      childrenByKey.set(child.dataset.key, child);
    });

    var children = state.items.map(function (item) {
      var child = childrenByKey.get(item.id);

      if (child) {
        obsolete.delete(child);
      } else {
        child = document.createElement('div');
        child.classList.add('todo-item');
        child.dataset.key = item.id;
        VT.TodoItem(child);
      }

      child.todoItem.update({ item: item });

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
  }

  el.todoList = {
    update: update,
  };
};
