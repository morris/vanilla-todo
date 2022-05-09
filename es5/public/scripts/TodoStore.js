/* global VT */
window.VT = window.VT || {};

VT.TodoStore = function (el) {
  var state = {
    items: [],
    customLists: [],
    at: VT.formatDateId(new Date()),
    customAt: 0,
  };
  var storeTimeout;

  el.addEventListener('addItem', function (e) {
    var index = 0;

    state.items.forEach(function (item) {
      if (item.listId === e.detail.listId) {
        index = Math.max(index, item.index + 1);
      }
    });

    state.items.push({
      id: VT.uuid(),
      listId: e.detail.listId,
      index: index,
      label: e.detail.label,
      done: false,
    });

    dispatch({ items: state.items });
  });

  el.addEventListener('checkItem', function (e) {
    if (e.detail.item.done === e.detail.done) return;

    e.detail.item.done = e.detail.done;
    dispatch({ items: state.items });
  });

  el.addEventListener('saveItem', function (e) {
    if (e.detail.item.label === e.detail.label) return;

    e.detail.item.label = e.detail.label;
    dispatch({ items: state.items });
  });

  el.addEventListener('moveItem', function (e) {
    var movedItem = state.items.find(function (item) {
      return item.id === e.detail.item.id;
    });

    var listItems = state.items.filter(function (item) {
      return item.listId === e.detail.listId && item !== movedItem;
    });

    listItems.sort(function (a, b) {
      return a.index - b.index;
    });

    movedItem.listId = e.detail.listId;
    listItems.splice(e.detail.index, 0, movedItem);

    listItems.forEach(function (item, index) {
      item.index = index;
    });

    dispatch({ items: state.items });
  });

  el.addEventListener('deleteItem', function (e) {
    dispatch({
      items: state.items.filter(function (item) {
        return item.id !== e.detail.id;
      }),
    });
  });

  el.addEventListener('addList', function (e) {
    var index = 0;

    state.customLists.forEach(function (customList) {
      index = Math.max(index, customList.index + 1);
    });

    state.customLists.push({
      id: VT.uuid(),
      index: index,
      title: e.detail.title || '',
    });

    dispatch({ customLists: state.customLists });
  });

  el.addEventListener('saveList', function (e) {
    var list = state.customLists.find(function (l) {
      return l.id === e.detail.list.id;
    });

    if (list.title === e.detail.title) return;

    list.title = e.detail.title;

    dispatch({ customLists: state.customLists });
  });

  el.addEventListener('moveList', function (e) {
    var movedListIndex = state.customLists.findIndex(function (list) {
      return list.id === e.detail.list.id;
    });
    var movedList = state.customLists[movedListIndex];

    state.customLists.splice(movedListIndex, 1);
    state.customLists.sort(function (a, b) {
      return a.index - b.index;
    });
    state.customLists.splice(e.detail.index, 0, movedList);

    state.customLists.forEach(function (item, index) {
      item.index = index;
    });

    dispatch({ customLists: state.customLists });
  });

  el.addEventListener('deleteList', function (e) {
    dispatch({
      customLists: state.customLists.filter(function (customList) {
        return customList.id !== e.detail.id;
      }),
    });
  });

  el.addEventListener('seek', function (e) {
    var t = new Date(state.at + ' 00:00:00');
    t.setDate(t.getDate() + e.detail);

    dispatch({
      at: VT.formatDateId(t),
    });
  });

  el.addEventListener('seekHome', function () {
    dispatch({
      at: VT.formatDateId(new Date()),
    });
  });

  el.addEventListener('customSeek', function (e) {
    dispatch({
      customAt: Math.max(
        0,
        Math.min(state.customLists.length - 1, state.customAt + e.detail)
      ),
    });
  });

  function dispatch(next) {
    Object.assign(state, next);
    store();

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
      console.warn(err);
    }
  }

  function store() {
    clearTimeout(storeTimeout);

    storeTimeout = setTimeout(function () {
      try {
        localStorage.todo = JSON.stringify(state);
      } catch (err) {
        console.warn(err);
      }
    }, 100);
  }

  el.todoStore = {
    dispatch: dispatch,
    load: load,
  };
};
