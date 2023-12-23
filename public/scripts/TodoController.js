// TodoController.js

import { TodoLogic } from './TodoLogic.js';

/**
 * @param {HTMLElement} el
 */
export function TodoController(el) {
  let todoData = TodoLogic.initTodoData();
  let saveTimeout;

  el.addEventListener('loadTodoData', load);

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
        todoData = { ...todoData, ...JSON.parse(localStorage.todo) };
      }

      // Assuming moveItemsToToday is part of TodoLogic
      todoData.items = TodoLogic.moveItemsToToday(todoData.items);
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
}
