import { formatDateId, uuid } from './util.js';

export function TodoStore(el) {
  const state = {
    items: [],
    customLists: [],
    at: formatDateId(new Date()),
    customAt: 0,
  };

  let storeTimeout;

  el.addEventListener('loadStore', load);

  el.addEventListener('addItem', (e) => {
    let index = 0;

    for (const item of state.items) {
      if (item.listId === e.detail.listId) {
        index = Math.max(index, item.index + 1);
      }
    }

    state.items.push({
      id: uuid(),
      listId: e.detail.listId,
      index,
      label: e.detail.label,
      done: false,
    });

    dispatch({ items: state.items });
  });

  el.addEventListener('checkItem', (e) => {
    if (e.detail.item.done === e.detail.done) return;

    e.detail.item.done = e.detail.done;
    dispatch({ items: state.items });
  });

  el.addEventListener('saveItem', (e) => {
    if (e.detail.item.label === e.detail.label) return;

    e.detail.item.label = e.detail.label;
    dispatch({ items: state.items });
  });

  el.addEventListener('moveItem', (e) => {
    const movedItem = state.items.find((item) => item.id === e.detail.item.id);

    const listItems = state.items.filter(
      (item) => item.listId === e.detail.listId && item !== movedItem
    );

    listItems.sort((a, b) => a.index - b.index);

    movedItem.listId = e.detail.listId;
    listItems.splice(e.detail.index, 0, movedItem);

    listItems.forEach((item, index) => {
      item.index = index;
    });

    dispatch({ items: state.items });
  });

  el.addEventListener('deleteItem', (e) => {
    dispatch({ items: state.items.filter((item) => item.id !== e.detail.id) });
  });

  el.addEventListener('addList', (e) => {
    let index = 0;

    for (const customList of state.customLists) {
      index = Math.max(index, customList.index + 1);
    }

    state.customLists.push({
      id: uuid(),
      index,
      title: e.detail.title || '',
    });

    dispatch({ customLists: state.customLists });
  });

  el.addEventListener('saveList', (e) => {
    const list = state.customLists.find((l) => l.id === e.detail.list.id);

    if (list.title === e.detail.title) return;

    list.title = e.detail.title;

    dispatch({ customLists: state.customLists });
  });

  el.addEventListener('moveList', (e) => {
    const movedListIndex = state.customLists.findIndex(
      (list) => list.id === e.detail.list.id
    );
    const movedList = state.customLists[movedListIndex];

    state.customLists.splice(movedListIndex, 1);
    state.customLists.sort((a, b) => a.index - b.index);
    state.customLists.splice(e.detail.index, 0, movedList);

    state.customLists.forEach((item, index) => {
      item.index = index;
    });

    dispatch({ customLists: state.customLists });
  });

  el.addEventListener('deleteList', (e) => {
    dispatch({
      customLists: state.customLists.filter(
        (customList) => customList.id !== e.detail.id
      ),
    });
  });

  el.addEventListener('seek', (e) => {
    const t = new Date(`${state.at} 00:00:00`);
    t.setDate(t.getDate() + e.detail);

    dispatch({ at: formatDateId(t) });
  });

  el.addEventListener('seekHome', () =>
    dispatch({ at: formatDateId(new Date()) })
  );

  el.addEventListener('customSeek', (e) => {
    dispatch({
      customAt: Math.max(
        0,
        Math.min(state.customLists.length - 1, state.customAt + e.detail)
      ),
    });
  });

  function dispatch(next) {
    Object.assign(state, next);
    save();

    el.dispatchEvent(
      new CustomEvent('todoData', {
        detail: state,
        bubbles: false,
      })
    );
  }

  function load() {
    if (!localStorage || !localStorage.todo) {
      dispatch(state);
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
        localStorage.todo = JSON.stringify(state);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(err);
      }
    }, 100);
  }
}
