import { formatDateId, uuid } from './util.js';

/**
 * @param {HTMLElement} el
 */
export function TodoStore(el) {
  const todoData = {
    items: [],
    customLists: [],
    at: formatDateId(new Date()),
    customAt: 0,
  };

  let storeTimeout;

  el.addEventListener('loadTodoStore', load);

  el.addEventListener('addTodoItem', (e) => {
    let index = 0;

    for (const item of todoData.items) {
      if (item.listId === e.detail.listId) {
        index = Math.max(index, item.index + 1);
      }
    }

    todoData.items.push({
      id: uuid(),
      listId: e.detail.listId,
      index,
      label: e.detail.label,
      done: false,
    });

    dispatch({ items: todoData.items });
  });

  el.addEventListener('checkTodoItem', (e) => {
    if (e.detail.item.done === e.detail.done) return;

    e.detail.item.done = e.detail.done;
    dispatch({ items: todoData.items });
  });

  el.addEventListener('saveTodoItem', (e) => {
    if (e.detail.item.label === e.detail.label) return;

    e.detail.item.label = e.detail.label;
    dispatch({ items: todoData.items });
  });

  el.addEventListener('moveTodoItem', (e) => {
    const movedItem = todoData.items.find(
      (item) => item.id === e.detail.item.id,
    );

    const listItems = todoData.items.filter(
      (item) => item.listId === e.detail.listId && item !== movedItem,
    );

    listItems.sort((a, b) => a.index - b.index);

    movedItem.listId = e.detail.listId;
    listItems.splice(e.detail.index, 0, movedItem);

    listItems.forEach((item, index) => {
      item.index = index;
    });

    dispatch({ items: todoData.items });
  });

  el.addEventListener('deleteTodoItem', (e) =>
    dispatch({
      items: todoData.items.filter((item) => item.id !== e.detail.id),
    }),
  );

  el.addEventListener('addTodoList', (e) => {
    let index = 0;

    for (const customList of todoData.customLists) {
      index = Math.max(index, customList.index + 1);
    }

    todoData.customLists.push({
      id: uuid(),
      index,
      title: e.detail.title || '',
    });

    dispatch({ customLists: todoData.customLists });
  });

  el.addEventListener('saveTodoList', (e) => {
    const list = todoData.customLists.find((l) => l.id === e.detail.list.id);

    if (list.title === e.detail.title) return;

    list.title = e.detail.title;

    dispatch({ customLists: todoData.customLists });
  });

  el.addEventListener('moveTodoList', (e) => {
    const movedListIndex = todoData.customLists.findIndex(
      (list) => list.id === e.detail.list.id,
    );
    const movedList = todoData.customLists[movedListIndex];

    todoData.customLists.splice(movedListIndex, 1);
    todoData.customLists.sort((a, b) => a.index - b.index);
    todoData.customLists.splice(e.detail.index, 0, movedList);

    todoData.customLists.forEach((item, index) => {
      item.index = index;
    });

    dispatch({ customLists: todoData.customLists });
  });

  el.addEventListener('deleteTodoList', (e) =>
    dispatch({
      customLists: todoData.customLists.filter(
        (customList) => customList.id !== e.detail.id,
      ),
    }),
  );

  el.addEventListener('seekDays', (e) => {
    const t = new Date(`${todoData.at}T00:00:00`);
    t.setDate(t.getDate() + e.detail);

    dispatch({ at: formatDateId(t) });
  });

  el.addEventListener('seekToToday', () =>
    dispatch({ at: formatDateId(new Date()) }),
  );

  el.addEventListener('seekToDate', (e) =>
    dispatch({ at: formatDateId(e.detail) }),
  );

  el.addEventListener('seekCustomTodoLists', (e) =>
    dispatch({
      customAt: Math.max(
        0,
        Math.min(todoData.customLists.length - 1, todoData.customAt + e.detail),
      ),
    }),
  );

  function dispatch(next) {
    Object.assign(todoData, next);
    save();

    el.dispatchEvent(
      new CustomEvent('todoData', {
        detail: todoData,
        bubbles: false,
      }),
    );
  }

  function load() {
    if (!localStorage || !localStorage.todo) {
      dispatch(todoData);
      return;
    }

    try {
      dispatch(JSON.parse(localStorage.todo));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(err);
    }
  }

  function save() {
    clearTimeout(storeTimeout);

    storeTimeout = setTimeout(() => {
      try {
        localStorage.todo = JSON.stringify(todoData);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(err);
      }
    }, 100);
  }
}
