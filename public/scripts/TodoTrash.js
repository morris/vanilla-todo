/* global VT */
window.VT = window.VT || {};

VT.TodoTrash = function (el) {
  el.innerHTML = '<i class="app-icon" data-id="trashbin-24"></i>';

  el.addEventListener('draggableDrop', function (e) {
    el.dispatchEvent(
      new CustomEvent('deleteItem', {
        detail: e.detail.data.item,
        bubbles: true,
      })
    );
  });
};
