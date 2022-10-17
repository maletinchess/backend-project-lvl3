/* eslint-disable no-undef */

import { processName, urlToFilename, urlToDirname } from '../src/buildpath.js';

test('processName', () => {
  const expected1 = 'ru-hexlet-io-courses';
  const actual1 = processName('ru.hexlet.io/courses');
  expect(actual1).toBe(expected1);

  const expected2 = 'ru-hexlet-io';
  const actual2 = processName('ru.hexlet.io');
  expect(actual2).toBe(expected2);
});

test('urlToFileName', () => {
  const expected1 = 'ru-hexlet-io-courses.html';
  const actual1 = urlToFilename('https://ru.hexlet.io/courses');
  expect(actual1).toBe(expected1);

  const url2 = 'https://ru.hexlet.io/assets/professions/nodejs.png';
  const actual2 = urlToFilename(url2);
  const expected2 = 'ru-hexlet-io-assets-professions-nodejs.png';
  expect(actual2).toBe(expected2);
});

test('urlToDirName', () => {
  const baseUrl1 = 'https://ru.hexlet.io/courses';
  const expected1 = 'ru-hexlet-io-courses_files';
  const actual1 = urlToDirname(baseUrl1);
  expect(actual1).toBe(expected1);

  const baseUrl2 = 'https://ru.hexlet.io';
  const expected2 = 'ru-hexlet-io_files';
  const actual2 = urlToDirname(baseUrl2);
  expect(actual2).toBe(expected2);
});
