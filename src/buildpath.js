/* eslint no-param-reassign: "error" */

import path from 'path';
import { URL } from 'url';

const replaceSymbols = (word) => word
  .split('')
  .map((item) => {
    if (item.match(/\d/) || item.match(/\w/)) {
      return item;
    }
    return '-';
  }).join('');

const mapFilename = (filename) => {
  const parsed = path.parse(filename);
  const { dir, ext, name } = parsed;

  const newDir = replaceSymbols(dir);
  const newName = replaceSymbols(name);
  if (dir === '') {
    return `${newName}${ext}`;
  }
  const newFileName = `${newDir}-${newName}${ext}`;

  return newFileName;
};

const removeProtocol = (urlObject) => path.join(urlObject.hostname, urlObject.pathname);

export const buildmainHtmlFilename = (baseURL) => {
  const modifiedUrl = removeProtocol(baseURL);
  return `${mapFilename(modifiedUrl)}.html`;
};

export const buildAssetFilename = (baseURL, input = '/') => {
  const sourceURL = new URL(input, baseURL);
  const modifiedUrl = removeProtocol(sourceURL);
  const mappedFileName = mapFilename(modifiedUrl);
  if (path.extname(modifiedUrl).length === 0) {
    return `${mappedFileName}.html`;
  }
  return mappedFileName;
};

export const buildAssetsDirname = (baseURL) => {
  const modifiedUrl = removeProtocol(baseURL);
  return `${mapFilename(modifiedUrl)}_files`;
};

export const buildAssetPath = (baseURL, input, dirname) => path.join(
  dirname,
  buildAssetFilename(baseURL, input),
);

export const processName = (filename) => {
  const mappedFilename = replaceSymbols(filename);
  return mappedFilename;
};

export const urlToFilename = (url) => {
  const urlWithoutProtocol = removeProtocol(new URL(url));
  const parsed = path.parse(urlWithoutProtocol);
  const { dir, name, ext } = parsed;
  const filename = `${processName(path.join(dir, name))}`;
  const processed = processName(filename);
  if (ext === '') {
    return `${processed}.html`;
  }
  return `${processed}${ext}`;
};

export const urlToDirname = (url) => {
  const urlObject = new URL(url);
  const { hostname, pathname } = urlObject;
  const urlWithoutProtocol = pathname === '/' ? hostname : path.join(hostname, pathname);
  const processed = `${processName(urlWithoutProtocol)}`;
  return `${processed}_files`;
};
