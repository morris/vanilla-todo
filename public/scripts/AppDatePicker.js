import { AppIcon } from './AppIcon.js';
import { formatMonth } from './util.js';

const datesCell = /* html */ `
  <td><button class="app-button"></button></td>
`;

const datesRow = /* html */ `
  <tr>
    ${datesCell}
    ${datesCell}
    ${datesCell}
    ${datesCell}
    ${datesCell}
    ${datesCell}
    ${datesCell}
  </tr>
`;

/**
 * @param {HTMLElement} el
 */
export function AppDatePicker(el) {
  const now = new Date();
  let at = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
  let show = false;

  el.innerHTML = /* html */ `
    <h4 class="header">
      <button class="app-button -circle previousmonth" title="Previous month">
        <i class="app-icon" data-id="chevron-left-16"></i>
      </button>
      <span class="month"></span>
      <button class="app-button -circle nextmonth" title="Next month">
        <i class="app-icon" data-id="chevron-right-16"></i>
      </button>
    </h4>
    <table class="dates">
      <thead>
        <tr>
          <th>Su</th>
          <th>Mo</th>
          <th>Tu</th>
          <th>We</th>
          <th>Th</th>
          <th>Fr</th>
          <th>Sa</th>
        <tr>
      </thead>
      <tbody>
        ${datesRow}
        ${datesRow}
        ${datesRow}
        ${datesRow}
        ${datesRow}
      </tbody>
    </div>
  `;

  el.querySelectorAll('.app-icon').forEach(AppIcon);

  el.addEventListener('toggleDatePicker', (e) => {
    show = e.detail ?? !show;
    update();
  });

  el.querySelector('.previousmonth').addEventListener('click', previousMonth);
  el.querySelector('.nextmonth').addEventListener('click', nextMonth);

  el.addEventListener('click', (e) => {
    if (!e.target.matches('.app-button')) return;

    show = false;
    update();

    el.dispatchEvent(
      new CustomEvent('pickDate', {
        detail: new Date(
          e.target.dataset.year,
          e.target.dataset.month - 1,
          e.target.dataset.day,
        ),
        bubbles: true,
      }),
    );
  });

  function previousMonth() {
    if (at.month > 1) {
      at = {
        year: at.year,
        month: at.month - 1,
      };
    } else {
      at = {
        year: at.year - 1,
        month: 12,
      };
    }

    update();
  }

  function nextMonth() {
    if (at.month < 12) {
      at = {
        year: at.year,
        month: at.month + 1,
      };
    } else {
      at = {
        year: at.year + 1,
        month: 1,
      };
    }

    update();
  }

  function update() {
    el.classList.toggle('-show', show);

    const now = new Date();
    const first = new Date(at.year, at.month - 1, 1);

    el.querySelector('.month').innerHTML = `${formatMonth(
      first,
    )} ${first.getFullYear()}`;

    let current = new Date(first);
    current.setDate(1 - current.getDay());

    const datesBody = el.querySelector('.dates > tbody');

    for (let i = 0; i < 35; ++i) {
      const row = Math.floor(i / 7);
      const column = i % 7;

      const cell = datesBody.children[row].children[column];
      const button = cell.children[0];

      button.innerHTML = current.getDate();

      button.dataset.year = current.getFullYear();
      button.dataset.month = current.getMonth() + 1;
      button.dataset.day = current.getDate();

      button.classList.toggle(
        '-highlight',
        current.getFullYear() === now.getFullYear() &&
          current.getMonth() === now.getMonth() &&
          current.getDate() === now.getDate(),
      );

      current.setDate(current.getDate() + 1);
    }
  }

  update();
}
