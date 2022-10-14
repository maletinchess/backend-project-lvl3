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

const tags = [
  { tagname: 'link', attr: 'href' },
  { tagname: 'script', attr: 'src' },
  { tagname: 'img', attr: 'src' },
];

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
  const dirname = buildAssetsDirname(baseURL);
  tags.forEach(({ tagname, attr }) => {
    const nodes = $(tagname);
    nodes.each((_i, el) => {
      const elem = $(el);
      const src = elem.attr(attr);
      const srcUrl = new URL(src, baseURL.toString()).toString();
      if (isLocal(srcUrl, baseURL)) {
        elem.attr(attr, buildAssetPath(baseURL, src, dirname));
      }
    });
  });

  return $.html();
};

const downloadAssets = (url, dirname, baseURL) => axios.get(url, { responseType: 'arraybuffer', validateStatus: (status) => status === 200 })
  .then(({ data }) => {
    const filename = buildAssetFilename(baseURL, url);
    const fullPath = path.join(dirname, filename);
    return fs.writeFile(fullPath, data);
  });

const wrapLoadingToListr = (urls, dirname, baseUrl) => {
  const tasks = urls.map(({ urlToFetchContent }) => {
    const task = downloadAssets(urlToFetchContent, dirname, baseUrl);
    return { title: urlToFetchContent, task: () => task };
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
      const urls = extractUrls(data, baseURL);
      const localHTML = modifyHTML(data, baseURL);
      const htmlFilename = buildmainHtmlFilename(baseURL);
      const filepath = path.join(dest, htmlFilename);
      log(`saving HTML to ${filepath}`);
      return fs.writeFile(filepath, localHTML).then(() => urls);
    })
    .then((urls) => {
      log(`saving assets to ${assetsOutputPath}`);
      return wrapLoadingToListr(urls, assetsOutputPath, baseURL);
    })
    .catch(handleError);
};
