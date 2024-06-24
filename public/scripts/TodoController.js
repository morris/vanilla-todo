import { TodoLogic } from './TodoLogic.js';
import { toDataURL } from './util.js';

/**
 * @param {HTMLElement} el
 */
export function TodoController(el) {
  let todoData = TodoLogic.initTodoData();
  let saveTimeout;

  el.addEventListener('loadTodoData', load);
  el.addEventListener('importTodoData', (e) => importTodoData(e.detail));
  el.addEventListener('exportTodoData', exportTodoData);

  for (const action of [
    'addTodoItem',
    'checkTodoItem',
    'editTodoItem',
    'moveTodoItem',
    'deleteTodoItem',
    'addCustomTodoList',
    'editCustomTodoList',
    'moveCustomTodoList',
    'deleteCustomTodoList',
    'seekDays',
    'seekToToday',
    'seekToDate',
    'seekCustomTodoLists',
  ]) {
    el.addEventListener(action, (e) => {
      todoData = TodoLogic[action](todoData, e.detail);
      update();
    });
  }

  function update() {
    save();

    el.dispatchEvent(
      new CustomEvent('todoData', {
        detail: todoData,
        bubbles: false,
      }),
    );
  }

  function load() {
    try {
      if (localStorage?.todo) {
        todoData = TodoLogic.movePastTodoItems({
          ...todoData,
          ...JSON.parse(localStorage.todo),
        });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(err);
    }

    update();
  }

  function save() {
    clearTimeout(saveTimeout);

    saveTimeout = setTimeout(() => {
      try {
        localStorage.todo = JSON.stringify(todoData);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(err);
      }
    }, 100);
  }

  function importTodoData(input) {
    // TODO validate?
    todoData = input;

    update();
  }

  async function exportTodoData() {
    const json = JSON.stringify(todoData, null, 2);
    const href = await toDataURL(json);
    const link = document.createElement('a');
    link.setAttribute('download', 'todo.json');
    link.setAttribute('href', href);
    document.querySelector('body').appendChild(link);
    link.click();
    link.remove();
  }
}
