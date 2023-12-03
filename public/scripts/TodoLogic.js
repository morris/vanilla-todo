import { formatDateId } from './util.js';
import { uuid } from './uuid.js';

/**
 * @typedef {{
 *  id: string;
 *  listId: string;
 *  index: number;
 *  label: string;
 *  done: boolean;
 * }} TodoDataItem
 */

/**
 * @typedef {{
 *  id: string;
 *  index: number;
 *  title: string;
 * }} TodoDataCustomList
 */

/**
 * @typedef {{
 *  items: TodoDataItem[];
 *  customLists: TodoDataCustomList[];
 *  at: string;
 *  customAt: number;
 * }} TodoData
 */

export class TodoLogic {
  /**
   * @param {Date} now
   * @returns {TodoData}
   */
  static initTodoData(now = new Date()) {
    return {
      items: [],
      customLists: [],
      at: formatDateId(now),
      customAt: 0,
    };
  }

  static getTodoListsByDay(data, range) {
    const listsByDay = [];

    for (let i = 0; i < 2 * range; ++i) {
      const t = new Date(data.at);
      t.setDate(t.getDate() - range + i);
      const id = formatDateId(t);

      listsByDay.push({
        id,
        items: TodoLogic.getTodoItemsForList(data, id),
        position: -range + i,
      });
    }

    return listsByDay;
  }

  static getTodoItemsForList(data, listId) {
    return data.items
      .filter((item) => item.listId === listId)
      .sort((a, b) => a.index - b.index);
  }

  /**
   * @param {TodoData} data
   * @param {{listId: string, label: string}} input
   * @returns {TodoData}
   */
  static addTodoItem(data, input) {
    let index = 0;

    for (const item of data.items) {
      if (item.listId === input.listId) {
        index = Math.max(index, item.index + 1);
      }
    }

    return {
      ...data,
      items: [
        ...data.items,
        {
          ...input,
          id: uuid(),
          index,
          done: false,
        },
      ],
    };
  }

  /**
   * @param {TodoData} data
   * @param {{id: string, done: boolean}} input
   * @returns {TodoData}
   */
  static checkTodoItem(data, input) {
    return {
      ...data,
      items: data.items.map((item) =>
        item.id === input.id ? { ...item, done: input.done } : item,
      ),
    };
  }

  /**
   * @param {TodoData} data
   * @param {{id: string, label: string}} input
   * @returns {TodoData}
   */
  static editTodoItem(data, input) {
    return {
      ...data,
      items: data.items.map((item) =>
        item.id === input.id ? { ...item, label: input.label } : item,
      ),
    };
  }

  /**
   * @param {TodoData} data
   * @param {{id: string, listId: string, index: number}} input
   * @returns {TodoData}
   */
  static moveTodoItem(data, input) {
    const itemToMove = data.items.find((item) => item.id === input.id);

    // Reinsert item at target list and index
    let list = data.items.filter(
      (item) => item.listId === input.listId && item.id !== input.id,
    );
    list.splice(input.index, 0, { ...itemToMove, listId: input.listId });
    list = TodoLogic.setIndexes(list);

    // Reinsert updated list
    let items = data.items.filter(
      (item) => item.listId !== input.listId && item.id !== input.id,
    );
    items = [...items, ...list];

    return {
      ...data,
      items,
    };
  }

  /**
   * @param {TodoData} data
   * @param {{id: string}} input
   * @returns {TodoData}
   */
  static deleteTodoItem(data, input) {
    return {
      ...data,
      items: data.items.filter((item) => item.id !== input.id),
    };
  }

  //

  static getCustomTodoLists(data) {
    return data.customLists
      .map((list) => ({
        id: list.id,
        index: list.index,
        title: list.title,
        items: TodoLogic.getTodoItemsForList(data, list.id),
      }))
      .sort((a, b) => a.index - b.index);
  }

  /**
   * @param {TodoData} data
   * @returns {TodoData}
   */
  static addCustomTodoList(data) {
    let index = 0;

    for (const customList of data.customLists) {
      index = Math.max(index, customList.index + 1);
    }

    return {
      ...data,
      customLists: [
        ...data.customLists,
        {
          id: uuid(),
          index,
          title: '',
        },
      ],
    };
  }

  /**
   * @param {TodoData} data
   * @param {{id: string, title: string}} input
   * @returns {TodoData}
   */
  static editCustomTodoList(data, input) {
    return {
      ...data,
      customLists: data.customLists.map((customList) =>
        customList.id === input.id
          ? { ...customList, title: input.title }
          : customList,
      ),
    };
  }

  /**
   * @param {TodoData} data
   * @param {{id: string, index: number}} input
   * @returns {TodoData}
   */
  static moveCustomTodoList(data, input) {
    const customListToMove = data.customLists.find(
      (customList) => customList.id === input.id,
    );

    let customLists = data.customLists
      .filter((customList) => customList.id !== input.id)
      .sort((a, b) => a.index - b.index);
    customLists.splice(input.index, 0, customListToMove);
    customLists = TodoLogic.setIndexes(customLists);

    return {
      ...data,
      customLists,
    };
  }

  /**
   * @param {TodoData} data
   * @param {{id: string}} input
   * @returns {TodoData}
   */
  static deleteCustomTodoList(data, input) {
    return {
      ...data,
      customLists: data.customLists.filter(
        (customList) => customList.id !== input.id,
      ),
    };
  }

  //

  /**
   * @param {TodoData} data
   * @param {number} delta
   * @returns {TodoData}
   */
  static seekDays(data, delta) {
    const t = new Date(`${data.at}T00:00:00`);
    t.setDate(t.getDate() + delta);

    return { ...data, at: formatDateId(t) };
  }

  /**
   * @param {TodoData} data
   * @returns {TodoData}
   */
  static seekToToday(data) {
    return { ...data, at: formatDateId(new Date()) };
  }

  /**
   * @param {TodoData} data
   * @param {Date} date
   * @returns {TodoData}
   */
  static seekToDate(data, date) {
    return { ...data, at: formatDateId(date) };
  }

  /**
   * @param {TodoData} data
   * @param {number} delta
   * @returns {TodoData}
   */
  static seekCustomTodoLists(data, delta) {
    return {
      ...data,
      customAt: Math.max(
        0,
        Math.min(data.customLists.length - 1, data.customAt + delta),
      ),
    };
  }

  //

  /**
   * @template {{index?: number}} T
   * @param {T[]} array
   * @returns {T[]}
   */
  static setIndexes(array) {
    return array.map((item, index) =>
      item.index === index ? item : { ...item, index },
    );
  }
}
