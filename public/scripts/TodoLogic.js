// TodoLogic.js

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
  // ... Existing functions

  /**
   * @param {TodoDataItem[]} items
   * @returns {TodoDataItem[]}
   */
  static moveItemsToToday(items) {
    const today = new Date().toISOString().split('T')[0];

    return items.map((item) => {
      if (!item.done) {
        item.listId = today; // Assuming listId represents the date
      }
      return item;
    });
  }
}
