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

let dest;

const fixturesfilenames = {
  script: 'script-fixture.js',
  css: 'link-fixture.css',
  image: 'node-js-image-fixture.png',
  htmlMain: 'body-fixture.html',
  htmlSource: 'body-fixture.html',
};

const url = 'https://ru.hexlet.io/courses';
const filesdirname = 'ru-hexlet-io-courses_files';

const formats = [
  {
    format: 'htmlSource', expectedData: '', expectedFilename: 'ru-hexlet-io-courses.html', actualData: '',
  },
  {
    format: 'image', expectedData: '', expectedFilename: 'ru-hexlet-io-assets-professions-nodejs.png', actualData: '',
  },
  {
    format: 'css', expectedData: '', expectedFilename: 'ru-hexlet-io-assets-application.css', actualData: '',
  },
  {
    format: 'script', expectedData: '', expectedFilename: 'ru-hexlet-io-packs-js-runtime.js', actualData: '',
  },
];

nock.disableNetConnect();

beforeEach(async () => {
  nock(/ru\.hexlet\.io/)
    .get(/\/courses/)
    .replyWithFile(200, getFixturePath(fixturesfilenames.htmlMain))
    .get(/\/assets\/professions\/nodejs\.png/)
    .replyWithFile(200, getFixturePath(fixturesfilenames.image))
    .get(/\/packs\/js\/runtime\.js/)
    .replyWithFile(200, getFixturePath(fixturesfilenames.script))
    .get(/\/assets\/application\.css/)
    .replyWithFile(200, getFixturePath(fixturesfilenames.css))
    .get(/\/courses/)
    .replyWithFile(200, getFixturePath(fixturesfilenames.htmlSource));

  dest = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));

  await loadHTML(url, dest);
});

describe('positive cases', () => {
  test.each(formats)('$format load', async (item) => {
    const data = await fs.readFile(getFixturePath(fixturesfilenames[item.format]), 'utf-8');
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
      .replyWithFile(200, getFixturePath(fixturesfilenames.htmlMain))
      .get(/\/assets\/professions\/nodejs\.png/)
      .replyWithFile(200, getFixturePath(fixturesfilenames.image))
      .get(/\/packs\/js\/runtime\.js/)
      .replyWithFile(200, getFixturePath(fixturesfilenames.script))
      .get(/\/assets\/application\.css/)
      .replyWithFile(200, getFixturePath(fixturesfilenames.css))
      .get(/\/courses/)
      .replyWithFile(200, getFixturePath(fixturesfilenames.htmlSource));
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

  test('fs-error: file does not exist', async () => {
    nock(/\/validurl\.ru/)
      .get('/testerr')
      .replyWithFile(200, getFixturePath(fixturesfilenames.htmlMain));
    expect.assertions(1);

    const fakedir = path.join(os.tmpdir(), makeRandomString());

    await expect(loadHTML('https://validurl.ru/testerr', fakedir)).rejects.toThrow(/ENOENT/);
  });

  test('fs-error: access error', async () => {
    nock(/\/validurl\.ru/)
      .get('/testerr')
      .replyWithFile(200, getFixturePath(fixturesfilenames.htmlMain));
    expect.assertions(1);
    await expect(loadHTML('https://validurl.ru/testerr', '/sys')).rejects.toThrow(/EACCES/);
  });

  test('fs-error: file exists', async () => {
    await expect(loadHTML(url, dest)).rejects.toThrow(/EEXIST/);
  });
});
