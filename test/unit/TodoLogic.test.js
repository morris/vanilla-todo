import { expect, test } from '@playwright/test';
import { TodoLogic } from '../../public/scripts/TodoLogic.js';
import '../coverage.js';

test('TodoLogic.initTodoData', () => {
  const data = TodoLogic.initTodoData(new Date(0));

  expect(data).toEqual({
    at: '1970-01-01',
    customAt: 0,
    customLists: [],
    items: [],
  });
});

test('TodoLogic.addTodoItem', () => {
  let data = TodoLogic.initTodoData(new Date(0));

  data = TodoLogic.addTodoItem(data, { label: 'foo', listId: '1970-01-01' });

  expect(data).toEqual({
    at: '1970-01-01',
    customAt: 0,
    customLists: [],
    items: [
      {
        id: expect.stringMatching(/./),
        listId: '1970-01-01',
        label: 'foo',
        index: 0,
        done: false,
        fixed: true,
      },
    ],
  });

  data = TodoLogic.addTodoItem(data, { label: 'bar', listId: '1970-01-01' });

  expect(data.items).toEqual([
    {
      id: expect.stringMatching(/./),
      listId: '1970-01-01',
      label: 'foo',
      index: 0,
      done: false,
      fixed: true,
    },
    {
      id: expect.stringMatching(/./),
      listId: '1970-01-01',
      label: 'bar',
      index: 1,
      done: false,
      fixed: true,
    },
  ]);

  data = TodoLogic.addTodoItem(data, { label: 'baz', listId: '1970-01-02' });

  expect(data.items).toEqual([
    {
      id: expect.stringMatching(/./),
      listId: '1970-01-01',
      label: 'foo',
      index: 0,
      done: false,
      fixed: true,
    },
    {
      id: expect.stringMatching(/./),
      listId: '1970-01-01',
      label: 'bar',
      index: 1,
      done: false,
      fixed: true,
    },
    {
      id: expect.stringMatching(/./),
      listId: '1970-01-02',
      label: 'baz',
      index: 0,
      done: false,
      fixed: true,
    },
  ]);
});

test('TodoLogic.moveTodoItem', () => {
  let data = TodoLogic.initTodoData(new Date(0));

  data = {
    ...data,
    items: [
      {
        id: 'a',
        listId: '1970-01-01',
        label: 'foo',
        index: 0,
        done: false,
      },
      {
        id: 'b',
        listId: '1970-01-01',
        label: 'bar',
        index: 1,
        done: false,
      },
      {
        id: 'c',
        listId: '1970-01-02',
        label: 'baz',
        index: 0,
        done: false,
      },
    ],
  };

  data = TodoLogic.moveTodoItem(data, {
    id: 'a',
    listId: '1970-01-01',
    index: 1,
  });

  expect(data.items).toEqual([
    {
      id: 'c',
      listId: '1970-01-02',
      label: 'baz',
      index: 0,
      done: false,
    },
    {
      id: 'b',
      listId: '1970-01-01',
      label: 'bar',
      index: 0,
      done: false,
    },
    {
      id: 'a',
      listId: '1970-01-01',
      label: 'foo',
      index: 1,
      done: false,
      fixed: true,
    },
  ]);

  data = TodoLogic.moveTodoItem(
    data,
    {
      id: 'a',
      listId: '1970-01-02',
      index: 0,
    },
    new Date('1970-01-01'),
  );

  expect(data.items).toEqual([
    {
      id: 'b',
      listId: '1970-01-01',
      label: 'bar',
      index: 0,
      done: false,
    },
    {
      id: 'a',
      listId: '1970-01-02',
      label: 'foo',
      index: 0,
      done: false,
      fixed: false,
    },
    {
      id: 'c',
      listId: '1970-01-02',
      label: 'baz',
      index: 1,
      done: false,
    },
  ]);
});

test('TodoLogic.checkTodoItem', () => {
  let data = TodoLogic.initTodoData(new Date(0));

  data = {
    ...data,
    items: [
      {
        id: 'a',
        listId: '1970-01-01',
        label: 'foo',
        index: 0,
        done: false,
      },
      {
        id: 'b',
        listId: '1970-01-01',
        label: 'bar',
        index: 1,
        done: false,
      },
    ],
  };

  data = TodoLogic.checkTodoItem(data, { id: 'a', done: true });

  expect(data.items).toEqual([
    {
      id: 'a',
      listId: '1970-01-01',
      label: 'foo',
      index: 0,
      done: true,
    },
    {
      id: 'b',
      listId: '1970-01-01',
      label: 'bar',
      index: 1,
      done: false,
    },
  ]);
});

test('TodoLogic.editTodoItem', () => {
  let data = TodoLogic.initTodoData(new Date(0));

  data = {
    ...data,
    items: [
      { id: 'a', listId: '1970-01-01', label: 'foo', index: 0, done: false },
      { id: 'b', listId: '1970-01-01', label: 'bar', index: 1, done: false },
    ],
  };

  data = TodoLogic.editTodoItem(data, { id: 'a', label: 'updated' });

  expect(data.items).toEqual([
    { id: 'a', listId: '1970-01-01', label: 'updated', index: 0, done: false },
    { id: 'b', listId: '1970-01-01', label: 'bar', index: 1, done: false },
  ]);
});

test('TodoLogic.deleteTodoItem', () => {
  let data = TodoLogic.initTodoData(new Date(0));

  data = {
    ...data,
    items: [
      { id: 'a', listId: '1970-01-01', label: 'foo', index: 0, done: false },
      { id: 'b', listId: '1970-01-01', label: 'bar', index: 1, done: false },
    ],
  };

  data = TodoLogic.deleteTodoItem(data, { id: 'a' });

  expect(data.items).toEqual([
    { id: 'b', listId: '1970-01-01', label: 'bar', index: 1, done: false },
  ]);
});

test('TodoLogic.getTodoItemsForList', () => {
  let data = TodoLogic.initTodoData(new Date(0));

  data = {
    ...data,
    items: [
      { id: 'a', listId: '1970-01-01', label: 'foo', index: 1, done: false },
      { id: 'b', listId: '1970-01-01', label: 'bar', index: 0, done: false },
      { id: 'c', listId: '1970-01-02', label: 'baz', index: 0, done: false },
    ],
  };

  expect(TodoLogic.getTodoItemsForList(data, '1970-01-01')).toEqual([
    { id: 'b', listId: '1970-01-01', label: 'bar', index: 0, done: false },
    { id: 'a', listId: '1970-01-01', label: 'foo', index: 1, done: false },
  ]);
});

test('TodoLogic.getTodoListsByDay', () => {
  let data = TodoLogic.initTodoData(new Date('1970-01-05T00:00:00'));

  data = TodoLogic.addTodoItem(data, {
    label: 'foo',
    listId: '1970-01-05',
  });

  const lists = TodoLogic.getTodoListsByDay(data, 1);

  expect(lists).toEqual([
    { id: '1970-01-04', items: [], position: -1 },
    {
      id: '1970-01-05',
      items: [expect.objectContaining({ label: 'foo' })],
      position: 0,
    },
  ]);
});

test('TodoLogic.isListInThePast', () => {
  const now = new Date('1970-01-05T00:00:00');

  expect(TodoLogic.isListInThePast('1970-01-04', now)).toBeTruthy();
  expect(TodoLogic.isListInThePast('1970-01-05', now)).toBeFalsy();
  expect(TodoLogic.isListInThePast('1970-01-06', now)).toBeFalsy();
  expect(TodoLogic.isListInThePast('some-custom-list-id', now)).toBeFalsy();
});

test('TodoLogic.movePastTodoItems', () => {
  const now = new Date('1970-01-05T00:00:00');

  let data = {
    ...TodoLogic.initTodoData(now),
    items: [
      // Undone, unfixed item in the past: should move to today
      {
        id: 'a',
        listId: '1970-01-03',
        index: 0,
        label: 'foo',
        done: false,
        fixed: false,
      },
      // Done item in the past: should stay
      {
        id: 'b',
        listId: '1970-01-03',
        index: 1,
        label: 'bar',
        done: true,
        fixed: false,
      },
      // Fixed item in the past: should stay
      {
        id: 'c',
        listId: '1970-01-03',
        index: 2,
        label: 'baz',
        done: false,
        fixed: true,
      },
      // Existing item already in today's list
      {
        id: 'd',
        listId: '1970-01-05',
        index: 0,
        label: 'qux',
        done: false,
        fixed: false,
      },
    ],
  };

  data = TodoLogic.movePastTodoItems(data, now);

  expect(data.items).toEqual([
    {
      id: 'a',
      listId: '1970-01-05',
      index: 1,
      label: 'foo',
      done: false,
      fixed: false,
    },
    {
      id: 'b',
      listId: '1970-01-03',
      index: 1,
      label: 'bar',
      done: true,
      fixed: false,
    },
    {
      id: 'c',
      listId: '1970-01-03',
      index: 2,
      label: 'baz',
      done: false,
      fixed: true,
    },
    {
      id: 'd',
      listId: '1970-01-05',
      index: 0,
      label: 'qux',
      done: false,
      fixed: false,
    },
  ]);
});

test('TodoLogic.getCustomTodoLists', () => {
  let data = TodoLogic.initTodoData(new Date(0));

  data = {
    ...data,
    items: [{ id: 'a', listId: 'list-1', label: 'foo', index: 0, done: false }],
    customLists: [
      { id: 'list-2', index: 1, title: 'Second' },
      { id: 'list-1', index: 0, title: 'First' },
    ],
  };

  expect(TodoLogic.getCustomTodoLists(data)).toEqual([
    {
      id: 'list-1',
      index: 0,
      title: 'First',
      items: [
        { id: 'a', listId: 'list-1', label: 'foo', index: 0, done: false },
      ],
    },
    { id: 'list-2', index: 1, title: 'Second', items: [] },
  ]);
});

test('TodoLogic.addCustomTodoList', () => {
  let data = TodoLogic.initTodoData(new Date(0));

  data = TodoLogic.addCustomTodoList(data);

  expect(data.customLists).toEqual([
    { id: expect.stringMatching(/./), index: 0, title: '' },
  ]);

  data = TodoLogic.addCustomTodoList(data);

  expect(data.customLists).toEqual([
    { id: expect.stringMatching(/./), index: 0, title: '' },
    { id: expect.stringMatching(/./), index: 1, title: '' },
  ]);
});

test('TodoLogic.editCustomTodoList', () => {
  let data = TodoLogic.initTodoData(new Date(0));

  data = {
    ...data,
    customLists: [
      { id: 'a', index: 0, title: 'foo' },
      { id: 'b', index: 1, title: 'bar' },
    ],
  };

  data = TodoLogic.editCustomTodoList(data, { id: 'a', title: 'updated' });

  expect(data.customLists).toEqual([
    { id: 'a', index: 0, title: 'updated' },
    { id: 'b', index: 1, title: 'bar' },
  ]);
});

test('TodoLogic.moveCustomTodoList', () => {
  let data = TodoLogic.initTodoData(new Date(0));

  data = {
    ...data,
    customLists: [
      { id: 'a', index: 0, title: 'foo' },
      { id: 'b', index: 1, title: 'bar' },
      { id: 'c', index: 2, title: 'baz' },
    ],
  };

  data = TodoLogic.moveCustomTodoList(data, { id: 'c', index: 0 });

  expect(data.customLists).toEqual([
    { id: 'c', index: 0, title: 'baz' },
    { id: 'a', index: 1, title: 'foo' },
    { id: 'b', index: 2, title: 'bar' },
  ]);
});

test('TodoLogic.deleteCustomTodoList', () => {
  let data = TodoLogic.initTodoData(new Date(0));

  data = {
    ...data,
    customLists: [
      { id: 'a', index: 0, title: 'foo' },
      { id: 'b', index: 1, title: 'bar' },
    ],
  };

  data = TodoLogic.deleteCustomTodoList(data, { id: 'a' });

  expect(data.customLists).toEqual([{ id: 'b', index: 1, title: 'bar' }]);
});

test('TodoLogic.seekDays', () => {
  let data = TodoLogic.initTodoData(new Date('1970-01-01T00:00:00'));

  data = TodoLogic.seekDays(data, 5);
  expect(data.at).toBe('1970-01-06');

  data = TodoLogic.seekDays(data, -10);
  expect(data.at).toBe('1969-12-27');
});

test('TodoLogic.seekToToday', () => {
  let data = TodoLogic.initTodoData(new Date('1970-01-01T00:00:00'));

  data = TodoLogic.seekToToday(data);

  expect(data.at).toBe(TodoLogic.initTodoData(new Date()).at);
});

test('TodoLogic.seekToDate', () => {
  let data = TodoLogic.initTodoData(new Date('1970-01-01T00:00:00'));

  data = TodoLogic.seekToDate(data, new Date('1970-06-15T00:00:00'));

  expect(data.at).toBe('1970-06-15');
});

test('TodoLogic.seekCustomTodoLists', () => {
  let data = TodoLogic.initTodoData(new Date(0));

  data = {
    ...data,
    customLists: [
      { id: 'a', index: 0, title: 'foo' },
      { id: 'b', index: 1, title: 'bar' },
    ],
  };

  // Clamped at upper bound
  data = TodoLogic.seekCustomTodoLists(data, 5);
  expect(data.customAt).toBe(1);

  // Clamped at lower bound
  data = TodoLogic.seekCustomTodoLists(data, -5);
  expect(data.customAt).toBe(0);
});

test('TodoLogic.setIndexes', () => {
  const first = { index: 0 };
  const second = { index: 5 };

  const result = TodoLogic.setIndexes([first, second]);

  expect(result).toEqual([{ index: 0 }, { index: 1 }]);
  // Items whose index is already correct are returned unchanged (same reference).
  expect(result[0]).toBe(first);
  expect(result[1]).not.toBe(second);
});
