import { AppIcon } from './AppIcon.js';

export function TodoItemInput(el) {
  let saveOnBlur = true;

  el.innerHTML = `
    <input type="text" class="input use-focus-other">
    <button class="app-button save"><i class="app-icon" data-id="plus-24"></i></button>
  `;

  const inputEl = el.querySelector('.input');
  const saveEl = el.querySelector('.save');

  el.querySelectorAll('.app-icon').forEach(AppIcon);

  inputEl.addEventListener('keyup', (e) => {
    switch (e.keyCode) {
      case 13: // enter
        save();
        break;
      case 27: // escape
        clear();
        break;
    }
  });

  inputEl.addEventListener('blur', () => {
    if (saveOnBlur) save();
    saveOnBlur = true;
  });

  inputEl.addEventListener('focusOther', save);

  saveEl.addEventListener('mousedown', () => {
    saveOnBlur = false;
  });

  saveEl.addEventListener('click', () => {
    save();
    inputEl.focus();
  });

  function save() {
    const label = inputEl.value.trim();

    if (label === '') return;

    inputEl.value = '';

    el.dispatchEvent(
      new CustomEvent('addItem', {
        detail: { label },
        bubbles: true,
      })
    );
  }

  function clear() {
    inputEl.value = '';
    inputEl.blur();
  }
}
