import { AppDraggable } from './AppDraggable.js';
import { AppIcon } from './AppIcon.js';
import { TodoList } from './TodoList.js';

/**
 * @param {HTMLElement} el
 */
export function TodoCustomList(el) {
  let list;
  let editing = false;
  let startEditing = false;
  let saveOnBlur = true;

  el.innerHTML = /* html */ `
    <div class="header">
      <h2 class="title"></h2>
      <p class="form">
        <input type="text" class="input use-focus-other" aria-label="Title">
        <button class="app-button delete" title="Delete">
          <i class="app-icon" data-id="trash-16"></i>
        </button>
      </p>
    </div>
    <div class="todo-list"></div>
  `;

  const titleEl = el.querySelector('.title');
  const inputEl = el.querySelector('.input');
  const deleteEl = el.querySelector('.delete');

  AppDraggable(titleEl, {
    dropSelector: '.todo-frame.-custom .container',
  });
  el.querySelectorAll('.app-icon').forEach(AppIcon);
  TodoList(el.querySelector('.todo-list'));

  titleEl.addEventListener('click', () => {
    startEditing = true;
    editing = true;
    update();
  });

  deleteEl.addEventListener(
    'touchstart',
    () => {
      saveOnBlur = false;
    },
    { passive: true },
  );

  deleteEl.addEventListener('mousedown', () => {
    saveOnBlur = false;
  });

  inputEl.addEventListener('blur', () => {
    if (saveOnBlur) save();
    saveOnBlur = true;
  });

  inputEl.addEventListener('focusOther', () => {
    if (editing) save();
  });

  inputEl.addEventListener('keyup', (e) => {
    switch (e.keyCode) {
      case 13: // enter
        save();
        break;
      case 27: // escape
        cancelEdit();
        break;
    }
  });

  deleteEl.addEventListener('click', () => {
    if (list.items.length > 0) {
      if (
        !confirm(
          'Deleting this list will delete its items as well. Are you sure?',
        )
      ) {
        return;
      }
    }

    el.dispatchEvent(
      new CustomEvent('deleteCustomTodoList', {
        detail: list,
        bubbles: true,
      }),
    );
  });

  el.addEventListener('draggableStart', (e) => {
    if (e.target !== titleEl) return;

    e.detail.data.list = list;
    e.detail.data.key = list.id;

    // Update image (default would only be title element).
    e.detail.setImage(el);

    // Override for horizontal dragging only.
    e.detail.image.addEventListener('draggableDrag', (e) => {
      const x = e.detail.clientX - e.detail.imageX;
      const y = e.detail.originY - e.detail.imageY;
      e.detail.image.style.transform = `translate(${x}px, ${y}px)`;
    });
  });

  el.addEventListener('addTodoItem', (e) => {
    e.detail.listId = list.id;
  });

  el.addEventListener('moveTodoItem', (e) => {
    e.detail.listId = list.id;
    e.detail.index = e.detail.index ?? 0;
  });

  el.addEventListener('customTodoList', (e) => {
    list = e.detail;
    update();
  });

  function save() {
    el.dispatchEvent(
      new CustomEvent('editCustomTodoList', {
        detail: { ...list, title: inputEl.value.trim() },
        bubbles: true,
      }),
    );
    editing = false;
    update();
  }

  function cancelEdit() {
    saveOnBlur = false;
    editing = false;
    update();
  }

  function update() {
    titleEl.innerText = list.title || '...';

    el.querySelector('.todo-list').dispatchEvent(
      new CustomEvent('todoItems', { detail: list.items }),
    );

    el.querySelector('.todo-list > .todo-item-input').dataset.key =
      `todo-item-input${list.id}`;

    el.classList.toggle('-editing', editing);

    if (editing && startEditing) {
      inputEl.value = list.title;
      inputEl.focus();
      inputEl.select();
      startEditing = false;
    }
  }
}
