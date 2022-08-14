import axios from 'axios';
import url from 'url';
import path from 'path';
import { promises as fs } from 'fs';
import debug from 'debug';
import axiosDebug from 'axios-debug-log';

import { buildSourcesDirname, buildFilename } from './buildPathApi.js';
import replaceSources from './modifyHTML.js';

import extractUrls from './extractUrls.js';

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

const fetchContent = (urlToFetchContent, contentType) => {
  if (contentType === 'image') {
    return axios.get(
      urlToFetchContent,
      {
        responseType: 'arraybuffer',
        validateStatus: (status) => status === 200,
      },
    );
  }

  return axios.get(urlToFetchContent);
};

const saveContent = (fetchData, dest, baseURL) => {
  const { urlToFetchContent, contentType } = fetchData;
  const output = path.join(dest, buildFilename(baseURL, urlToFetchContent));
  const promise = fetchContent(urlToFetchContent, contentType)
    .then(({ data }) => {
      pageLoadDebug(data);
      const dataToSave = baseURL.href === urlToFetchContent ? replaceSources(data, baseURL) : data;
      fs.writeFile(output, dataToSave);
    }).catch((e) => console.error(e.message));
  return promise;
};

const fileloader = (html, destToSaveFiles, baseURL) => {
  const fetchDatas = extractUrls(html, baseURL);
  pageLoadDebug(fetchDatas);
  const promises = fetchDatas.map((fetchData) => saveContent(fetchData, destToSaveFiles, baseURL));
  return Promise.all(promises);
};

export default (pageUrl, dest) => {
  let html;
  console.log(dest);
  const { URL } = url;
  const baseURL = new URL(pageUrl);
  const sourcesDirname = buildSourcesDirname(baseURL);
  const destToSaveFiles = path.join(dest, sourcesDirname);
  return axios.get(pageUrl)
    .then(({ data }) => {
      pageLoadDebug(data);
      html = data;
      const localHTML = replaceSources(data, baseURL);
      const htmlFilename = buildFilename(baseURL);
      fs.writeFile(path.join(dest, htmlFilename), localHTML);
    })
    .then(() => fs.mkdir(destToSaveFiles))
    .catch((e) => console.error(e.code))
    .then(() => fileloader(html, destToSaveFiles, baseURL))
    .catch((e) => console.error(e.code));
};
