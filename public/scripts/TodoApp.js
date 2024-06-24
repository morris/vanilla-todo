import { AppCollapsible } from './AppCollapsible.js';
import { AppFlip } from './AppFlip.js';
import { AppIcon } from './AppIcon.js';
import { TodoController } from './TodoController.js';
import { TodoFrameCustom } from './TodoFrameCustom.js';
import { TodoFrameDays } from './TodoFrameDays.js';
import { TodoLogic } from './TodoLogic.js';

/**
 * @param {HTMLElement} el
 */
export function TodoApp(el) {
  let todoData = TodoLogic.initTodoData();

  el.innerHTML = /* html */ `
    <header class="app-header">
      <h1 class="title">
        VANILLA TODO
      </h1>
      <p class="actions">
        <label class="app-button import" title="Import data">
          <i class="app-icon" data-id="upload-16"></i>
          <input type="file" name="importFile" hidden>
        </label>
        <button class="app-button export" title="Export data">
          <i class="app-icon" data-id="download-16"></i>
        </button>
      </p>
    </header>
    <div class="todo-frame -days"></div>
    <div class="app-collapsible">
      <p class="bar">
        <button class="app-button -circle toggle" title="Show/hide custom todo-lists">
          <i class="app-icon" data-id="chevron-up-24"></i>
        </button>
      </p>
      <div class="body">
        <div class="todo-frame -custom"></div>
      </div>
    </div>
    <footer class="app-footer">
      <p>
        VANILLA TODO &copy; 2020&ndash;2024 <a href="https://morrisbrodersen.de">Morris Brodersen</a>
        &mdash; A case study on viable techniques for vanilla web development.
        <a href="https://github.com/morris/vanilla-todo">About →</a>
      </p>
    </footer>
  `;

  AppFlip(el, {
    selector: '.todo-item, .todo-item-input, .todo-day, .todo-custom-list',
    removeTimeout: 200,
  });

  TodoController(el);

  el.querySelectorAll('.app-collapsible').forEach(AppCollapsible);
  el.querySelectorAll('.app-icon').forEach(AppIcon);

  TodoFrameDays(el.querySelector('.todo-frame.-days'));
  TodoFrameCustom(el.querySelector('.todo-frame.-custom'));

  el.querySelector('[name=importFile]').addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const reader = new FileReader();

    reader.addEventListener('load', (e) => {
      try {
        const todoData = JSON.parse(e.target.result);

        el.dispatchEvent(
          new CustomEvent('importTodoData', {
            detail: todoData,
            bubbles: true,
          }),
        );
      } catch (err) {
        alert(`Could not import data (${err.message})`);
      }
    });

    reader.readAsText(f);
  });

  el.querySelector('.app-header > .actions > .export').addEventListener(
    'click',
    () => {
      el.dispatchEvent(new CustomEvent('exportTodoData', { bubbles: true }));
    },
  );

  // Each of these events make changes to the HTML to be animated using FLIP.
  // Listening to them using "capture" dispatches "beforeFlip" before any changes.
  el.addEventListener('todoData', beforeFlip, true);
  el.addEventListener('sortableUpdate', beforeFlip, true);
  el.addEventListener('draggableCancel', beforeFlip, true);
  el.addEventListener('draggableDrop', beforeFlip, true);

  // Some necessary work to orchestrate drag & drop with FLIP animations
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

  // Dispatch "focusOther" on .use-focus-other inputs if they are not active.
  // Ensures only one edit input is active.
  el.addEventListener('focusin', (e) => {
    if (!e.target.classList.contains('use-focus-other')) return;

    document.querySelectorAll('.use-focus-other').forEach((el) => {
      if (el === e.target) return;
      el.dispatchEvent(new CustomEvent('focusOther'));
    });
  });

  // Listen to the TodoController's data.
  // This is the main update.
  // Everything else is related to drag & drop or FLIP animations.
  el.addEventListener('todoData', (e) => {
    todoData = e.detail;
    update();
  });

  // Dispatch "flip" after HTML changes from the following events.
  // This plays the FLIP animations.
  el.addEventListener('todoData', flip);
  el.addEventListener('sortableUpdate', flip);
  el.addEventListener('draggableCancel', flip);
  el.addEventListener('draggableDrop', flip);

  el.dispatchEvent(new CustomEvent('loadTodoData'));

  function update() {
    el.querySelectorAll('.todo-frame').forEach((el) =>
      el.dispatchEvent(new CustomEvent('todoData', { detail: todoData })),
    );

    el.querySelectorAll('.app-collapsible').forEach((el) =>
      el.dispatchEvent(new CustomEvent('collapse')),
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
