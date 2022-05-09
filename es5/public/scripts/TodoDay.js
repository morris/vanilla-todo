/* global VT */
window.VT = window.VT || {};

VT.TodoDay = function (el) {
  var state = {
    dateId: el.dataset.key,
    items: [],
  };

  el.innerHTML = [
    '<div class="header">',
    '  <h3 class="dayofweek"></h3>',
    '  <h6 class="date"></h6>',
    '</div>',
    '<div class="todo-list"></div>',
  ].join('\n');

  VT.TodoList(el.querySelector('.todo-list'));

  el.addEventListener('addItem', function (e) {
    e.detail.listId = state.dateId;
  });

  el.addEventListener('moveItem', function (e) {
    e.detail.listId = state.dateId;
    e.detail.index = e.detail.index || 0;
  });

  el.todoDay = {
    update: update,
  };

  function update(next) {
    Object.assign(state, next);

    var date = new Date(state.dateId);
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    el.classList.toggle('-past', date < today);
    el.classList.toggle('-today', date >= today && date < tomorrow);

    el.querySelector('.header > .dayofweek').innerText = VT.formatDayOfWeek(
      date
    );
    el.querySelector('.header > .date').innerText = VT.formatDate(date);
    el.querySelector('.todo-list').todoList.update({ items: state.items });
  }
};
