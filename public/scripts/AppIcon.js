export const BASE_URL =
  'https://rawcdn.githack.com/primer/octicons/ff7f6eee63fa2f2d24d02e3aa76a87db48e4b6f6/icons/';

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
