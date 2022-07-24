import os from 'os';
import path, { dirname } from 'path';
import { promises as fs } from 'fs';
import nock from 'nock';
import { fileURLToPath } from 'url';
import loadHTML from '../src/promiseBasedApi/index.js';

/* eslint-disable no-underscore-dangle */
const __filename = fileURLToPath(import.meta.url);
/* eslint-disable no-underscore-dangle */
const __dirname = dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

/* global test, expect, beforeAll, beforeEach */
/* eslint no-undef: "error" */

let body;
let expectedPage;
let expectedImageBuffer; // make image fixture..//
let dest;
const url = 'https://ru.hexlet.io/courses';
const filesdirname = 'ru-hexlet-io-courses_files';
const imageSRC = '/assets/professions/nodejs.png';
const scriptSRC = '/packs/js/runtime.js';
const linkHref = '/assets/application.css';

nock.disableNetConnect();

beforeAll(async () => {
  body = await fs.readFile(getFixturePath('body-fixture.html'), 'utf-8');
  expectedPage = await fs.readFile(getFixturePath('expected-page-fixture.html'), 'utf-8');
  const image = await fs.readFile(getFixturePath('node-js-image-fixture.png'));
  expectedImageBuffer = Buffer.from(image);
});

beforeEach(async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, body)
    .get(imageSRC)
    .reply(200, expectedImageBuffer)
    .get(scriptSRC)
    .reply(200, 'Hello, world!')
    .get(linkHref)
    .reply(200, 'CSS_STYLES')
    .get('/courses')
    .reply(200, body);

  dest = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));

  await loadHTML(url, dest);
});

test('html-load', async () => {
  const actualFilename = 'ru-hexlet-io-courses.html';
  const actualPath = path.join(dest, actualFilename);// ...define manually filename//
  const actualHTML = await fs.readFile(actualPath, 'utf-8');
  expect(actualHTML).toEqual(expectedPage.trim());
});

test('image-load', async () => {
  const actualFilename = 'ru-hexlet-io-assets-professions-nodejs.png';
  const actualImageFilePath = path.join(dest, filesdirname, actualFilename);
  const actualImage = await fs.readFile(actualImageFilePath);
  const actualImageBuffer = Buffer.from(actualImage);
  expect(actualImageBuffer).toEqual(expectedImageBuffer);
});

test('script-load', async () => {
  const actualFilename = 'ru-hexlet-io-packs-js-runtime.js';
  const actualFilePath = path.join(dest, filesdirname, actualFilename);
  const content = await fs.readFile(actualFilePath, 'utf-8');
  expect(content).toBe('Hello, world!');
});

test('link-load', async () => {
  const actualCssFilename = 'ru-hexlet-io-assets-application.css';
  const actualCssFilePath = path.join(dest, filesdirname, actualCssFilename);
  const contentCss = await fs.readFile(actualCssFilePath, 'utf-8');
  expect(contentCss).toBe('CSS_STYLES');

  const actualHtmlFilename = 'ru-hexlet-io-courses.html';
  const actualHtmlFilePath = path.join(dest, filesdirname, actualHtmlFilename);
  const contentHtml = await fs.readFile(actualHtmlFilePath, 'utf-8');
  expect(contentHtml).toBe(expectedPage.trim());
});

test('scope-isDone', async () => {
  const scope = nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, body)
    .get(imageSRC)
    .reply(200, expectedImageBuffer)
    .get(scriptSRC)
    .reply(200, 'Hello, world!')
    .get(linkHref)
    .reply(200, 'CSS_STYLES')
    .get('/courses')
    .reply(200, body);
  const anotherDest = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  await loadHTML(url, anotherDest);
  expect(scope.isDone()).toBe(true);
});
