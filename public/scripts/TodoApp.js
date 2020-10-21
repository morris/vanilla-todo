/* global VT */
window.VT = window.VT || {};

VT.TodoApp = function (el) {
  var state = {
    items: [],
    customLists: [],
    at: VT.formatDateId(new Date()),
    customAt: 0,
  };

  el.innerHTML = [
    '<header class="app-header">',
    '  <h1 class="title">VANILLA TODO</h1>',
    '</header>',
    '<div class="todo-frame -days"></div>',
    '<div class="app-collapsible">',
    '  <p class="bar">',
    '    <button class="app-button -circle toggle"><i class="app-icon" data-id="chevron-up-24"></i></button>',
    '  </p>',
    '  <div class="body">',
    '    <div class="todo-frame -custom"></div>',
    '  </div>',
    '</div>',
    '<footer class="app-footer">',
    '  <p>',
    '    VANILLA TODO &copy 2020 <a href="https://morrisbrodersen.de">Morris Brodersen</a>',
    '    &mdash; A case study on viable techniques for vanilla web development.',
    '    <a href="https://github.com/morris/vanilla-todo">About</a>',
    '  </p>',
    '</footer>',
  ].join('\n');

  VT.AppFlip(el, {
    selector: '.todo-item, .todo-item-input, .todo-day, .todo-custom-list',
    removeTimeout: 200,
  });
  VT.TodoStore(el);

  el.querySelectorAll('.app-collapsible').forEach(VT.AppCollapsible);
  el.querySelectorAll('.app-icon').forEach(VT.AppIcon);

  VT.TodoFrameDays(el.querySelector('.todo-frame.-days'));
  VT.TodoFrameCustom(el.querySelector('.todo-frame.-custom'));

  // each of these events make changes to the HTML to be animated using FLIP
  // listening to them using "capture" dispatches "beforeFlip" before any changes
  el.addEventListener('todoData', beforeFlip, true);
  el.addEventListener('sortableUpdate', beforeFlip, true);
  el.addEventListener('draggableCancel', beforeFlip, true);
  el.addEventListener('draggableDrop', beforeFlip, true);

  // some necessary work to orchestrate drag & drop with FLIP animations
  el.addEventListener('draggableStart', function (e) {
    e.detail.image.classList.add('_noflip');
    el.appendChild(e.detail.image);
  });

  el.addEventListener('draggableCancel', function (e) {
    e.detail.image.classList.remove('_noflip');
    update();
  });

  el.addEventListener('draggableDrop', function (e) {
    e.detail.image.classList.remove('_noflip');
  });

  el.addEventListener('sortableUpdate', function (e) {
    e.detail.placeholder.classList.add('_noflip');
  });

  // listen to the TodoStore's data
  // this is the main update
  // everything else is related to drag & drop or FLIP animations
  el.addEventListener('todoData', function (e) {
    update(e.detail);
  });

  // dispatch "flip" after HTML changes from these events
  // this plays the FLIP animations
  el.addEventListener('todoData', flip);
  el.addEventListener('sortableUpdate', flip);
  el.addEventListener('draggableCancel', flip);
  el.addEventListener('draggableDrop', flip);

  el.todoStore.load();

  function update(next) {
    Object.assign(state, next);

    el.querySelector('.todo-frame.-days').todoFrameDays.update({
      items: state.items,
      at: state.at,
    });

    el.querySelector('.todo-frame.-custom').todoFrameCustom.update({
      lists: state.customLists,
      items: state.items,
      at: state.customAt,
    });

    el.querySelectorAll('.app-collapsible').forEach(function (el) {
      el.appCollapsible.update();
    });
  }

  function beforeFlip() {
    el.dispatchEvent(
      new CustomEvent('beforeFlip', {
        bubbles: true,
      })
    );
  }

  function flip() {
    el.dispatchEvent(
      new CustomEvent('flip', {
        bubbles: true,
      })
    );
  }
};
