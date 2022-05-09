/* global VT */
window.VT = window.VT || {};

VT.TodoCustomList = function (el) {
  var state = {
    list: null,
    editing: false,
  };
  var startEditing = false;
  var saveOnBlur = true;

  el.innerHTML = [
    '<div class="header">',
    '  <h3 class="title"></h3>',
    '  <p class="form">',
    '    <input type="text" class="input use-focus-other">',
    '    <button class="app-button delete"><i class="app-icon" data-id="trashcan-16"></i></button>',
    '  </p>',
    '</div>',
    '<div class="todo-list"></div>',
  ].join('\n');

  var titleEl = el.querySelector('.title');
  var inputEl = el.querySelector('.input');
  var deleteEl = el.querySelector('.delete');

  VT.AppDraggable(titleEl, {
    dropSelector: '.todo-frame.-custom .container',
  });
  VT.TodoList(el.querySelector('.todo-list'));
  el.querySelectorAll('.app-icon').forEach(VT.AppIcon);

  titleEl.addEventListener('click', function () {
    startEditing = true;
    update({ editing: true });
  });

  deleteEl.addEventListener('touchstart', function () {
    saveOnBlur = false;
  });

  deleteEl.addEventListener('mousedown', function () {
    saveOnBlur = false;
  });

  inputEl.addEventListener('blur', function () {
    if (saveOnBlur) save();
    saveOnBlur = true;
  });

  inputEl.addEventListener('focusOther', function () {
    if (state.editing) save();
  });

  inputEl.addEventListener('keyup', function (e) {
    switch (e.keyCode) {
      case 13: // enter
        save();
        break;
      case 27: // escape
        cancelEdit();
        break;
    }
  });

  deleteEl.addEventListener('click', function () {
    if (state.list.items.length > 0) {
      if (
        !confirm(
          'Deleting this list will delete its items as well. Are you sure?'
        )
      ) {
        return;
      }
    }

    el.dispatchEvent(
      new CustomEvent('deleteList', {
        detail: state.list,
        bubbles: true,
      })
    );
  });

  el.addEventListener('draggableStart', function (e) {
    if (e.target !== titleEl) return;

    e.detail.data.list = state.list;
    e.detail.data.key = state.list.id;

    // update image (default would only be title element)
    e.detail.setImage(el);

    // override for horizontal dragging only
    e.detail.image.addEventListener('draggableDrag', function (e) {
      var x = e.detail.clientX - e.detail.imageX;
      var y = e.detail.originY - e.detail.imageY;
      e.detail.image.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    });
  });

  el.addEventListener('addItem', function (e) {
    e.detail.listId = state.list.id;
  });

  el.addEventListener('moveItem', function (e) {
    e.detail.listId = state.list.id;
    e.detail.index = e.detail.index || 0;
  });

  el.todoCustomList = {
    update: update,
  };

  function save() {
    el.dispatchEvent(
      new CustomEvent('saveList', {
        detail: { list: state.list, title: inputEl.value.trim() },
        bubbles: true,
      })
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

    el.querySelector('.todo-list').todoList.update({ items: state.list.items });
    el.querySelector('.todo-list > .todo-item-input').dataset.key =
      'todo-item-input' + state.list.id;

    el.classList.toggle('-editing', state.editing);

    if (state.editing && startEditing) {
      inputEl.value = state.list.title;
      inputEl.focus();
      inputEl.select();
      startEditing = false;
    }
  }
};
