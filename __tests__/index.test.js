import os from 'os';
import path, { dirname } from 'path';
import { promises as fs } from 'fs';
import nock from 'nock';
import { fileURLToPath } from 'url';
import getHTML from '../src/index.js';
import { getFileNameFromUrl } from '../src/getHTML.js';

/* eslint-disable no-underscore-dangle */
const __filename = fileURLToPath(import.meta.url);
/* eslint-disable no-underscore-dangle */
const __dirname = dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

/* global test, expect, beforeAll, beforeEach */
/* eslint no-undef: "error" */

let expected;
let dest;
const url = 'https://ru.hexlet.io/projects/4/members/22511';

beforeAll(async () => {
  expected = await fs.readFile(getFixturePath('expected.html'), 'utf-8');
});

beforeEach(async () => {
  dest = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  nock('https://ru.hexlet.io')
    .get('/projects/4/members/22511')
    .reply(200, expected);
  await getHTML(url, dest);
});

test('getHTML', async () => {
  const actualPath = path.join(dest, getFileNameFromUrl(url));
  const actual = await fs.readFile(actualPath, 'utf-8');
  expect(actual).toEqual(expected);
});

test('request succeed', async () => {
  const scope = nock('https://ru.hexlet.io')
    .get('/projects/4/members/22511')
    .reply(200, expected);
  await getHTML(url, dest);
  expect(scope.isDone()).toBe(true);
});
