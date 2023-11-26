import { AppIcon } from './AppIcon.js';
import { AppSortable } from './AppSortable.js';
import { TodoCustomList } from './TodoCustomList.js';

/**
 * @param {HTMLElement} el
 */
export function TodoFrameCustom(el) {
  let todoData = {
    customLists: [],
    items: [],
    customAt: 0,
  };

  el.innerHTML = `
    <div class="leftcontrols">
      <p><button class="app-button -circle -xl back"><i class="app-icon" data-id="chevron-left-24"></i></button></p>
    </div>
    <div class="container"></div>
    <div class="rightcontrols">
      <p><button class="app-button -circle -xl forward"><i class="app-icon" data-id="chevron-right-24"></i></button></p>
      <p><button class="app-button -circle -xl add"><i class="app-icon" data-id="plus-circle-24"></i></button></p>
    </div>
  `;

  AppSortable(el.querySelector('.container'), { direction: 'horizontal' });

  setTimeout(() => el.classList.add('-animated'), 200);

  el.querySelectorAll('.app-icon').forEach(AppIcon);

  el.querySelector('.back').addEventListener('click', () =>
    el.dispatchEvent(
      new CustomEvent('seekCustomTodoLists', { detail: -1, bubbles: true }),
    ),
  );

  el.querySelector('.forward').addEventListener('click', () =>
    el.dispatchEvent(
      new CustomEvent('seekCustomTodoLists', { detail: 1, bubbles: true }),
    ),
  );

  el.querySelector('.add').addEventListener('click', () => {
    el.dispatchEvent(
      new CustomEvent('addTodoList', { detail: {}, bubbles: true }),
    );
    // TODO seek if not at end
  });

  el.addEventListener('sortableDrop', (e) => {
    if (!e.detail.data.list) return;

    el.dispatchEvent(
      new CustomEvent('moveTodoList', {
        detail: {
          list: e.detail.data.list,
          index: e.detail.index,
        },
        bubbles: true,
      }),
    );
  });

  el.addEventListener('draggableOver', (e) => {
    if (!e.detail.data.list) return;

    updatePositions();
  });

  el.addEventListener('todoData', (e) => {
    todoData = e.detail;
    update();
  });

  function update() {
    const lists = getLists();
    const container = el.querySelector('.container');
    const obsolete = new Set(container.children);
    const childrenByKey = new Map();

    obsolete.forEach((child) => childrenByKey.set(child.dataset.key, child));

    const children = lists.map((list) => {
      let child = childrenByKey.get(list.id);

      if (child) {
        obsolete.delete(child);
      } else {
        child = document.createElement('div');
        child.className = 'card todo-custom-list';
        child.dataset.key = list.id;
        TodoCustomList(child);
      }

      child.dispatchEvent(new CustomEvent('todoCustomList', { detail: list }));

      return child;
    });

    obsolete.forEach((child) => container.removeChild(child));

    children.forEach((child, index) => {
      if (child !== container.children[index]) {
        container.insertBefore(child, container.children[index]);
      }
    });

    updatePositions();
    updateHeight();
  }

  function updatePositions() {
    el.querySelectorAll('.container > *').forEach((child, index) => {
      child.style.transform = `translateX(${
        (index - todoData.customAt) * 100
      }%)`;
    });
  }

  function updateHeight() {
    let height = 280;
    const container = el.querySelector('.container');

    for (let i = 0, l = container.children.length; i < l; ++i) {
      container.children[i].style.height = `auto`;
      height = Math.max(container.children[i].offsetHeight, height);
    }

    el.style.height = `${height + 80}px`;

    for (let i = 0, l = container.children.length; i < l; ++i) {
      container.children[i].style.height = `${height + 30}px`;
    }

    // Update collapsible on changing heights
    el.dispatchEvent(new CustomEvent('collapse', { bubbles: true }));
  }

  function getLists() {
    return todoData.customLists
      .map((list) => ({
        id: list.id,
        index: list.index,
        title: list.title,
        items: getItemsForList(list.id),
      }))
      .sort((a, b) => a.index - b.index);
  }

  function getItemsForList(listId) {
    return todoData.items
      .filter((item) => item.listId === listId)
      .sort((a, b) => a.index - b.index);
  }
}
