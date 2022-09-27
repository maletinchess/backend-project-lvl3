/* eslint no-param-reassign: "error" */

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

let body;
let image;
let dest;

const fixture = {};

const fixturesfilenames = {
  script: 'script-fixture.js',
  css: 'link-fixture.css',
  image: 'node-js-image-fixture.png',
};

const url = 'https://ru.hexlet.io/courses';

const filesdirname = 'ru-hexlet-io-courses_files';
const imagePath = '/assets/professions/nodejs.png';
const scriptPath = '/packs/js/runtime.js';
const linkPath = '/assets/application.css';

const formatsArray = [
  {
    format: 'htmlSource', fixturepath: 'body-fixture.html', expectedData: '', expectedFilename: 'ru-hexlet-io-courses.html', actualData: '',
  },
  {
    format: 'image', fixturepath: 'node-js-image-fixture.png', expectedData: '', expectedFilename: 'ru-hexlet-io-assets-professions-nodejs.png', actualData: '',
  },
  {
    format: 'css', fixturepath: 'link-fixture.css', expectedData: '', expectedFilename: 'ru-hexlet-io-assets-application.css', actualData: '',
  },
  {
    format: 'script', fixturepath: 'script-fixture.js', expectedData: '', expectedFilename: 'ru-hexlet-io-packs-js-runtime.js', actualData: '',
  },
];

nock.disableNetConnect();

beforeAll(async () => {
  body = await fs.readFile(getFixturePath('body-fixture.html'), 'utf-8');
  image = await fs.readFile(getFixturePath('node-js-image-fixture.png'));
  fixture.css = await fs.readFile(getFixturePath('link-fixture.css', 'utf-8'));
  fixture.script = await fs.readFile(getFixturePath('script-fixture.js', 'utf-8'));
});

beforeEach(async () => {
  nock(/ru\.hexlet\.io/)
    .get('/courses')
    .reply(200, body)
    .get(imagePath)
    .replyWithFile(200, getFixturePath(fixturesfilenames.image))
    .get(scriptPath)
    .replyWithFile(200, getFixturePath(fixturesfilenames.script))
    .get(linkPath)
    .replyWithFile(200, getFixturePath(fixturesfilenames.css))
    .get('/courses')
    .reply(200, body);

  dest = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));

  await loadHTML(url, dest);
});

describe('positive cases', () => {
  test.each(formatsArray)('$format load', async (item) => {
    const data = await fs.readFile(getFixturePath(item.fixturepath), 'utf-8');
    item.expectedData = data;
    const { expectedFilename } = item;
    const expectedPath = path.join(dest, filesdirname, expectedFilename);
    item.actualData = await fs.readFile(expectedPath, 'utf-8');
    expect(item.expectedData.trim()).toEqual(item.actualData.trim());
  });

  test('main page html load', async () => {
    const expectedFilename = 'ru-hexlet-io-courses.html';
    const expectedPath = path.join(dest, expectedFilename);
    const actualHTML = await fs.readFile(expectedPath, 'utf-8');
    const expectedHTML = await fs.readFile(getFixturePath('expected-page-fixture.html'), 'utf-8');
    expect(actualHTML.trim()).toEqual(expectedHTML.trim());
  });

  test('scope-isDone', async () => {
    const scope = nock(/ru\.hexlet\.io/)
      .get(/\/courses/)
      .reply(200, body)
      .get(imagePath)
      .reply(200, image)
      .get(scriptPath)
      .reply(200, fixture.script)
      .get(linkPath)
      .reply(200, fixture.css)
      .get('/courses')
      .reply(200, body);
    const scopeCheckDest = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
    await loadHTML(url, scopeCheckDest);
    expect(scope.isDone()).toBe(true);
  });
});

describe('negative-cases', () => {
  test('http-errors - loadpage - status code 404', async () => {
    nock(/wrong\.url\.wrong/)
      .get(/no-response/)
      .replyWithError('Wrong url')
      .get('/404')
      .reply(404);

    const destForErrCase = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-err-'));

    expect.assertions(2);

    await expect(loadHTML('https://wrong.url.wrong/no-response', destForErrCase)).rejects.toThrow();
    await expect(loadHTML('https://wrong.url.wrong/404', destForErrCase)).rejects.toThrow(/bad response/);
  });

  test('fs-errors - file does not exist, access error', async () => {
    // razdelit access i not exist //
    nock('https://validurl.ru')
      .get('/testerr')
      .reply(200, body);
    expect.assertions(2);

    const fakedir = path.join(os.tmpdir(), makeRandomString());
    const sys = '/sys';

    await expect(loadHTML('https://validurl.ru/testerr', fakedir)).rejects.toThrow(/ENOENT/);
    await expect(loadHTML('https://validurl.ru/testerr', sys)).rejects.toThrow(/EACCES/);
  });

  test('fs-error: file exist', async () => {
    await expect(loadHTML(url, dest)).rejects.toThrow(/EEXIST/);
  });
});
