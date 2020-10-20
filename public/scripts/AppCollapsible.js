/* global VT */
window.VT = window.VT || {};

VT.AppCollapsible = function (el) {
  var state = {
    show: true,
  };

  el.querySelector('.bar > .toggle').addEventListener('click', function () {
    update({ show: !state.show });
  });

  el.appCollapsible = {
    update: update,
  };

  function update(next) {
    Object.assign(state, next);

    el.querySelector('.bar > .toggle > .app-icon').classList.toggle(
      '-r180',
      state.show
    );

    el.querySelectorAll('.body').forEach(function (el) {
      el.style.height = state.show ? el.children[0].offsetHeight + 'px' : '0';
    });
  }
};
