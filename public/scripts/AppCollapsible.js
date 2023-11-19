export function AppCollapsible(el) {
  const state = {
    show: true,
  };

  setTimeout(() => el.classList.add('-animated'), 200);

  el.addEventListener('collapse', (e) => {
    update({ show: typeof e.detail === 'boolean' ? !e.detail : state.show });
  });

  el.querySelector('.bar > .toggle').addEventListener('click', () => {
    update({ show: !state.show });
  });

  update();

  function update(next) {
    Object.assign(state, next);

    el.querySelector('.bar > .toggle > .app-icon').classList.toggle(
      '-r180',
      state.show,
    );

    el.querySelectorAll('.body').forEach((el) => {
      el.style.height = state.show ? `${el.children[0].offsetHeight}px` : '0';
    });
  }
}
