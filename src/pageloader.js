import axios from 'axios';
import { URL } from 'url';
import path from 'path';
import { promises as fs } from 'fs';
import debug from 'debug';
import axiosDebug from 'axios-debug-log';
import Listr from 'listr';
import * as cheerio from 'cheerio';

import {
  urlToDirname,
  urlToFilename,
} from './utils.js';

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

const attributeByTag = {
  link: 'href',
  script: 'src',
  img: 'src',
};

const handleError = (e) => {
  if (e.isAxiosError && e.response) {
    throw new Error('bad response');
  }
  throw new Error(`${e.message}`);
};

const isLocal = (sourceLink, currentURL) => {
  const sourceURL = new URL(sourceLink, currentURL.toString());
  const sourceHost = sourceURL.host;
  const currentHost = currentURL.host;

  return currentHost === sourceHost;
};

const prepareAssets = (html, origin) => {
  const $ = cheerio.load(html);
  const assets = [];
  const entries = Object.entries(attributeByTag);
  entries.forEach(([tag, attr]) => {
    const nodes = $(tag);
    nodes.each((_i, el) => {
      const elem = $(el);
      const src = elem.attr(attr);
      const srcUrl = new URL(src, origin.toString()).toString();
      if (isLocal(srcUrl, origin)) {
        const newPath = path.join(urlToDirname(origin), urlToFilename(srcUrl));
        assets.push(srcUrl);
        elem.attr(attr, newPath);
      }
    });
  });
  return { html: $.html(), assets };
};

const downloadAssets = (url, dirname) => axios.get(url, { responseType: 'arraybuffer', validateStatus: (status) => status === 200 })
  .then(({ data }) => {
    const filename = urlToFilename(url);
    const fullPath = path.join(dirname, filename);
    return fs.writeFile(fullPath, data);
  });

const wrapLoadingToListr = (urls, dirname) => {
  const tasks = urls.map((u) => {
    const task = downloadAssets(u, dirname);
    return { title: u, task: () => task };
  });
  return new Listr(
    tasks,
    { concurent: true },
  ).run();
};

export const buildOutputPath = (pageUrl, dest) => {
  const filepath = path.join(dest, urlToFilename(pageUrl));
  const output = path.resolve(process.cwd(), filepath);
  return output;
};

export default (pageUrl, dest = process.cwd()) => {
  const baseURL = new URL(pageUrl);
  const assetsDirname = urlToDirname(baseURL);
  const assetsOutputPath = path.join(dest, assetsDirname);

  return fs.access(assetsOutputPath)
    .catch(() => fs.mkdir(assetsOutputPath))
    .then(() => axios.get(pageUrl))
    .then(({ data }) => {
      const htmlFilename = urlToFilename(pageUrl);
      const { html, assets } = prepareAssets(data, baseURL);
      const filepath = path.join(dest, htmlFilename);
      log(`saving HTML to ${filepath}`);
      return fs.writeFile(filepath, html).then(() => assets);
    })
    .then((urls) => {
      log(`saving assets to ${assetsOutputPath}`);
      return wrapLoadingToListr(urls, assetsOutputPath);
    })
    .catch(handleError);
};
