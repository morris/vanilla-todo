export const BASE_URL = 'https://unpkg.com/@primer/octicons@19.8.0/build/svg/';

const cache = {};

export function AppIcon(el) {
  if (el.children.length > 0) return;

  const id = el.dataset.id;
  let promise = cache[id];

  if (!promise) {
    promise = cache[id] = fetch(`${BASE_URL}${id}.svg`).then((r) => r.text());
  }

  promise.then((svg) => {
    el.innerHTML = el.classList.contains('-double') ? svg + svg : svg;
  });
}
