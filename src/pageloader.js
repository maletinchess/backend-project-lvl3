import axios from 'axios';
import { URL } from 'url';
import path from 'path';
import { promises as fs } from 'fs';
import debug from 'debug';
import axiosDebug from 'axios-debug-log';
import Listr from 'listr';
import * as cheerio from 'cheerio';

import {
  buildAssetsDirname, buildAssetFilename, buildmainHtmlFilename, buildAssetPath,
} from './buildpath.js';

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

const prepareAssets = (html, origin, dir) => {
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
        assets.push(srcUrl);
        elem.attr(attr, buildAssetPath(origin, src, dir));
      }
    });
  });
  return { html: $.html(), assets };
};

const downloadAssets = (url, dirname, baseURL) => axios.get(url, { responseType: 'arraybuffer', validateStatus: (status) => status === 200 })
  .then(({ data }) => {
    const filename = buildAssetFilename(baseURL, url);
    const fullPath = path.join(dirname, filename);
    return fs.writeFile(fullPath, data);
  });

const wrapLoadingToListr = (urls, dirname, baseUrl) => {
  const tasks = urls.map((u) => {
    const task = downloadAssets(u, dirname, baseUrl);
    return { title: u, task: () => task };
  });
  return new Listr(
    tasks,
    { concurent: true },
  ).run();
};

export const buildOutputPath = (pageUrl, dest) => {
  const baseURL = new URL(pageUrl);
  const filepath = path.join(dest, buildmainHtmlFilename(baseURL));
  const output = path.resolve(process.cwd(), filepath);
  return output;
};

export default (pageUrl, dest = process.cwd()) => {
  const baseURL = new URL(pageUrl);
  const assetsDirname = buildAssetsDirname(baseURL);
  const assetsOutputPath = path.join(dest, assetsDirname);

  return fs.access(assetsOutputPath)
    .catch(() => fs.mkdir(assetsOutputPath))
    .then(() => axios.get(pageUrl))
    .then(({ data }) => {
      const htmlFilename = buildmainHtmlFilename(baseURL);
      const { html, assets } = prepareAssets(data, baseURL, assetsDirname);
      const filepath = path.join(dest, htmlFilename);
      log(`saving HTML to ${filepath}`);
      return fs.writeFile(filepath, html).then(() => assets);
    })
    .then((urls) => {
      log(`saving assets to ${assetsOutputPath}`);
      return wrapLoadingToListr(urls, assetsOutputPath, baseURL);
    })
    .catch(handleError);
};
