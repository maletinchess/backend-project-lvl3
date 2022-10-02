/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

import axios from 'axios';
import { URL } from 'url';
import path from 'path';
import { promises as fs } from 'fs';
import debug from 'debug';
import axiosDebug from 'axios-debug-log';
import Listr from 'listr';
import * as cheerio from 'cheerio';
import prettier from 'prettier';

import {
  buildSourceDirname, buildSourceFilename, buildmainHtmlFilename, buildSourcePath,
} from './buildpath.js';

import { handleError } from './utils.js';

const log = debug('page-loader');

axiosDebug({
  request(httpDebug, config) {
    httpDebug(`Request with ${config.url}`);
  },
  response(httpDebug, response) {
    httpDebug(
      `Response with ${response.headers['content-type']}`,
      `from ${response.config.url}`,
    );
  },
  error(httpDebug, error) {
    httpDebug('Boom', error.message);
  },
});

const tags = [
  { tagname: 'link', attr: 'href' },
  { tagname: 'script', attr: 'src' },
  { tagname: 'img', attr: 'src' },
];

const isLocal = (sourceLink, currentURL) => {
  const sourceURL = new URL(sourceLink, currentURL.toString());
  const sourceHost = sourceURL.host;
  const currentHost = currentURL.host;

  return currentHost === sourceHost;
};

const extractUrls = (html, baseURL) => {
  const $ = cheerio.load(html);
  const urls = tags.flatMap(({ tagname, attr }) => {
    const tagsNodes = $(tagname);
    const mapped = tagsNodes.map((_i, el) => {
      const elem = $(el);
      const src = elem.attr(attr);
      const srcUrl = new URL(src, baseURL.toString()).toString();
      if (isLocal(srcUrl, baseURL)) {
        return { urlToFetchContent: srcUrl };
      }
      return null;
    });
    return mapped.toArray();
  });
  return urls;
};

const modifyHTML = (html, baseURL) => {
  const $ = cheerio.load(html);
  const dirname = buildSourceDirname(baseURL);
  tags.forEach(({ tagname, attr }) => {
    const nodes = $(tagname);
    nodes.each((_i, el) => {
      const elem = $(el);
      const src = elem.attr(attr);
      const srcUrl = new URL(src, baseURL.toString()).toString();
      if (isLocal(srcUrl, baseURL)) {
        elem.attr(attr, buildSourcePath(baseURL, src, dirname));
      }
    });
  });

  const prettified = prettier.format($.html(), { parser: 'html' });
  console.log(prettified);
  return $.html();
};

const downloadAssets = (url, dirname, baseURL) => axios.get(url, { responseType: 'arraybuffer', validateStatus: (status) => status === 200 })
  .then(({ data }) => {
    const filename = buildSourceFilename(baseURL, url);
    const fullPath = path.join(dirname, filename);
    return fs.writeFile(fullPath, data);
  })
  .catch(handleError);

const fileloader = (html, destToSaveFiles, baseURL) => {
  const fetchDatas = extractUrls(html, baseURL);
  const tasks = new Listr(
    fetchDatas.map(({ urlToFetchContent }) => {
      const task = downloadAssets(urlToFetchContent, destToSaveFiles, baseURL);
      return { title: urlToFetchContent, task: () => task };
    }),
    { concurrent: true },
  );

  return tasks.run();
};

export default (pageUrl, dest = process.cwd()) => {
  let html;
  let output;
  const baseURL = new URL(pageUrl);
  const sourcesDirname = buildSourceDirname(baseURL);
  const destToSaveFiles = path.join(dest, sourcesDirname);
  return fs.mkdir(destToSaveFiles)
    .then(() => axios.get(pageUrl))
    .catch(handleError)
    .then(({ data }) => {
      html = data;
      const localHTML = modifyHTML(data, baseURL);
      const htmlFilename = buildmainHtmlFilename(baseURL);
      const filepath = path.join(dest, htmlFilename);
      output = path.resolve(process.cwd(), filepath);
      log(`saving HTML to ${filepath}`);
      fs.writeFile(filepath, localHTML);
    })
    .catch(handleError)
    .then(() => {
      log(`saving sources ${destToSaveFiles}`);
      return fileloader(html, destToSaveFiles, baseURL);
    })
    .then(() => output);
};
