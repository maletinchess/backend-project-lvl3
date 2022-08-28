import axios from 'axios';
import url from 'url';
import path from 'path';
import { promises as fs } from 'fs';
import debug from 'debug';
import axiosDebug from 'axios-debug-log';
import Listr from 'listr';

import { buildSourceDirname, buildSourceFilename, buildmainHtmlFilename } from './buildpath.js';
import replaceSources from './modifyHTML.js';

import extractUrls from './extractUrls.js';

import { handleError } from './utils.js';

const pageLoadDebug = debug('page-loader');

const isDebugEnv = process.env.DEBUG;

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

const fileloader = (html, destToSaveFiles, baseURL) => {
  const fetchDatas = extractUrls(html, baseURL);
  const tasks = new Listr(
    fetchDatas.map(({ urlToFetchContent }) => {
      const task = axios.get(urlToFetchContent, { responseType: 'arraybuffer', validateStatus: (status) => status === 200 })
        .then(({ data }) => {
          const filepath = path.join(
            destToSaveFiles,
            buildSourceFilename(baseURL, urlToFetchContent),
          );
          return fs.writeFile(filepath, data);
        })
        .catch(handleError);
      return { title: urlToFetchContent, task: () => task };
    }),
    { concurrent: true, renderer: isDebugEnv ? 'silent' : 'default' },
  );

  return tasks.run();
};

export default (pageUrl, dest = process.cwd()) => {
  let html;
  let output;
  const { URL } = url;
  const baseURL = new URL(pageUrl);
  const sourcesDirname = buildSourceDirname(baseURL);
  const destToSaveFiles = path.join(dest, sourcesDirname);
  return fs.mkdir(destToSaveFiles)
    .then(() => axios.get(pageUrl))
    .then(({ data }) => {
      html = data;
      const localHTML = replaceSources(data, baseURL);
      const htmlFilename = buildmainHtmlFilename(baseURL, '/', true);
      const filepath = path.join(dest, htmlFilename);
      output = path.resolve(process.cwd(), filepath);
      pageLoadDebug(`saving HTML to ${filepath}`);
      fs.writeFile(filepath, localHTML);
    })
    .then(() => {
      pageLoadDebug(`saving sources ${destToSaveFiles}`);
      return fileloader(html, destToSaveFiles, baseURL);
    })
    .then(() => output)
    .catch((e) => {
      handleError(e);
    });
};
