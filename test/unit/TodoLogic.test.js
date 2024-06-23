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
