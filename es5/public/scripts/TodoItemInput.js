/* global VT */
window.VT = window.VT || {};

VT.TodoItemInput = function (el) {
  var saveOnBlur = true;

  el.innerHTML = [
    '<input type="text" class="input use-focus-other">',
    '<button class="app-button save"><i class="app-icon" data-id="plus-24"></i></button>',
  ].join('\n');

  var inputEl = el.querySelector('.input');
  var saveEl = el.querySelector('.save');

  el.querySelectorAll('.app-icon').forEach(VT.AppIcon);

  inputEl.addEventListener('keyup', function (e) {
    switch (e.keyCode) {
      case 13: // enter
        save();
        break;
      case 27: // escape
        clear();
        break;
    }
  });

  inputEl.addEventListener('blur', function () {
    if (saveOnBlur) save();
    saveOnBlur = true;
  });

  inputEl.addEventListener('focusOther', save);

  saveEl.addEventListener('mousedown', function () {
    saveOnBlur = false;
  });

  saveEl.addEventListener('click', function () {
    save();
    inputEl.focus();
  });

  function save() {
    var label = inputEl.value.trim();

    if (label === '') return;

    inputEl.value = '';

    el.dispatchEvent(
      new CustomEvent('addItem', {
        detail: { label: label },
        bubbles: true,
      })
    );
  }

  function clear() {
    inputEl.value = '';
    inputEl.blur();
  }
};
