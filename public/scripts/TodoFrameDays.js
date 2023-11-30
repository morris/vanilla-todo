import { AppDatePicker } from './AppDatePicker.js';
import { AppIcon } from './AppIcon.js';
import { TodoDay } from './TodoDay.js';
import { TodoLogic } from './TodoLogic.js';

/**
 * @param {HTMLElement} el
 */
export function TodoFrameDays(el) {
  const RANGE = 14;
  let todoData = TodoLogic.initTodoData();

  el.innerHTML = `
    <nav class="leftcontrols">
      <p>
        <button class="app-button -circle -xl backward">
          <i class="app-icon" data-id="chevron-left-24"></i>
        </button>
      </p>
      <p>
        <button class="app-button fastbackward">
          <i class="app-icon -double" data-id="chevron-left-16"></i>
        </button>
      </p>
      <p>
        <button class="app-button home">
          <i class="app-icon" data-id="home-16"></i>
        </button>
      </p>
    </nav>
    <div class="container"></div>
    <nav class="rightcontrols">
      <p>
        <button class="app-button -circle -xl forward">
          <i class="app-icon" data-id="chevron-right-24"></i>
        </button>
      </p>
      <p>
        <button class="app-button fastforward">
          <i class="app-icon -double" data-id="chevron-right-16"></i>
        </button>
      </p>
      <p>
        <button class="app-button pickdate">
          <i class="app-icon" data-id="calendar-16"></i>
        </button>
      </p>
      <div class="app-dropdown app-date-picker datepicker"></div>
    </nav>
  `;

  setTimeout(() => el.classList.add('-animated'), 200);

  el.querySelectorAll('.app-icon').forEach(AppIcon);
  el.querySelectorAll('.app-date-picker').forEach(AppDatePicker);

  el.querySelector('.backward').addEventListener('click', () =>
    el.dispatchEvent(
      new CustomEvent('seekDays', { detail: -1, bubbles: true }),
    ),
  );

  el.querySelector('.forward').addEventListener('click', () =>
    el.dispatchEvent(new CustomEvent('seekDays', { detail: 1, bubbles: true })),
  );

  el.querySelector('.fastbackward').addEventListener('click', () =>
    el.dispatchEvent(
      new CustomEvent('seekDays', { detail: -5, bubbles: true }),
    ),
  );

  el.querySelector('.fastforward').addEventListener('click', () =>
    el.dispatchEvent(new CustomEvent('seekDays', { detail: 5, bubbles: true })),
  );

  el.querySelector('.home').addEventListener('click', () =>
    el.dispatchEvent(new CustomEvent('seekToToday', { bubbles: true })),
  );

  el.querySelector('.pickdate').addEventListener('click', () =>
    el
      .querySelector('.datepicker')
      .dispatchEvent(new CustomEvent('toggleDatePicker')),
  );

  el.querySelector('.datepicker').addEventListener('pickDate', (e) =>
    el.dispatchEvent(
      new CustomEvent('seekToDate', { detail: e.detail, bubbles: true }),
    ),
  );

  el.addEventListener('todoData', (e) => {
    todoData = e.detail;
    update();
  });

  function update() {
    const listsByDay = TodoLogic.getTodoListsByDay(todoData, RANGE);

    const container = el.querySelector('.container');
    const obsolete = new Set(container.children);
    const childrenByKey = new Map();

    obsolete.forEach((child) => childrenByKey.set(child.dataset.key, child));

    const children = listsByDay.map((day) => {
      let child = childrenByKey.get(day.id);

      if (child) {
        obsolete.delete(child);
      } else {
        child = document.createElement('div');
        child.className = 'card todo-day';
        child.dataset.key = day.id;
        TodoDay(child);
      }

      child.dispatchEvent(new CustomEvent('todoDay', { detail: day }));
      child.style.transform = `translateX(${day.position * 100}%)`;

      return child;
    });

    obsolete.forEach((child) => container.removeChild(child));

    children.forEach((child, index) => {
      if (child !== container.children[index]) {
        container.insertBefore(child, container.children[index]);
      }
    });

    updateHeight();
  }

  function updateHeight() {
    let height = 280;
    const container = el.querySelector('.container');

    for (let i = 0, l = container.children.length; i < l; ++i) {
      height = Math.max(container.children[i].offsetHeight, height);
    }

    el.style.height = `${height + 50}px`;
  }
}
