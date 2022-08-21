import os from 'os';
import path, { dirname } from 'path';
import { promises as fs } from 'fs';
import nock from 'nock';
import { fileURLToPath } from 'url';
import loadHTML from '../src/index.js';
import { makeRandomString } from '../src/utils.js';

/* eslint-disable no-underscore-dangle */
const __filename = fileURLToPath(import.meta.url);
/* eslint-disable no-underscore-dangle */
const __dirname = dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

/* global test, expect, beforeAll, beforeEach, describe */
/* eslint no-undef: "error" */

let body;
let expectedPage;
let dest;
let image;
const url = 'https://ru.hexlet.io/courses';
const filesdirname = 'ru-hexlet-io-courses_files';
const imageSRC = '/assets/professions/nodejs.png';
const scriptSRC = '/packs/js/runtime.js';
const linkHref = '/assets/application.css';

nock.disableNetConnect();

beforeAll(async () => {
  body = await fs.readFile(getFixturePath('body-fixture.html'), 'utf-8');
  expectedPage = await fs.readFile(getFixturePath('expected-page-fixture.html'), 'utf-8');
  image = await fs.readFile(getFixturePath('node-js-image-fixture.png'));
});

beforeEach(async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, body)
    .get(imageSRC)
    .reply(200, image)
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
  expect(actualImage.length).toEqual(image.length);
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
    .reply(200, image)
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

describe('error-cases', () => {
  test('http-errors', async () => {
    nock(/wrong\.url\.wrong/)
      .get(/no-response/)
      .replyWithError('Wrong url')
      .get('/404')
      .reply(404);

    const destForErrCase = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-err-'));

    expect.assertions(2);

    await expect(loadHTML('https://wrong.url.wrong/no-response', destForErrCase)).rejects.toMatch('Wrong url');
    await expect(loadHTML('https://wrong.url.wrong/404', destForErrCase)).rejects.toMatch('Request failed with status code 404');
  });

  test('fs-errors', async () => {
    nock('https://validurl.ru')
      .get('/testerr')
      .reply(200, body);
    expect.assertions(2);

    const fakedir = path.join(os.tmpdir(), makeRandomString());
    const sys = '/sys';

    await expect(loadHTML('https://validurl.ru/testerr', fakedir)).rejects.toMatch('ENOENT');
    await expect(loadHTML('https://validurl.ru/testerr', sys)).rejects.toMatch('EACCES');
  });

  test('fs-error: file exist', async () => {
    await expect(loadHTML(url, dest)).rejects.toMatch('EEXIST');
  });
});
