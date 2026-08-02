/**
 * @param {HTMLElement} el
 */
export function AppCollapsible(el) {
  let show = true;

  const toggleEl = el.querySelector('.bar > .toggle');

  setTimeout(() => el.classList.add('-animated'), 200);

  el.addEventListener('collapse', (e) => {
    if (typeof e.detail === 'boolean') {
      show = e.detail;
    }

    update();
  });

  toggleEl.addEventListener('click', () => {
    show = !show;
    update();
  });

  update();

  function update() {
    toggleEl.setAttribute('aria-expanded', show);
    toggleEl.querySelector('.app-icon').classList.toggle('-r180', show);

    el.querySelectorAll('.body').forEach((el) => {
      el.style.height = show ? `${el.children[0].offsetHeight}px` : '0';
      el.inert = !show;
    });
  }
}
