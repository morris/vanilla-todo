/**
 * @param {HTMLElement} el
 */
export function AppCollapsible(el) {
  let show = true;

  setTimeout(() => el.classList.add('-animated'), 200);

  el.addEventListener('collapse', (e) => {
    if (typeof e.detail === 'boolean') {
      show = e.detail;
    }

    update();
  });

  el.querySelector('.bar > .toggle').addEventListener('click', () => {
    show = !show;
    update();
  });

  update();

  function update() {
    el.querySelector('.bar > .toggle > .app-icon').classList.toggle(
      '-r180',
      show,
    );

    el.querySelectorAll('.body').forEach((el) => {
      el.style.height = show ? `${el.children[0].offsetHeight}px` : '0';
    });
  }
}
