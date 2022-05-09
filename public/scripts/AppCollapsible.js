export function AppCollapsible(el) {
  const state = {
    show: true,
  };

  el.addEventListener('collapse', (e) => update({ show: !e.detail }));

  el.querySelector('.bar > .toggle').addEventListener('click', () =>
    update({ show: !state.show })
  );

  update();

  function update(next) {
    Object.assign(state, next);

    el.querySelector('.bar > .toggle > .app-icon').classList.toggle(
      '-r180',
      state.show
    );

    el.querySelectorAll('.body').forEach((el) => {
      el.style.height = state.show ? `${el.children[0].offsetHeight}px` : '0';
    });
  }
}
