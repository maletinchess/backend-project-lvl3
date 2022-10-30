import path from 'path';
import { URL } from 'url';

export const processName = (name) => name
  .split('')
  .map((item) => {
    if (item.match(/\d/) || item.match(/\w/)) {
      return item;
    }
    return '-';
  }).join('');

export const urlToFilename = (url) => {
  const { hostname, pathname } = new URL(url);
  const { dir, name, ext } = path.parse(pathname);
  const base = path.join(hostname, dir, name);
  const processed = processName(base);
  if (ext === '') {
    return `${processed}.html`;
  }
  return `${processed}${ext}`;
};

export const urlToDirname = (url) => {
  const { hostname, pathname } = new URL(url);
  const base = pathname === '/' ? hostname : path.join(hostname, pathname);
  const processed = `${processName(base)}`;
  return `${processed}_files`;
};
