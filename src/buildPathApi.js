/* eslint no-param-reassign: "error" */

import path from 'path';
import url from 'url';

const { URL } = url;

const replaceSymbols = (word) => word
  .split('')
  .map((item) => {
    if (item.match(/\d/) || item.match(/\w/)) {
      return item;
    }
    return '-';
  }).join('');

const mapFilename = (filename, toHTML = false) => {
  const parsed = path.parse(filename);
  const { dir, ext, name } = parsed;

  const newDir = replaceSymbols(dir);
  const newName = replaceSymbols(name);
  const newExt = ext === '' || toHTML ? '.html' : ext;
  if (dir === '') {
    return `${newName}${newExt}`;
  }
  const newFileName = `${newDir}-${newName}${newExt}`;

  return newFileName;
};

export const buildSourcesDirname = (parsedURL) => {
  const { hostname, pathname } = parsedURL;
  const dirname = path.join(hostname, pathname);
  return `${replaceSymbols(dirname)}_files`;
};

export const buildFilename = (baseURL, input = '/') => {
  if (input === '/') {
    return mapFilename(path.join(baseURL.hostname, baseURL.pathname), true);
  }
  const newUrl = new URL(input, baseURL.toString());
  const { hostname, pathname } = newUrl;
  return mapFilename(path.join(hostname, pathname));
};

export const buildSourcePath = (baseURL, input, dirname) => path.join(
  dirname,
  buildFilename(baseURL, input),
);
