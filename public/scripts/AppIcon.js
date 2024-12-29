export const BASE_URL =
  'https://cdn.jsdelivr.net/npm/@primer/octicons@19.8.0/build/svg';

const cache = {};

/**
 * @param {HTMLElement} el
 */
export function AppIcon(el) {
  if (el.dataset.lid === el.dataset.id) return;

  const id = el.dataset.id;
  el.dataset.lid = id;

  let promise = cache[id];

  if (!promise) {
    promise = cache[id] = fetch(`${BASE_URL}/${id}.svg`).then((r) => r.text());
  }

  promise.then((svg) => {
    el.innerHTML = el.classList.contains('-double') ? svg + svg : svg;
  });
}
