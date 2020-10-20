/* global VT */
window.VT = window.VT || {};

VT.TodoItem = function (el) {
  var state = {
    item: null,
    editing: false,
  };
  var focus = false;

  el.innerHTML = [
    '<div class="checkbox">',
    '  <input type="checkbox">',
    '</div>',
    '<p class="label"></p>',
    '<p class="form">',
    '  <input class="input" type="text">',
    '  <button class="app-button save"><i class="app-icon" data-id="check-16"></i></button>',
    '</p>',
  ].join('\n');

  var inputEl = el.querySelector('.input');
  var labelEl = el.querySelector('.label');

  VT.AppDraggable(el, {
    dropSelector: '.todo-list > .items',
  });
  VT.AppLateBlur(inputEl);

  el.querySelectorAll('.app-icon').forEach(VT.AppIcon);

  el.querySelector('.checkbox').addEventListener('click', function () {
    el.dispatchEvent(
      new CustomEvent('checkItem', {
        detail: {
          item: state.item,
          done: !state.item.done,
        },
        bubbles: true,
      })
    );
  });

  labelEl.addEventListener('click', function () {
    focus = true;
    update({ editing: true });
  });

  el.querySelector('.save').addEventListener('click', function () {
    save();
  });

  inputEl.addEventListener('keypress', function (e) {
    if (e.keyCode === 13) save();
  });

  inputEl.addEventListener('lateBlur', function () {
    save();
    update({ editing: false });
  });

  el.addEventListener('draggableStart', function (e) {
    e.detail.data.item = state.item;
    e.detail.data.key = state.item.id;
  });

  el.todoItem = {
    update: update,
  };

  function save() {
    var label = inputEl.value.trim();

    if (label === '') {
      el.dispatchEvent(
        new CustomEvent('deleteItem', {
          detail: state.item,
          bubbles: true,
        })
      );

      return;
    }

    el.dispatchEvent(
      new CustomEvent('saveItem', {
        detail: {
          item: state.item,
          label: label,
        },
        bubbles: true,
      })
    );

    update({ editing: false });
  }

  function update(next) {
    // TODO optimize
    Object.assign(state, next);

    el.classList.toggle('-done', state.item.done);
    el.querySelector('.checkbox > input').checked = state.item.done;
    labelEl.innerText = state.item.label;
    inputEl.value = state.item.label;
    el.classList.toggle('-editing', state.editing);
    el.classList.toggle('_nodrag', state.editing);

    if (state.editing && focus) {
      el.querySelector('.input').focus();
      el.querySelector('.input').select();
      focus = false;
    }
  }
};
