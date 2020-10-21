/* global VT */
window.VT = window.VT || {};

VT.TodoItemInput = function (el) {
  el.innerHTML = [
    '<input class="input" type="text">',
    '<button class="app-button save"><i class="app-icon" data-id="plus-24"></i></button>',
  ].join('\n');

  var inputEl = el.querySelector('.input');
  var saveEl = el.querySelector('.save');

  VT.AppLateBlur(inputEl);
  el.querySelectorAll('.app-icon').forEach(VT.AppIcon);

  inputEl.addEventListener('keypress', function (e) {
    switch (e.keyCode) {
      case 13: // enter
        save();
        break;
      case 27: // escape
        clear();
        break;
    }
  });

  inputEl.addEventListener('lateBlur', save);

  saveEl.addEventListener('click', function () {
    save();
    inputEl.focus();
  });

  function save() {
    var label = inputEl.value.trim();

    if (label === '') return;

    el.dispatchEvent(
      new CustomEvent('addItem', {
        detail: { label: inputEl.value },
        bubbles: true,
      })
    );

    inputEl.value = '';
  }

  function clear() {
    inputEl.value = '';
    inputEl.blur();
  }
};
