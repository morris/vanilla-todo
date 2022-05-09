import { AppCollapsible } from './AppCollapsible.js';
import { AppFlip } from './AppFlip.js';
import { AppFps } from './AppFps.js';
import { AppIcon } from './AppIcon.js';
import { TodoFrameCustom } from './TodoFrameCustom.js';
import { TodoFrameDays } from './TodoFrameDays.js';
import { TodoStore } from './TodoStore.js';
import { formatDateId } from './util.js';

export function TodoApp(el) {
  const state = {
    items: [],
    customLists: [],
    at: formatDateId(new Date()),
    customAt: 0,
  };

  el.innerHTML = `
    <header class="app-header">
      <h1 class="title">VANILLA TODO</h1>
      <p class="app-fps fps"></p>
    </header>
    <div class="todo-frame -days"></div>
    <div class="app-collapsible">
      <p class="bar">
        <button class="app-button -circle toggle"><i class="app-icon" data-id="chevron-up-24"></i></button>
      </p>
      <div class="body">
        <div class="todo-frame -custom"></div>
      </div>
    </div>
    <footer class="app-footer">
      <p>
        VANILLA TODO &copy 2020-2022 <a href="https://morrisbrodersen.de">Morris Brodersen</a>
        &mdash; A case study on viable techniques for vanilla web development.
        <a href="https://github.com/morris/vanilla-todo">About →</a>
      </p>
    </footer>
  `;

  AppFlip(el, {
    selector: '.todo-item, .todo-item-input, .todo-day, .todo-custom-list',
    removeTimeout: 200,
  });

  TodoStore(el);

  el.querySelectorAll('.app-collapsible').forEach(AppCollapsible);
  el.querySelectorAll('.app-icon').forEach(AppIcon);
  el.querySelectorAll('.app-fps').forEach(AppFps);

  TodoFrameDays(el.querySelector('.todo-frame.-days'));
  TodoFrameCustom(el.querySelector('.todo-frame.-custom'));

  // each of these events make changes to the HTML to be animated using FLIP
  // listening to them using "capture" dispatches "beforeFlip" before any changes
  el.addEventListener('todoData', beforeFlip, true);
  el.addEventListener('sortableUpdate', beforeFlip, true);
  el.addEventListener('draggableCancel', beforeFlip, true);
  el.addEventListener('draggableDrop', beforeFlip, true);

  // some necessary work to orchestrate drag & drop with FLIP animations
  el.addEventListener('draggableStart', (e) => {
    e.detail.image.classList.add('_noflip');
    el.appendChild(e.detail.image);
  });

  el.addEventListener('draggableCancel', (e) => {
    e.detail.image.classList.remove('_noflip');
    update();
  });

  el.addEventListener('draggableDrop', (e) => {
    e.detail.image.classList.remove('_noflip');
  });

  el.addEventListener('sortableUpdate', (e) => {
    e.detail.placeholder.classList.add('_noflip');
  });

  // dispatch "focusOther"  on .use-focus-other inputs if they are not active
  // ensures only one edit input is active
  el.addEventListener('focusin', (e) => {
    if (!e.target.classList.contains('use-focus-other')) return;

    document.querySelectorAll('.use-focus-other').forEach((el) => {
      if (el === e.target) return;
      el.dispatchEvent(new CustomEvent('focusOther'));
    });
  });

  // listen to the TodoStore's data
  // this is the main update
  // everything else is related to drag & drop or FLIP animations
  el.addEventListener('todoData', (e) => update(e.detail));

  // dispatch "flip" after HTML changes from these events
  // this plays the FLIP animations
  el.addEventListener('todoData', flip);
  el.addEventListener('sortableUpdate', flip);
  el.addEventListener('draggableCancel', flip);
  el.addEventListener('draggableDrop', flip);

  el.dispatchEvent(new CustomEvent('loadStore'));

  function update(next) {
    Object.assign(state, next);

    el.querySelectorAll('.todo-frame').forEach((el) =>
      el.dispatchEvent(new CustomEvent('todoData', { detail: state }))
    );

    el.querySelectorAll('.app-collapsible').forEach((el) =>
      el.dispatchEvent(new CustomEvent('collapse'))
    );
  }

  function beforeFlip(e) {
    if (e.type === 'todoData' && e.target !== el) return;

    el.dispatchEvent(new CustomEvent('beforeFlip'));
  }

  function flip() {
    el.dispatchEvent(new CustomEvent('flip'));
  }
}
