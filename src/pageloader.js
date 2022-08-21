import axios from 'axios';
import url from 'url';
import path from 'path';
import { promises as fs } from 'fs';
import debug from 'debug';
import axiosDebug from 'axios-debug-log';
import Listr from 'listr';

import { buildSourcesDirname, buildFilename } from './buildPathApi.js';
import replaceSources from './modifyHTML.js';

import extractUrls from './extractUrls.js';

import { handleError } from './utils.js';

const pageLoadDebug = debug('page-loader');

axiosDebug({
  request(httpDebug, config) {
    httpDebug(`Request with ${config.headers['content-type']}`);
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
          const filepath = path.join(destToSaveFiles, buildFilename(baseURL, urlToFetchContent));
          const dataToSave = baseURL.href === urlToFetchContent
            ? replaceSources(data, baseURL)
            : data;
          return fs.writeFile(filepath, dataToSave);
        })
        .catch(handleError);
      return { title: urlToFetchContent, task: () => task };
    }),
    { concurrent: true },
  );

  return tasks.run();
};

export default (pageUrl, dest) => {
  let html;
  const { URL } = url;
  const baseURL = new URL(pageUrl);
  console.log(dest);
  const sourcesDirname = buildSourcesDirname(baseURL);
  const destToSaveFiles = path.join(dest, sourcesDirname);
  return fs.mkdir(destToSaveFiles)
    .then(() => axios.get(pageUrl))
    .then(({ data }) => {
      pageLoadDebug(data);
      html = data;
      const localHTML = replaceSources(data, baseURL);
      const htmlFilename = buildFilename(baseURL);
      fs.writeFile(path.join(dest, htmlFilename), localHTML);
    })
    .then(() => fileloader(html, destToSaveFiles, baseURL))
    .catch((e) => {
      handleError(e);
    });
};
