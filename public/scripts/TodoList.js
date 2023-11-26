import { AppSortable } from './AppSortable.js';
import { TodoItem } from './TodoItem.js';
import { TodoItemInput } from './TodoItemInput.js';

/**
 * @param {HTMLElement} el
 */
export function TodoList(el) {
  let items = [];

  el.innerHTML = `
    <div class="items"></div>
    <div class="todo-item-input"></div>
  `;

  AppSortable(el.querySelector('.items'), {});
  TodoItemInput(el.querySelector('.todo-item-input'));

  el.addEventListener('sortableDrop', (e) =>
    el.dispatchEvent(
      new CustomEvent('moveTodoItem', {
        detail: {
          item: e.detail.data.item,
          index: e.detail.index,
        },
        bubbles: true,
      }),
    ),
  );

  el.addEventListener('todoItems', (e) => {
    items = e.detail;
    update();
  });

  function update() {
    const container = el.querySelector('.items');
    const obsolete = new Set(container.children);
    const childrenByKey = new Map();

    obsolete.forEach((child) => childrenByKey.set(child.dataset.key, child));

    const children = items.map((item) => {
      let child = childrenByKey.get(item.id);

      if (child) {
        obsolete.delete(child);
      } else {
        child = document.createElement('div');
        child.classList.add('todo-item');
        child.dataset.key = item.id;
        TodoItem(child);
      }

      child.dispatchEvent(new CustomEvent('todoItem', { detail: item }));

      return child;
    });

    obsolete.forEach((child) => container.removeChild(child));

    children.forEach((child, index) => {
      if (child !== container.children[index]) {
        container.insertBefore(child, container.children[index]);
      }
    });
  }
}
