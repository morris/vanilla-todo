import { TodoList } from './TodoList.js';
import { formatDate, formatDayOfWeek } from './util.js';

/**
 * @param {HTMLElement} el
 */
export function TodoDay(el) {
  const state = {
    dateId: el.dataset.key,
    items: [],
  };

  el.innerHTML = `
    <div class="header">
      <h3 class="dayofweek"></h3>
      <h6 class="date"></h6>
    </div>
    <div class="todo-list"></div>
  `;

  TodoList(el.querySelector('.todo-list'));

  el.addEventListener('addTodoItem', (e) => {
    e.detail.listId = state.dateId;
  });

  el.addEventListener('moveTodoItem', (e) => {
    e.detail.listId = state.dateId;
    e.detail.index = e.detail.index ?? 0;
  });

  el.addEventListener('todoDay', (e) => update(e.detail));

  function update(next) {
    Object.assign(state, next);

    const date = new Date(state.dateId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    el.classList.toggle('-past', date < today);
    el.classList.toggle('-today', date >= today && date < tomorrow);

    el.querySelector('.header > .dayofweek').innerText = formatDayOfWeek(date);
    el.querySelector('.header > .date').innerText = formatDate(date);
    el.querySelector('.todo-list').dispatchEvent(
      new CustomEvent('todoItems', { detail: state.items }),
    );
  }
}
