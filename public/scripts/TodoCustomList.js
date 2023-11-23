import { AppDraggable } from './AppDraggable.js';
import { AppIcon } from './AppIcon.js';
import { TodoList } from './TodoList.js';

/**
 * @param {HTMLElement} el
 */
export function TodoCustomList(el) {
  const state = {
    list: null,
    editing: false,
  };
  let startEditing = false;
  let saveOnBlur = true;

  el.innerHTML = `
    <div class="header">
      <h3 class="title"></h3>
      <p class="form">
        <input type="text" class="input use-focus-other">
        <button class="app-button delete"><i class="app-icon" data-id="trash-16"></i></button>
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
    update({ editing: true });
  });

  deleteEl.addEventListener('touchstart', () => {
    saveOnBlur = false;
  });

  deleteEl.addEventListener('mousedown', () => {
    saveOnBlur = false;
  });

  inputEl.addEventListener('blur', () => {
    if (saveOnBlur) save();
    saveOnBlur = true;
  });

  inputEl.addEventListener('focusOther', () => {
    if (state.editing) save();
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
    if (state.list.items.length > 0) {
      if (
        !confirm(
          'Deleting this list will delete its items as well. Are you sure?',
        )
      ) {
        return;
      }
    }

    el.dispatchEvent(
      new CustomEvent('deleteTodoList', {
        detail: state.list,
        bubbles: true,
      }),
    );
  });

  el.addEventListener('draggableStart', (e) => {
    if (e.target !== titleEl) return;

    e.detail.data.list = state.list;
    e.detail.data.key = state.list.id;

    // update image (default would only be title element)
    e.detail.setImage(el);

    // override for horizontal dragging only
    e.detail.image.addEventListener('draggableDrag', (e) => {
      const x = e.detail.clientX - e.detail.imageX;
      const y = e.detail.originY - e.detail.imageY;
      e.detail.image.style.transform = `translate(${x}px, ${y}px)`;
    });
  });

  el.addEventListener('addTodoItem', (e) => {
    e.detail.listId = state.list.id;
  });

  el.addEventListener('moveTodoItem', (e) => {
    e.detail.listId = state.list.id;
    e.detail.index = e.detail.index ?? 0;
  });

  el.addEventListener('todoCustomList', (e) => update({ list: e.detail }));

  function save() {
    el.dispatchEvent(
      new CustomEvent('saveTodoList', {
        detail: { list: state.list, title: inputEl.value.trim() },
        bubbles: true,
      }),
    );
    update({ editing: false });
  }

  function cancelEdit() {
    saveOnBlur = false;
    update({ editing: false });
  }

  function update(next) {
    Object.assign(state, next);

    titleEl.innerText = state.list.title || '...';

    el.querySelector('.todo-list').dispatchEvent(
      new CustomEvent('todoItems', { detail: state.list.items }),
    );

    el.querySelector('.todo-list > .todo-item-input').dataset.key =
      `todo-item-input${state.list.id}`;

    el.classList.toggle('-editing', state.editing);

    if (state.editing && startEditing) {
      inputEl.value = state.list.title;
      inputEl.focus();
      inputEl.select();
      startEditing = false;
    }
  }
}
