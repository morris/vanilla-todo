import { AppDraggable } from './AppDraggable.js';
import { AppIcon } from './AppIcon.js';

/**
 * @param {HTMLElement} el
 */
export function TodoItem(el) {
  let item;
  let editing = false;
  let startEditing = false;
  let saveOnBlur = true;

  el.innerHTML = `
    <div class="checkbox">
      <input type="checkbox">
    </div>
    <p class="label"></p>
    <p class="form">
      <input type="text" class="input use-focus-other">
      <button class="app-button save"><i class="app-icon" data-id="check-16"></i></button>
    </p>
  `;

  const checkboxEl = el.querySelector('.checkbox');
  const labelEl = el.querySelector('.label');
  const inputEl = el.querySelector('.input');
  const saveEl = el.querySelector('.save');

  AppDraggable(el, {
    dropSelector: '.todo-list > .items',
  });

  el.querySelectorAll('.app-icon').forEach(AppIcon);

  checkboxEl.addEventListener(
    'touchstart',
    () => {
      saveOnBlur = false;
    },
    { passive: true },
  );

  checkboxEl.addEventListener('mousedown', () => {
    saveOnBlur = false;
  });

  checkboxEl.addEventListener('click', () => {
    if (editing) save();

    el.dispatchEvent(
      new CustomEvent('checkTodoItem', {
        detail: {
          item,
          done: !item.done,
        },
        bubbles: true,
      }),
    );
  });

  labelEl.addEventListener('click', () => {
    startEditing = true;
    editing = true;
    update();
  });

  inputEl.addEventListener('keyup', (e) => {
    switch (e.keyCode) {
      case 13: // Enter
        save();
        break;
      case 27: // Escape
        cancelEdit();
        break;
    }
  });

  inputEl.addEventListener('blur', () => {
    if (saveOnBlur) save();
    saveOnBlur = true;
  });

  inputEl.addEventListener('focusOther', () => {
    if (editing) save();
  });

  saveEl.addEventListener('mousedown', () => {
    saveOnBlur = false;
  });

  saveEl.addEventListener('click', save);

  el.addEventListener('draggableStart', (e) => {
    e.detail.data.item = item;
    e.detail.data.key = item.id;
  });

  el.addEventListener('todoItem', (e) => {
    item = e.detail;
    update();
  });

  function save() {
    const label = inputEl.value.trim();

    if (label === '') {
      // Deferred deletion prevents a bug at reconciliation in TodoList:
      //   Failed to execute 'removeChild' on 'Node': The node to be removed is
      //   no longer a child of this node. Perhaps it was moved in a 'blur'
      //   event handler?
      requestAnimationFrame(() => {
        el.dispatchEvent(
          new CustomEvent('deleteTodoItem', {
            detail: item,
            bubbles: true,
          }),
        );
      });

      return;
    }

    el.dispatchEvent(
      new CustomEvent('saveTodoItem', {
        detail: {
          item,
          label,
        },
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
    el.classList.toggle('-done', item.done);
    checkboxEl.querySelector('input').checked = item.done;
    labelEl.innerText = item.label;

    el.classList.toggle('-editing', editing);
    el.classList.toggle('_nodrag', editing);

    if (editing && startEditing) {
      inputEl.value = item.label;
      inputEl.focus();
      inputEl.select();
      startEditing = false;
    }
  }
}
