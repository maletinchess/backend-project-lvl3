/* eslint no-param-reassign: "error" */

import path from 'path';
import { URL } from 'url';

export const processName = (filename) => filename
  .split('')
  .map((item) => {
    if (item.match(/\d/) || item.match(/\w/)) {
      return item;
    }
    return '-';
  }).join('');

const removeProtocolFromUrl = (url) => {
  const urlObject = new URL(url);
  const { hostname, pathname } = urlObject;
  const urlWithoutProtocol = pathname === '/' ? hostname : path.join(hostname, pathname);
  return urlWithoutProtocol;
};

export const urlToFilename = (url) => {
  const urlWithoutProtocol = removeProtocolFromUrl(url);
  const { dir, name, ext } = path.parse(urlWithoutProtocol);
  const filename = `${processName(path.join(dir, name))}`;
  const processed = processName(filename);
  if (ext === '') {
    return `${processed}.html`;
  }
  return `${processed}${ext}`;
};

export const urlToDirname = (url) => {
  const urlWithoutProtocol = removeProtocolFromUrl(url);
  const processed = `${processName(urlWithoutProtocol)}`;
  return `${processed}_files`;
};
